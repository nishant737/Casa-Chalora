import { useCallback, useState } from 'react';
import './App.css';

import Navbar          from './components/Navbar/Navbar';
import Hero            from './components/Hero/Hero';
import OurVilla        from './components/OurVilla/OurVilla';
import Amenities       from './components/Amenities/Amenities';
import Gallery         from './components/Gallery/Gallery';
import Accommodation   from './components/Accommodation/Accommodation';
import AuthModal       from './components/AuthModal/AuthModal';
import AdminDashboard  from './components/AdminDashboard/AdminDashboard';
import BookingPage     from './components/BookingPage/BookingPage';

export default function App() {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [authOpen,      setAuthOpen]      = useState(false);
  const [isSuperAdmin,  setIsSuperAdmin]  = useState(() => localStorage.getItem('role') === 'superadmin');
  const [isCustomer,    setIsCustomer]    = useState(() => localStorage.getItem('role') === 'customer' && !!localStorage.getItem('token'));
  const [adminToken,    setAdminToken]    = useState(() => localStorage.getItem('token') || '');
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('token') || '');
  const [userName,      setUserName]      = useState(() => localStorage.getItem('name') || '');

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const handleAuthSuccess = useCallback((token, role, name) => {
    if (role === 'superadmin') {
      setAdminToken(token);
      setIsSuperAdmin(true);
    } else {
      setCustomerToken(token);
      setUserName(name || '');
      setIsCustomer(true);
    }
  }, []);

  const handleAdminLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setIsSuperAdmin(false);
    setAdminToken('');
  }, []);

  const handleCustomerLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setIsCustomer(false);
    setCustomerToken('');
    setUserName('');
  }, []);

  if (isSuperAdmin) {
    return <AdminDashboard token={adminToken} onLogout={handleAdminLogout} />;
  }

  if (isCustomer) {
    return <BookingPage token={customerToken} userName={userName} onLogout={handleCustomerLogout} />;
  }

  return (
    <div className="App">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} onBookNow={() => setAuthOpen(true)} />
      <Hero />
      <OurVilla />
      <Amenities />
      <Gallery />
      <Accommodation />
      {authOpen && <AuthModal onClose={closeAuth} onAuthSuccess={handleAuthSuccess} />}
    </div>
  );
}
