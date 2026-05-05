import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Loader2 } from 'lucide-react'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import ImageDetail from './pages/ImageDetail'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Trending from './pages/Trending'
import Profile from './pages/Profile'
import Bookmarks from './pages/Bookmarks'

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ background: 'var(--accent)', borderRadius: '14px', padding: '12px', display: 'flex' }}>
          <Loader2 size={28} color="white" className="animate-spin" />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontFamily: 'Outfit, sans-serif' }}>
          Loading Pixora...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Auth pages (Login / Register) get their own full-bleed auth-page layout.
          All other pages are wrapped in the .container for centred content. */}
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Container-wrapped pages */}
        <Route path="/*" element={
          <main className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
            <Routes>
              <Route path="/"           element={<Feed />} />
              <Route path="/search"     element={<Search />} />
              <Route path="/trending"   element={<Trending />} />
              <Route path="/images/:id" element={<ImageDetail />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/profile"    element={<Profile />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
              </Route>

              <Route element={<ProtectedRoute requiredRole="creator" />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
            </Routes>
          </main>
        } />
      </Routes>
    </div>
  )
}

export default App
