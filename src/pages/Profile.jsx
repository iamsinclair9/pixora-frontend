import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import ImageCard from '../components/ImageCard';
import { Camera, Heart, Upload, Bookmark, Star, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [meRes, imgRes] = await Promise.all([
          client.get('/me'),
          client.get('/me/images'),
        ]);
        setData(meRes.data);
        setImages(imgRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      <Loader2 size={36} className="animate-spin" color="var(--text-muted)" />
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>

      {/* Profile hero */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '3rem', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--accent)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700, flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>{user?.name}</h1>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              background: data?.user?.role === 'creator' ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: data?.user?.role === 'creator' ? 'white' : 'var(--text-muted)',
              padding: '3px 10px', borderRadius: '100px',
            }}>
              {data?.user?.role || 'viewer'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: '0 0 1.5rem' }}>{user?.email}</p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { icon: Upload,   label: 'Uploads',   value: stats.uploads   || 0 },
              { icon: Heart,    label: 'Total Likes', value: stats.likes   || 0 },
              { icon: Bookmark, label: 'Saved',      value: stats.bookmarks || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2px' }}>
                  <Icon size={14} /> {label}
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <Camera size={20} />
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, margin: 0 }}>My Portfolio</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{images.length} photos</span>
        </div>

        {images.length > 0 ? (
          <div className="masonry-grid">
            {images.map(img => (
              <ImageCard key={img.id} image={img} onDelete={(id) => setImages(prev => prev.filter(i => i.id !== id))} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '5rem', textAlign: 'center', border: '2px dashed var(--border-subtle)', borderRadius: '20px', background: 'var(--bg-secondary)' }}>
            <Camera size={36} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>No uploads yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
