import { useEffect, useRef, useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setErrors({});
    setApiError('');
    setFields({ name: '', email: '', password: '' });
  };

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !fields.name.trim()) e.name = 'Full name is required.';
    if (!fields.email.trim()) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(fields.email)) e.email = 'Enter a valid email address.';
    if (!fields.password) e.password = 'Password is required.';
    else if (fields.password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: fields.email, password: fields.password }
        : { name: fields.name, email: fields.email, password: fields.password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || data.error || 'Something went wrong.'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      if (onAuthSuccess) onAuthSuccess(data.token, data.role, data.name);
      onClose();
    } catch {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field) => (e) => {
    setFields(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div
      className="auth-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? 'Login' : 'Create account'}
    >
      <div className="auth-card">
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="auth-header">
          <span className="auth-eyebrow">Casa Chalora</span>
          <h2 className="auth-title">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <div className="auth-divider" />
        </div>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <input id="auth-name" type="text" placeholder="Your full name" value={fields.name}
                onChange={setField('name')} autoComplete="name"
                className={errors.name ? 'auth-input--error' : ''} />
              {errors.name && <span className="auth-field-error">{errors.name}</span>}
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <input id="auth-email" type="email" placeholder="you@example.com" value={fields.email}
              onChange={setField('email')} autoComplete="email"
              className={errors.email ? 'auth-input--error' : ''} />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" placeholder="Minimum 6 characters" value={fields.password}
              onChange={setField('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={errors.password ? 'auth-input--error' : ''} />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>
          {apiError && <p className="auth-api-error">{apiError}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" aria-label="Loading" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        <p className="auth-toggle">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={switchMode}>{mode === 'login' ? 'Sign up' : 'Log in'}</button>
        </p>
      </div>
    </div>
  );
}
