import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LandingPage from './LandingPage'
import AuthPage from './AuthPage'
import SummarizerPage from './SummarizerPage'
import './App.css'
import ConversationView from './ConversationView'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175'

function RequireAuth({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let mounted = true
    fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted) return
        setStatus(data?.user ? 'authed' : 'guest')
      })
      .catch(() => {
        if (!mounted) return
        setStatus('guest')
      })

    return () => {
      mounted = false
    }
  }, [])

  if (status === 'loading') return null
  return status === 'authed' ? children : <Navigate to="/auth" replace />
}

function AppFrame() {
  const location = useLocation()
  const isSummarizer = location.pathname.startsWith('/summarizer')

  return (
    <>
      {(location.pathname === '/' || location.pathname === '/auth') && (
        <>
          <video autoPlay loop muted playsInline className="video-background">
            <source src="/background.mp4" type="video/mp4" />
          </video>

          <nav className="nav">
            <Link to="/" className="logo">Iris</Link>
            <Link to="/auth">
              <button className="nav-cta">Get Started</button>
            </Link>
          </nav>
        </>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/summarizer" element={(
          <RequireAuth>
            <SummarizerPage />
          </RequireAuth>
        )}
        />
        <Route path="/conversation/:id" element={(
          <RequireAuth>
            <ConversationView />
          </RequireAuth>
        )}
        />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppFrame />
    </BrowserRouter>
  )
}

export default App
