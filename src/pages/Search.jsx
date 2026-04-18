import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import client from '../api/client';
import ImageCard from '../components/ImageCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const initialQ = queryParams.get('q') || '';
  const initialLoc = queryParams.get('loc') || '';
  const initialTags = queryParams.get('tags') || '';

  const [q, setQ] = useState(initialQ);
  const [loc, setLoc] = useState(initialLoc);
  const [tags, setTags] = useState(initialTags);
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchResults = async (p = 1, append = false) => {
    setLoading(true);
    setSearched(true);
    try {
      const qs = new URLSearchParams();
      if (q) qs.append('q', q);
      if (loc) qs.append('loc', loc);
      if (tags) qs.append('tags', tags);
      qs.append('page', p);

      const res = await client.get(`/images/search?${qs.toString()}`);
      if (append) {
        setImages(prev => [...prev, ...res.data.data]);
      } else {
        setImages(res.data.data);
      }
      setHasMore(res.data.current_page < res.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    
    // Update URL bar
    const qs = new URLSearchParams();
    if (q) qs.append('q', q);
    if (loc) qs.append('loc', loc);
    if (tags) qs.append('tags', tags);
    navigate(`/search?${qs.toString()}`, { replace: true });
    
    fetchResults(1, false);
  };

  // Run search on mount if URL has params
  useEffect(() => {
    if (initialQ || initialLoc || initialTags) {
      fetchResults(1, false);
    }
  }, []); // Run once on mount

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(nextPage, true);
  };

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <h1 style={{fontSize: '2rem'}}>Search Pixora</h1>
        <p style={{color: 'var(--text-secondary)'}}>Find photos by keywords, location, or tags.</p>
      </div>

      <div className="glass-panel" style={{padding: '2rem', marginBottom: '2rem'}}>
        <form onSubmit={handleSearch} style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          <div style={{flex: '1 1 200px'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem'}}>Keyword / Title</label>
            <input type="text" className="glass-input" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. sunset" />
          </div>
          <div style={{flex: '1 1 200px'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem'}}>Location</label>
            <input type="text" className="glass-input" value={loc} onChange={e => setLoc(e.target.value)} placeholder="e.g. London" />
          </div>
          <div style={{flex: '1 1 200px'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem'}}>Tags</label>
            <input type="text" className="glass-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. nature, beach" />
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end'}}>
            <button type="submit" className="glass-button" style={{height: '42px'}}>
              <SearchIcon size={18} /> Search
            </button>
          </div>
        </form>
      </div>

      {loading && page === 1 ? (
        <div style={{display: 'flex', justifyContent: 'center', padding: '4rem'}}>
          <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
        </div>
      ) : searched && (
        <div style={{marginTop: '2rem'}}>
          <h2 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}}>Results ({images.length}{hasMore ? '+' : ''})</h2>
          
          {images.length > 0 ? (
            <div className="image-grid">
              {images.map(img => (
                <ImageCard key={img.id} image={img} />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{padding: '3rem', textAlign: 'center'}}>
              <p style={{color: 'var(--text-secondary)'}}>No matching images found.</p>
            </div>
          )}

          {hasMore && (
            <div style={{textAlign: 'center', margin: '2rem 0'}}>
              <button 
                onClick={loadMore} 
                className="glass-button"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Results'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
