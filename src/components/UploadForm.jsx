import { useState } from 'react';
import client from '../api/client';
import { Upload, X } from 'lucide-react';

export default function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    location: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select an image file');
    
    setLoading(true);
    setError('');

    try {
      // 1. Todo: Upload the image to azure blob storage and get the URL.
      // 2. For this demo, we'll just send the file and metadata to our backend, which will handle the upload and DB entry in one step.
      
      const payload = new FormData();
      payload.append('image', file);
      payload.append('title', formData.title);
      payload.append('caption', formData.caption);
      payload.append('location', formData.location);
      
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      tagsArray.forEach((tag, idx) => {
        payload.append(`tags[${idx}]`, tag);
      });

      const res = await client.post('/uploads/confirm', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFile(null);
      setPreview('');
      setFormData({title: '', caption: '', location: '', tags: ''});
      if (onUploadSuccess) onUploadSuccess(res.data);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{padding: '2rem'}}>
      <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
        <Upload size={24} color="var(--accent-color)" />
        Upload New Image
      </h2>

      {error && <div style={{color: 'var(--danger-color)', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px'}}>{error}</div>}

      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
        
        <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
          {/* File input / Preview area */}
          <div style={{flex: '1 1 300px'}}>
            <label style={{display: 'block', marginBottom: '0.5rem'}}>Image File</label>
            {!preview ? (
              <div style={{border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '3rem 1rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.2)'}} onClick={() => document.getElementById('fileUpload').click()}>
                <Upload size={32} color="var(--text-secondary)" style={{marginBottom: '1rem'}} />
                <p style={{color: 'var(--text-secondary)'}}>Click to select an image</p>
                <input type="file" id="fileUpload" accept="image/*" style={{display: 'none'}} onChange={handleFileChange} />
              </div>
            ) : (
              <div style={{position: 'relative', borderRadius: '12px', overflow: 'hidden'}}>
                <img src={preview} alt="Preview" style={{width: '100%', height: 'auto', display: 'block'}} />
                <button type="button" onClick={() => {setPreview(''); setFile(null);}} style={{position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer'}}>
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Metadata area */}
          <div style={{flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Title *</label>
              <input name="title" type="text" className="glass-input" value={formData.title} onChange={handleChange} required />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Caption</label>
              <textarea name="caption" rows={3} className="glass-input" value={formData.caption} onChange={handleChange} />
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div style={{flex: 1}}>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>Location</label>
                <input name="location" type="text" className="glass-input" value={formData.location} onChange={handleChange} />
              </div>
              <div style={{flex: 1}}>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>Tags (comma separated)</label>
                <input name="tags" type="text" className="glass-input" value={formData.tags} onChange={handleChange} placeholder="nature, mountains" />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="glass-button" disabled={loading || !file} style={{alignSelf: 'flex-end', marginTop: '1rem', width: '200px'}}>
          {loading ? 'Uploading...' : 'Publish Image'}
        </button>
      </form>
    </div>
  );
}
