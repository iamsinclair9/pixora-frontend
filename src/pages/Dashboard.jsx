import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import ImageCard from '../components/ImageCard';
import UploadForm from '../components/UploadForm';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <h1 style={{fontSize: '2rem'}}>Creator Dashboard</h1>
        <p style={{color: 'var(--text-secondary)'}}>Upload and manage your portfolio.</p>
      </div>

      <UploadForm onUploadSuccess={handleUploadSuccess} />

      <div style={{marginTop: '3rem'}}>
        <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Your Uploads</h2>
        
        {loading ? (
          <div style={{display: 'flex', justifyContent: 'center', padding: '4rem'}}>
            <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
          </div>
        ) : images.length > 0 ? (
          <div className="image-grid">
            {images.map(img => (
              <ImageCard key={img.id} image={img} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{padding: '3rem', textAlign: 'center'}}>
            <p style={{color: 'var(--text-secondary)'}}>You haven't uploaded any images yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
