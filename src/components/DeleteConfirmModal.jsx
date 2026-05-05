import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onConfirm, onCancel, loading }) {
  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Render into document.body via a Portal so no parent CSS clips it
  return createPortal(
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
        animation: 'modalFadeIn 0.2s ease-out',
      }}
    >
      {/* Stop click inside from closing */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-primary)',
          maxWidth: '420px',
          width: '100%',
          borderRadius: '20px',
          padding: '2.5rem',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)',
          animation: 'modalScaleUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Warning icon */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--danger-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <Trash2 size={28} color="var(--danger)" />
        </div>

        <h3 style={{
          fontSize: '1.375rem', fontWeight: 700,
          color: 'var(--text-main)', margin: '0 0 0.75rem',
          letterSpacing: '-0.02em',
        }}>
          Delete this discovery?
        </h3>

        <p style={{
          color: 'var(--text-muted)', fontSize: '0.9375rem',
          lineHeight: 1.65, margin: '0 0 2rem',
          maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto',
        }}>
          This will permanently remove the photo from your portfolio and the community feed.
          <strong style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-main)' }}>
            This action cannot be undone.
          </strong>
        </p>

        <div style={{ display: 'flex', gap: '0.875rem' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: '0.8125rem',
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: '12px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9375rem',
              color: 'var(--text-main)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: '0.8125rem',
              background: 'var(--danger)',
              border: '1.5px solid var(--danger)',
              borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '0.9375rem',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: loading ? 0.75 : 1,
              transition: 'opacity 0.15s ease, filter 0.15s ease',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Deleting…</>
              : <><Trash2 size={18} /> Delete</>
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalScaleUp {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>,
    document.body   // ← Portal target — bypasses all parent CSS
  );
}
