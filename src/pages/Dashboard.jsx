import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import ImageCard from '../components/ImageCard';
import UploadForm from '../components/UploadForm';
import { Loader2, LayoutGrid, Images } from 'lucide-react';

export default function Dashboard() {
  const { user }                  = useAuth();
  const [images, setImages]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetchMyImages = async () => {
    try {
      const res = await client.get(`/images?creator_id=${user.id}`);
      setImages(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyImages();
  }, []);

  const handleUploadSuccess = (newImage) => {
    setImages(prev => [newImage, ...prev]);
  };

  const handleDeleteSuccess = (deletedId) => {
    setImages(prev => prev.filter(img => img.id !== deletedId));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Creator Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Upload and manage your photography portfolio.
        </p>
      </div>

      {/* Upload Form */}
      <UploadForm onUploadSuccess={handleUploadSuccess} />

      {/* Uploads Section */}
      <div style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <Images size={20} color="var(--text-main)" />
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Your Portfolio</h2>
          {!loading && (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {images.length} {images.length === 1 ? 'photo' : 'photos'}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem', paddingTop: '1rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ width: 'calc(33.33% - 1.2rem)', height: '360px' }} />
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="masonry-grid">
            {images.map(img => (
              <ImageCard key={img.id} image={img} onDelete={handleDeleteSuccess} />
            ))}
          </div>
        ) : (
          <div style={{
            padding: '5rem 2rem',
            textAlign: 'center',
            border: '2px dashed var(--border-subtle)',
            borderRadius: '20px',
            background: 'var(--bg-secondary)'
          }}>
            <LayoutGrid size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.375rem' }}>
              No photos yet
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Upload your first image above and let Gemini AI categorize it automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
