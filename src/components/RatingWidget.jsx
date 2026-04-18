import { useState, useEffect } from 'react';
import client from '../api/client';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RatingWidget({ imageId, initialAvg, initialCount }) {
  const [avg, setAvg] = useState(initialAvg || 0);
  const [count, setCount] = useState(initialCount || 0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleRate = async (score) => {
    if (!user) return alert('Please login to rate');
    
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
    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'inline-flex'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '1rem', borderRight: '1px solid var(--glass-border)'}}>
        <span style={{fontSize: '1.5rem', fontWeight: 700}}>{Number(avg).toFixed(1)}</span>
        <div style={{display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
          <Star size={12} fill="var(--accent-color)" color="var(--accent-color)" />
          <span>{count} votes</span>
        </div>
      </div>
      
      <div style={{display: 'flex', gap: '0.25rem'}} onMouseLeave={() => setHover(0)}>
        {[1,2,3,4,5].map(star => (
          <button 
            key={star}
            disabled={loading || !user}
            onMouseEnter={() => setHover(star)}
            onClick={() => handleRate(star)}
            style={{
              background: 'transparent', 
              border: 'none', 
              cursor: user ? 'pointer' : 'not-allowed',
              transition: 'transform 0.1s'
            }}
          >
            <Star 
              size={24} 
              fill={star <= (hover || Math.round(Number(avg))) ? "var(--accent-color)" : "transparent"} 
              color={star <= (hover || Math.round(Number(avg))) ? "var(--accent-color)" : "var(--text-secondary)"} 
              style={{transform: star === hover ? 'scale(1.2)' : 'none'}}
            />
          </button>
        ))}
      </div>
      {!user && <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Login to rate</span>}
    </div>
  );
}
