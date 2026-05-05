import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Search, LogOut, LayoutGrid, PlusSquare, TrendingUp, User, ChevronDown, Bookmark, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, isCreator, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: '10px',
        fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
        color: isActive(to) ? 'var(--text-main)' : 'var(--text-muted)',
        background: isActive(to) ? 'var(--bg-secondary)' : 'transparent',
        border: `1px solid ${isActive(to) ? 'var(--border-subtle)' : 'transparent'}`,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.color = 'var(--text-main)'; }}
      onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      <Icon size={17} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ background: 'var(--text-main)', padding: '7px', borderRadius: '10px', display: 'flex' }}>
            <Camera size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'Outfit' }}>Pixora</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <NavLink to="/search"   icon={Search}     label="Explore" />
          <NavLink to="/trending" icon={TrendingUp}  label="Trending" />
          {isCreator && <NavLink to="/dashboard" icon={PlusSquare} label="Upload" />}
        </div>

        {/* Right: auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {user ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              {/* Avatar button */}
              <button
                onClick={() => setDropOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px 6px 6px',
                  background: dropOpen ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '100px', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Avatar circle */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transform: dropOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
              </button>

              {/* Dropdown panel */}
              {dropOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
                  background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
                  borderRadius: '14px', padding: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                  minWidth: '210px',
                  animation: 'slideDown 0.15s ease-out',
                }}>
                  {/* User info */}
                  <div style={{ padding: '10px 12px 14px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)', margin: 0 }}>{user.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{user.email}</p>
                    <span style={{
                      display: 'inline-block', marginTop: '6px',
                      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: isCreator ? 'var(--accent)' : 'var(--bg-tertiary)',
                      color: isCreator ? 'white' : 'var(--text-muted)',
                      padding: '2px 8px', borderRadius: '100px',
                    }}>
                      {isCreator ? 'Creator' : 'Viewer'}
                    </span>
                  </div>

                  {/* Menu items */}
                  {[
                    ...(isCreator ? [{ to: '/dashboard', icon: LayoutGrid, label: 'My Portfolio' }] : []),
                    { to: '/profile',   icon: User,     label: 'Profile' },
                    { to: '/bookmarks', icon: Bookmark, label: 'Saved' },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setDropOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '8px', textDecoration: 'none',
                        color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 500,
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon size={16} color="var(--text-muted)" />
                      {label}
                    </Link>
                  ))}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '6px', paddingTop: '6px' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '9px 12px', borderRadius: '8px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600,
                        transition: 'background 0.12s', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <Link to="/login"    className="btn btn-ghost" style={{ padding: '8px 16px' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Join Pixora</Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}
