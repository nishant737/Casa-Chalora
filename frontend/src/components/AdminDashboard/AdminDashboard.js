import { useCallback, useEffect, useRef, useState } from 'react';
import logoImg from '../../assets/images/Casa_Chalora_Logo.png';
import heroBg  from '../../assets/images/casa-ourvilla.jpg';

const API = 'http://localhost:4000';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtAmt(v) {
  if (v == null) return '—';
  return `₹${Number(v).toLocaleString('en-IN')}`;
}
function nights(a, b) {
  if (!a || !b) return '—';
  return Math.ceil((new Date(b) - new Date(a)) / 86400000);
}

const STATUS = {
  pending:  { label: 'Pending',   bg: '#fff8ee', color: '#b5711a', dot: '#e8a130' },
  paid:     { label: 'Paid',      bg: '#edfaf4', color: '#1e7248', dot: '#2ecc71' },
  failed:   { label: 'Failed',    bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
  refunded: { label: 'Refunded',  bg: '#eff6ff', color: '#1d4ed8', dot: '#60a5fa' },
};

/* ─── Admin Profile Dropdown ────────────────────────────── */
function AdminProfileDropdown({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="adm2-profile" ref={ref}>
      <button className="adm2-profile-btn" onClick={() => setOpen(o => !o)}>
        <span className="adm2-avatar">SA</span>
        <span className="adm2-profile-label">Super Admin</span>
        <svg className={`adm2-chevron${open ? ' adm2-chevron--open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="adm2-dropdown">
          <button className="adm2-dropdown-item adm2-dropdown-item--danger" onClick={() => { setOpen(false); onLogout(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ label, value, icon }) {
  return (
    <div className="adm2-stat">
      <span className="adm2-stat-icon">{icon}</span>
      <div>
        <div className="adm2-stat-value">{value}</div>
        <div className="adm2-stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function AdminDashboard({ token, onLogout }) {
  const [bookings,    setBookings]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [stats,       setStats]       = useState({ totalBookings: 0, totalRevenue: 0, pendingPayments: 0, activeBookings: 0 });
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [checkInFrom,  setCheckInFrom]  = useState('');
  const [checkOutTo,   setCheckOutTo]   = useState('');
  const searchTimer = useRef(null);
  const LIMIT = 20;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page, limit: LIMIT, sortBy: 'createdAt', sortOrder: 'desc',
        ...(search       && { search }),
        ...(filterStatus && { paymentStatus: filterStatus }),
        ...(checkInFrom  && { checkInFrom }),
        ...(checkOutTo   && { checkOutTo }),
      });
      const res  = await fetch(`${API}/api/admin/bookings?${q}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setStats(data.stats);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, page, search, filterStatus, checkInFrom, checkOutTo]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const statCards = [
    { label: 'Total Bookings',   value: stats.totalBookings,        icon: '🏡' },
    { label: 'Total Revenue',    value: fmtAmt(stats.totalRevenue), icon: '₹'  },
    { label: 'Pending Payments', value: stats.pendingPayments,      icon: '⏳' },
    { label: 'Active Bookings',  value: stats.activeBookings,       icon: '✓'  },
  ];

  return (
    <div className="adm2-root">
      {/* ── Top Navigation ── */}
      <nav className="adm2-nav">
        <img src={logoImg} alt="Casa Chalora" className="adm2-nav-logo" />
        <div className="adm2-nav-links">
          <span className="adm2-nav-link adm2-nav-link--active">Admin Panel</span>
        </div>
        <AdminProfileDropdown onLogout={onLogout} />
      </nav>

      {/* ── Hero banner ── */}
      <div className="adm2-hero">
        <img src={heroBg} alt="" className="adm2-hero-img" />
        <div className="adm2-hero-overlay" />
        <div className="adm2-hero-text">
          <span className="adm2-hero-eyebrow">Casa Chalora · Admin</span>
          <h1 className="adm2-hero-title">Bookings Overview</h1>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="adm2-main">
        {/* Stats */}
        <div className="adm2-stats-row">
          {statCards.map(c => <StatCard key={c.label} {...c} />)}
        </div>

        {/* Bookings panel */}
        <div className="adm2-panel">
          <div className="adm2-panel-header">
            <div className="adm2-panel-title-row">
              <h2 className="adm2-panel-title">All Bookings</h2>
              <span className="adm2-total-badge">{total}</span>
            </div>

            {/* Filters — read only */}
            <div className="adm2-filters">
              <div className="adm2-search-wrap">
                <svg className="adm2-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="adm2-search"
                  placeholder="Search guest name, email or phone…"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    clearTimeout(searchTimer.current);
                    searchTimer.current = setTimeout(() => setPage(1), 400);
                  }}
                />
              </div>
              <select
                className="adm2-filter-select"
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <div className="adm2-date-group">
                <span className="adm2-date-label">Check-in from</span>
                <input type="date" className="adm2-date-input" value={checkInFrom}
                  onChange={e => { setCheckInFrom(e.target.value); setPage(1); }} />
              </div>
              <div className="adm2-date-group">
                <span className="adm2-date-label">Check-out to</span>
                <input type="date" className="adm2-date-input" value={checkOutTo}
                  onChange={e => { setCheckOutTo(e.target.value); setPage(1); }} />
              </div>
              {(search || filterStatus || checkInFrom || checkOutTo) && (
                <button className="adm2-clear-btn" onClick={() => {
                  setSearch(''); setFilterStatus('');
                  setCheckInFrom(''); setCheckOutTo(''); setPage(1);
                }}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="adm2-loading">
              <div className="adm2-spinner" />
              <span>Loading bookings…</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="adm2-empty">
              <div className="adm2-empty-icon">📋</div>
              <p>No bookings found.</p>
              {(search || filterStatus) && <button className="adm2-link-btn" onClick={() => { setSearch(''); setFilterStatus(''); }}>Clear filters</button>}
            </div>
          ) : (
            <div className="adm2-table-wrap">
              <table className="adm2-table">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Guest</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Nights</th>
                    <th>Guests</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => {
                    const s = STATUS[b.paymentStatus] || STATUS.pending;
                    return (
                      <tr key={b.id} className="adm2-tr">
                        <td className="adm2-td-id">#{b.id}</td>
                        <td>
                          <div className="adm2-guest-name">{b.customerName}</div>
                          <div className="adm2-guest-email">{b.email}</div>
                        </td>
                        <td className="adm2-td-date">{fmt(b.checkIn)}</td>
                        <td className="adm2-td-date">{fmt(b.checkOut)}</td>
                        <td className="adm2-td-center">{nights(b.checkIn, b.checkOut)}</td>
                        <td className="adm2-td-center">{b.guests}</td>
                        <td className="adm2-td-amount">{fmtAmt(b.totalAmount)}</td>
                        <td className="adm2-td-method">{b.paymentMethod.replace('_', ' ')}</td>
                        <td>
                          <span className="adm2-badge" style={{ background: s.bg, color: s.color }}>
                            <span className="adm2-badge-dot" style={{ background: s.dot }} />
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="adm2-pagination">
              <button className="adm2-page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="adm2-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 7)         p = i + 1;
                else if (page <= 4)          p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else                         p = page - 3 + i;
                return (
                  <button key={p} className={`adm2-page-btn${page === p ? ' adm2-page-btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button className="adm2-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              <button className="adm2-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
              <span className="adm2-page-info">{page} of {totalPages} · {total} records</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
