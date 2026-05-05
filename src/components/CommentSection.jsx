import { useState, useEffect } from 'react';
import client from '../api/client';
import { Trash2, Smile, Frown, Meh, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ imageId }) {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      const res = await client.get(`/images/${imageId}/comments`);
      setComments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [imageId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await client.post(`/images/${imageId}/comments`, { body });
      setComments([res.data, ...comments]);
      setBody('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if(!confirm('Delete this comment?')) return;
    try {
      await client.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
        <MessageCircle size={20} color="var(--text-main)" />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Community Discussion</h3>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>({comments.length})</span>
      </div>
      
      {user ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Share your thoughts on this discovery..." 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={submitting || !body.trim()} style={{ padding: '0 24px' }}>
            {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Post'}
          </button>
        </form>
      ) : (
        <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', marginBottom: '2.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Join the conversation. <span style={{ fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>Log in</span> to leave a comment.
          </p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader2 className="animate-spin" size={24} color="var(--text-muted)" />
        </div>
      ) : comments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem' }}>
                {c.user?.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.user?.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {c.sentiment && (
                      <span title={`Sentiment: ${c.sentiment}`} style={{ display: 'flex', alignItems: 'center' }}>
                        {c.sentiment === 'POSITIVE' && <Smile size={14} color="#10b981" />}
                        {c.sentiment === 'NEGATIVE' && <Frown size={14} color="#ef4444" />}
                        {c.sentiment === 'NEUTRAL' && <Meh size={14} color="#6b7280" />}
                      </span>
                    )}
                    {user && user.id === c.user_id && (
                      <button onClick={() => handleDelete(c.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6 }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No comments yet. Start the discussion!</p>
        </div>
      )}
    </div>
  );
}
