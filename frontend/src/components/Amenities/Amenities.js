import { useCallback, useEffect, useState } from 'react';
import privatePool from '../../assets/images/amenities/private-pool.jpg';
import pool        from '../../assets/images/amenities/pool.jpg';
import bbq         from '../../assets/images/amenities/bbq.jpg';
import bar         from '../../assets/images/amenities/bar.jpg';
import games       from '../../assets/images/amenities/games.jpg';
import kitchen     from '../../assets/images/amenities/kitchen.jpg';
import acRoom      from '../../assets/images/amenities/ac-room.jpg';
import staff       from '../../assets/images/amenities/staff.jpg';

const AMENITIES_SLIDES = [
  { src: privatePool, name: 'Private Pool',           sub: 'Your own private plunge retreat' },
  { src: pool,        name: 'Pool Deck',              sub: 'Unwind beside pristine waters' },
  { src: bbq,         name: 'BBQ & Al Fresco',        sub: 'Al fresco grilling under open skies' },
  { src: bar,         name: 'Bar & Lounge',            sub: 'Curated spirits & cocktail essentials' },
  { src: games,       name: 'Indoor & Outdoor Games', sub: 'Endless entertainment for every mood' },
  { src: kitchen,     name: 'Personal Cook',           sub: 'Personalised meals crafted on request' },
  { src: acRoom,      name: 'AC Rooms',               sub: 'Climate-controlled comfort throughout' },
  { src: staff,       name: 'Driver & Staff',          sub: 'Dedicated team at your service' },
];

export default function Amenities() {
  const [active, setActive] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const total = AMENITIES_SLIDES.length;

  const mod = (n) => ((n % total) + total) % total;

  const getRole = (i) => {
    if (i === active)           return 'center';
    if (i === mod(active - 1)) return 'left';
    if (i === mod(active + 1)) return 'right';
    if (i === mod(active - 2)) return 'lhide';
    return 'rhide';
  };

  const advance = useCallback((to) => {
    setTextVisible(false);
    setActive(to);
    setTimeout(() => setTextVisible(true), 120);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActive(a => {
        const next = (a + 1) % total;
        setTextVisible(false);
        setTimeout(() => setTextVisible(true), 120);
        return next;
      });
    }, 2800);
    return () => clearInterval(id);
  }, [total]);

  return (
    <div className="amenities-clip">
      <section id="amenities" className="amenities-section">
        <div className="amenities-topbar">
          <span className="amenities-eyebrow">What We Offer</span>
          <span className="amenities-label">Amenities</span>
        </div>

        <div className="amenities-stage">
          {AMENITIES_SLIDES.map((slide, i) => {
            const role = getRole(i);
            return (
              <div
                key={i}
                className={`amenities-slide amenities-slide--${role}`}
                onClick={role === 'right' || role === 'left' ? () => advance(i) : undefined}
              >
                <img src={slide.src} alt={slide.name} className="amenities-slide-img" />
                {role === 'center' && <div className="amenities-gradient" />}
                {role === 'center' && (
                  <div className={`amenities-overlay-text${textVisible ? ' amenities-overlay-text--visible' : ''}`}>
                    <h2 className="amenities-slide-name">{slide.name}</h2>
                    <p className="amenities-slide-sub">{slide.sub}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
