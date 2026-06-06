require('dotenv').config();
const express            = require('express');
const cors               = require('cors');
const jwt                = require('jsonwebtoken');
const bcrypt             = require('bcryptjs');
const crypto             = require('crypto');
const Razorpay           = require('razorpay');
const { Pool }           = require('pg');
const { PrismaClient }   = require('@prisma/client');
const { PrismaPg }       = require('@prisma/adapter-pg');

const pool   = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const app    = express();

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;
const PORT   = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET;

const RATE_PER_NIGHT  = parseInt(process.env.RATE_PER_NIGHT || '25000');
const EXTRAS_PRICING  = { bbq: 800, cook: 4000, driver: 800, pet: 1500 };
function calcExtrasAmount(extraServices) {
  if (!Array.isArray(extraServices)) return 0;
  return extraServices.reduce((sum, key) => sum + (EXTRAS_PRICING[key] || 0), 0);
}

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));
/* Webhook route needs the raw body for HMAC verification — must be
   registered BEFORE express.json() so it gets the untouched buffer. */
app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret === 'your_webhook_secret_here') {
    console.warn('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set — skipping.');
    return res.status(200).json({ status: 'ignored' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) return res.status(400).json({ message: 'Missing signature header.' });

  /* Verify the webhook signature using the raw body buffer */
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)          // req.body is a Buffer here
    .digest('hex');

  if (expected !== signature) {
    console.error('Razorpay webhook signature mismatch — possible spoofed request.');
    return res.status(400).json({ message: 'Invalid signature.' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ message: 'Invalid JSON payload.' });
  }

  console.log('Razorpay webhook event:', event.event);

  /* Handle payment.captured — this is the reliable confirmation that
     money actually arrived. We upsert the booking so duplicate webhooks
     are safe (Razorpay may send the same event more than once). */
  if (event.event === 'payment.captured') {
    const payment   = event.payload.payment.entity;
    const orderId   = payment.order_id;   // links back to the order we created
    const paymentId = payment.id;

    try {
      /* Find a pending booking created by the client-side verify-payment flow,
         OR create one if the browser never called verify-payment at all. */
      const existing = await prisma.booking.findFirst({
        where: {
          OR: [
            { razorpayOrderId:   orderId   },
            { razorpayPaymentId: paymentId },
          ],
        },
      });

      if (existing) {
        /* Already recorded — just ensure it is marked paid */
        if (existing.paymentStatus !== 'paid') {
          await prisma.booking.update({
            where: { id: existing.id },
            data:  { paymentStatus: 'paid', razorpayPaymentId: paymentId },
          });
          console.log(`Webhook: marked booking ${existing.id} as paid.`);
        } else {
          console.log(`Webhook: booking ${existing.id} already paid — no-op.`);
        }
      } else {
        /* Browser never called verify-payment — create the booking now
           using the notes Razorpay echoes back from orders.create(). */
        const notes = payment.notes || {};
        if (notes.userId && notes.checkIn && notes.checkOut) {
          const user = await prisma.user.findUnique({ where: { id: parseInt(notes.userId) } });
          if (user) {
            const checkInDate  = new Date(notes.checkIn);
            const checkOutDate = new Date(notes.checkOut);
            const nights       = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            await prisma.booking.create({
              data: {
                customerName:     user.name,
                email:            user.email,
                contactNumber:    notes.contactNumber || '',
                checkIn:          checkInDate,
                checkOut:         checkOutDate,
                guests:           parseInt(notes.guests) || 1,
                paymentMethod:    'card',
                paymentStatus:    'paid',
                totalAmount:      nights * RATE_PER_NIGHT,
                notes:            '',
                userId:           user.id,
                razorpayOrderId:  orderId,
                razorpayPaymentId: paymentId,
              },
            });
            console.log(`Webhook: created booking for user ${user.id} via fallback path.`);
          }
        } else {
          console.warn('Webhook: payment.captured missing notes — cannot create booking automatically.');
        }
      }
    } catch (err) {
      console.error('Webhook DB error:', err.message);
      /* Return 200 anyway so Razorpay does not keep retrying for a DB
         hiccup — we can reconcile manually from the Razorpay dashboard. */
    }
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity;
    console.log(`Webhook: payment failed — order ${payment.order_id}, error: ${payment.error_description}`);
  }

  res.status(200).json({ status: 'ok' });
});

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

    const nights      = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
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

