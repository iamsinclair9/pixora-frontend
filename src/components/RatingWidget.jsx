import { useState, useEffect } from 'react';
import client from '../api/client';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RatingWidget({ imageId, initialAvg, initialCount }) {
  const [avg, setAvg] = useState(initialAvg || 0);
  const [count, setCount] = useState(initialCount || 0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRate = async (score) => {
    if (!user) return navigate('/login');
    
    setLoading(true);
    try {
      const res = await client.post(`/images/${imageId}/rate`, { score });
      setAvg(res.data.avg_rating);
      setCount(res.data.rating_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '2px' }} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(star => (
          <button 
            key={star}
            disabled={loading}
            onMouseEnter={() => setHover(star)}
            onClick={() => handleRate(star)}
            style={{
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              padding: '2px',
              transition: 'transform 0.1s'
            }}
          >
            <Star 
              size={20} 
              fill={star <= (hover || Math.round(Number(avg))) ? "var(--star-gold)" : "none"} 
              color={star <= (hover || Math.round(Number(avg))) ? "var(--star-gold)" : "var(--border-subtle)"} 
              style={{ transform: star === hover ? 'scale(1.15)' : 'none' }}
            />
          </button>
        ))}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{Number(avg).toFixed(1)}</span>
        <span style={{ margin: '0 4px' }}>•</span>
        <span>{count} ratings</span>
      </div>
    </div>
  );
}
