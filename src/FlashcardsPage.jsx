import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SummarizerPage.css'
import './FlashcardsPage.css'
import irisLogo from './assets/irislogo.png'
import {
  ChatIcon,
  ClockIcon,
  HomeIcon,
  NotesIcon,
  PlusIcon,
  QuizIcon,
  RefreshIcon,
  UploadIcon
} from './Icons'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175'

const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  let data = null
  try { data = await response.json() } catch { data = null }
  if (!response.ok) throw new Error(data?.error || 'Request failed.')
  return data
}

function FlashcardsPage() {
  const navigate = useNavigate()
  const userMenuRef = useRef(null)
  const [displayName, setDisplayName] = useState('Guest')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [theme, setTheme] = useState('light')
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [flashcardCounts, setFlashcardCounts] = useState({})

  useEffect(() => {
    let mounted = true
    Promise.all([fetchJson('/api/auth/me'), fetchJson('/api/conversations')])
      .then(([profile, conversationData]) => {
        if (!mounted) return
        const name = profile.user?.display_name || profile.user?.email || 'Guest'
        setDisplayName(name.split(' ')[0])
        setAvatarUrl(profile.user?.avatar_url || '')
        setTheme(profile.user?.theme || 'light')
        setProfileLoaded(true)
        setConversations(Array.isArray(conversationData) ? conversationData : [])
      })
      .catch((error) => console.error('Failed to load flashcards page:', error))
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    if (conversations.length === 0) return () => { mounted = false }
    Promise.all(
      conversations.slice(0, 40).map(async (item) => {
        try {
          const cards = await fetchJson(`/api/flashcards/${item.id}`)
          return [item.id, Array.isArray(cards) ? cards.length : 0]
        } catch { return [item.id, 0] }
      })
    ).then((entries) => {
      if (!mounted) return
      setFlashcardCounts(Object.fromEntries(entries))
    })
    return () => { mounted = false }
  }, [conversations])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    if (!profileLoaded) return
    fetchJson('/api/profile/theme', { method: 'PUT', body: JSON.stringify({ theme }) })
      .catch((error) => console.error('Failed to save theme:', error))
  }, [theme, profileLoaded])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    fetchJson('/api/auth/logout', { method: 'POST' })
      .catch((error) => console.error('Failed to logout:', error))
      .finally(() => navigate('/auth'))
  }

  const formatDate = (value) => {
    if (!value) return 'Recently'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Recently'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const flashcardSets = useMemo(
    () => conversations
      .map((item) => ({
        id: item.id,
        title: item.notes_title || item.title || 'Untitled set',
        cards: flashcardCounts[item.id] || 0,
        updatedAt: item.updated_at || item.created_at
      }))
      .filter((item) => item.cards > 0)
      .sort((a, b) => b.cards - a.cards),
    [conversations, flashcardCounts]
  )

  const folderCards = flashcardSets.slice(0, 4)
  const recentSets = [...flashcardSets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)

  const folderAccents = ['#dbeafe', '#ede9fe', '#fef3c7', '#dcfce7']
  const folderTextColors = ['#1e40af', '#6d28d9', '#92400e', '#166534']

  return (
    <div className={`studio-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className={`studio-rail ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="studio-rail-scroll">
          <div className="studio-header">
            <button className="logo-button" type="button" onClick={() => navigate('/summarizer')}>
              <img className="logo-mark" src={irisLogo} alt="Iris" />
              <span className="logo-name">Iris</span>
            </button>
            <button
              className="sidebar-toggle"
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span
                className={`material-symbols-outlined sidebar-toggle-glyph ${sidebarCollapsed ? '' : 'is-open'}`}
                aria-hidden="true"
              >chevron_right</span>
            </button>
          </div>

          <div className="studio-section">
            <button className="studio-link primary-session-btn" type="button" onClick={() => navigate('/blank-note')}>
              <span className="studio-icon"><PlusIcon /></span>
              <span className="studio-text">New session</span>
            </button>
            <button className="studio-link" type="button" onClick={() => navigate('/summarizer')}>
              <span className="studio-icon"><HomeIcon /></span>
              <span className="studio-text">Dashboard</span>
            </button>
            <button className="studio-link active" type="button">
              <span className="studio-icon"><NotesIcon /></span>
              <span className="studio-text">Flashcards</span>
            </button>
            <button className="studio-link" type="button" onClick={() => navigate('/conversations')}>
              <span className="studio-icon"><ChatIcon /></span>
              <span className="studio-text">Notes</span>
            </button>
            <button className="studio-link" type="button" onClick={() => navigate('/summarizer')}>
              <span className="studio-icon"><RefreshIcon /></span>
              <span className="studio-text">Recent</span>
            </button>
            <button className="studio-link" type="button" onClick={() => navigate('/pomodoro')}>
              <span className="studio-icon"><ClockIcon /></span>
              <span className="studio-text">Pomodoro</span>
            </button>
          </div>
        </div>

        <div className="user-profile" ref={userMenuRef}>
          <button
            className="user-profile-button"
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
          >
            <div className="user-avatar">
              {avatarUrl && <img className="user-avatar-img" src={avatarUrl} alt="" referrerPolicy="no-referrer" />}
            </div>
            <span className="user-name">{displayName}</span>
            <span className="user-settings-dot" aria-hidden="true" />
          </button>
          {userMenuOpen && (
            <div className="user-menu">
              <button className="user-menu-item" type="button" onClick={() => setTheme('light')}>Theme: Light</button>
              <button className="user-menu-item" type="button" onClick={() => setTheme('dark')}>Theme: Dark</button>
              <button className="user-menu-item logout" type="button" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <main className="studio-main fc-main">
        <header className="fc-header">
          <div>
            <h1 className="fc-title">Flashcards</h1>
            <p className="fc-subtitle">Review and create flashcard sets from your notes</p>
          </div>
          <button type="button" className="fc-generate-btn" onClick={() => navigate('/blank-note')}>
            <PlusIcon />
            Generate flashcards
          </button>
        </header>

        {/* Folders */}
        <section className="fc-section">
          <p className="fc-section-label">Folders</p>
          <div className="fc-folder-grid">
            {folderCards.length === 0 ? (
              <div className="fc-empty">No flashcard sets yet — create a note and generate flashcards.</div>
            ) : (
              folderCards.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  className="fc-folder-card"
                  style={{ background: folderAccents[i % folderAccents.length] }}
                  onClick={() => navigate(`/blank-note/${item.id}?tab=flashcards`)}
                >
                  <span className="fc-folder-icon" style={{ color: folderTextColors[i % folderTextColors.length] }}>
                    <QuizIcon />
                  </span>
                  <span className="fc-folder-title">{item.title}</span>
                  <span className="fc-folder-count">{item.cards} cards</span>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Recent sets */}
        <section className="fc-section">
          <p className="fc-section-label">Recent sets</p>
          <div className="fc-recent-list">
            {recentSets.length === 0 ? (
              <div className="fc-empty">Recent sets will appear here after you generate flashcards.</div>
            ) : (
              recentSets.map((item) => (
                <div key={item.id} className="fc-recent-row">
                  <span className="fc-recent-icon"><UploadIcon /></span>
                  <span className="fc-recent-copy">
                    <span className="fc-recent-title">{item.title}</span>
                    <span className="fc-recent-meta">{item.cards} cards · {formatDate(item.updatedAt)}</span>
                  </span>
                  <button
                    type="button"
                    className="fc-study-btn"
                    onClick={() => navigate(`/blank-note/${item.id}?tab=flashcards`)}
                  >
                    Study
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default FlashcardsPage
