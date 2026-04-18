import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import ImageDetail from './pages/ImageDetail'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center'}}>Loading App...</div>
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="container animate-fade-in" style={{paddingTop: '2rem'}}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/images/:id" element={<ImageDetail />} />
          
          <Route element={<ProtectedRoute requiredRole="creator" />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App
