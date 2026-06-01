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

const VILLA_STATS = [
  {
    value: '9',
    label: 'Guests',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="3.5"/>
        <path d="M5 21v-1.5A5.5 5.5 0 0 1 10.5 14h3A5.5 5.5 0 0 1 19 19.5V21"/>
      </svg>
    ),
  },
  {
    value: '3',
    label: 'Rooms',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5V19a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9.5"/>
        <path d="M2 10l10-7 10 7"/>
        <rect x="9" y="14" width="6" height="6" rx="0.5"/>
      </svg>
    ),
  },
  {
    value: '5',
    label: 'Baths',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z"/>
        <path d="M4 12V6a2 2 0 0 1 2-2c.6 0 1.1.2 1.5.6L9 6"/>
        <line x1="8" y1="20" x2="8" y2="22"/>
        <line x1="16" y1="20" x2="16" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    ),
  },
  {
    value: '✦',
    label: 'Meals Available',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3C8 3 5 6.5 5 10h14c0-3.5-3-7-7-7Z"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="12" y1="10" x2="12" y2="20"/>
        <path d="M8 20h8"/>
      </svg>
    ),
  },
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

        <p className="our-villa-body">
          Every corner of Casa Chalora has been thoughtfully designed to offer the finest in
          comfort and style. Whether you are unwinding by the sparkling pool, hosting an intimate
          gathering on the sun-drenched lawn, or simply soaking in the serene Goan atmosphere,
          this villa is your personal sanctuary — a place where every moment feels effortlessly
          luxurious and every stay becomes an unforgettable memory.
        </p>

        <div className="our-villa-stats">
          {VILLA_STATS.map(({ value, label, icon }) => (
            <div key={label} className="our-villa-stat">
              <span className="our-villa-stat-icon">{icon}</span>
              <span className="our-villa-stat-value">{value}</span>
              <span className="our-villa-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
