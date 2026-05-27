import { useEffect, useRef, useState } from 'react';
import heroImage from './assets/images/CasaChalora.jpg';
import aboutVideo from './assets/images/aboutus.mp4';
import logoImg from './assets/images/casa-removefinal.png';
import './App.css';


function Hero() {
  const videoRef = useRef(null);
  const [logoVisible, setLogoVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLogoVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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

  const NAV_LINKS = ['Home', 'Our Villa', 'About Us', 'Experiences', 'Contact'];

  return (
    <section className="hero-section">
      {/* Background video — poster shows natively until video plays */}
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

      {/* Top navigation */}
      <nav className="hero-nav">
        <div className="hero-nav-left" />
        <div className="hero-nav-right">
          <a href="#book" className="hero-nav-book">BOOK NOW</a>
          <button className="hero-nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Centered logo */}
      <div className={`hero-logo-wrap${logoVisible ? ' hero-logo-wrap--visible' : ''}`}>
        <img src={logoImg} alt="Casa Chalora" className="hero-logo" />
      </div>

      {/* Follow us — right edge */}
      <div className="hero-follow">
        <span className="hero-follow-label">FOLLOW US</span>
        <div className="hero-follow-icons">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hero-follow-icon" aria-label="Instagram">
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

      {/* Full-screen menu overlay */}
      <div className={`menu-overlay${menuOpen ? ' menu-overlay--open' : ''}`} aria-hidden={!menuOpen}>
        {/* Left — villa image */}
        <div className={`menu-img-panel${menuOpen ? ' menu-img-panel--open' : ''}`}>
          <img src={heroImage} alt="Casa Chalora Villa" className="menu-img" />
          <div className="menu-img-overlay" />
          <div className="menu-img-caption">
            <span className="menu-img-sub">Luxury Villa</span>
            <span className="menu-img-name">Casa Chalora</span>
          </div>
        </div>

        {/* Right — white nav panel */}
        <div className={`menu-nav-panel${menuOpen ? ' menu-nav-panel--open' : ''}`}>
          {/* Logo + close */}
          <div className="menu-top">
            <img src={logoImg} alt="Casa Chalora" className="menu-logo" />
            <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
          </div>

          {/* Nav links */}
          <nav className="menu-links">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="menu-link"
                style={{ '--link-delay': `${0.32 + i * 0.08}s` }}
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Contact info */}
          <div className="menu-contact">
            <p>casachalora@gmail.com</p>
            <p>+91 98765 43210</p>
          </div>
        </div>
      </div>
    </section>
  );
}


function App() {
  return (
    <div className="App">
      <Hero />
    </div>
  );
}

export default App;
