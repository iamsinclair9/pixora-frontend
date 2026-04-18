import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import CommentSection from '../components/CommentSection';
import RatingWidget from '../components/RatingWidget';
import { MapPin, ArrowLeft, Loader2, Calendar } from 'lucide-react';

export default function ImageDetail() {
  const { id } = useParams();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await client.get(`/images/${id}`);
        setImage(res.data);
      } catch (err) {
        setError('Image not found');
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [id]);

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', padding: '4rem'}}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
      </div>
    );
  }

  if (error || !image) {
    return <div className="glass-panel" style={{padding: '3rem', textAlign: 'center'}}>{error}</div>;
  }

  return (
    <div style={{maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem'}}>
      <Link to="/" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem'}}>
        <ArrowLeft size={16} /> Back to Feed
      </Link>
      
      <div className="glass-panel" style={{overflow: 'hidden', marginBottom: '2rem'}}>
        <div style={{background: '#0f172a', textAlign: 'center', width: '100%', maxHeight: '70vh', display: 'flex', justifyContent: 'center'}}>
          <img 
            src={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') + image.cdn_url : `http://localhost:8000/storage/${image.file_path}`} 
            alt={image.title}
            style={{maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain'}}
          />
        </div>
        
        <div style={{padding: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem'}}>
            <div>
              <h1 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{image.title}</h1>
              <div style={{display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <div style={{width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'}}>
                    {image.creator?.name.charAt(0).toUpperCase()}
                  </div>
                  {image.creator?.name}
                </span>
                
                {image.location && (
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <MapPin size={14} /> {image.location}
                  </span>
                )}
                
                <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <Calendar size={14} /> {new Date(image.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <RatingWidget imageId={image.id} initialAvg={image.avg_rating} initialCount={image.rating_count} />
          </div>

          {image.caption && (
            <div style={{marginBottom: '1.5rem', lineHeight: 1.6}}>
              <p>{image.caption}</p>
            </div>
          )}

          {image.tags && image.tags.length > 0 && (
            <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
              {image.tags.map(tag => (
                <span key={tag} style={{background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem'}}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <CommentSection imageId={image.id} />
    </div>
  );
}
