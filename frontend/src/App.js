import { useCallback, useEffect, useRef, useState } from 'react';
import heroImage from './assets/images/hamburger.jpg';
import ourVillaImg from './assets/images/casa-ourvilla.jpg';
import ourVilla2 from './assets/images/our villa 2.jpg';
import ourVilla3 from './assets/images/our villa 3.jpg';
import ourVilla4 from './assets/images/our villa 4.jpg';
import aboutVideo from './assets/images/aboutus.mp4';
import logoImg from './assets/images/Casa_Chalora_Logo.png';
import logoHam from './assets/images/hamburger.png';
import './App.css';


/* ─── Auth Modal ──────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthModal({ onClose }) {
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
      onClose();

      if (data.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/booking';
      }
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

/* ─── App ─────────────────────────────────────────────────────── */

const NAV_LINKS = ['Home', 'Our Villa', 'Accommodation', 'Experiences', 'Gallery', 'Amenities', 'About Us', 'Contact Us'];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

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

      {authOpen && <AuthModal onClose={closeAuth} />}
    </div>
  );
}

export default App;
