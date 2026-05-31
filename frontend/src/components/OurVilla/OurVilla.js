import { useEffect, useState } from 'react';
import ourVillaImg from '../../assets/images/casa-ourvilla.jpg';
import ourVilla2 from '../../assets/images/our villa 2.jpg';
import ourVilla3 from '../../assets/images/our villa 3.jpg';
import ourVilla4 from '../../assets/images/our villa 4.jpg';

const VILLA_SLIDES = [
  { src: ourVillaImg, pos: 'center center' },
  { src: ourVilla2,   pos: 'center center' },
  { src: ourVilla3,   pos: 'center top'    },
  { src: ourVilla4,   pos: 'center top'    },
];

const LANDMARKS = [
  { name: 'Candolim Beach', distance: '2.4 km' },
  { name: 'Calangute Beach', distance: '3.7 km' },
  { name: 'Aguada Fort',     distance: '6.6 km' },
  { name: 'Baga Beach',      distance: '6.7 km' },
];

export default function OurVilla() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % VILLA_SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="our-villa" className="our-villa-section">
      <div className="our-villa-image-col">
        {VILLA_SLIDES.map(({ src, pos }, i) => (
          <img key={src} src={src} alt={`Casa Chalora Villa ${i + 1}`}
            style={{ objectPosition: pos }}
            className={`our-villa-image${i === current ? ' our-villa-image--active' : ''}`} />
        ))}
        <div className="our-villa-dots">
          {VILLA_SLIDES.map((_, i) => (
            <button key={i}
              className={`our-villa-dot${i === current ? ' our-villa-dot--active' : ''}`}
              onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </div>

      <div className="our-villa-content-col">
        <span className="our-villa-eyebrow">Luxury Villa · Goa</span>
        <h2 className="our-villa-title">Our Villa</h2>
        <div className="our-villa-divider" />
        <p className="our-villa-body">
          Casa Chalora is an incredible haven in the centre of Goa where elegance and peace
          coexist. Tucked away in verdant surroundings and clear blue skies, this property
          offers an experience unlike any other — from a chic outdoor pool and manicured lawn
          to high-definition entertainment and fully stocked bar counters.
        </p>

        <div className="our-villa-landmarks">
          <span className="our-villa-landmarks-label">Nearby Landmarks</span>
          <ul className="our-villa-landmarks-list">
            {LANDMARKS.map(({ name, distance }) => (
              <li key={name} className="our-villa-landmarks-item">
                <span className="our-villa-landmarks-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                </span>
                <span className="our-villa-landmarks-name">{name}</span>
                <span className="our-villa-landmarks-distance">{distance}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
