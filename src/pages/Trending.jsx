import { useState, useEffect } from 'react';
import client from '../api/client';
import ImageCard from '../components/ImageCard';
import { Loader2, TrendingUp, Flame, Star, Heart } from 'lucide-react';

const TABS = [
  { key: 'likes',  label: 'Most Liked',  icon: Heart,     sort: 'likes_count' },
  { key: 'rated',  label: 'Top Rated',   icon: Star,      sort: 'avg_rating' },
  { key: 'hot',    label: 'Hot Today',   icon: Flame,     sort: 'created_at' },
];

export default function Trending() {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('likes');

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const sort = TABS.find(t => t.key === tab)?.sort || 'likes_count';
        const res = await client.get(`/images?sort=${sort}&per_page=12`);
        // Sort client-side since backend may not support sort param yet
        const data = [...(res.data.data || [])];
        if (sort === 'likes_count')  data.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        if (sort === 'avg_rating')   data.sort((a, b) => (b.avg_rating  || 0) - (a.avg_rating  || 0));
        if (sort === 'created_at')   data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setImages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [tab]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '6px 16px', borderRadius: '100px', marginBottom: '1.25rem' }}>
          <TrendingUp size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Charts</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
          Trending Discoveries
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
          The community's most celebrated moments, ranked by likes, ratings, and recency.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '3rem' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 22px', borderRadius: '100px', cursor: 'pointer',
              border: `1.5px solid ${tab === key ? 'var(--text-main)' : 'var(--border-subtle)'}`,
              background: tab === key ? 'var(--text-main)' : 'white',
              color: tab === key ? 'white' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.875rem',
              transition: 'all 0.18s ease',
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton" style={{ flex: '1 1 280px', height: '380px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="masonry-grid">
          {images.map((img, idx) => (
            <div key={img.id} style={{ position: 'relative' }}>
              {/* Rank badge */}
              {idx < 3 && (
                <div style={{
                  position: 'absolute', top: -10, left: -10, zIndex: 30,
                  width: 32, height: 32, borderRadius: '50%',
                  background: ['#f59e0b', '#9ca3af', '#cd7f32'][idx],
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  #{idx + 1}
                </div>
              )}
              <ImageCard image={img} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '6rem', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No trending content yet.</p>
        </div>
      )}
    </div>
  );
}
