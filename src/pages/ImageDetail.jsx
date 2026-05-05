import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import CommentSection from '../components/CommentSection';
import RatingWidget from '../components/RatingWidget';
import { MapPin, ArrowLeft, Loader2, Calendar, Heart, ThumbsDown, Sparkles, Share2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ImageDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [image, setImage]                   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [shareLabel, setShareLabel]         = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await client.get(`/images/${id}`);
        setImage(res.data);
      } catch {
        setError('Image not found. It may have been moved or deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [id]);

  const handleInteract = async (type) => {
    if (!user) return navigate('/login');
    if (interactionLoading) return;

    const next = (type === 'like' && image.user_liked) || (type === 'dislike' && image.user_disliked)
      ? 'none' : type;


    setImage(prev => ({
      ...prev,
      user_liked:     next === 'like',
      user_disliked:  next === 'dislike',
      likes_count:    next === 'like'    ? (prev.likes_count    || 0) + 1
                    : prev.user_liked    ? (prev.likes_count    || 1) - 1
                    : (prev.likes_count  || 0),
      dislikes_count: next === 'dislike' ? (prev.dislikes_count || 0) + 1
                    : prev.user_disliked ? (prev.dislikes_count || 1) - 1
                    : (prev.dislikes_count || 0),
    }));

    setInteractionLoading(true);
    try {
      const res = await client.post(`/images/${id}/interact`, { type: next });
      setImage(prev => ({
        ...prev,
        likes_count:    res.data.likes_count,
        dislikes_count: res.data.dislikes_count,
        user_liked:     res.data.user_liked,
        user_disliked:  res.data.user_disliked,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setInteractionLoading(false);
    }
  };

 
  const handleShare = async () => {
    const shareData = {
      title: image.title,
      text:  image.ai_description || image.caption || `Check out "${image.title}" on Pixora!`,
      url:   window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareLabel('shared');
      } catch { }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel('copied');
      } catch {
        const el = document.createElement('textarea');
        el.value = window.location.href;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setShareLabel('copied');
      }
    }
    setTimeout(() => setShareLabel(null), 2500);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' }}>
        <Loader2 className="animate-spin" size={40} color="var(--text-main)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading image…</p>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" className="btn btn-primary">Back to Feed</Link>
      </div>
    );
  }


  const resolveUrl = (path, preferField) => {
    if (preferField && preferField.startsWith('http')) return preferField;
    if (path && path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${base}/storage/${path || ''}`;
  };

  const imageUrl = image.image_url || resolveUrl(image.file_path, image.cdn_url);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '6rem' }}>

      {/* Back link */}
      <Link to="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem',
        marginBottom: '2rem', fontWeight: 500
      }}>
        <ArrowLeft size={16} /> Back to Explore
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'start' }}>

        <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <img
            src={imageUrl}
            alt={image.title}
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '85vh', objectFit: 'contain' }}
            onError={e => { e.target.alt = 'Image could not be loaded'; e.target.style.padding = '4rem'; e.target.style.opacity = '0.4'; }}
          />
        </div>

        {/* ── Right: Info panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Title & Creator */}
          <div>
            {image.ai_category && (
              <div className="ai-badge" style={{ marginBottom: '0.75rem' }}>
                <Sparkles size={12} />
                <span>{image.ai_category}</span>
              </div>
            )}
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              {image.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0
              }}>
                {image.creator?.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                by <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{image.creator?.name}</span>
              </span>
            </div>
          </div>

          {/* Social Actions */}
          <div className="card" style={{ padding: '1.25rem', overflow: 'visible' }}>
            {/* Like / Dislike row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '8px' }}>

                {/* Like */}
                <button
                  onClick={() => handleInteract('like')}
                  disabled={interactionLoading}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    minWidth: '60px', padding: '10px',
                    background: image.user_liked ? 'rgba(239,68,68,0.06)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${image.user_liked ? 'var(--danger)' : 'var(--border-subtle)'}`,
                    borderRadius: '10px', cursor: 'pointer',
                    color: image.user_liked ? 'var(--danger)' : 'var(--text-muted)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <Heart size={20} fill={image.user_liked ? 'var(--danger)' : 'none'} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{image.likes_count || 0}</span>
                </button>

                {/* Dislike */}
                <button
                  onClick={() => handleInteract('dislike')}
                  disabled={interactionLoading}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    minWidth: '60px', padding: '10px',
                    background: image.user_disliked ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${image.user_disliked ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    borderRadius: '10px', cursor: 'pointer',
                    color: image.user_disliked ? 'var(--accent)' : 'var(--text-muted)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <ThumbsDown size={20} fill={image.user_disliked ? 'var(--accent)' : 'none'} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{image.dislikes_count || 0}</span>
                </button>
              </div>

              {/* Rating */}
              <RatingWidget imageId={image.id} initialAvg={image.avg_rating} initialCount={image.rating_count} />
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
            >
              {shareLabel === 'copied' ? (
                <><Check size={16} color="var(--success)" /><span style={{ color: 'var(--success)' }}>Link copied!</span></>
              ) : shareLabel === 'shared' ? (
                <><Check size={16} color="var(--success)" /><span style={{ color: 'var(--success)' }}>Shared!</span></>
              ) : (
                <><Share2 size={16} /><span>Share Discovery</span></>
              )}
            </button>
          </div>

          {image.ai_description && (
            <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                <Sparkles size={13} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI Insights</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                "{image.ai_description}"
              </p>
            </div>
          )}

          {/* Caption & Tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {image.caption && (
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.7, margin: 0 }}>{image.caption}</p>
            )}

            {image.tags && image.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {image.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.775rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '100px', border: '1px solid var(--border-subtle)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {image.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> <span>{image.location}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> <span>{new Date(image.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div style={{ marginTop: '4rem' }}>
        <CommentSection imageId={image.id} />
      </div>
    </div>
  );
}
