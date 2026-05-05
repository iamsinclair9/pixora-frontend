import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Heart, ThumbsDown, Sparkles, Trash2, Loader2, Clock, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import DeleteConfirmModal from './DeleteConfirmModal';

// ── Utility: relative time (e.g. "3 hours ago") ──────────────────────────
function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (mins  <  1) return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  if (weeks <  5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function ImageCard({ image: initialImage, onDelete }) {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [image, setImage]         = useState(initialImage);
  const [busy, setBusy]           = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookmarked, setBookmarked] = useState(!!image.user_bookmarked);

  const isCreator = user && user.id === image.creator_id;

  // ── Resolve image URL ────────────────────────────────────────────────────
  const resolveUrl = (img) => {
    if (img.thumbnail_url) return img.thumbnail_url;
    if (img.cdn_url && img.cdn_url.startsWith('http')) return img.cdn_url;
    const base = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    const path = img.thumbnail_path || img.file_path || '';
    return path.startsWith('http') ? path : `${base}/storage/${path}`;
  };
  const imageUrl = resolveUrl(image);

  // ── Like / Dislike ────────────────────────────────────────────────────────
  const handleInteract = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');
    if (busy) return;

    const next = (type === 'like' && image.user_liked) || (type === 'dislike' && image.user_disliked)
      ? 'none' : type;

    // Optimistic update
    setImage(prev => ({
      ...prev,
      user_liked:     next === 'like',
      user_disliked:  next === 'dislike',
      likes_count:    next === 'like'    ? (prev.likes_count    || 0) + 1
                    : prev.user_liked    ? Math.max((prev.likes_count || 1) - 1, 0)
                    : (prev.likes_count  || 0),
      dislikes_count: next === 'dislike' ? (prev.dislikes_count || 0) + 1
                    : prev.user_disliked ? Math.max((prev.dislikes_count || 1) - 1, 0)
                    : (prev.dislikes_count || 0),
    }));

    setBusy(true);
    try {
      const res = await client.post(`/images/${image.id}/interact`, { type: next });
      setImage(prev => ({
        ...prev,
        likes_count:    res.data.likes_count,
        dislikes_count: res.data.dislikes_count,
        user_liked:     res.data.user_liked,
        user_disliked:  res.data.user_disliked,
      }));
    } catch (err) {
      setImage(initialImage);
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  // ── Bookmark ─────────────────────────────────────────────────────────────
  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');
    setBookmarked(b => !b); // optimistic
    try {
      const res = await client.post(`/images/${image.id}/bookmark`);
      setBookmarked(res.data.bookmarked);
    } catch (err) {
      setBookmarked(b => !b); // revert
      console.error(err);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await client.delete(`/images/${image.id}`);
      if (onDelete) onDelete(image.id);
    } catch (err) {
      alert('Failed to delete. Please try again.');
      console.error(err);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── Tags to display (first 3) ─────────────────────────────────────────────
  const displayTags = Array.isArray(image.tags) ? image.tags.slice(0, 3) : [];

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* ── Delete Modal ── */}
      <DeleteConfirmModal isOpen={showDeleteModal} onConfirm={confirmDelete} onCancel={() => setShowDeleteModal(false)} loading={deleting} />

      {/* ── Image + Overlays ── */}
      <Link to={`/images/${image.id}`} style={{ display: 'block', position: 'relative', paddingTop: '75%', background: 'var(--bg-secondary)', textDecoration: 'none', flexShrink: 0 }}>
        <img
          src={imageUrl}
          alt={image.title}
          loading="lazy"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          onError={e => { e.target.style.opacity = '0.3'; }}
        />

        {/* Top badges row */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
          {image.ai_category && (
            <div className="ai-badge" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)' }}>
              <Sparkles size={11} />
              <span>{image.ai_category}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            {/* Bookmark button */}
            <button
              onClick={handleBookmark}
              title={bookmarked ? 'Saved' : 'Save'}
              style={{
                background: bookmarked ? 'var(--text-main)' : 'rgba(255,255,255,0.9)',
                color: bookmarked ? 'white' : 'var(--text-main)',
                border: 'none', borderRadius: '8px', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.18s ease',
              }}
            >
              <Bookmark size={14} fill={bookmarked ? 'white' : 'none'} />
            </button>
            {/* Delete button (creator only) */}
            {isCreator && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete"
                style={{
                  background: 'rgba(255,255,255,0.9)', color: 'var(--danger)',
                  border: 'none', borderRadius: '8px', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Tags overlay at bottom of image */}
        {displayTags.length > 0 && (
          <div style={{
            position: 'absolute', bottom: '10px', left: '10px', right: '10px',
            display: 'flex', flexWrap: 'wrap', gap: '4px', zIndex: 10
          }}>
            {displayTags.map(tag => (
              <span key={tag} style={{
                fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em',
                background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.95)',
                padding: '2px 8px', borderRadius: '100px', backdropFilter: 'blur(4px)',
              }}>
                #{tag}
              </span>
            ))}
            {image.tags?.length > 3 && (
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', padding: '2px 4px' }}>
                +{image.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* ── Card body ── */}
      <div style={{ padding: '0.875rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

        <Link to={`/images/${image.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {image.title}
          </h3>
        </Link>

        {/* Creator + time */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            by <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{image.creator?.name || 'Anonymous'}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-subtle)', fontSize: '0.75rem' }}>
            <Clock size={11} />
            <span>{timeAgo(image.created_at)}</span>
          </div>
        </div>

        {/* ── Stats & Actions ── */}
        <div style={{
          marginTop: 'auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '0.625rem', borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Rating + comments */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Star size={13} fill={Number(image.avg_rating) > 0 ? 'var(--star-gold)' : 'none'} color={Number(image.avg_rating) > 0 ? 'var(--star-gold)' : 'var(--text-subtle)'} />
              <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-main)' }}>{Number(image.avg_rating || 0).toFixed(1)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)' }}>
              <MessageSquare size={13} />
              <span style={{ fontSize: '0.8125rem' }}>{image.comments_count || 0}</span>
            </div>
          </div>

          {/* Like + Dislike */}
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              onClick={(e) => handleInteract(e, 'like')}
              disabled={busy}
              title="Like"
              style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: image.user_liked ? 'var(--danger-soft)' : 'none',
                border: 'none', cursor: 'pointer',
                color: image.user_liked ? 'var(--danger)' : 'var(--text-muted)',
                padding: '4px 7px', borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Heart size={15} fill={image.user_liked ? 'var(--danger)' : 'none'} color={image.user_liked ? 'var(--danger)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '12px' }}>{image.likes_count || 0}</span>
            </button>

            <button
              onClick={(e) => handleInteract(e, 'dislike')}
              disabled={busy}
              title="Dislike"
              style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: image.user_disliked ? 'rgba(17,24,39,0.06)' : 'none',
                border: 'none', cursor: 'pointer',
                color: image.user_disliked ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '4px 7px', borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <ThumbsDown size={15} fill={image.user_disliked ? 'var(--text-main)' : 'none'} color={image.user_disliked ? 'var(--text-main)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '12px' }}>{image.dislikes_count || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
