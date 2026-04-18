import { useState, useEffect } from 'react';
import client from '../api/client';
import { Trash2 } from 'lucide-react';
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
    <div style={{marginTop: '2rem'}}>
      <h3 style={{marginBottom: '1rem'}}>Comments</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
          <input 
            type="text" 
            className="glass-input" 
            placeholder="Add a comment..." 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{flex: 1}}
          />
          <button type="submit" className="glass-button" disabled={submitting || !body.trim()}>
            Post
          </button>
        </form>
      ) : (
        <div style={{padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '2rem'}}>
          Log in to leave a comment.
        </div>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length > 0 ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {comments.map(c => (
            <div key={c.id} className="glass-panel" style={{padding: '1rem', display: 'flex', gap: '1rem', borderRadius: '8px'}}>
              <div style={{width: 32, height: 32, flexShrink: 0, borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                {c.user?.name.charAt(0).toUpperCase()}
              </div>
              <div style={{flex: 1}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{fontWeight: 600}}>{c.user?.name}</span>
                  <span style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{marginTop: '0.5rem', lineHeight: 1.5}}>{c.body}</p>
              </div>
              {user && user.id === c.user_id && (
                <button onClick={() => handleDelete(c.id)} style={{background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', alignSelf: 'flex-start'}}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{color: 'var(--text-secondary)'}}>No comments yet.</p>
      )}
    </div>
  );
}
