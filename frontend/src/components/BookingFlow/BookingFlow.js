import { useEffect, useRef, useState } from 'react';
import logoImg   from '../../assets/images/Casa_Chalora_Logo.png';
import heroBg    from '../../assets/images/casa-ourvilla.jpg';
import booking1  from '../../assets/images/booking1.jpg';
import booking2  from '../../assets/images/booking2.jpg';
import booking3  from '../../assets/images/booking3.jpg';
import booking4  from '../../assets/images/booking4.jpg';
import booking5  from '../../assets/images/booking5.jpg';

const API            = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const NIGHTLY_RATE   = parseInt(process.env.REACT_APP_RATE_PER_NIGHT || '25000');
const EMAIL_RE       = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EXTRAS = [
  { key: 'bbq',    label: 'BBQ',           price: 800,  icon: '🔥' },
  { key: 'cook',   label: 'Cook',           price: 4000, icon: '👨‍🍳' },
  { key: 'driver', label: 'Driver / Staff', price: 800,  icon: '🚗' },
  { key: 'pet',    label: 'Pet Care',       price: 1500, icon: '🐾' },
];

function extrasTotal(keys) {
  return EXTRAS.filter(e => (keys || []).includes(e.key)).reduce((s, e) => s + e.price, 0);
}

function nightCount(a, b) {
  return Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}
