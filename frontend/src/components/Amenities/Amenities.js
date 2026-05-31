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

const AMENITIES_SLIDES = [
  { src: accomOne,   name: 'Private Pool',           sub: 'Your own private plunge retreat' },
  { src: accomTwo,   name: 'BBQ',                    sub: 'Al fresco grilling under open skies' },
  { src: accomThree, name: 'Lawn',                   sub: 'Lush manicured grounds for leisure' },
  { src: accomFour,  name: 'Bar',                    sub: 'Curated spirits & cocktail essentials' },
  { src: accomFive,  name: 'Balcony & Terrace',      sub: 'Breathe in Goa from your private perch' },
  { src: accomSix,   name: 'Indoor & Outdoor Games', sub: 'Endless entertainment for every mood' },
  { src: accomSeven, name: 'Music System & Speaker', sub: 'Premium sound to set the perfect tone' },
  { src: accomEight, name: 'Cook Available',         sub: 'Personalised meals crafted on request' },
  { src: accomNine,  name: 'Pet Friendly',           sub: 'Your beloved companions are welcome here' },
];

export default function Amenities() {
  const [active, setActive] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const total = AMENITIES_SLIDES.length;

  const mod = (n) => ((n % total) + total) % total;

  const getRole = (i) => {
    if (i === active)            return 'center';
    if (i === mod(active - 1))  return 'left';
    if (i === mod(active + 1))  return 'right';
    if (i === mod(active - 2))  return 'lhide';
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
    }, 4500);
    return () => clearInterval(id);
  }, [total]);

  return (
    /* Hard DOM-level clip — height:100vh + overflow:hidden seals all absolutely-positioned slides */
    <div style={{ display: 'block', width: '100%', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 0 }}>
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
