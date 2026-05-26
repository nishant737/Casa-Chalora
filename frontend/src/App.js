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
      {/* Background video */}
      <video
        ref={videoRef}
        className="hero-bg-video"
        src={aboutVideo}
        autoPlay
        muted
        playsInline
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
                style={{ '--link-delay': `${0.18 + i * 0.07}s` }}
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

function About() {
  return (
    <section className="about-section">
      <div className="about-inner">
        <div className="about-left">
          <p className="about-eyebrow">About Us</p>
          <h2 className="about-heading">
            A Sanctuary of<br />
            <em>Coastal Elegance</em>
          </h2>
          <div className="about-divider" />
          <p className="about-body">
            Nestled in the serene charm of Candolim, Goa, Casa Chalora is a destination where luxury meets effortless coastal elegance. Thoughtfully crafted with aesthetically designed interiors, every corner of the villa reflects refined taste, timeless comfort, and an atmosphere of understated sophistication.
          </p>
          <p className="about-body">
            Step into a world of curated spaces, soft natural light, and elegant details designed to elevate every moment of your stay. The highlight of the experience is the exclusive <span className="about-highlight">Privé pool</span> — your own private sanctuary to unwind, soak in the tropical ambience, and create unforgettable memories.
          </p>
          <p className="about-body">
            Whether it's a peaceful morning by the pool, golden sunset gatherings, or indulgent evenings surrounded by luxury, Casa Chalora offers a seamless blend of privacy, comfort, and premium living. Designed for travellers who appreciate beauty, tranquility, and elevated experiences, this exquisite retreat transforms every stay into something truly memorable.
          </p>
        </div>

        <div className="about-right">
          <div className="about-img-wrap">
            <video className="about-video" src={aboutVideo} autoPlay muted loop playsInline />
          </div>
          <div className="about-accent-block" />
        </div>
      </div>
    </section>
  );
}

const EXPERIENCES = [
  { label: 'Private Pool',   pos: 'center 60%' },
  { label: 'BBQ Nights',     pos: 'center 30%' },
  { label: 'Butler Service', pos: 'center 20%' },
  { label: 'Board Games',    pos: 'center 50%' },
  { label: 'Coastal Views',  pos: 'center 10%' },
];

function Experiences() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el    = entry.target;
          const delay = el.style.getPropertyValue('--card-delay') || '0s';

          if (entry.isIntersecting) {
            // floating rise — staggered left to right
            el.style.transition = `opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1) ${delay},
                                   transform 1.1s cubic-bezier(0.34, 1.18, 0.64, 1) ${delay}`;
            el.classList.add('exp-card--visible');
          } else {
            // gravity fall — same stagger so they drop one by one
            el.style.transition = `opacity 0.55s cubic-bezier(0.4, 0, 0.8, 0.6) ${delay},
                                   transform 0.6s cubic-bezier(0.4, 0, 1, 1) ${delay}`;
            el.classList.remove('exp-card--visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    cardsRef.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="exp-section">
      {/* Heading */}
      <div className="exp-heading-wrap">
        <p className="exp-eyebrow">Casa Chalora</p>
        <h2 className="exp-heading">Experiences &amp; Activities</h2>
        <div className="exp-heading-divider" />
      </div>

      {/* Cards row */}
      <div className="exp-track">
        {EXPERIENCES.map((exp, i) => (
          <div
            key={i}
            className="exp-card"
            ref={(el) => (cardsRef.current[i] = el)}
            style={{
              /* rightmost (i=4) → delay 0s, leftmost (i=0) → delay 0.4s */
              '--card-delay': `${i * 0.2}s`,
            }}
          >
            <div className="exp-card-img-wrap">
              <img
                src={heroImage}
                alt={exp.label}
                className="exp-card-img"
                style={{ objectPosition: exp.pos }}
              />
              <div className="exp-card-overlay" />
            </div>
            <div className="exp-card-caption">
              <span>{exp.label}</span>
            </div>
          </div>
        ))}
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
