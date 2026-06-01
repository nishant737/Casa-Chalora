import { useCallback, useEffect, useRef, useState } from 'react';
import villaVideo  from '../../assets/images/aboutus.mp4';
import ourVillaImg from '../../assets/images/casa-ourvilla.jpg';
import ourVilla2   from '../../assets/images/our villa 2.jpg';
import ourVilla3   from '../../assets/images/our villa 3.jpg';
import ourVilla4   from '../../assets/images/our villa 4.jpg';
import heroImage   from '../../assets/images/hamburger.jpg';
import accomOne    from '../../assets/images/accomadationone.jpg';
import accomTwo    from '../../assets/images/accomadationtwo.jpg';
import accomThree  from '../../assets/images/accomadationthree.jpg';
import accomFour   from '../../assets/images/accomadationfour.jpg';
import accomFive   from '../../assets/images/accomadationfive.jpg';
import accomSeven  from '../../assets/images/accomadationseven.jpg';
import accomEight  from '../../assets/images/accomadationeight.jpg';
import accomNine   from '../../assets/images/accomadationnine.jpg';

const GALLERY_ITEMS = [
  { type: 'video', src: villaVideo },
  { type: 'video', src: '/videos/villa-1.mov' },
  { type: 'video', src: '/videos/villa-2.mov' },
  { type: 'video', src: '/videos/villa-3.mov' },
  { type: 'video', src: '/videos/villa-4.mov' },
  { type: 'video', src: '/videos/villa-5.mov' },
  { type: 'video', src: '/videos/villa-6.mov' },
  { type: 'video', src: '/videos/villa-7.mov' },
  { type: 'video', src: '/videos/villa-8.mov' },
  { type: 'image', src: ourVillaImg },
  { type: 'image', src: ourVilla2 },
  { type: 'image', src: ourVilla3 },
  { type: 'image', src: ourVilla4 },
  { type: 'image', src: accomOne },
  { type: 'image', src: accomTwo },
  { type: 'image', src: accomThree },
  { type: 'image', src: accomFour },
  { type: 'image', src: accomFive },
  { type: 'image', src: accomSeven },
  { type: 'image', src: accomEight },
  { type: 'image', src: accomNine },
  { type: 'image', src: heroImage },
];

const VISIBLE = 5;

function LightboxMedia({ item }) {
  if (item.type === 'video') {
    return (
      <video
        src={item.src}
        className="gallery-lb-img"
        controls
        muted
        autoPlay
        loop
        playsInline
      />
    );
  }
  return <img src={item.src} alt="Casa Chalora" className="gallery-lb-img" />;
}

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const videoRef = useRef(null);
  const total = GALLERY_ITEMS.length;

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setLightbox(i => (i + 1) % total), [total]);

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
    <section id="gallery" className="gallery-section">
      <div className="gallery-header">
        <span className="gallery-eyebrow">Explore The Villa</span>
        <h2 className="gallery-title">Gallery</h2>
        <div className="gallery-divider" />
      </div>

      <div className="gallery-grid">
        {/* Hero cell — video */}
        <button className="gallery-cell gallery-cell--hero" onClick={() => setLightbox(0)} aria-label="Play villa video">
          <video
            ref={videoRef}
            src={GALLERY_ITEMS[0].src}
            className="gallery-img"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="gallery-video-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            <span>Play Video</span>
          </div>
        </button>

        <div className="gallery-right">
          <div className="gallery-right-row">
            {[1, 2].map(idx => (
              <button key={idx} className="gallery-cell" onClick={() => setLightbox(idx)} aria-label="View gallery">
                {GALLERY_ITEMS[idx].type === 'video'
                  ? <><video src={GALLERY_ITEMS[idx].src} className="gallery-img" muted playsInline preload="metadata" /><div className="gallery-video-badge"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="5,3 19,12 5,21"/></svg></div></>
                  : <img src={GALLERY_ITEMS[idx].src} alt="Casa Chalora" className="gallery-img" />
                }
              </button>
            ))}
          </div>
          <div className="gallery-right-row">
            <button className="gallery-cell" onClick={() => setLightbox(3)} aria-label="View gallery">
              {GALLERY_ITEMS[3].type === 'video'
                ? <><video src={GALLERY_ITEMS[3].src} className="gallery-img" muted playsInline preload="metadata" /><div className="gallery-video-badge"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="5,3 19,12 5,21"/></svg></div></>
                : <img src={GALLERY_ITEMS[3].src} alt="Casa Chalora" className="gallery-img" />
              }
            </button>
            <button className="gallery-cell gallery-cell--more" onClick={() => setLightbox(4)} aria-label="View all photos">
              {GALLERY_ITEMS[4].type === 'video'
                ? <video src={GALLERY_ITEMS[4].src} className="gallery-img" muted playsInline preload="metadata" />
                : <img src={GALLERY_ITEMS[4].src} alt="Casa Chalora" className="gallery-img" />
              }
              <div className="gallery-more-overlay">
                <span className="gallery-more-count">+{total - VISIBLE}</span>
                <span className="gallery-more-label">More</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <button className="gallery-lb-close" onClick={closeLightbox} aria-label="Close">✕</button>
          <button className="gallery-lb-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          <div className="gallery-lb-content" onClick={e => e.stopPropagation()}>
            <LightboxMedia item={GALLERY_ITEMS[lightbox]} />
            <span className="gallery-lb-counter">{lightbox + 1} / {total}</span>
          </div>
          <button className="gallery-lb-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
        </div>
      )}
    </section>
  );
}
