import { useCallback, useEffect, useState } from 'react';
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
import accomSix    from '../../assets/images/accomadationsix.jpg';
import accomSeven  from '../../assets/images/accomadationseven.jpg';
import accomEight  from '../../assets/images/accomadationeight.jpg';
import accomNine   from '../../assets/images/accomadationnine.jpg';

const GALLERY_ALL = [
  ourVillaImg, ourVilla2, ourVilla3, ourVilla4,
  accomOne, accomTwo, accomThree, accomFour, accomFive,
  accomSix, accomSeven, accomEight, accomNine, heroImage,
];

const VISIBLE = 3;

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const total = GALLERY_ALL.length;

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
        <button className="gallery-cell gallery-cell--hero" onClick={() => setLightbox(0)} aria-label="View gallery">
          <img src={GALLERY_ALL[0]} alt="Casa Chalora" className="gallery-img" />
        </button>

        <div className="gallery-right">
          <button className="gallery-cell" onClick={() => setLightbox(1)} aria-label="View gallery">
            <img src={GALLERY_ALL[1]} alt="Casa Chalora" className="gallery-img" />
          </button>
          <button className="gallery-cell gallery-cell--more" onClick={() => setLightbox(2)} aria-label="View all photos">
            <img src={GALLERY_ALL[2]} alt="Casa Chalora" className="gallery-img" />
            <div className="gallery-more-overlay">
              <span className="gallery-more-count">+{total - VISIBLE}</span>
              <span className="gallery-more-label">More</span>
            </div>
          </button>
        </div>
      </div>

      {lightbox !== null && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <button className="gallery-lb-close" onClick={closeLightbox} aria-label="Close">✕</button>
          <button className="gallery-lb-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          <div className="gallery-lb-content" onClick={e => e.stopPropagation()}>
            <img src={GALLERY_ALL[lightbox]} alt="Casa Chalora" className="gallery-lb-img" />
            <span className="gallery-lb-counter">{lightbox + 1} / {total}</span>
          </div>
          <button className="gallery-lb-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
        </div>
      )}
    </section>
  );
}
