import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', message: '' });
    }, 1200);
  };

  return (
    <section id="contact-us" className="contact-section">
      <div className="contact-inner">

        {/* ── Left: Form ── */}
        <div className="contact-form-col">
          <span className="contact-eyebrow">Reach Out</span>
          <h2 className="contact-title">Contact Us</h2>
          <div className="contact-divider" />
          <p className="contact-intro">
            We'd love to hear from you. Fill in the form and our team will get
            back to you within 24 hours.
          </p>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-field-row">
              <div className="contact-field">
                <label className="contact-label" htmlFor="cf-name">Full Name</label>
                <input
                  id="cf-name" name="name" type="text"
                  className="contact-input" placeholder="Arjun Sharma"
                  value={form.name} onChange={handleChange} required
                />
              </div>
              <div className="contact-field">
                <label className="contact-label" htmlFor="cf-email">Email Address</label>
                <input
                  id="cf-email" name="email" type="email"
                  className="contact-input" placeholder="arjun@example.com"
                  value={form.email} onChange={handleChange} required
                />
              </div>
            </div>

            <div className="contact-field">
              <label className="contact-label" htmlFor="cf-phone">Phone Number</label>
              <input
                id="cf-phone" name="phone" type="tel"
                className="contact-input" placeholder="+91 98765 43210"
                value={form.phone} onChange={handleChange}
              />
            </div>

            <div className="contact-field">
              <label className="contact-label" htmlFor="cf-message">Message</label>
              <textarea
                id="cf-message" name="message"
                className="contact-input contact-textarea"
                placeholder="Tell us about your stay, dates, number of guests…"
                rows={5} value={form.message} onChange={handleChange} required
              />
            </div>

            <button type="submit" className="contact-submit" disabled={status === 'sending'}>
              {status === 'sending' ? (
                <span className="contact-spinner" />
              ) : status === 'sent' ? (
                'Message Sent ✓'
              ) : (
                'Send Message'
              )}
            </button>

            {status === 'sent' && (
              <p className="contact-success">
                Thank you! We'll be in touch shortly.
              </p>
            )}
          </form>
        </div>

        {/* ── Right: Info + Map ── */}
        <div className="contact-info-col">
          <div className="contact-info-block">
            <span className="contact-eyebrow">Find Us</span>
            <h2 className="contact-title">Get In Touch</h2>
            <div className="contact-divider" />

            <ul className="contact-details">
              <li className="contact-detail-item">
                <span className="contact-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                </span>
                <div>
                  <span className="contact-detail-label">Address</span>
                  <span className="contact-detail-value">Casa Chalora, Candolim,<br />North Goa – 403515, India</span>
                </div>
              </li>
              <li className="contact-detail-item">
                <span className="contact-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 5.68 5.68l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <div>
                  <span className="contact-detail-label">Phone</span>
                  <span className="contact-detail-value">+91 98765 43210</span>
                </div>
              </li>
              <li className="contact-detail-item">
                <span className="contact-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <div>
                  <span className="contact-detail-label">Email</span>
                  <span className="contact-detail-value">stay@casachalora.com</span>
                </div>
              </li>
              <li className="contact-detail-item">
                <span className="contact-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </span>
                <div>
                  <span className="contact-detail-label">Check-in / Check-out</span>
                  <span className="contact-detail-value">2:00 PM / 11:00 AM</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="contact-map">
            <iframe
              title="Casa Chalora Location"
              src="https://maps.google.com/maps?q=Candolim+Beach+Goa+India&z=14&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
