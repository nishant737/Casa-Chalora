import { useCallback, useEffect, useRef, useState } from 'react';
import heroImage from './assets/images/hamburger.jpg';
import ourVillaImg from './assets/images/casa-ourvilla.jpg';
import ourVilla2 from './assets/images/our villa 2.jpg';
import ourVilla3 from './assets/images/our villa 3.jpg';
import ourVilla4 from './assets/images/our villa 4.jpg';
import aboutVideo from './assets/images/aboutus.mp4';
import logoImg from './assets/images/Casa_Chalora_Logo.png';
import logoHam from './assets/images/hamburger.png';
import accomOne   from './assets/images/accomadationone.jpg';
import accomTwo   from './assets/images/accomadationtwo.jpg';
import accomThree from './assets/images/accomadationthree.jpg';
import accomFour  from './assets/images/accomadationfour.jpg';
import accomFive  from './assets/images/accomadationfive.jpg';
import accomSix   from './assets/images/accomadationsix.jpg';
import accomSeven from './assets/images/accomadationseven.jpg';
import accomEight from './assets/images/accomadationeight.jpg';
import accomNine  from './assets/images/accomadationnine.jpg';
import './App.css';


/* ─── Auth Modal ──────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthModal({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setErrors({});
    setApiError('');
    setFields({ name: '', email: '', password: '' });
  };

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !fields.name.trim()) e.name = 'Full name is required.';
    if (!fields.email.trim()) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(fields.email)) e.email = 'Enter a valid email address.';
    if (!fields.password) e.password = 'Password is required.';
    else if (fields.password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setErrors({});
    setApiError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: fields.email, password: fields.password }
        : { name: fields.name, email: fields.email, password: fields.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || data.error || 'Something went wrong. Please try again.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      if (onAuthSuccess) onAuthSuccess(data.token, data.role, data.name);
      onClose();
    } catch {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field) => (e) => {
    setFields(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div
      className="auth-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? 'Login' : 'Create account'}
    >
      <div className="auth-card">
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="auth-header">
          <span className="auth-eyebrow">Casa Chalora</span>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <div className="auth-divider" />
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Your full name"
                value={fields.name}
                onChange={setField('name')}
                autoComplete="name"
                className={errors.name ? 'auth-input--error' : ''}
              />
              {errors.name && <span className="auth-field-error">{errors.name}</span>}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={fields.email}
              onChange={setField('email')}
              autoComplete="email"
              className={errors.email ? 'auth-input--error' : ''}
            />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="Minimum 6 characters"
              value={fields.password}
              onChange={setField('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={errors.password ? 'auth-input--error' : ''}
            />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          {apiError && <p className="auth-api-error">{apiError}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <span className="auth-spinner" aria-label="Loading" />
              : (mode === 'login' ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={switchMode}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─── Our Villa Section ───────────────────────────────────────── */

const VILLA_SLIDES = [
  { src: ourVillaImg, pos: 'center center' },
  { src: ourVilla2,   pos: 'center center' },
  { src: ourVilla3,   pos: 'center top'    },
  { src: ourVilla4,   pos: 'center top'    },
];

