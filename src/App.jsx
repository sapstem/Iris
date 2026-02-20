import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LandingPage from './LandingPage'
import AuthPage from './AuthPage'
import SummarizerPage from './SummarizerPage'
import ConversationsPage from './ConversationsPage'
import BlankNotePage from './BlankNotePage'
import About from './pages/About'
import HowitWorks from './pages/HowitWorks'
import ProjectWorkspacePage from './ProjectWorkspacePage'
import './App.css'

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
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowitWorks />} />
        <Route path="/summarizer" element={(
          <RequireAuth>
            <SummarizerPage />
          </RequireAuth>
        )}
        />
        <Route path="/blank-note" element={(
          <RequireAuth>
            <BlankNotePage />
          </RequireAuth>
        )}
        />
        <Route path="/blank-note/:id" element={(
          <RequireAuth>
            <BlankNotePage />
          </RequireAuth>
        )}
        />
        <Route path="/conversations" element={(
          <RequireAuth>
            <ConversationsPage />
          </RequireAuth>
        )}
        />
        <Route path="/project/:spaceId" element={(
          <RequireAuth>
            <ProjectWorkspacePage />
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
