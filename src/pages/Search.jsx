import { suggestSearchCriteria } from '../services/aiService';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import client from '../api/client';
import ImageCard from '../components/ImageCard';
import { Search as SearchIcon, Loader2, Filter, Sparkles, X } from 'lucide-react';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const initialQ = queryParams.get('q') || '';
  const initialLoc = queryParams.get('loc') || '';
  const initialTags = queryParams.get('tags') || '';
  const initialCat = queryParams.get('category') || '';

  const [smartQuery, setSmartQuery] = useState(initialQ || '');
  const [q, setQ] = useState(initialQ);
  const [loc, setLoc] = useState(initialLoc);
  const [tags, setTags] = useState(initialTags);
  const [category, setCategory] = useState(initialCat);
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);

  const categories = ['Nature', 'Animal', 'Architecture', 'People', 'Tech', 'Food', 'Urban'];

  const fetchResults = async (p = 1, append = false, overrides = null) => {
    setLoading(true);
    setSearched(true);
    try {
      const qs = new URLSearchParams();
      const currentQ = overrides && overrides.q !== undefined ? overrides.q : q;
      const currentLoc = overrides && overrides.loc !== undefined ? overrides.loc : loc;
      const currentTags = overrides && overrides.tags !== undefined ? overrides.tags : tags;
      const currentCat = overrides && overrides.category !== undefined ? overrides.category : category;
      
      if (currentQ) qs.append('q', currentQ);
      if (currentLoc) qs.append('loc', currentLoc);
      if (currentTags) qs.append('tags', currentTags);
      if (currentCat) qs.append('category', currentCat);
      
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

  const handleSmartSearch = async (e) => {
    if (e) e.preventDefault();
    if (!smartQuery) return;
    
    setIsAiThinking(true);
    setSearched(false);
    
    const criteria = await suggestSearchCriteria(smartQuery);
    setIsAiThinking(false);
    
    if (criteria) {
      setQ(criteria.q); setLoc(criteria.loc); setTags(criteria.tags); setCategory(criteria.category);
      setPage(1);
      
      const qs = new URLSearchParams();
      if (criteria.q) qs.append('q', criteria.q);
      if (criteria.loc) qs.append('loc', criteria.loc);
      if (criteria.tags) qs.append('tags', criteria.tags);
      if (criteria.category) qs.append('category', criteria.category);
      navigate(`/search?${qs.toString()}`, { replace: true });
      
      fetchResults(1, false, criteria);
    } else {
      setQ(smartQuery); setLoc(''); setTags(''); setCategory('');
      setPage(1);
      const qs = new URLSearchParams();
      qs.append('q', smartQuery);
      navigate(`/search?${qs.toString()}`, { replace: true });
      fetchResults(1, false, { q: smartQuery, loc: '', tags: '', category: '' });
    }
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    
    // Clear smart search params when clicking a pill to just view that category
    setSmartQuery('');
    setQ('');
    setLoc('');
    setTags('');
    setCategory(newCat);
    setPage(1);

    const qs = new URLSearchParams();
    if (newCat) qs.append('category', newCat);
    navigate(`/search?${qs.toString()}`, { replace: true });

    fetchResults(1, false, { category: newCat, q: '', loc: '', tags: '' });
  };

  useEffect(() => {
    if (initialQ || initialLoc || initialTags || initialCat) {
      fetchResults(1, false);
    }
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(nextPage, true);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Intelligent Search
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Discover the gallery using keywords, locations, or AI-detected categories.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '3rem', border: 'none', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        {isAiThinking && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--text-main)', color: 'white', padding: '10px 24px', borderRadius: '100px', fontWeight: 600 }}>
              <Sparkles size={18} className="animate-pulse" color="var(--star-gold)" /> AI is curating results...
            </div>
          </div>
        )}
        <form onSubmit={handleSmartSearch}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '8px', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--text-muted)' }}>
              <Sparkles size={20} />
            </div>
            <input 
              type="text" 
              value={smartQuery}
              onChange={e => setSmartQuery(e.target.value)}
              placeholder="E.g. 'Show me moody architecture in Tokyo at night'..."
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.1rem', outline: 'none', padding: '0.5rem 0', color: 'var(--text-main)' }}
            />
            {smartQuery && (
              <button type="button" onClick={() => setSmartQuery('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                <X size={18} />
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SearchIcon size={18} /> Search
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginTop: '1.5rem', paddingBottom: '0.5rem' }} className="hide-scrollbar">
          <button
            type="button"
            onClick={() => handleCategoryChange({ target: { value: '' }})}
            style={{ padding: '8px 20px', borderRadius: '100px', whiteSpace: 'nowrap', border: '1px solid', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', background: !category ? 'var(--text-main)' : 'white', color: !category ? 'white' : 'var(--text-main)', borderColor: !category ? 'var(--text-main)' : 'var(--border-subtle)' }}
          >
            All Discoveries
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange({ target: { value: cat }})}
              style={{ padding: '8px 20px', borderRadius: '100px', whiteSpace: 'nowrap', border: '1px solid', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', background: category === cat ? 'var(--text-main)' : 'white', color: category === cat ? 'white' : 'var(--text-main)', borderColor: category === cat ? 'var(--text-main)' : 'var(--border-subtle)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && page === 1 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ width: 'calc(33.33% - 1.35rem)', height: '350px', borderRadius: '12px' }}></div>
          ))}
        </div>
      ) : searched && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              {images.length > 0 ? `${images.length} discoveries found` : 'No matches found'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Filter size={14} />
              <span>Sorted by Latest</span>
            </div>
          </div>
          
          {images.length > 0 ? (
            <div className="masonry-grid">
              {images.map(img => (
                <ImageCard key={img.id} image={img} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '6rem', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We couldn't find any matches for your query.</p>
              <button onClick={() => {setQ(''); setLoc(''); setCategory('');}} className="btn btn-ghost" style={{ marginTop: '1.5rem' }}>Clear Filters</button>
            </div>
          )}

          {hasMore && (
            <div style={{ textAlign: 'center', margin: '4rem 0' }}>
              <button onClick={loadMore} className="btn btn-ghost" disabled={loading} style={{ padding: '12px 32px', borderRadius: '100px' }}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Load More Results'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
