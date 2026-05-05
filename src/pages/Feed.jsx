import { useState, useEffect } from 'react';
import client from '../api/client';
import ImageCard from '../components/ImageCard';
import { Loader2 } from 'lucide-react';

export default function Feed() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = async (p) => {
    try {
      const res = await client.get(`/images?page=${p}`);
      if (p === 1) {
        setImages(res.data.data);
      } else {
        setImages(prev => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.current_page < res.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(page);
  }, [page]);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Curated Gallery
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-main)', marginBottom: '1rem' }}>
          Explore the World
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover breathtaking moments captured by our professional community.
        </p>
      </div>

      {loading && page === 1 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', padding: '2rem 0' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ width: 'calc(33.33% - 1.35rem)', height: '400px', borderRadius: '12px' }}></div>
          ))}
        </div>
      ) : (
        <>
          <div className="masonry-grid">
            {images.map(img => (
              <ImageCard key={img.id} image={img} />
            ))}
          </div>
          
          {images.length === 0 && (
            <div style={{ padding: '6rem', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No stories discovered yet. Be the first to share one!</p>
            </div>
          )}

          {hasMore && (
            <div style={{ textAlign: 'center', margin: '4rem 0' }}>
              <button 
                onClick={() => setPage(p => p + 1)} 
                className="btn btn-ghost"
                disabled={loading}
                style={{ padding: '12px 32px', borderRadius: '100px' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Discovering more...</span>
                  </>
                ) : 'Discover More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
