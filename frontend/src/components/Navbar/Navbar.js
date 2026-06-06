import logoHam from '../../assets/images/hamburger.png';
import heroImage from '../../assets/images/hamburger.jpg';

const NAV_LINKS = ['Home', 'Our Villa', 'Experiences', 'Gallery', 'Amenities', 'About Us', 'Contact Us'];

export default function Navbar({ menuOpen, setMenuOpen, onBookNow, onMyAccount, token, userName }) {
  const initials = token && userName
    ? userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <>
      {/* Fixed nav bar */}
      <nav className="hero-nav">
        <div className="hero-nav-left" />
        <div className="hero-nav-right">
          {/* Show avatar only when logged in */}
          {token && (
            <button className="hero-nav-account" onClick={onMyAccount} aria-label="My Account">
              <span className="hero-nav-avatar-sm">{initials}</span>
              <span>{userName.split(' ')[0]}</span>
            </button>
          )}

          <button className="hero-nav-book" onClick={onBookNow}>BOOK NOW</button>
          <button className="hero-nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Full-screen hamburger overlay */}
      <div className={`menu-overlay${menuOpen ? ' menu-overlay--open' : ''}`} aria-hidden={!menuOpen}>
        <div className={`menu-img-panel${menuOpen ? ' menu-img-panel--open' : ''}`}>
          <img src={heroImage} alt="Casa Chalora Villa" className="menu-img" />
          <div className="menu-img-overlay" />
          <div className="menu-img-caption">
            <span className="menu-img-sub">Luxury Villa</span>
            <span className="menu-img-name">Casa Chalora</span>
          </div>
        </div>

        <div className={`menu-nav-panel${menuOpen ? ' menu-nav-panel--open' : ''}`}>
          <div className="menu-top">
            <img src={logoHam} alt="Casa Chalora" className="menu-logo" />
            <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
          </div>

          <nav className="menu-links">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="menu-link"
                style={{ '--link-delay': `${0.72 + i * 0.07}s` }}
                onClick={() => setMenuOpen(false)}
              >
                <span className="menu-link-arrow">→</span>
                <span className="menu-link-text">{link}</span>
              </a>
            ))}

            {/* My Account */}
            <button
              className="menu-link menu-link--account"
              style={{ '--link-delay': `${0.72 + NAV_LINKS.length * 0.07}s` }}
              onClick={() => { setMenuOpen(false); onMyAccount(); }}
            >
              <span className="menu-link-arrow">→</span>
              <span className="menu-link-text">
                {token ? `My Account` : 'My Account'}
              </span>
              {token && <span className="menu-link-badge">{initials}</span>}
            </button>
          </nav>

          <div className="menu-contact">
            <p>casachalora@gmail.com</p>
            <p>+91 98765 43210</p>
          </div>
        </div>
      </div>
    </>
  );
}
