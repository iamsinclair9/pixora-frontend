import { useState, useEffect } from 'react';
import client from '../api/client';
import ImageCard from '../components/ImageCard';
import { Bookmark, Loader2 } from 'lucide-react';

export default function Bookmarks() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/me/bookmarks')
      .then(res => setImages(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = (id) => setImages(prev => prev.filter(i => i.id !== id));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Bookmark size={24} color="var(--text-main)" />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>Saved Discoveries</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Moments you've saved for later.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
          <Loader2 size={36} className="animate-spin" color="var(--text-muted)" />
        </div>
      ) : images.length > 0 ? (
        <div className="masonry-grid">
          {images.map(img => (
            <ImageCard key={img.id} image={img} onDelete={handleUnsave} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '6rem 2rem', textAlign: 'center', border: '2px dashed var(--border-subtle)', borderRadius: '24px', background: 'var(--bg-secondary)' }}>
          <Bookmark size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Nothing saved yet</p>
          <p style={{ color: 'var(--text-muted)' }}>Tap the bookmark icon on any discovery to save it here.</p>
        </div>
      )}
    </div>
  );
}
