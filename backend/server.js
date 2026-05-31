require('dotenv').config();
const express            = require('express');
const cors               = require('cors');
const jwt                = require('jsonwebtoken');
const bcrypt             = require('bcryptjs');
const { Pool }           = require('pg');
const { PrismaClient }   = require('@prisma/client');
const { PrismaPg }       = require('@prisma/adapter-pg');

const pool   = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const app    = express();
const PORT   = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

/* ── POST /api/auth/register ── */
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase(), password: hash, role: 'customer' },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* ── POST /api/auth/login ── */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* ── Auth middleware ── */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorised.' });
  }
  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token expired or invalid.' });
  }
}

/* ── GET /api/auth/me ── */
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── Admin middleware ── */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    next();
  });
}

/* ── Admin stats helper ── */
async function getStats() {
  const now = new Date();
  const [totalBookings, revenueAgg, pendingPayments, activeBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'paid' } }),
    prisma.booking.count({ where: { paymentStatus: 'pending' } }),
    prisma.booking.count({ where: { checkIn: { lte: now }, checkOut: { gte: now } } }),
  ]);
  return {
    totalBookings,
    totalRevenue: revenueAgg._sum.totalAmount || 0,
    pendingPayments,
    activeBookings,
  };
}

/* ── GET /api/admin/stats ── */
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    res.json(await getStats());
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── GET /api/admin/bookings ── */
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  try {
    const {
      search, paymentStatus, paymentMethod,
      dateFrom, dateTo, checkInFrom, checkInTo, checkOutFrom, checkOutTo,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = '1', limit = '20',
    } = req.query;

    const where = {};
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (search) {
      where.OR = [
        { customerName:  { contains: search, mode: 'insensitive' } },
        { email:         { contains: search, mode: 'insensitive' } },
        { contactNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (dateFrom || dateTo) {
      where.bookingDate = {};
      if (dateFrom) where.bookingDate.gte = new Date(dateFrom);
      if (dateTo)   where.bookingDate.lte = new Date(dateTo);
    }
    if (checkInFrom || checkInTo) {
      where.checkIn = {};
      if (checkInFrom) where.checkIn.gte = new Date(checkInFrom);
      if (checkInTo)   where.checkIn.lte = new Date(checkInTo);
    }
    if (checkOutFrom || checkOutTo) {
      where.checkOut = {};
      if (checkOutFrom) where.checkOut.gte = new Date(checkOutFrom);
      if (checkOutTo)   where.checkOut.lte = new Date(checkOutTo);
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const allowedSortFields = ['id','bookingDate','customerName','checkIn','checkOut','totalAmount','paymentStatus','createdAt'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDir   = sortOrder === 'asc' ? 'asc' : 'desc';

    const [bookings, total, stats] = await Promise.all([
      prisma.booking.findMany({ where, orderBy: { [orderField]: orderDir }, skip, take: limitNum }),
      prisma.booking.count({ where }),
      getStats(),
    ]);

    res.json({ bookings, total, page: pageNum, totalPages: Math.ceil(total / limitNum), stats });
  } catch (err) {
    console.error('List bookings error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── POST /api/admin/bookings ── */
app.post('/api/admin/bookings', requireAdmin, async (req, res) => {
  try {
    const {
      customerName, contactNumber, email, checkIn, checkOut,
      guests, paymentMethod, paymentStatus, totalAmount,
      extraServices, notes, userId, bookingDate,
    } = req.body;

    if (!customerName || !contactNumber || !email || !checkIn || !checkOut || !guests || !paymentMethod || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const booking = await prisma.booking.create({
      data: {
        customerName,
        contactNumber,
        email,
        checkIn:       new Date(checkIn),
        checkOut:      new Date(checkOut),
        guests:        parseInt(guests, 10),
        paymentMethod,
        paymentStatus: paymentStatus || 'pending',
        totalAmount:   parseFloat(totalAmount),
        extraServices: extraServices || null,
        notes:         notes || null,
        userId:        userId ? parseInt(userId, 10) : null,
        bookingDate:   bookingDate ? new Date(bookingDate) : undefined,
      },
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── PUT /api/admin/bookings/:id ── */
app.put('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      customerName, contactNumber, email, checkIn, checkOut,
      guests, paymentMethod, paymentStatus, totalAmount,
      extraServices, notes, userId,
    } = req.body;

    const data = {};
    if (customerName  !== undefined) data.customerName  = customerName;
    if (contactNumber !== undefined) data.contactNumber = contactNumber;
    if (email         !== undefined) data.email         = email;
    if (checkIn       !== undefined) data.checkIn       = new Date(checkIn);
    if (checkOut      !== undefined) data.checkOut      = new Date(checkOut);
    if (guests        !== undefined) data.guests        = parseInt(guests, 10);
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
    if (paymentStatus !== undefined) data.paymentStatus = paymentStatus;
    if (totalAmount   !== undefined) data.totalAmount   = parseFloat(totalAmount);
    if (extraServices !== undefined) data.extraServices = extraServices;
    if (notes         !== undefined) data.notes         = notes;
    if (userId        !== undefined) data.userId        = userId ? parseInt(userId, 10) : null;

    const booking = await prisma.booking.update({ where: { id }, data });
    res.json(booking);
  } catch (err) {
    console.error('Update booking error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── DELETE /api/admin/bookings/:id ── */
app.delete('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.booking.delete({ where: { id } });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    console.error('Delete booking error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── POST /api/admin/seed-demo ── */
app.post('/api/admin/seed-demo', requireAdmin, async (req, res) => {
  try {
    const names    = ['Arjun Sharma','Priya Mehta','Rohan Kapoor','Neha Singh','Vikram Patel','Aisha Khan','Siddharth Nair','Divya Rao','Karan Malhotra','Sneha Joshi','Abhishek Verma','Pooja Gupta','Rahul Desai','Ananya Iyer','Manish Tiwari'];
    const methods  = ['card','cash','upi','bank_transfer'];
    const statuses = ['pending','paid','paid','paid','failed','refunded','pending','paid'];
    const extras   = ['["Airport Transfer","Breakfast"]','["Pool Access"]','["Spa Package","Wine Welcome"]','[]','["Breakfast","Late Checkout"]','["Airport Transfer"]','["Early Check-in","Pool Access"]',null];

    const now = new Date();
    const bookingsData = names.map((name, i) => {
      const daysOffset = (i - 7) * 4;
      const checkIn    = new Date(now); checkIn.setDate(checkIn.getDate() + daysOffset);
      const checkOut   = new Date(checkIn); checkOut.setDate(checkOut.getDate() + 2 + (i % 5));
      return {
        customerName:  name,
        contactNumber: `+91 9${String(8000000000 + i * 111111111).slice(1)}`,
        email:         `${name.split(' ')[0].toLowerCase()}${i + 1}@example.com`,
        checkIn,
        checkOut,
        guests:        1 + (i % 6),
        paymentMethod: methods[i % methods.length],
        paymentStatus: statuses[i % statuses.length],
        totalAmount:   15000 + (i * 3500) + ((i % 3) * 1200),
        extraServices: extras[i % extras.length],
        notes:         i % 3 === 0 ? 'Special anniversary stay, please arrange flowers.' : null,
        bookingDate:   new Date(now.getTime() - (14 - i) * 86400000),
      };
    });

    await prisma.booking.createMany({ data: bookingsData });
    res.json({ message: `${bookingsData.length} demo bookings created.` });
  } catch (err) {
    console.error('Seed error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── GET /api/bookings/my — customer's own bookings ── */
app.get('/api/bookings/my', requireAuth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bookings });
  } catch (err) {
    console.error('My bookings error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── POST /api/bookings — customer creates a booking ── */
app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { checkIn, checkOut, guests, contactNumber, notes, paymentMethod } = req.body;

    if (!checkIn || !checkOut || !guests || !contactNumber) {
      return res.status(400).json({ message: 'Check-in, check-out, guests and contact number are required.' });
    }

    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in.' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const RATE_PER_NIGHT = 25000;
    const totalAmount = nights * RATE_PER_NIGHT;

    const booking = await prisma.booking.create({
      data: {
        customerName:  user.name,
        email:         user.email,
        contactNumber,
        checkIn:       checkInDate,
        checkOut:      checkOutDate,
        guests:        parseInt(guests),
        paymentMethod: paymentMethod || 'card',
        paymentStatus: 'pending',
        totalAmount,
        notes:         notes || '',
        userId:        user.id,
      },
    });

    res.status(201).json({ booking });
  } catch (err) {
    console.error('Create booking error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── DELETE /api/bookings/:id — customer cancels own booking ── */
app.delete('/api/bookings/:id', requireAuth, async (req, res) => {
  try {
    const id      = parseInt(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking)                       return res.status(404).json({ message: 'Booking not found.' });
    if (booking.userId !== req.user.id) return res.status(403).json({ message: 'Not your booking.' });
    if (booking.paymentStatus === 'paid') return res.status(400).json({ message: 'Paid bookings cannot be cancelled. Please contact us.' });

    await prisma.booking.delete({ where: { id } });
    res.json({ message: 'Booking cancelled.' });
  } catch (err) {
    console.error('Cancel booking error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