function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Property Summary Card (sidebar) ─────────────────────── */
function PropertyCard({ form }) {
  const n        = form.checkIn && form.checkOut ? nightCount(form.checkIn, form.checkOut) : 0;
  const base     = n * NIGHTLY_RATE;
  const addons   = extrasTotal(form.extraServices);
  const total    = base + addons;
  const selected = EXTRAS.filter(e => (form.extraServices || []).includes(e.key));

  return (
    <div className="bf-prop-card">
      <div className="bf-prop-img-wrap">
        <img src={heroBg} alt="Casa Chalora" className="bf-prop-img" />
        <span className="bf-prop-tag">Entire Villa</span>
      </div>
      <div className="bf-prop-body">
        <h3 className="bf-prop-name">Casa Chalora</h3>
        <p className="bf-prop-loc">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          Candolim, North Goa
        </p>
        <div className="bf-prop-perks">
          <span>🏊 Private Pool</span>
          <span>🌿 Private Lawn</span>
          <span>👥 Up to 9 Guests</span>
          <span>🍳 In-house Chef</span>
        </div>
        {n > 0 && (
          <div className="bf-prop-price-box">
            <div className="bf-prop-price-header">Price Details</div>
            <div className="bf-prop-price-row">
              <span>₹{NIGHTLY_RATE.toLocaleString('en-IN')} × {n} night{n > 1 ? 's' : ''}</span>
              <span>₹{base.toLocaleString('en-IN')}</span>
            </div>
            {selected.map(e => (
              <div key={e.key} className="bf-prop-price-row">
                <span>{e.icon} {e.label}</span>
                <span>₹{e.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {form.checkIn && (
              <div className="bf-prop-price-row bf-prop-price-row--sm">
                <span>{fmt(form.checkIn)} → {fmt(form.checkOut)}</span>
                <span>{form.guests} guest{form.guests > 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="bf-prop-price-total">
              <span>Total Amount</span>
              <strong>₹{total.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Step 1: Dates & Availability ────────────────────────── */
function DateStep({ form, setForm, onNext, onBack }) {
  const today   = new Date().toISOString().split('T')[0];
  const [avail,      setAvail]      = useState(null);
  const [checking,   setChecking]   = useState(false);
  const [error,      setError]      = useState('');
  const [slideIdx,   setSlideIdx]   = useState(0);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const extrasDropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (extrasDropRef.current && !extrasDropRef.current.contains(e.target)) {
        setExtrasOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const slides = [booking1, booking2, booking3, booking4, booking5];
  const n            = form.checkIn && form.checkOut ? nightCount(form.checkIn, form.checkOut) : 0;
  const selectedKeys = form.extraServices || [];

  const prevSlide = () => setSlideIdx(i => (i - 1 + slides.length) % slides.length);
  const nextSlide = () => setSlideIdx(i => (i + 1) % slides.length);

  const autoRef = useRef(null);
  const resetAutoPlay = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setSlideIdx(i => (i + 1) % slides.length), 3500);
  };
  useEffect(() => {
    resetAutoPlay();
    return () => clearInterval(autoRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrev = () => { prevSlide(); resetAutoPlay(); };
  const handleNext = () => { nextSlide(); resetAutoPlay(); };
  const handleDot  = (i) => { setSlideIdx(i); resetAutoPlay(); };

  const toggleExtra = (key) => {
    setForm(f => {
      const cur     = f.extraServices || [];
      const updated = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key];
      return { ...f, extraServices: updated };
    });
  };

  const resetAvail = () => { setAvail(null); setError(''); };

  const checkAvail = async () => {
    if (!form.checkIn || !form.checkOut) { setError('Please select both check-in and check-out dates.'); return; }
    if (n <= 0)                          { setError('Check-out must be after check-in.'); return; }
    setChecking(true); setError(''); setAvail(null);
    try {
      const res  = await fetch(`${API}/api/availability?checkIn=${form.checkIn}&checkOut=${form.checkOut}`);
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Could not check availability.'); return; }
      setAvail(data);
    } catch { setError('Network error. Please try again.'); }
    finally  { setChecking(false); }
  };

  return (
    <div className="bf-date-split-card">

      {/* ── LEFT: image slider ── */}
      <div className="bf-date-slider">
        <div className="bf-slider-viewport">
          <div className="bf-slider-track" style={{ transform: `translateX(-${slideIdx * 100}%)` }}>
            {slides.map((src, i) => (
              <img key={i} src={src} alt={`Casa Chalora view ${i + 1}`} className="bf-slider-img" />
            ))}
          </div>
        </div>

        <div className="bf-slider-overlay">
          <div className="bf-slider-badge">Private Villa</div>
          <h1 className="bf-slider-title">Casa Chalora</h1>
          <p className="bf-slider-sub">📍 Candolim, North Goa · Private Pool · Up to 9 guests</p>
          <span className="bf-slider-price">From ₹{NIGHTLY_RATE.toLocaleString('en-IN')} / night</span>
        </div>

        <button className="bf-slider-nav bf-slider-nav--prev" onClick={handlePrev} aria-label="Previous photo">&#8249;</button>
        <button className="bf-slider-nav bf-slider-nav--next" onClick={handleNext} aria-label="Next photo">&#8250;</button>

        <div className="bf-slider-dots">
          {slides.map((_, i) => (
            <button key={i} className={`bf-slider-dot ${i === slideIdx ? 'bf-slider-dot--on' : ''}`}
              onClick={() => handleDot(i)} aria-label={`Photo ${i + 1}`} />
          ))}
        </div>
      </div>

      {/* ── RIGHT: booking panel ── */}
      <div className="bf-date-panel">
        <div className="bf-panel-inner">

          <button className="bf-back-link" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            Back to Home
          </button>

          <div className="bf-panel-heading">
            <h2 className="bf-panel-title">Reserve Your Villa</h2>
            <p className="bf-panel-tagline">Private villa &nbsp;·&nbsp; Candolim, North Goa</p>
          </div>

          {/* Dates + Guests card */}
          <div className="bf-form-card-soft">
            <div className="bf-form-dates-row">
              <div className="bf-form-col">
                <span className="bf-form-label">Check-In</span>
                <input type="date" className="bf-form-input" value={form.checkIn} min={today}
                  onChange={e => { setForm(f => ({ ...f, checkIn: e.target.value })); resetAvail(); }} />
              </div>
              <span className="bf-form-arrow">→</span>
              <div className="bf-form-col">
                <span className="bf-form-label">Check-Out</span>
                <input type="date" className="bf-form-input" value={form.checkOut} min={form.checkIn || today}
                  onChange={e => { setForm(f => ({ ...f, checkOut: e.target.value })); resetAvail(); }} />
              </div>
            </div>
            <div className="bf-form-row-divider" />
            <div className="bf-form-col bf-form-col--full">
              <span className="bf-form-label">Guests</span>
              <select className="bf-form-input" value={form.guests}
                onChange={e => setForm(f => ({ ...f, guests: parseInt(e.target.value) }))}>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(g => (
                  <option key={g} value={g}>{g} Guest{g > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Extra services dropdown */}
          <div className="bf-form-card-soft">
            <span className="bf-form-label">Extra Services</span>
            <div className="bf-extras-dropdown" ref={extrasDropRef}>
              <button type="button" className="bf-extras-trigger"
                onClick={() => setExtrasOpen(o => !o)}>
                <span className="bf-extras-trigger-text">
                  {selectedKeys.length === 0
                    ? 'Add services to your stay'
                    : `${selectedKeys.length} service${selectedKeys.length > 1 ? 's' : ''} selected`}
                </span>
                <svg className={`bf-caret${extrasOpen ? ' bf-caret--up' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {extrasOpen && (
                <div className="bf-extras-menu">
                  {EXTRAS.map(extra => {
                    const on = selectedKeys.includes(extra.key);
                    return (
                      <button key={extra.key} type="button"
                        className={`bf-extras-option${on ? ' bf-extras-option--on' : ''}`}
                        onClick={() => toggleExtra(extra.key)}>
                        <span className="bf-extras-opt-name">{extra.label}</span>
                        <span className="bf-extras-opt-price">₹{extra.price.toLocaleString('en-IN')}</span>
                        <span className={`bf-extras-chk${on ? ' bf-extras-chk--on' : ''}`}>{on ? '✓' : ''}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedKeys.length > 0 && (
              <div className="bf-extras-chips">
                {EXTRAS.filter(e => selectedKeys.includes(e.key)).map(e => (
                  <span key={e.key} className="bf-extras-chip">
                    {e.icon} {e.label}
                    <button type="button" onClick={() => toggleExtra(e.key)} aria-label={`Remove ${e.label}`}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Nights summary — no price shown */}
          {n > 0 && (
            <div className="bf-nights-pill">
              {n} night{n > 1 ? 's' : ''} &nbsp;·&nbsp; {fmt(form.checkIn)} → {fmt(form.checkOut)} &nbsp;·&nbsp; {form.guests} guest{form.guests > 1 ? 's' : ''}
            </div>
          )}

          {error && <p className="bf-error-msg">{error}</p>}

          {avail && (
            <div className={`bf-avail-banner ${avail.available ? 'bf-avail-banner--ok' : 'bf-avail-banner--na'}`}>
              <span className="bf-avail-icon">{avail.available ? '✓' : '✕'}</span>
              <div>
                {avail.available ? (
                  <><strong>Villa is Available!</strong><span>{avail.nights} night{avail.nights > 1 ? 's' : ''} · Ready to book</span></>
                ) : (
                  <><strong>Dates Not Available</strong><span>Please choose different dates.</span></>
                )}
              </div>
            </div>
          )}

          <div className="bf-panel-actions">
            <button className="bf-btn-check" onClick={checkAvail} disabled={checking}>
              {checking ? 'Checking…' : 'Check Availability'}
            </button>
            {avail?.available && (
              <button className="bf-btn-book" onClick={onNext}>Book Now →</button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

/* ─── Step 2: Auth ─────────────────────────────────────────── */
function AuthStep({ onAuthSuccess, onBack }) {
  const [mode,     setMode]     = useState('login');
  const [fields,   setFields]   = useState({ name: '', email: '', password: '' });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setErrors({}); setApiError('');
    setFields({ name: '', email: '', password: '' });
  };

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !fields.name.trim())  e.name     = 'Full name is required.';
    if (!fields.email.trim())                       e.email    = 'Email is required.';
    else if (!EMAIL_RE.test(fields.email))          e.email    = 'Enter a valid email address.';
    if (!fields.password)                           e.password = 'Password is required.';
    else if (fields.password.length < 6)            e.password = 'Must be at least 6 characters.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setErrors({}); setApiError(''); setLoading(true);
    try {
      const url  = mode === 'login' ? `${API}/api/auth/login` : `${API}/api/auth/register`;
      const body = mode === 'login'
        ? { email: fields.email, password: fields.password }
        : { name: fields.name, email: fields.email, password: fields.password };
      const res  = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || 'Something went wrong.'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role',  data.role);
      localStorage.setItem('name',  data.name);
      onAuthSuccess(data.token, data.role, data.name);
    } catch { setApiError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const setField = (k) => (e) => {
    setFields(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }));
  };

  return (
    <div className="bf-auth-wrap">
      <div className="bf-auth-saved-notice">
        ✓ Your booking details are saved — {mode === 'login' ? 'sign in' : 'create an account'} to proceed to payment
      </div>
      <div className="bf-auth-card">
        <div className="bf-auth-card-head">
          <img src={logoImg} alt="Casa Chalora" className="bf-auth-logo" />
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h2>
          <p>{mode === 'login' ? 'Sign in to complete your booking' : 'Quick sign-up to confirm your reservation'}</p>
        </div>
        <form className="bf-auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="bf-field">
              <label>Full Name *</label>
              <input type="text" placeholder="Your full name" value={fields.name}
                onChange={setField('name')} autoComplete="name"
                className={errors.name ? 'bf-input-error' : ''} />
              {errors.name && <span className="bf-field-err">{errors.name}</span>}
            </div>
          )}
          <div className="bf-field">
            <label>Email Address *</label>
            <input type="email" placeholder="you@example.com" value={fields.email}
              onChange={setField('email')} autoComplete="email"
              className={errors.email ? 'bf-input-error' : ''} />
            {errors.email && <span className="bf-field-err">{errors.email}</span>}
          </div>
          <div className="bf-field">
            <label>Password *</label>
            <input type="password" placeholder="Minimum 6 characters" value={fields.password}
              onChange={setField('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={errors.password ? 'bf-input-error' : ''} />
            {errors.password && <span className="bf-field-err">{errors.password}</span>}
          </div>
          {apiError && <p className="bf-api-err">{apiError}</p>}
          <button type="submit" className="bf-btn-submit" disabled={loading}>
            {loading
              ? <span className="bf-spinner" />
              : mode === 'login' ? 'Sign In & Continue →' : 'Create Account & Continue →'
            }
          </button>
        </form>
        <p className="bf-auth-switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={switchMode}>{mode === 'login' ? 'Sign up' : 'Log in'}</button>
        </p>
        <button className="bf-btn-ghost" onClick={onBack} style={{ display: 'block', margin: '16px auto 0', textAlign: 'center' }}>
          ← Back to Dates
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3: Details ─────────────────────────────────────── */
function DetailsStep({ form, setForm, userName, userEmail, onNext, onBack }) {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!form.contactNumber.trim()) { setError('Contact number is required.'); return; }
    onNext();
  };

  return (
    <div className="bf-split-layout">
      <div className="bf-split-form">
        <div className="bf-form-card">
          <div className="bf-form-card-head">
            <h2>Your Details</h2>
            <p>Just a couple of details before we confirm your booking</p>
          </div>

          <div className="bf-user-row">
            <div className="bf-user-avatar">
              {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="bf-user-meta">
              <strong>{userName}</strong>
              <span>{userEmail}</span>
            </div>
            <span className="bf-user-badge">✓ Verified</span>
          </div>

          <div className="bf-form-section">
            <div className="bf-field">
              <label>Contact Number *</label>
              <input type="tel" placeholder="+91 98765 43210" value={form.contactNumber}
                onChange={e => { setForm(f => ({ ...f, contactNumber: e.target.value })); setError(''); }} />
            </div>
            <div className="bf-field">
              <label>Address <span className="bf-optional">(Optional)</span></label>
              <input type="text" placeholder="Your home address" value={form.address || ''}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
          </div>

          {error && <p className="bf-error-msg">{error}</p>}

          <div className="bf-form-actions">
            <button className="bf-btn-ghost" onClick={onBack}>← Back</button>
            <button className="bf-btn-primary" onClick={handleNext}>Proceed to Payment →</button>
          </div>
        </div>
      </div>

      <div className="bf-split-sidebar">
        <PropertyCard form={form} />
      </div>
    </div>
  );
}

/* ─── Step 4: Payment ──────────────────────────────────────── */
function PaymentStep({ form, token, userName, userEmail, onSuccess, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const n          = form.checkIn && form.checkOut ? nightCount(form.checkIn, form.checkOut) : 0;
  const base       = n * NIGHTLY_RATE;
  const addons     = extrasTotal(form.extraServices);
  const total      = base + addons;
  const selected   = EXTRAS.filter(e => (form.extraServices || []).includes(e.key));

  const loadScript = () => new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s   = document.createElement('script');
    s.src     = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handlePay = async () => {
    setLoading(true); setError('');
    const loaded = await loadScript();
    if (!loaded) { setError('Could not load payment gateway. Please check your connection.'); setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/bookings/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests,
          contactNumber: form.contactNumber, paymentMethod: form.paymentMethod,
          notes: form.notes, extraServices: form.extraServices || [],
        }),
      });
      const od = await res.json();
      if (!res.ok) { setError(od.message || 'Could not create payment order.'); setLoading(false); return; }

      const options = {
        key:         od.keyId,
        amount:      od.amount,
        currency:    od.currency,
        name:        'Casa Chalora',
        description: `${n} night${n > 1 ? 's' : ''} in Goa`,
        order_id:    od.orderId,
        handler: async (resp) => {
          try {
            const vr = await fetch(`${API}/api/bookings/verify-payment`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body:    JSON.stringify({
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_order_id:   resp.razorpay_order_id,
                razorpay_signature:  resp.razorpay_signature,
                checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests,
                contactNumber: form.contactNumber, paymentMethod: form.paymentMethod,
                notes: form.notes, extraServices: form.extraServices || [],
              }),
            });
            const vd = await vr.json();
            if (vr.ok) { onSuccess(vd.booking); }
            else { setError(vd.message || 'Payment verification failed.'); setLoading(false); }
          } catch { setError('Payment verification failed. Please contact support.'); setLoading(false); }
        },
        prefill: { name: userName, email: userEmail, contact: form.contactNumber },
        theme:   { color: '#c9a96e' },
        modal:   { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', r => { setError(`Payment failed: ${r.error.description}`); setLoading(false); });
      rzp.open();
    } catch { setError('Network error. Please try again.'); setLoading(false); }
  };

  return (
    <div className="bf-split-layout">
      <div className="bf-split-form">
        <div className="bf-form-card">
          <div className="bf-form-card-head">
            <h2>Complete Payment</h2>
            <p>Review your booking and confirm payment</p>
          </div>

          <div className="bf-pay-mini-row">
            <img src={heroBg} alt="Casa Chalora" className="bf-pay-mini-img" />
            <div className="bf-pay-mini-info">
              <strong>Casa Chalora</strong>
              <span>Candolim, North Goa</span>
              <span>{fmt(form.checkIn)} → {fmt(form.checkOut)}</span>
              <span>{n} night{n > 1 ? 's' : ''} · {form.guests} guest{form.guests > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="bf-price-breakdown">
            <div className="bf-pb-header">Price Breakdown</div>
            <div className="bf-pb-row">
              <span>₹{NIGHTLY_RATE.toLocaleString('en-IN')} × {n} night{n > 1 ? 's' : ''}</span>
              <span>₹{base.toLocaleString('en-IN')}</span>
            </div>
            {selected.map(e => (
              <div key={e.key} className="bf-pb-row">
                <span>{e.icon} {e.label}</span>
                <span>₹{e.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="bf-pb-row"><span>Taxes &amp; fees</span><span>Included</span></div>
            <div className="bf-pb-row bf-pb-row--total">
              <span>Total Amount</span>
              <strong>₹{total.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {error && <p className="bf-error-msg">{error}</p>}

          <button className="bf-btn-pay-cta" onClick={handlePay} disabled={loading}>
            {loading ? <span className="bf-spinner" /> : <>Pay ₹{total.toLocaleString('en-IN')} Securely →</>}
          </button>

          <div className="bf-pay-trust">
            <span>🔒 100% Secure Payments</span>
            <span>·</span>
            <span>Powered by Razorpay</span>
          </div>

          <button className="bf-btn-ghost" onClick={onBack} disabled={loading}
            style={{ display: 'block', textAlign: 'center', width: '100%', marginTop: '12px' }}>
            ← Back to Details
          </button>
        </div>
      </div>

      <div className="bf-split-sidebar">
        <PropertyCard form={form} />
      </div>
    </div>
  );
}

/* ─── Root BookingFlow ─────────────────────────────────────── */
export default function BookingFlow({ initialToken, initialUserName, initialForm, onAuthSuccess, onPaymentSuccess, onBack }) {
  const [step,      setStep]      = useState('dates');
  const [token,     setToken]     = useState(initialToken || '');
  const [userName,  setUserName]  = useState(initialUserName || '');
  const [userEmail, setUserEmail] = useState('');
  const [form,      setForm]      = useState({
    checkIn:       initialForm?.checkIn  || '',
    checkOut:      initialForm?.checkOut || '',
    guests:        initialForm?.guests   || 2,
    extraServices: [],
    contactNumber: '',
    paymentMethod: 'card',
    notes:         '',
  });

  useEffect(() => {
    document.body.style.overflow  = '';
    document.body.style.overflowY = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.email) setUserEmail(d.email); })
      .catch(() => {});
  }, [token]);

  const isLoggedIn = !!token;
  const stepList   = isLoggedIn
    ? ['dates', 'details', 'payment']
    : ['dates', 'auth', 'details', 'payment'];
  const stepIdx = stepList.indexOf(step);

  const goNext = () => { const next = stepList[stepIdx + 1]; if (next) setStep(next); };
  const goBack = () => { if (stepIdx === 0) { onBack(); return; } setStep(stepList[stepIdx - 1]); };

  const handleAuthSuccess = (tok, role, name) => {
    setToken(tok); setUserName(name);
    onAuthSuccess(tok, role, name);
    if (role !== 'superadmin') setStep('details');
  };

  const LABELS = { dates: 'Dates', auth: 'Sign In', details: 'Details', payment: 'Payment' };

  return (
    <div className="bf-root">
      <nav className="bf-nav">
        <img src={logoImg} alt="Casa Chalora" className="bf-nav-logo" onClick={onBack} style={{ cursor: 'pointer' }} />
        {isLoggedIn && userName && (
          <div className="bf-nav-user">
            <span className="bf-nav-avatar">{userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
            <span className="bf-nav-uname">{userName}</span>
          </div>
        )}
      </nav>

      <div className="bf-stepper-bar">
        <div className="bf-stepper-inner">
          {stepList.map((s, i) => (
            <div key={s} className={`bf-st-item ${step === s ? 'bf-st--active' : ''} ${i < stepIdx ? 'bf-st--done' : ''}`}>
              {i > 0 && <div className={`bf-st-line ${i <= stepIdx ? 'bf-st-line--on' : ''}`} />}
              <div className="bf-st-circle">{i < stepIdx ? '✓' : i + 1}</div>
              <span className="bf-st-label">{LABELS[s]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bf-page">
        {step === 'dates' && (
          <div className="bf-wide">
            <DateStep form={form} setForm={setForm} onNext={goNext} onBack={goBack} />
          </div>
        )}
        {step === 'auth' && (
          <div className="bf-narrow">
            <AuthStep onAuthSuccess={handleAuthSuccess} onBack={goBack} />
          </div>
        )}
        {step === 'details' && (
          <DetailsStep form={form} setForm={setForm} userName={userName} userEmail={userEmail} onNext={goNext} onBack={goBack} />
        )}
        {step === 'payment' && (
          <PaymentStep form={form} token={token} userName={userName} userEmail={userEmail} onSuccess={onPaymentSuccess} onBack={goBack} />
        )}
      </div>
    </div>
  );
}
