import { useEffect, useRef, useState } from 'react';
import logoImg from '../../assets/images/Casa_Chalora_Logo.png';
import aboutVideo from '../../assets/images/aboutus.mp4';

export default function Hero() {
  const videoRef = useRef(null);
  const [logoVisible,  setLogoVisible]  = useState(false);
  const [logoSmall,    setLogoSmall]    = useState(false);
  const [videoReady,   setVideoReady]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 300);
    const t2 = setTimeout(() => setLogoSmall(true), 300 + 1600 + 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => { if (video.currentTime >= 26.5) video.currentTime = 4; };
    const handleSeeked    = () => { setVideoReady(true); video.play().catch(() => {}); };
    const handleLoaded    = () => { video.currentTime = 4; };
    video.addEventListener('timeupdate',     handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoaded);
    video.addEventListener('seeked',         handleSeeked);
    if (video.readyState >= 1) handleLoaded();
    return () => {
      video.removeEventListener('timeupdate',     handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoaded);
      video.removeEventListener('seeked',         handleSeeked);
    };
  }, []);

  return (
    <section id="home" className="hero-section">
      <video ref={videoRef}
        className={`hero-bg-video${videoReady ? ' hero-bg-video--ready' : ''}`}
        src={aboutVideo} autoPlay muted playsInline preload="auto" />
      <div className="hero-bg-overlay" />
      <div className={`hero-logo-wrap${logoVisible ? ' hero-logo-wrap--visible' : ''}${logoSmall ? ' hero-logo-wrap--small' : ''}`}>
        <img src={logoImg} alt="Casa Chalora" className="hero-logo" />
      </div>
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
