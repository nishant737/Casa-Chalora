import { useCallback, useEffect, useRef, useState } from 'react';
import logoImg    from '../../assets/images/Casa_Chalora_Logo.png';
import heroBg     from '../../assets/images/casa-ourvilla.jpg';
import villaBg2   from '../../assets/images/our villa 2.jpg';
import villaBg3   from '../../assets/images/our villa 3.jpg';

const API = 'http://localhost:4000';

function fmt(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function nightCount(a, b) {
  return Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}

const STATUS = {
  pending:  { label: 'Pending',   bg: '#fff8ee', color: '#b5711a', dot: '#e8a130' },
  paid:     { label: 'Confirmed', bg: '#edfaf4', color: '#1e7248', dot: '#2ecc71' },
  failed:   { label: 'Failed',    bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
  refunded: { label: 'Refunded',  bg: '#eff6ff', color: '#1d4ed8', dot: '#60a5fa' },
};

const VILLA_IMAGES = [heroBg, villaBg2, villaBg3];

/* ─── Profile Dropdown ─────────────────────────────────── */
function ProfileDropdown({ userName, onDashboard, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="bp2-profile" ref={ref}>
      <button className="bp2-profile-btn" onClick={() => setOpen(o => !o)}>
        <span className="bp2-avatar">{initials}</span>
        <span className="bp2-profile-name">{userName}</span>
        <svg className={`bp2-chevron${open ? ' bp2-chevron--open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="bp2-dropdown">
          <button className="bp2-dropdown-item" onClick={() => { setOpen(false); onDashboard(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            My Account
          </button>
          <div className="bp2-dropdown-divider" />
          <button className="bp2-dropdown-item bp2-dropdown-item--danger" onClick={() => { setOpen(false); onLogout(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Hero Search ──────────────────────────────────────── */
function HeroSearch({ onSearch }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ checkIn: '', checkOut: '', guests: 2 });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="bp2-hero">
      <div className="bp2-hero-bg">
        <img src={heroBg} alt="Casa Chalora" className="bp2-hero-img" />
        <div className="bp2-hero-overlay" />
      </div>
      <div className="bp2-hero-content">
        <span className="bp2-hero-eyebrow">Casa Chalora · Candolim, Goa</span>
        <h1 className="bp2-hero-title">Book Your Private Villa</h1>
        <p className="bp2-hero-sub">Luxury stay with private pool, lawn &amp; personalised service</p>

        {/* Search widget */}
        <div className="bp2-search-bar">
          <div className="bp2-search-field">
            <span className="bp2-search-label">Check-in</span>
            <input type="date" value={form.checkIn} min={today}
              onChange={set('checkIn')} className="bp2-search-input" />
          </div>
          <div className="bp2-search-sep" />
          <div className="bp2-search-field">
            <span className="bp2-search-label">Check-out</span>
            <input type="date" value={form.checkOut} min={form.checkIn || today}
              onChange={set('checkOut')} className="bp2-search-input" />
          </div>
          <div className="bp2-search-sep" />
          <div className="bp2-search-field">
            <span className="bp2-search-label">Guests</span>
            <select value={form.guests} onChange={set('guests')} className="bp2-search-input">
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <button className="bp2-search-btn" onClick={() => onSearch(form)}>
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Booking Card ─────────────────────────────────────── */
function BookingCard({ booking, imgSrc, onCancel, cancelling }) {
  const s  = STATUS[booking.paymentStatus] || STATUS.pending;
  const n  = nightCount(booking.checkIn, booking.checkOut);
  return (
    <div className="bp2-card">
      <div className="bp2-card-img-wrap">
        <img src={imgSrc} alt="Villa" className="bp2-card-img" />
        <span className="bp2-card-badge" style={{ background: s.bg, color: s.color }}>
          <span className="bp2-card-badge-dot" style={{ background: s.dot }} />
          {s.label}
        </span>
      </div>
      <div className="bp2-card-body">
        <div className="bp2-card-id">Booking #{booking.id}</div>
        <h3 className="bp2-card-villa">Casa Chalora, Goa</h3>
        <div className="bp2-card-dates">
          <div className="bp2-card-date-block">
            <span className="bp2-card-date-label">Check-in</span>
            <span className="bp2-card-date-val">{fmt(booking.checkIn)}</span>
          </div>
          <div className="bp2-card-date-arrow">→</div>
          <div className="bp2-card-date-block">
            <span className="bp2-card-date-label">Check-out</span>
            <span className="bp2-card-date-val">{fmt(booking.checkOut)}</span>
          </div>
        </div>
        <div className="bp2-card-meta">
          <span><strong>{n}</strong> night{n !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span><strong>{booking.guests}</strong> guest{booking.guests !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span><strong>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</strong></span>
        </div>
        {booking.notes && <p className="bp2-card-notes">"{booking.notes}"</p>}
        {booking.paymentStatus === 'pending' && (
          <button className="bp2-card-cancel" onClick={() => onCancel(booking.id)} disabled={cancelling === booking.id}>
            {cancelling === booking.id ? 'Cancelling…' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Empty State ──────────────────────────────────────── */
function EmptyState({ onBook }) {
  return (
    <div className="bp2-empty">
      <div className="bp2-empty-img-wrap">
        <img src={villaBg2} alt="Villa" className="bp2-empty-img" />
        <div className="bp2-empty-img-overlay" />
      </div>
      <div className="bp2-empty-content">
        <span className="bp2-empty-eyebrow">Your Story Begins Here</span>
        <h2 className="bp2-empty-title">No Bookings Yet</h2>
        <p className="bp2-empty-sub">
          You haven't reserved your stay at Casa Chalora yet. Start planning your perfect Goa escape — private pool, manicured lawns, and unmatched luxury await.
        </p>
        <button className="bp2-btn-primary" onClick={onBook}>Book Your First Stay</button>
      </div>
    </div>
  );
}

/* ─── New Booking Modal ────────────────────────────────── */
function NewBookingModal({ initialForm, onClose, onSuccess, token }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm]       = useState(initialForm || { checkIn: '', checkOut: '', guests: 2, contactNumber: '', paymentMethod: 'card', notes: '' });
  const [submitting, setSub]  = useState(false);
  const [err, setErr]         = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const n = form.checkIn && form.checkOut ? nightCount(form.checkIn, form.checkOut) : 0;
  const total = n * 25000;

  const submit = async (e) => {
    e.preventDefault();
    if (n <= 0) { setErr('Check-out must be after check-in.'); return; }
    setSub(true); setErr('');
    try {
      const res  = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || 'Something went wrong.'); return; }
      onSuccess();
    } catch { setErr('Network error. Please try again.'); }
    finally { setSub(false); }
  };

  return (
    <div className="bp2-modal-overlay" onClick={(e) => { if (e.target.classList.contains('bp2-modal-overlay')) onClose(); }}>
      <div className="bp2-modal">
        <div className="bp2-modal-header">
          <h2 className="bp2-modal-title">Reserve Your Stay</h2>
          <button className="bp2-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="bp2-modal-villa-strip">
          <img src={heroBg} alt="Villa" className="bp2-modal-villa-img" />
          <div className="bp2-modal-villa-info">
            <strong>Casa Chalora</strong>
            <span>Candolim, North Goa</span>
            <span>Up to 30 guests · Private Pool · ₹25,000/night</span>
          </div>
        </div>
        <form onSubmit={submit} className="bp2-modal-form">
          <div className="bp2-modal-grid">
            <div className="bp2-field">
              <label>Check-in *</label>
              <input type="date" value={form.checkIn} min={today} onChange={set('checkIn')} required />
            </div>
            <div className="bp2-field">
              <label>Check-out *</label>
              <input type="date" value={form.checkOut} min={form.checkIn || today} onChange={set('checkOut')} required />
            </div>
            <div className="bp2-field">
              <label>Guests *</label>
              <select value={form.guests} onChange={set('guests')}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="bp2-field">
              <label>Contact Number *</label>
              <input type="tel" placeholder="+91 98765 43210" value={form.contactNumber} onChange={set('contactNumber')} required />
            </div>
            <div className="bp2-field">
              <label>Payment Method</label>
              <select value={form.paymentMethod} onChange={set('paymentMethod')}>
                <option value="card">Credit / Debit Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash on Arrival</option>
              </select>
            </div>
            <div className="bp2-field bp2-field--full">
              <label>Special Requests</label>
              <textarea rows={3} placeholder="Early check-in, celebrations, dietary preferences…" value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          {n > 0 && (
            <div className="bp2-price-strip">
              <div className="bp2-price-row">
                <span>₹25,000 × {n} night{n > 1 ? 's' : ''}</span>
                <span>₹{(n * 25000).toLocaleString('en-IN')}</span>
              </div>
              <div className="bp2-price-row bp2-price-total">
                <span>Estimated Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
          {err && <p className="bp2-form-err">{err}</p>}
          <div className="bp2-modal-actions">
            <button type="button" className="bp2-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="bp2-btn-primary" disabled={submitting}>
              {submitting ? 'Confirming…' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Account / Dashboard View ─────────────────────────── */
function AccountView({ userName, userEmail, bookings, onNewBooking, onCancel, cancelling }) {
  return (
    <div className="bp2-account">
      <div className="bp2-account-header">
        <h2 className="bp2-account-title">My Account</h2>
        <button className="bp2-btn-primary" onClick={onNewBooking}>+ New Booking</button>
      </div>

      {/* Profile card */}
      <div className="bp2-profile-card">
        <div className="bp2-profile-avatar-lg">
          {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="bp2-profile-info">
          <h3 className="bp2-profile-fullname">{userName}</h3>
          <p className="bp2-profile-email">{userEmail}</p>
          <span className="bp2-profile-tag">Casa Chalora Guest</span>
        </div>
      </div>

      {/* Booking history */}
      <h3 className="bp2-history-title">Booking History</h3>
      {bookings.length === 0 ? (
        <p className="bp2-history-empty">No bookings yet.</p>
      ) : (
        <div className="bp2-history-table-wrap">
          <table className="bp2-history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Nights</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const s = STATUS[b.paymentStatus] || STATUS.pending;
                const n = nightCount(b.checkIn, b.checkOut);
                return (
                  <tr key={b.id}>
                    <td className="bp2-ht-id">#{b.id}</td>
                    <td>{fmt(b.checkIn)}</td>
                    <td>{fmt(b.checkOut)}</td>
                    <td>{n}</td>
                    <td>{b.guests}</td>
                    <td>₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="bp2-ht-badge" style={{ background: s.bg, color: s.color }}>
                        <span style={{ background: s.dot }} className="bp2-ht-dot" />
                        {s.label}
                      </span>
                    </td>
                    <td>
                      {b.paymentStatus === 'pending' && (
                        <button className="bp2-ht-cancel" onClick={() => onCancel(b.id)} disabled={cancelling === b.id}>
                          {cancelling === b.id ? '…' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── BookingPage Root ──────────────────────────────────── */
export default function BookingPage({ token, userName, onLogout }) {
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Ensure body scroll is always restored when this page mounts
  // (AuthModal sets body overflow:hidden and may not clean up on login redirect)
  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.overflowY = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const [view,         setView]         = useState('home'); // 'home' | 'account'
  const [showModal,    setShowModal]    = useState(false);
  const [modalForm,    setModalForm]    = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [toast,        setToast]        = useState('');
  const [userEmail,    setUserEmail]    = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/bookings/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setBookings(data.bookings);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Fetch user email for account view
  useEffect(() => {
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.email) setUserEmail(d.email); }).catch(() => {});
  }, [token]);

  const handleSearch = (form) => { setModalForm(form); setShowModal(true); };

  const handleBookingSuccess = () => {
    setShowModal(false);
    setModalForm(null);
    fetchBookings();
    setToast('Booking confirmed! We\'ll be in touch shortly.');
    setTimeout(() => setToast(''), 5000);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(id);
    try {
      const res  = await fetch(`${API}/api/bookings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) { fetchBookings(); setToast('Booking cancelled.'); setTimeout(() => setToast(''), 3000); }
      else alert(data.message || 'Could not cancel.');
    } catch { alert('Network error.'); }
    finally { setCancellingId(null); }
  };

  return (
    <div className="bp2-root">
      {/* ── Navbar ── */}
      <nav className="bp2-nav">
        <img src={logoImg} alt="Casa Chalora" className="bp2-nav-logo" onClick={() => setView('home')} style={{ cursor: 'pointer' }} />
        <div className="bp2-nav-center">
          <button className={`bp2-nav-link${view === 'home' ? ' bp2-nav-link--active' : ''}`} onClick={() => setView('home')}>Home</button>
          <button className={`bp2-nav-link${view === 'account' ? ' bp2-nav-link--active' : ''}`} onClick={() => setView('account')}>My Bookings</button>
        </div>
        <ProfileDropdown
          userName={userName}
          onDashboard={() => setView('account')}
          onLogout={onLogout}
        />
      </nav>

      {/* ── Toast ── */}
      {toast && <div className="bp2-toast">{toast}</div>}

      {/* ── Home view ── */}
      {view === 'home' && (
        <>
          <HeroSearch onSearch={handleSearch} />

          <div className="bp2-content">
            {loading ? (
              <div className="bp2-loading">Loading your bookings…</div>
            ) : bookings.length === 0 ? (
              <EmptyState onBook={() => setShowModal(true)} />
            ) : (
              <div className="bp2-bookings-section">
                <div className="bp2-bookings-header">
                  <h2 className="bp2-bookings-title">Your Stays</h2>
                  <button className="bp2-btn-primary" onClick={() => setShowModal(true)}>+ New Booking</button>
                </div>
                <div className="bp2-cards-grid">
                  {bookings.map((b, i) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      imgSrc={VILLA_IMAGES[i % VILLA_IMAGES.length]}
                      onCancel={handleCancel}
                      cancelling={cancellingId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Account view ── */}
      {view === 'account' && (
        <div className="bp2-content">
          <AccountView
            userName={userName}
            userEmail={userEmail}
            bookings={bookings}
            onNewBooking={() => setShowModal(true)}
            onCancel={handleCancel}
            cancelling={cancellingId}
          />
        </div>
      )}

      {/* ── New Booking Modal ── */}
      {showModal && (
        <NewBookingModal
          initialForm={modalForm}
          token={token}
          onClose={() => { setShowModal(false); setModalForm(null); }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
