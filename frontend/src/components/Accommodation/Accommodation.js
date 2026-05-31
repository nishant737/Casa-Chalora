import { useCallback, useEffect, useState } from 'react';
import accomOne   from '../../assets/images/accomadationone.jpg';
import accomTwo   from '../../assets/images/accomadationtwo.jpg';
import accomThree from '../../assets/images/accomadationthree.jpg';
import accomFour  from '../../assets/images/accomadationfour.jpg';
import accomFive  from '../../assets/images/accomadationfive.jpg';
import accomSix   from '../../assets/images/accomadationsix.jpg';
import accomSeven from '../../assets/images/accomadationseven.jpg';
import accomEight from '../../assets/images/accomadationeight.jpg';
import accomNine  from '../../assets/images/accomadationnine.jpg';

const ACCOM_PHOTOS = [
  { src: accomOne,   label: 'Master Suite',    desc: 'King bed · En-suite · Garden view' },
  { src: accomTwo,   label: 'Deluxe Room',      desc: 'Queen bed · Private terrace' },
  { src: accomThree, label: 'Premium Suite',    desc: 'King bed · Pool view' },
  { src: accomFour,  label: 'Garden Bedroom',   desc: 'Twin beds · Courtyard access' },
  { src: accomFive,  label: 'Junior Suite',     desc: 'King bed · Outdoor shower' },
  { src: accomSix,   label: 'Poolside Room',    desc: 'Queen bed · Direct pool access' },
  { src: accomSeven, label: 'Forest View',      desc: 'King bed · Floor-to-ceiling windows' },
  { src: accomEight, label: 'Cosy Alcove',      desc: 'Queen bed · Reading nook' },
  { src: accomNine,  label: 'Heritage Chamber', desc: 'King bed · Antique décor · Balcony' },
];

export default function Accommodation() {
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
      <div className="accom-header">
        <span className="accom-eyebrow">Stay With Us</span>
        <h2 className="accom-title">Accommodation</h2>
        <div className="accom-divider" />
        <p className="accom-subtitle">
          Nine thoughtfully curated rooms — each a private sanctuary blending
          heritage craftsmanship with contemporary comfort.
        </p>
      </div>

      <div className="accom-grid">
        {ACCOM_PHOTOS.map(({ src, label, desc }, i) => (
          <button key={i} className={`accom-cell accom-cell--${i}`}
            onClick={() => setLightbox(i)} aria-label={`View ${label}`}>
            <img src={src} alt={label} className="accom-cell-img" loading="lazy" />
            <div className="accom-cell-overlay">
              <span className="accom-cell-label">{label}</span>
              <span className="accom-cell-desc">{desc}</span>
            </div>
          </button>
        ))}
      </div>

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
