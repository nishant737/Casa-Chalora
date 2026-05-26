import { useEffect, useRef, useState } from 'react';
import heroImage from './assets/images/CasaChalora.jpg';
import aboutVideo from './assets/images/aboutus.mp4';
import './App.css';

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function lerp(a, b, t)    { return a + (b - a) * t; }

const INIT = {
  desktop: { w: 22, h: 62, t: 24 },
  mobile:  { w: 72, h: 58, t: 20 },
};
function getInit() {
  return window.innerWidth < 768 ? INIT.mobile : INIT.desktop;
}

const FACILITIES = [
  { icon: '🛏', label: '3 Bedrooms' },
  { icon: '🏊', label: 'Private Pool' },
  { icon: '🛎', label: 'Butler Service' },
  { icon: '🎱', label: 'Pool / Snooker' },
  { icon: '🎲', label: 'Board Games' },
  { icon: '🔥', label: 'BBQ' },
  { icon: '📶', label: 'WiFi' },
  { icon: '⚡', label: 'EV Charging' },
  { icon: '🚗', label: 'Parking' },
  { icon: '🐾', label: 'Pet Friendly' },
  { icon: '✨', label: 'Designed Spaces' },
];

function Hero() {
  const sectionRef     = useRef(null);
  const frameRef       = useRef(null);
  const overlayRef     = useRef(null);
  const exploreRef     = useRef(null);
  const subtitleRef    = useRef(null);
  const titleRef       = useRef(null);
  const dividerRef     = useRef(null);
  const facilitiesRef  = useRef(null);
  const rafRef         = useRef(null);
  const smoothRef      = useRef(0);
  const facilShownRef  = useRef(false);

  const [titleEntered, setTitleEntered] = useState(false);
  const [imageEntered, setImageEntered] = useState(false);
  const [exploreShown, setExploreShown] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleEntered(true), 120);
    const t2 = setTimeout(() => setImageEntered(true), 2800);
    const t3 = setTimeout(() => setExploreShown(true), 4200);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const section    = sectionRef.current;
    const frame      = frameRef.current;
    const overlay    = overlayRef.current;
    const explore    = exploreRef.current;
    const subtitle   = subtitleRef.current;
    const titleEl    = titleRef.current;
    const divider    = dividerRef.current;
    const facilities = facilitiesRef.current;
    const ANIM_END   = 0.50;

    const tick = () => {
      const maxScroll = section.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const raw        = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        const lerpFactor = window.innerWidth < 768 ? 0.13 : 0.08;
        smoothRef.current = lerp(smoothRef.current, raw, lerpFactor);
        const s     = smoothRef.current;
        const animP = easeOutCubic(Math.min(1, s / ANIM_END));

        const { w: iw, h: ih, t: it } = getInit();
        const w = lerp(iw, 100, animP);
        const h = lerp(ih, 100, animP);
        const t = lerp(it, 0,   animP);
        const r = lerp(10, 0,   animP);

        frame.style.width        = `${w}%`;
        frame.style.height       = `${h}%`;
        frame.style.top          = `${t}%`;
        frame.style.borderRadius = `${r}px`;
        if (raw > 0.01) {
          frame.style.transform = 'translateX(-50%)';
          frame.style.opacity   = '1';
        }

        overlay.style.opacity  = String(lerp(0, 0.60, animP));

        // title: black → white as image expands; shadow grows for legibility
        const titleC = Math.round(lerp(26, 255, animP));
        titleEl.style.color      = `rgb(${titleC},${titleC},${titleC})`;
        titleEl.style.textShadow = animP > 0.1
          ? `0 2px ${Math.round(lerp(4, 24, animP))}px rgba(0,0,0,${lerp(0.15, 0.75, animP).toFixed(2)})`
          : 'none';

        // subtitle + divider fade out as image expands
        const subOp = lerp(1, 0, Math.min(1, animP * 2.2));
        subtitle.style.opacity = String(subOp);
        divider.style.opacity  = String(subOp);

        explore.style.opacity  = String(lerp(1, 0, Math.min(1, animP * 3)));

        // facilities: reveal slowly during dwell phase
        const dwellP = Math.max(0, (s - ANIM_END) / (1 - ANIM_END));
        const facilP = easeOutCubic(Math.min(1, dwellP * 1.6));
        facilities.style.opacity   = String(facilP);
        facilities.style.transform = `translateY(${lerp(40, 0, facilP)}px)`;

        // trigger item stagger only after panel is well visible (30%)
        if (facilP > 0.30 && !facilShownRef.current) {
          facilShownRef.current = true;
          facilities.querySelectorAll('.facility-item').forEach((el, i) => {
            el.style.transitionDelay = `${i * 90}ms`;
            el.classList.add('facility-item--visible');
          });
        }
        if (facilP < 0.05 && facilShownRef.current) {
          facilShownRef.current = false;
          facilities.querySelectorAll('.facility-item').forEach(el => {
            el.classList.remove('facility-item--visible');
            el.style.transitionDelay = '0ms';
          });
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    const onResize = () => { section.style.height = `${window.innerHeight * 2.5}px`; };
    onResize();
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="hero-section" ref={sectionRef}>
      <div className="hero-sticky">

        {/* Title */}
        <div className={`hero-title-wrap${titleEntered ? ' hero-title-wrap--entered' : ''}`}>
          <h1 className="hero-title" ref={titleRef}>CASA CHALORA</h1>
          <p className="hero-subtitle" ref={subtitleRef}>LUXURY ABOVE THE WAVES</p>
          <div className="hero-title-divider" ref={dividerRef} />
        </div>

        {/* Portrait frame → full bleed */}
        <div className={`hero-frame${imageEntered ? ' hero-frame--visible' : ''}`} ref={frameRef}>
          <img src={heroImage} alt="Casa Chalora" className="hero-image" />
          <div className="hero-overlay" ref={overlayRef} />

          {/* Facilities panel — lives inside the frame, revealed on dwell */}
          <div className="facilities-panel" ref={facilitiesRef}>
            <div className="facilities-grid">
              {FACILITIES.map((f, i) => (
                <div className="facility-item" key={i}>
                  <span className="facility-icon">{f.icon}</span>
                  <span className="facility-label">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll nudge */}
        <div className={`hero-explore${exploreShown ? ' hero-explore--visible' : ''}`} ref={exploreRef}>
          <span className="hero-explore-label">↓ &nbsp;Scroll to Explore</span>
          <div className="hero-explore-line" />
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
      <About />
      <Experiences />
    </div>
  );
}

export default App;
