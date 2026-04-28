import { Link } from 'react-router-dom';
import { Star, MessageSquare, MapPin } from 'lucide-react';

export default function ImageCard({ image }) {
  console.log("Image data", import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '/') + image.thumbnail_path : `http://localhost:8000/storage/${image.thumbnail_path}`)
  return (
    <Link to={`/images/${image.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
      <div className="glass-panel" style={{overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': {transform: 'scale(1.02)'}}}>
        <div style={{position: 'relative', paddingTop: '75%', background: '#0f172a'}}>
          <img 
           src={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') + image.cdn_url : `http://localhost:8000/storage/${image.file_path}`} 
            alt={image.title} 
            loading="lazy"
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'}} 
          />
        </div>
        <div style={{padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
          <h3 style={{fontSize: '1.1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {image.title}
          </h3>
          <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
            <span>by {image.creator?.name || 'Unknown'}</span>
            {image.location && (
              <>
                <span>&bull;</span>
                <MapPin size={12} /> {image.location}
              </>
            )}
          </div>
          
          <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
              <Star size={16} fill="var(--accent-color)" color="var(--accent-color)" />
              <span style={{fontWeight: 600, color: 'var(--text-primary)'}}>{Number(image.avg_rating).toFixed(1)}</span>
              <span style={{fontSize: '0.75rem'}}>({image.rating_count})</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
              <MessageSquare size={16} />
               <span>Discuss</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
