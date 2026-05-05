import client from '../api/client';
import { suggestImageMetadata, suggestFromUrl } from '../services/aiService';
import { useState, useEffect, useRef } from 'react';
import { Upload, X, Sparkles, Loader2, ImagePlus, MapPin, Link as LinkIcon } from 'lucide-react';

export default function UploadForm({ onUploadSuccess }) {
  const [mode, setMode] = useState('file');
  const [file, setFile]         = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [urlPreview, setUrlPreview] = useState('');
  const [preview, setPreview]   = useState('');
  const [formData, setFormData] = useState({ title: '', caption: '', location: '', tags: '', ai_category: '', ai_description: '' });
  const [loading, setLoading]   = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [urlImageLoading, setUrlImageLoading] = useState(false);
  const urlDebounceRef = useRef(null);

  
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data.address) {
            const city    = data.address.city || data.address.town || data.address.village || '';
            const country = data.address.country || '';
            setFormData(prev => ({ ...prev, location: city ? `${city}, ${country}` : country }));
          }
        } catch {  }
      },
      () => {}
    );
  }, []);

  
  useEffect(() => {
    if (file) runAiSuggest(file);
  }, [file]);

  const runAiSuggest = async (imageFile) => {
    setSuggesting(true);
    setAiStatus('Analysing image with AI…');
    const suggestions = await suggestImageMetadata(imageFile);
    if (suggestions) {
      setFormData(prev => ({
        ...prev,
        title:   suggestions.title   || prev.title,
        caption: suggestions.caption || prev.caption,
        tags:    suggestions.tags?.join(', ') || prev.tags,
        ai_category: suggestions.category || '',
        ai_description: suggestions.caption || '',
      }));
      setAiStatus('Analysis complete');
    } else {
      setAiStatus('AI unavailable — fill in manually.');
    }
    setSuggesting(false);
  };

  const runAiSuggestUrl = async (url) => {
    setSuggesting(true);
    setAiStatus('Analysing image with AI…');
    const suggestions = await suggestFromUrl(url);
    if (suggestions) {
      setFormData(prev => ({
        ...prev,
        title:   suggestions.title   || prev.title,
        caption: suggestions.caption || prev.caption,
        tags:    suggestions.tags?.join(', ') || prev.tags,
        ai_category: suggestions.category || '',
        ai_description: suggestions.caption || '',
      }));
      setAiStatus('Analysis complete');
    } else {
      setAiStatus('AI unavailable — fill in manually.');
    }
    setSuggesting(false);
  };

 
  useEffect(() => {
    if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:image'))) {
      setUrlImageLoading(true);
      urlDebounceRef.current = setTimeout(() => {
        setUrlPreview(imageUrl);
      }, 600);
    } else {
      setUrlPreview('');
      setUrlImageLoading(false);
    }
    return () => clearTimeout(urlDebounceRef.current);
  }, [imageUrl]);


  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setSuccess(false); setError(''); setAiStatus('');
    setFormData(prev => ({ ...prev, title: '', caption: '', tags: '', ai_category: '', ai_description: '' }));
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a photo.');
    setLoading(true); setError('');

    try {
      const payload = new FormData();
      payload.append('image',    file);
      payload.append('title',    formData.title);
      payload.append('caption',  formData.caption);
      payload.append('location', formData.location);
      payload.append('ai_category', formData.ai_category);
      payload.append('ai_description', formData.ai_description);
      formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        .forEach((tag, i) => payload.append(`tags[${i}]`, tag));

      const res = await client.post('/uploads/confirm', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFile(null); setPreview(''); setAiStatus('');
      setFormData(prev => ({ location: prev.location, title: '', caption: '', tags: '', ai_category: '', ai_description: '' }));
      setSuccess(true);
      if (onUploadSuccess) onUploadSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) return setError('Please enter an image URL.');
    setLoading(true); setError('');

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await client.post('/uploads/from-url', {
        url:      imageUrl,
        title:    formData.title,
        caption:  formData.caption,
        location: formData.location,
        tags:     tagsArray,
        ai_category: formData.ai_category,
        ai_description: formData.ai_description,
      });

      setImageUrl(''); setUrlPreview('');
      setFormData(prev => ({ location: prev.location, title: '', caption: '', tags: '', ai_category: '', ai_description: '' }));
      setSuccess(true);
      if (onUploadSuccess) onUploadSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch that URL. Make sure it points directly to an image.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleUrlBlur = () => {
    if (imageUrl && imageUrl.startsWith('http')) setUrlPreview(imageUrl);
  };

  const AiShimmer = ({ show }) =>
    !show ? null : (
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '8px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.08) 50%, transparent 100%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        pointerEvents: 'none', zIndex: 5,
      }} />
    );

  const MetadataFields = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Title *</label>
        <input name="title" className="input" value={formData.title} onChange={handleChange} placeholder="Discovery title…" required />
        <AiShimmer show={suggesting && !formData.title} />
      </div>
      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Caption / Story</label>
        <textarea name="caption" rows={3} className="input" value={formData.caption} onChange={handleChange} placeholder="The story behind the shot…" />
        <AiShimmer show={suggesting && !formData.caption} />
      </div>
      <div className="form-group">
        <label className="form-label">Location</label>
        <div style={{ position: 'relative' }}>
          <input name="location" className="input" style={{ paddingLeft: '2.5rem' }} value={formData.location} onChange={handleChange} placeholder="City, Country" />
          <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>
      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
        <input name="tags" className="input" value={formData.tags} onChange={handleChange} placeholder="nature, arctic, minimalist" />
        <AiShimmer show={suggesting && !formData.tags} />
      </div>
    </div>
  );

  return (
    <div className="card animate-fade-in" style={{ padding: '2.5rem', border: '1px solid var(--border-subtle)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--accent)', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Upload size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Publish Discovery</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Share your perspective with the world.</p>
          </div>
        </div>
        {suggesting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '6px 14px', borderRadius: '100px' }}>
            <Loader2 size={14} className="animate-spin" color="var(--star-gold)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--star-gold)' }}>AI analysing…</span>
          </div>
        )}
        {!suggesting && aiStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: '100px' }}>
            <Sparkles size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{aiStatus}</span>
          </div>
        )}
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '2rem', padding: '4px', background: 'var(--bg-secondary)', borderRadius: '12px', width: 'fit-content' }}>
        {[{ key: 'file', label: 'Upload File', icon: ImagePlus }, { key: 'url', label: 'From URL', icon: LinkIcon }].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setMode(key); setError(''); setSuccess(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
              background: mode === key ? 'white' : 'transparent',
              border: mode === key ? '1px solid var(--border-subtle)' : '1px solid transparent',
              color: mode === key ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: mode === key ? 600 : 500, fontSize: '0.875rem',
              boxShadow: mode === key ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Sparkles size={16} /> Discovery published! AI is analysing it in the background.
        </div>
      )}

      {/* ── File Mode ── */}
      {mode === 'file' && (
        <form onSubmit={handleFileSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Photo *</label>
              {!preview ? (
                <div
                  style={{ border: '2px dashed var(--border-subtle)', borderRadius: '16px', padding: '5rem 1rem', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'all 0.2s ease' }}
                  onClick={() => document.getElementById('fileUpload').click()}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                >
                  <ImagePlus size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.25rem' }}>Click to select photo</p>
                  <p style={{ color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>PNG, JPG, WEBP — Max 10 MB</p>
                  <input type="file" id="fileUpload" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                  {suggesting && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.65)', color: 'white', padding: '8px 18px', borderRadius: '100px', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Loader2 size={14} className="animate-spin" /> AI analysing…
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={() => { setPreview(''); setFile(null); setAiStatus(''); }} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <MetadataFields />
          </div>
          <div className="divider" style={{ margin: '2.5rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || !file} style={{ padding: '0.875rem 3.5rem', minWidth: '220px' }}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Publishing…</> : <><Upload size={20} /> Publish to Gallery</>}
            </button>
          </div>
        </form>
      )}

      {/* ── URL Mode ── */}
      {mode === 'url' && (
        <form onSubmit={handleUrlSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            <div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Image URL *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={imageUrl}
                    onChange={e => {
                      setImageUrl(e.target.value);
                      if (!e.target.value) {
                        setUrlPreview('');
                        setAiStatus('');
                        setFormData(prev => ({ ...prev, title: '', caption: '', tags: '' }));
                      }
                    }}
                    onBlur={handleUrlBlur}
                    placeholder="https://example.com/photo.jpg"
                    required
                  />
                  <LinkIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Paste a direct link to any publicly accessible image.</p>
              </div>

              {/* URL Preview */}
              {(urlPreview || urlImageLoading) && (
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
                  
                  {urlImageLoading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
                      <Loader2 size={24} className="animate-spin" color="var(--text-muted)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Loading preview…</span>
                    </div>
                  )}

                  {urlPreview && (
                    <img
                      src={urlPreview}
                      alt="URL preview"
                      style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: urlImageLoading ? 'none' : 'block' }}
                      onLoad={() => {
                        setUrlImageLoading(false);
                        
                        if (urlPreview && !formData.title && !suggesting && !aiStatus) {
                          runAiSuggestUrl(urlPreview);
                        }
                      }}
                      onError={() => {
                        setUrlImageLoading(false);
                        setUrlPreview('');
                        setError('Could not load image preview. Check the URL.');
                      }}
                    />
                  )}

                  {suggesting && !urlImageLoading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem', zIndex: 20 }}>
                      <div style={{ background: 'rgba(0,0,0,0.65)', color: 'white', padding: '8px 18px', borderRadius: '100px', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Loader2 size={14} className="animate-spin" /> AI analysing…
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <MetadataFields />
          </div>
          <div className="divider" style={{ margin: '2.5rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || !imageUrl} style={{ padding: '0.875rem 3.5rem', minWidth: '220px' }}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Fetching…</> : <><Upload size={20} /> Publish to Gallery</>}
            </button>
          </div>
        </form>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
