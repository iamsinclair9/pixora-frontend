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
    <div>
      <div style={{marginBottom: '2rem'}}>
        <h1 style={{fontSize: '2rem'}}>Explore Pixora</h1>
        <p style={{color: 'var(--text-secondary)'}}>Discover the latest community uploads.</p>
      </div>

      {loading && page === 1 ? (
        <div style={{display: 'flex', justifyContent: 'center', padding: '4rem'}}>
          <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
        </div>
      ) : (
        <>
          <div className="image-grid">
            {images.map(img => (
              <ImageCard key={img.id} image={img} />
            ))}
          </div>
          
          {images.length === 0 && (
            <div className="glass-panel" style={{padding: '4rem', textAlign: 'center'}}>
              <p style={{color: 'var(--text-secondary)'}}>No images found. Be the first to upload!</p>
            </div>
          )}

          {hasMore && (
            <div style={{textAlign: 'center', margin: '2rem 0'}}>
              <button 
                onClick={() => setPage(p => p + 1)} 
                className="glass-button"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
