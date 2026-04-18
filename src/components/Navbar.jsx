import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Search, User, LogOut, UploadCloud } from 'lucide-react';
import React from 'react';

export default function Navbar() {
  const { user, isCreator, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemStyle = {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
    fontSize: '0.95rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  };

  return (
    <nav className="glass-panel" style={{position: 'sticky', top: 0, zIndex: 50, borderRadius: 0, borderBottom: '1px solid var(--glass-border)', padding: '1rem 0'}}>
      <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        
        <Link to="/" style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', textDecoration: 'none'}}>
          <div style={{background: 'var(--accent-color)', padding: '0.5rem', borderRadius: '12px'}}>
            <Camera size={24} color="white" />
          </div>
          <span style={{fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em'}}>Pixora</span>
        </Link>
        <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
          <Link to="/search" style={{...navItemStyle, background: location.pathname === '/search' ? 'rgba(255,255,255,0.1)' : 'transparent'}}>
            <Search size={18} /> Search
          </Link>
          
          {user ? (
            <>
              {isCreator && (
                <Link to="/dashboard" style={{...navItemStyle, background: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent'}}>
                  <UploadCloud size={18} /> Dashboard
                </Link>
              )}
              <div style={{height: '24px', width: '1px', background: 'var(--glass-border)', margin: '0 0.5rem'}}></div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div style={{width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{fontSize: '0.9rem', marginRight: '1rem'}}>{user.name}</span>
                <button onClick={handleLogout} className="glass-button danger" style={{padding: '0.4rem 0.75rem', fontSize: '0.875rem'}}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{display: 'flex', gap: '1rem'}}>
              <Link to="/login" style={navItemStyle}>Login</Link>
              <Link to="/register" className="glass-button" style={{padding: '0.5rem 1.25rem'}}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