/* ── GET /api/availability ── */
app.get('/api/availability', async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    return res.status(400).json({ message: 'checkIn and checkOut are required.' });
  }
  try {
    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in.' });
    }

    const conflicts = await prisma.booking.findMany({
      where: {
        AND: [
          { checkIn:       { lt: checkOutDate } },
          { checkOut:      { gt: checkInDate  } },
          { paymentStatus: { notIn: ['failed', 'refunded'] } },
        ],
      },
      select: { checkIn: true, checkOut: true },
    });

    const nights      = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * RATE_PER_NIGHT;

    res.json({
      available:   conflicts.length === 0,
      nights,
      totalAmount,
      conflicts:   conflicts.map(c => ({ checkIn: c.checkIn, checkOut: c.checkOut })),
    });
  } catch (err) {
    console.error('Availability error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ── POST /api/bookings/create-order ── */
app.post('/api/bookings/create-order', requireAuth, async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ message: 'Payment service is not configured. Please contact support.' });
  }
  const { checkIn, checkOut, guests, contactNumber, paymentMethod, notes, extraServices } = req.body;
  if (!checkIn || !checkOut || !guests || !contactNumber) {
    return res.status(400).json({ message: 'Check-in, check-out, guests and contact number are required.' });
  }
  try {
    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in.' });
    }

    const conflicts = await prisma.booking.findMany({
      where: {
        AND: [
          { checkIn:       { lt: checkOutDate } },
          { checkOut:      { gt: checkInDate  } },
          { paymentStatus: { notIn: ['failed', 'refunded'] } },
        ],
      },
    });
    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Selected dates are no longer available. Please choose different dates.' });
    }

    const nights       = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const extrasAmount = calcExtrasAmount(extraServices);
    const totalAmount  = (nights * RATE_PER_NIGHT) + extrasAmount;

    const order = await razorpay.orders.create({
      amount:   totalAmount * 100,
      currency: 'INR',
      receipt:  `bk_${req.user.id}_${Date.now()}`,
      notes:    { userId: String(req.user.id), checkIn, checkOut, guests: String(guests) },
    });

    res.json({
      orderId:        order.id,
      amount:         order.amount,
      currency:       order.currency,
      keyId:          process.env.RAZORPAY_KEY_ID,
      bookingPreview: { nights, totalAmount, extrasAmount },
    });
  } catch (err) {
    console.error('Create order error:', err.statusCode, err.error || err.message);
    if (err.statusCode === 401) {
      return res.status(500).json({ message: 'Payment gateway authentication failed. Please check your Razorpay API keys in the server .env file.' });
    }
    res.status(500).json({ message: err.error?.description || err.message || 'Server error creating payment order.' });
  }
});

/* ── POST /api/bookings/verify-payment ── */
app.post('/api/bookings/verify-payment', requireAuth, async (req, res) => {
  const {
    razorpay_payment_id, razorpay_order_id, razorpay_signature,
    checkIn, checkOut, guests, contactNumber, paymentMethod, notes, extraServices,
  } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Payment details are incomplete.' });
  }
  try {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Please contact support.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights       = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const extrasAmount = calcExtrasAmount(extraServices);
    const totalAmount  = (nights * RATE_PER_NIGHT) + extrasAmount;

    const booking = await prisma.booking.create({
      data: {
        customerName:     user.name,
        email:            user.email,
        contactNumber,
        checkIn:          checkInDate,
        checkOut:         checkOutDate,
        guests:           parseInt(guests),
        paymentMethod:    paymentMethod || 'card',
        paymentStatus:    'paid',
        totalAmount,
        extraServices:    Array.isArray(extraServices) && extraServices.length ? extraServices.join(',') : null,
        notes:            notes || '',
        userId:           user.id,
        razorpayOrderId:  razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    res.status(201).json({ booking });
  } catch (err) {
    console.error('Verify payment error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
