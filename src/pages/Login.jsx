import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{maxWidth: '400px', margin: '4rem auto', padding: '2rem'}}>
      <div style={{textAlign: 'center', marginBottom: '2rem'}}>
        <Camera size={48} color="var(--accent-color)" />
        <h2 style={{marginTop: '1rem'}}>Welcome Back</h2>
      </div>
      
      {error && <div style={{color: 'var(--danger-color)', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px'}}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div>
          <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>Email</label>
          <input 
            type="email" 
            className="glass-input" 
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>Password</label>
          <input 
            type="password" 
            className="glass-input" 
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="glass-button" disabled={loading} style={{marginTop: '1rem', width: '100%'}}>
          {loading ? 'Entering...' : 'Login to Pixora'}
        </button>
      </form>
      <div style={{marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem'}}>
        Don't have an account? <Link to="/register" style={{color: 'var(--accent-color)', textDecoration: 'none'}}>Register</Link>
      </div>
    </div>
  );
}