function OurVilla() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(c => (c + 1) % VILLA_SLIDES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="our-villa" className="our-villa-section">
      <div className="our-villa-image-col">
        {VILLA_SLIDES.map(({ src, pos }, i) => (
          <img
            key={src}
            src={src}
            alt={`Casa Chalora Villa ${i + 1}`}
            style={{ objectPosition: pos }}
            className={`our-villa-image${i === current ? ' our-villa-image--active' : ''}`}
          />
        ))}
        {/* Subtle slide counter dots */}
        <div className="our-villa-dots">
          {VILLA_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`our-villa-dot${i === current ? ' our-villa-dot--active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="our-villa-content-col">
        <span className="our-villa-eyebrow">Luxury Villa · Goa</span>
        <h2 className="our-villa-title">Our Villa</h2>
        <div className="our-villa-divider" />
        <p className="our-villa-body">
          Casa Chalora is an incredible haven in the centre of Goa where elegance and peace
          coexist. Tucked away in this seaside paradise's verdant surroundings and clear blue
          skies, this property provides an experience unlike any other.
        </p>
        <p className="our-villa-body">
          Enter the magnificent home, where elegant furnishings that combine comfort and
          refinement welcome you. Find comfort in our warm alcoves, which are perfect for quiet
          conversations or delving into a gripping novel. Time slows down here in the peaceful
          surroundings, making it possible for you to fully enjoy every minute.
        </p>
        <p className="our-villa-body">
          Savour the pinnacle of contemporary luxury with a selection of features — from fully
          stocked bar counters and exhilarating pool tables to high-definition entertainment
          systems complete with TVs and projectors. A chic outdoor pool and manicured lawn
          invite you to cool down and unwind.
        </p>
        
      </div>
    </section>
  );
}

/* ─── Hero ────────────────────────────────────────────────────── */

function Hero() {
  const videoRef = useRef(null);
  const [logoVisible, setLogoVisible] = useState(false);
  const [logoSmall, setLogoSmall] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 300);
    const t2 = setTimeout(() => setLogoSmall(true), 300 + 1600 + 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Don't load or play video on mobile — use poster image instead
    if (window.innerWidth < 768) {
      video.removeAttribute('src');
      video.load();
      return;
    }

    const handleTimeUpdate = () => {
      if (video.currentTime >= 26.5) {
        video.currentTime = 4;
      }
    };

    const handleLoaded = () => {
      video.currentTime = 4;
      video.play().catch(() => {});
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoaded);

    if (video.readyState >= 1) handleLoaded();

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, []);

  return (
    <section id="home" className="hero-section">
      <video
        ref={videoRef}
        className="hero-bg-video"
        src={aboutVideo}
        poster={heroImage}
        autoPlay
        muted
        playsInline
        preload="auto"
      />
      <div className="hero-bg-overlay" />

      {/* Centered logo */}
      <div className={`hero-logo-wrap${logoVisible ? ' hero-logo-wrap--visible' : ''}${logoSmall ? ' hero-logo-wrap--small' : ''}`}>
        <img src={logoImg} alt="Casa Chalora" className="hero-logo" />
      </div>

      {/* Follow us — right edge */}
      <div className="hero-follow">
        <span className="hero-follow-label">FOLLOW US</span>
        <div className="hero-follow-icons">
          <a href="https://www.instagram.com/casachaloragoa/?hl=en" target="_blank" rel="noreferrer" className="hero-follow-icon" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hero-follow-icon" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Accommodation ───────────────────────────────────────────── */

const ACCOM_PHOTOS = [
  { src: accomOne,   label: 'Master Suite',     desc: 'King bed · En-suite · Garden view' },
  { src: accomTwo,   label: 'Deluxe Room',       desc: 'Queen bed · Private terrace' },
  { src: accomThree, label: 'Premium Suite',     desc: 'King bed · Pool view' },
  { src: accomFour,  label: 'Garden Bedroom',    desc: 'Twin beds · Courtyard access' },
  { src: accomFive,  label: 'Junior Suite',      desc: 'King bed · Outdoor shower' },
  { src: accomSix,   label: 'Poolside Room',     desc: 'Queen bed · Direct pool access' },
  { src: accomSeven, label: 'Forest View',       desc: 'King bed · Floor-to-ceiling windows' },
  { src: accomEight, label: 'Cosy Alcove',       desc: 'Queen bed · Reading nook' },
  { src: accomNine,  label: 'Heritage Chamber',  desc: 'King bed · Antique décor · Balcony' },
];

function Accommodation() {
  const [lightbox, setLightbox] = useState(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox(i => (i - 1 + ACCOM_PHOTOS.length) % ACCOM_PHOTOS.length), []);
  const next = useCallback(() => setLightbox(i => (i + 1) % ACCOM_PHOTOS.length), []);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightbox, closeLightbox, prev, next]);

  return (
    <section id="accommodation" className="accom-section">

      {/* ── Header ── */}
      <div className="accom-header">
        <span className="accom-eyebrow">Stay With Us</span>
        <h2 className="accom-title">Accommodation</h2>
        <div className="accom-divider" />
        <p className="accom-subtitle">
          Nine thoughtfully curated rooms — each a private sanctuary blending
          heritage craftsmanship with contemporary comfort.
        </p>
      </div>

      {/* ── Editorial grid ── */}
      <div className="accom-grid">
        {ACCOM_PHOTOS.map(({ src, label, desc }, i) => (
          <button
            key={i}
            className={`accom-cell accom-cell--${i}`}
            onClick={() => setLightbox(i)}
            aria-label={`View ${label}`}
          >
            <img src={src} alt={label} className="accom-cell-img" loading="lazy" />
            <div className="accom-cell-overlay">
              <span className="accom-cell-label">{label}</span>
              <span className="accom-cell-desc">{desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div className="accom-lightbox" onClick={closeLightbox}>
          <button className="accom-lb-close" onClick={closeLightbox} aria-label="Close">✕</button>
          <button className="accom-lb-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          <div className="accom-lb-content" onClick={e => e.stopPropagation()}>
            <img src={ACCOM_PHOTOS[lightbox].src} alt={ACCOM_PHOTOS[lightbox].label} className="accom-lb-img" />
            <div className="accom-lb-info">
              <span className="accom-lb-label">{ACCOM_PHOTOS[lightbox].label}</span>
              <span className="accom-lb-desc">{ACCOM_PHOTOS[lightbox].desc}</span>
              <span className="accom-lb-counter">{lightbox + 1} / {ACCOM_PHOTOS.length}</span>
            </div>
          </div>
          <button className="accom-lb-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
        </div>
      )}
    </section>
  );
}

/* ─── Super Admin Dashboard ───────────────────────────────────── */

const API = 'http://localhost:4000';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function fmtAmt(amount) {
  if (amount == null) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}


function StatusBadge({ status }) {
  return (
    <span className={`adm-status adm-status--${status}`}>{status}</span>
  );
}

const EMPTY_BOOKING_FORM = {
  customerName: '', contactNumber: '', email: '',
  checkIn: '', checkOut: '', guests: 1,
  paymentMethod: 'card', paymentStatus: 'pending',
  totalAmount: '', extraServices: '', notes: '',
};

function BookingModal({ booking, onClose, onSave, token, mode }) {
  const [form, setForm] = useState(() => {
    if (!booking) return EMPTY_BOOKING_FORM;
    return {
      customerName:  booking.customerName  || '',
      contactNumber: booking.contactNumber || '',
      email:         booking.email         || '',
      checkIn:       booking.checkIn  ? booking.checkIn.slice(0, 10)  : '',
      checkOut:      booking.checkOut ? booking.checkOut.slice(0, 10) : '',
      guests:        booking.guests        || 1,
      paymentMethod: booking.paymentMethod || 'card',
      paymentStatus: booking.paymentStatus || 'pending',
      totalAmount:   booking.totalAmount   != null ? booking.totalAmount : '',
      extraServices: booking.extraServices || '',
      notes:         booking.notes         || '',
    };
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const url    = mode === 'edit' ? `${API}/api/admin/bookings/${booking.id}` : `${API}/api/admin/bookings`;
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, totalAmount: parseFloat(form.totalAmount) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || 'Error'); return; }
      onSave(data);
    } catch { setErr('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="adm-modal-overlay" onClick={(e) => { if (e.target.classList.contains('adm-modal-overlay')) onClose(); }}>
      <div className="adm-modal">
        <div className="adm-modal-header">
          <h3>{mode === 'edit' ? `Edit Booking #${booking.id}` : 'New Booking'}</h3>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="adm-modal-form" onSubmit={submit}>
          <div className="adm-form-grid">
            <div className="adm-field">
              <label>Customer Name *</label>
              <input value={form.customerName} onChange={set('customerName')} required placeholder="Full name" />
            </div>
            <div className="adm-field">
              <label>Contact Number *</label>
              <input value={form.contactNumber} onChange={set('contactNumber')} required placeholder="+91 98765 43210" />
            </div>
            <div className="adm-field">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="guest@example.com" />
            </div>
            <div className="adm-field">
              <label>Guests *</label>
              <input type="number" min="1" max="30" value={form.guests} onChange={set('guests')} required />
            </div>
            <div className="adm-field">
              <label>Check-in *</label>
              <input type="date" value={form.checkIn} onChange={set('checkIn')} required />
            </div>
            <div className="adm-field">
              <label>Check-out *</label>
              <input type="date" value={form.checkOut} onChange={set('checkOut')} required />
            </div>
            <div className="adm-field">
              <label>Payment Method *</label>
              <select value={form.paymentMethod} onChange={set('paymentMethod')}>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="adm-field">
              <label>Payment Status</label>
              <select value={form.paymentStatus} onChange={set('paymentStatus')}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="adm-field">
              <label>Total Amount (₹) *</label>
              <input type="number" step="0.01" value={form.totalAmount} onChange={set('totalAmount')} required placeholder="25000" />
            </div>
            <div className="adm-field">
              <label>Extra Services (comma-separated)</label>
              <input value={form.extraServices} onChange={set('extraServices')} placeholder="Airport Transfer, Breakfast" />
            </div>
            <div className="adm-field adm-field--full">
              <label>Notes</label>
              <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Special requests..." />
            </div>
          </div>
          {err && <p className="adm-form-error">{err}</p>}
          <div className="adm-modal-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
              {loading ? <span className="adm-spinner" /> : (mode === 'edit' ? 'Save Changes' : 'Create Booking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SuperAdminDashboard({ token, onLogout }) {
  const [bookings, setBookings]           = useState([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [stats, setStats]                 = useState({ totalBookings: 0, totalRevenue: 0, pendingPayments: 0, activeBookings: 0 });
  const [loading, setLoading]             = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterMethod, setFilterMethod]   = useState('');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [checkInFrom, setCheckInFrom]     = useState('');
  const [checkInTo, setCheckInTo]         = useState('');
  const [checkOutFrom, setCheckOutFrom]   = useState('');
  const [checkOutTo, setCheckOutTo]       = useState('');
  const [sortBy, setSortBy]               = useState('createdAt');
  const [sortOrder, setSortOrder]         = useState('desc');
  const [editBooking, setEditBooking]     = useState(null);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [deleteId, setDeleteId]           = useState(null);
  const [seedLoading, setSeedLoading]     = useState(false);
  const [seedMsg, setSeedMsg]             = useState('');
  const searchTimer = useRef(null);

  const fetchBookings = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page, limit: 20, sortBy, sortOrder,
        ...(search      && { search }),
        ...(filterStatus && { paymentStatus: filterStatus }),
        ...(filterMethod && { paymentMethod: filterMethod }),
        ...(dateFrom     && { dateFrom }),
        ...(dateTo       && { dateTo }),
        ...(checkInFrom  && { checkInFrom }),
        ...(checkInTo    && { checkInTo }),
        ...(checkOutFrom && { checkOutFrom }),
        ...(checkOutTo   && { checkOutTo }),
        ...params,
      });
      const res  = await fetch(`${API}/api/admin/bookings?${q}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setStats(data.stats);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, page, sortBy, sortOrder, search, filterStatus, filterMethod, dateFrom, dateTo, checkInFrom, checkInTo, checkOutFrom, checkOutTo]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span style={{ opacity: 0.3, marginLeft: 4 }}>⇅</span>;
    return <span style={{ marginLeft: 4 }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/api/admin/bookings/${deleteId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setDeleteId(null); fetchBookings(); }
    } catch (e) { console.error(e); }
  };

  const handleSeed = async () => {
    setSeedLoading(true); setSeedMsg('');
    try {
      const res  = await fetch(`${API}/api/admin/seed-demo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSeedMsg(data.message || 'Done');
      fetchBookings();
    } catch { setSeedMsg('Error seeding.'); }
    finally { setSeedLoading(false); setTimeout(() => setSeedMsg(''), 3000); }
  };

  const exportCSV = () => {
    const headers = ['ID','Booking Date','Customer','Email','Contact','Check-in','Check-out','Guests','Method','Status','Amount','Extras','Notes'];
    const rows = bookings.map(b => [
      b.id, fmt(b.bookingDate), `"${b.customerName}"`, b.email, b.contactNumber,
      fmt(b.checkIn), fmt(b.checkOut), b.guests, b.paymentMethod, b.paymentStatus,
      b.totalAmount, `"${b.extraServices || ''}"`, `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a   = document.createElement('a');
    a.href    = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `casachalora-bookings-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const resetFilters = () => {
    setSearch(''); setFilterStatus(''); setFilterMethod('');
    setDateFrom(''); setDateTo('');
    setCheckInFrom(''); setCheckInTo('');
    setCheckOutFrom(''); setCheckOutTo('');
    setPage(1);
  };

  const statCards = [
    { label: 'Total Bookings',   value: stats.totalBookings,                            icon: '📋' },
    { label: 'Total Revenue',    value: fmtAmt(stats.totalRevenue),                     icon: '₹'  },
    { label: 'Pending Payments', value: stats.pendingPayments,                          icon: '⏳' },
    { label: 'Active Bookings',  value: stats.activeBookings,                           icon: '🏡' },
  ];

  const parseExtras = (str) => {
    if (!str) return [];
    try { const p = JSON.parse(str); return Array.isArray(p) ? p : []; }
    catch { return str.split(',').map(s => s.trim()).filter(Boolean); }
  };

  return (
    <div className="adm-root">
      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar${sidebarOpen ? ' adm-sidebar--open' : ''}`}>
        <div className="adm-sidebar-logo">
          <img src={logoImg} alt="Casa Chalora" className="adm-sidebar-logo-img" />
          <span className="adm-sidebar-logo-sub">Super Admin</span>
        </div>
        <nav className="adm-sidebar-nav">
          <button className="adm-nav-item adm-nav-item--active">
            <span className="adm-nav-icon">≡</span>
            Bookings
          </button>
        </nav>
        <button className="adm-sidebar-logout" onClick={onLogout}>
          <span>⏻</span> Logout
        </button>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="adm-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="adm-main">
        {/* Top bar */}
        <header className="adm-topbar">
          <button className="adm-hamburger" onClick={() => setSidebarOpen(s => !s)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <h1 className="adm-topbar-title">Bookings Management</h1>
          <div className="adm-topbar-right">
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={handleSeed} disabled={seedLoading}>
              {seedLoading ? <span className="adm-spinner adm-spinner--sm" /> : '＋ Seed Demo'}
            </button>
            {seedMsg && <span className="adm-seed-msg">{seedMsg}</span>}
          </div>
        </header>

        <div className="adm-content">
          {/* Stats */}
          <div className="adm-stats-row">
            {statCards.map(c => (
              <div key={c.label} className="adm-stat-card">
                <span className="adm-stat-icon">{c.icon}</span>
                <div>
                  <div className="adm-stat-value">{c.value}</div>
                  <div className="adm-stat-label">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bookings section */}
          <div className="adm-section">
            <div className="adm-section-header">
              <h2 className="adm-section-title">Bookings <span className="adm-total-badge">{total}</span></h2>
              <div className="adm-section-actions">
                <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => setShowAddModal(true)}>＋ New Booking</button>
                <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={exportCSV}>↓ Export CSV</button>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="adm-filters">
              <div className="adm-search-wrap">
                <span className="adm-search-icon">⌕</span>
                <input
                  className="adm-search"
                  placeholder="Search name, email, phone…"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    clearTimeout(searchTimer.current);
                    searchTimer.current = setTimeout(() => setPage(1), 500);
                  }}
                />
              </div>
              <select className="adm-filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select className="adm-filter-select" value={filterMethod} onChange={e => { setFilterMethod(e.target.value); setPage(1); }}>
                <option value="">All Methods</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={resetFilters}>✕ Reset</button>
            </div>

            {/* Date filters */}
            <div className="adm-date-filters">
              <div className="adm-date-group">
                <span className="adm-date-label">Booking Date</span>
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="adm-date-input" />
                <span>–</span>
                <input type="date" value={dateTo}   onChange={e => { setDateTo(e.target.value);   setPage(1); }} className="adm-date-input" />
              </div>
              <div className="adm-date-group">
                <span className="adm-date-label">Check-in</span>
                <input type="date" value={checkInFrom} onChange={e => { setCheckInFrom(e.target.value); setPage(1); }} className="adm-date-input" />
                <span>–</span>
                <input type="date" value={checkInTo}   onChange={e => { setCheckInTo(e.target.value);   setPage(1); }} className="adm-date-input" />
              </div>
              <div className="adm-date-group">
                <span className="adm-date-label">Check-out</span>
                <input type="date" value={checkOutFrom} onChange={e => { setCheckOutFrom(e.target.value); setPage(1); }} className="adm-date-input" />
                <span>–</span>
                <input type="date" value={checkOutTo}   onChange={e => { setCheckOutTo(e.target.value);   setPage(1); }} className="adm-date-input" />
              </div>
            </div>

            {/* Table */}
            <div className="adm-table-wrap">
              {loading ? (
                <div className="adm-loading"><span className="adm-spinner adm-spinner--lg" /> Loading…</div>
              ) : bookings.length === 0 ? (
                <div className="adm-empty">No bookings found. Try adjusting your filters or seed demo data.</div>
              ) : (
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="adm-th-sort" onClick={() => handleSort('id')}>ID <SortIcon field="id" /></th>
                      <th className="adm-th-sort" onClick={() => handleSort('bookingDate')}>Date <SortIcon field="bookingDate" /></th>
                      <th className="adm-th-sort" onClick={() => handleSort('customerName')}>Customer <SortIcon field="customerName" /></th>
                      <th>Contact</th>
                      <th className="adm-th-sort" onClick={() => handleSort('checkIn')}>Check-in <SortIcon field="checkIn" /></th>
                      <th className="adm-th-sort" onClick={() => handleSort('checkOut')}>Check-out <SortIcon field="checkOut" /></th>
                      <th>Guests</th>
                      <th>Method</th>
                      <th className="adm-th-sort" onClick={() => handleSort('paymentStatus')}>Status <SortIcon field="paymentStatus" /></th>
                      <th className="adm-th-sort" onClick={() => handleSort('totalAmount')}>Amount <SortIcon field="totalAmount" /></th>
                      <th>Extras</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => (
                      <tr key={b.id} className="adm-tr">
                        <td className="adm-td-muted">{(page - 1) * 20 + idx + 1}</td>
                        <td className="adm-td-id">#{b.id}</td>
                        <td className="adm-td-date">{fmt(b.bookingDate)}</td>
                        <td>
                          <div className="adm-customer-name">{b.customerName}</div>
                          <div className="adm-customer-email">{b.email}</div>
                        </td>
                        <td className="adm-td-contact">{b.contactNumber}</td>
                        <td className="adm-td-date">{fmt(b.checkIn)}</td>
                        <td className="adm-td-date">{fmt(b.checkOut)}</td>
                        <td style={{ textAlign: 'center' }}>{b.guests}</td>
                        <td className="adm-td-method">{b.paymentMethod.replace('_', ' ')}</td>
                        <td><StatusBadge status={b.paymentStatus} /></td>
                        <td className="adm-td-amount">{fmtAmt(b.totalAmount)}</td>
                        <td>
                          <div className="adm-extras">
                            {parseExtras(b.extraServices).slice(0,2).map((ex, i) => (
                              <span key={i} className="adm-extra-tag">{ex}</span>
                            ))}
                            {parseExtras(b.extraServices).length > 2 && (
                              <span className="adm-extra-tag adm-extra-tag--more">+{parseExtras(b.extraServices).length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="adm-row-actions">
                            <button className="adm-action-btn adm-action-btn--edit" onClick={() => setEditBooking(b)} title="Edit">✎</button>
                            <button className="adm-action-btn adm-action-btn--delete" onClick={() => setDeleteId(b.id)} title="Delete">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="adm-pagination">
                <button className="adm-page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                <button className="adm-page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let p;
                  if (totalPages <= 7) p = i + 1;
                  else if (page <= 4) p = i + 1;
                  else if (page >= totalPages - 3) p = totalPages - 6 + i;
                  else p = page - 3 + i;
                  return (
                    <button
                      key={p}
                      className={`adm-page-btn${page === p ? ' adm-page-btn--active' : ''}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  );
                })}
                <button className="adm-page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>›</button>
                <button className="adm-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
                <span className="adm-page-info">Page {page} of {totalPages} · {total} records</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editBooking && (
        <BookingModal
          booking={editBooking}
          token={token}
          mode="edit"
          onClose={() => setEditBooking(null)}
          onSave={() => { setEditBooking(null); fetchBookings(); }}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <BookingModal
          booking={null}
          token={token}
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSave={() => { setShowAddModal(false); fetchBookings(); }}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal--sm">
            <div className="adm-modal-header">
              <h3>Delete Booking #{deleteId}?</h3>
            </div>
            <p style={{ padding: '16px 24px', color: '#4b5563', fontSize: 14 }}>
              This action cannot be undone. The booking will be permanently removed.
            </p>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn--ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── App ─────────────────────────────────────────────────────── */

const NAV_LINKS = ['Home', 'Our Villa', 'Experiences', 'Gallery', 'Amenities', 'About Us', 'Contact Us'];

function App() {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => localStorage.getItem('role') === 'superadmin');
  const [adminToken, setAdminToken]   = useState(() => localStorage.getItem('token') || '');

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const handleAuthSuccess = useCallback((token, role) => {
    if (role === 'superadmin') {
      setAdminToken(token);
      setIsSuperAdmin(true);
    }
  }, []);

  const handleAdminLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setIsSuperAdmin(false);
    setAdminToken('');
  }, []);

  if (isSuperAdmin) {
    return <SuperAdminDashboard token={adminToken} onLogout={handleAdminLogout} />;
  }

  return (
    <div className="App">
      {/* ── Fixed nav bar — always on top ── */}
      <nav className="hero-nav">
        <div className="hero-nav-left" />
        <div className="hero-nav-right">
          <button className="hero-nav-book" onClick={() => setAuthOpen(true)}>BOOK NOW</button>
          <button className="hero-nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Full-screen hamburger menu overlay ── */}
      <div className={`menu-overlay${menuOpen ? ' menu-overlay--open' : ''}`} aria-hidden={!menuOpen}>
        <div className={`menu-img-panel${menuOpen ? ' menu-img-panel--open' : ''}`}>
          <img src={heroImage} alt="Casa Chalora Villa" className="menu-img" />
          <div className="menu-img-overlay" />
          <div className="menu-img-caption">
            <span className="menu-img-sub">Luxury Villa</span>
            <span className="menu-img-name">Casa Chalora</span>
          </div>
        </div>

        <div className={`menu-nav-panel${menuOpen ? ' menu-nav-panel--open' : ''}`}>
          <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
          <div className="menu-top">
            <img src={logoHam} alt="Casa Chalora" className="menu-logo" />
          </div>

          <nav className="menu-links">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="menu-link"
                style={{ '--link-delay': `${0.72 + i * 0.07}s` }}
                onClick={() => setMenuOpen(false)}
              >
                <span className="menu-link-arrow">→</span>
                <span className="menu-link-text">{link}</span>
              </a>
            ))}
          </nav>

          <div className="menu-contact">
            <p>casachalora@gmail.com</p>
            <p>+91 98765 43210</p>
          </div>
        </div>
      </div>

      {/* ── Page sections ── */}
      <Hero />
      <OurVilla />
      <Accommodation />

      {authOpen && <AuthModal onClose={closeAuth} onAuthSuccess={handleAuthSuccess} />}
    </div>
  );
}

export default App;
