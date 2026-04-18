import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'consumer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.password_confirmation) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="glass-panel" style={{maxWidth: '450px', margin: '4rem auto', padding: '2rem'}}>
      <div style={{textAlign: 'center', marginBottom: '2rem'}}>
        <Camera size={48} color="var(--accent-color)" />
        <h2 style={{marginTop: '1rem'}}>Join Pixora</h2>
      </div>
      
      {error && <div style={{color: 'var(--danger-color)', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px'}}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div>
          <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>Name</label>
          <input name="name" type="text" className="glass-input" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>Email</label>
          <input name="email" type="email" className="glass-input" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>Role</label>
          <select name="role" className="glass-input" value={formData.role} onChange={handleChange} required style={{backgroundColor: '#1e293b'}}>
            <option value="consumer">Consumer (Browse & Rate)</option>
            <option value="creator">Creator (Upload & Manage)</option>
          </select>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>Password</label>
            <input name="password" type="password" className="glass-input" value={formData.password} onChange={handleChange} required />
          </div>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>Confirm</label>
            <input name="password_confirmation" type="password" className="glass-input" value={formData.password_confirmation} onChange={handleChange} required />
          </div>
        </div>
        
        <button type="submit" className="glass-button" disabled={loading} style={{marginTop: '1rem', width: '100%'}}>
          {loading ? 'Registering...' : 'Create Account'}
        </button>
      </form>
      <div style={{marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem'}}>
        Already registered? <Link to="/login" style={{color: 'var(--accent-color)', textDecoration: 'none'}}>Login</Link>
      </div>
    </div>
  );
}
