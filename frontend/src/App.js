import { useCallback, useState } from 'react';
import './App.css';

import Navbar         from './components/Navbar/Navbar';
import Hero           from './components/Hero/Hero';
import OurVilla       from './components/OurVilla/OurVilla';
import Amenities      from './components/Amenities/Amenities';
import Gallery        from './components/Gallery/Gallery';
import Accommodation  from './components/Accommodation/Accommodation';
import Contact        from './components/Contact/Contact';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import BookingPage    from './components/BookingPage/BookingPage';
import BookingFlow    from './components/BookingFlow/BookingFlow';
import AccountLogin   from './components/AccountLogin/AccountLogin';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Single view state replaces the old isSuperAdmin / isCustomer booleans
  const [view, setView] = useState(() => {
    const role  = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (role === 'superadmin' && token) return 'admin';
    if (role === 'customer'   && token) return 'customer';
    return 'landing';
  });

  const [token,       setToken]       = useState(() => localStorage.getItem('token') || '');
  const [userName,    setUserName]    = useState(() => localStorage.getItem('name')  || '');
  // Carry pre-filled form data from dashboard → BookingFlow
  const [pendingForm, setPendingForm] = useState(null);

  // ── Auth success (called by BookingFlow or AccountLogin after login/signup) ──
  const handleAuthSuccess = useCallback((tok, role, name) => {
    setToken(tok);
    setUserName(name);
    if (role === 'superadmin') setView('admin');
    // customer: BookingFlow advances its own step; AccountLogin redirects to 'customer'
  }, []);

  // ── My Account clicked from navbar ──
  const handleMyAccount = useCallback(() => {
    if (token) {
      const role = localStorage.getItem('role');
      setView(role === 'superadmin' ? 'admin' : 'customer');
    } else {
      setView('account-login');
    }
  }, [token]);

  // ── Payment verified → go to customer dashboard ──
  const handlePaymentSuccess = useCallback(() => {
    setPendingForm(null);
    setView('customer');
  }, []);

  // ── Logged-in customer requests a new booking ──
  const handleNewBooking = useCallback((form) => {
    setPendingForm(form || null);
    setView('booking-flow');
  }, []);

  // ── Logout handlers ──
  const handleAdminLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setToken(''); setUserName(''); setView('landing');
  }, []);

  const handleCustomerLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setToken(''); setUserName(''); setView('landing');
  }, []);

  // ── Render ───────────────────────────────────────────────────

  if (view === 'account-login') {
    return (
      <AccountLogin
        onAuthSuccess={(tok, role, name) => {
          setToken(tok);
          setUserName(name);
          setView(role === 'superadmin' ? 'admin' : 'customer');
        }}
        onClose={() => setView('landing')}
      />
    );
  }

  if (view === 'admin') {
    return <AdminDashboard token={token} onLogout={handleAdminLogout} />;
  }

  if (view === 'customer') {
    return (
      <BookingPage
        token={token}
        userName={userName}
        onLogout={handleCustomerLogout}
        onNewBooking={handleNewBooking}
      />
    );
  }

  if (view === 'booking-flow') {
    return (
      <BookingFlow
        initialToken={token || null}
        initialUserName={userName}
        initialForm={pendingForm}
        onAuthSuccess={handleAuthSuccess}
        onPaymentSuccess={handlePaymentSuccess}
        onBack={() => setView(token ? 'customer' : 'landing')}
      />
    );
  }

  // Landing page
  return (
    <div className="App">
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onBookNow={() => setView('booking-flow')}
        onMyAccount={handleMyAccount}
        token={token}
        userName={userName}
      />
      <Hero />
      <OurVilla />
      <Amenities />
      <Gallery />
      <Accommodation />
      <Contact />
    </div>
  );
}
