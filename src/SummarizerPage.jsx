import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SummarizerPage.css'
import UploadModal from './UploadModal'
import RecordModal from './RecordModal'
import irisLogo from './assets/irislogo.png'
import {
  ChatIcon,
  ClockIcon,
  HomeIcon,
  MicIcon,
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
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message = data?.error || 'Request failed.'
    throw new Error(message)
  }

  return data
}

const quickActions = [
  { id: 'note',       title: 'New Note',        subtitle: 'Write and organize',     icon: <NotesIcon /> },
  { id: 'flashcards', title: 'Flashcards',       subtitle: 'Generate from notes',    icon: <QuizIcon /> },
  { id: 'upload',     title: 'Upload',           subtitle: 'Summarize content',      icon: <UploadIcon /> },
  { id: 'record',     title: 'Record Lecture',   subtitle: 'Capture and transcribe', icon: <MicIcon /> },
]

function SummarizerPage() {
  const navigate = useNavigate()
  const userMenuRef = useRef(null)
  const recentSectionRef = useRef(null)
  const [displayName, setDisplayName] = useState('there')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [conversations, setConversations] = useState([])
  const [flashcardCounts, setFlashcardCounts] = useState({})
  const [dashboardLoaded, setDashboardLoaded] = useState(false)

  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  useEffect(() => {
    let mounted = true
    Promise.all([fetchJson('/api/auth/me'), fetchJson('/api/conversations')])
      .then(([result, conversationData]) => {
        if (!mounted) return
        const name = result.user?.display_name || result.user?.email || 'there'
        setDisplayName(name.split(' ')[0])
        setAvatarUrl(result.user?.avatar_url || '')
        setTheme(result.user?.theme || 'light')
        const nextConversations = Array.isArray(conversationData) ? conversationData : []
        setConversations(nextConversations)
        if (nextConversations.length === 0) setFlashcardCounts({})
        setProfileLoaded(true)
      })
      .catch((error) => {
        console.error('Failed to load dashboard profile:', error)
      })
      .finally(() => {
        if (!mounted) return
        setDashboardLoaded(true)
      })

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    if (conversations.length === 0) return () => { mounted = false }

    Promise.all(
      conversations.slice(0, 24).map(async (item) => {
        try {
          const cards = await fetchJson(`/api/flashcards/${item.id}`)
          return [item.id, Array.isArray(cards) ? cards.length : 0]
        } catch {
          return [item.id, 0]
        }
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
    fetchJson('/api/profile/theme', {
      method: 'PUT',
      body: JSON.stringify({ theme })
    }).catch((error) => {
      console.error('Failed to save theme:', error)
    })
  }, [theme, profileLoaded])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(event.target)) setUserMenuOpen(false)
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

  const query = searchQuery.trim().toLowerCase()

  const recentItems = conversations.map((item) => {
    const flashcardCount = flashcardCounts[item.id] || 0
    const title = item.notes_title || item.title || 'Untitled note'
    const subtitle = flashcardCount > 0
      ? `${flashcardCount} flashcards`
      : (item.summary ? 'Summary available' : 'No summary yet')
    const icon = flashcardCount > 0 ? <NotesIcon /> : <UploadIcon />
    return { id: item.id, icon, title, subtitle, timestamp: formatDate(item.updated_at || item.created_at) }
  })

  const filteredRecent = query
    ? recentItems.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query))
    : recentItems

  const totalFlashcards = Object.values(flashcardCounts).reduce((sum, n) => sum + n, 0)
  const activeDays = new Set(
    conversations.map((item) => {
      const d = new Date(item.updated_at || item.created_at)
      return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
    }).filter(Boolean)
  ).size

  const hasStudyData = totalFlashcards > 0

  const stats = [
    { id: 'streak',   label: 'Active days',    value: hasStudyData ? `${activeDays}` : '0',    icon: <RefreshIcon /> },
    { id: 'reviewed', label: 'Flashcards',      value: hasStudyData ? `${totalFlashcards}` : '0', icon: <NotesIcon /> },
    { id: 'score',    label: 'Avg quiz score',  value: '0%',                                     icon: <QuizIcon /> },
    { id: 'time',     label: 'Study time',      value: '0m',                                     icon: <ClockIcon /> },
  ]

  const aiInsights = hasStudyData
    ? [
        { id: 'library',     label: 'Flashcard Library', description: `${totalFlashcards} cards generated from your notes.`,              cta: 'Open notes' },
        { id: 'consistency', label: 'Consistency',       description: `Studied across ${activeDays} day${activeDays === 1 ? '' : 's'}.`,   cta: 'Keep going' },
        { id: 'next',        label: 'Next Step',         description: 'Run a quiz to start collecting score insights.',                     cta: 'Start quiz' },
      ]
    : []

  const handleQuickAction = (actionId) => {
    if (actionId === 'flashcards') { navigate('/flashcards'); return }
    if (actionId === 'note')       { navigate('/blank-note'); return }
    if (actionId === 'quiz')       { navigate('/pomodoro');   return }
    if (actionId === 'tutor')      { navigate('/conversations'); return }
    if (actionId === 'record')     { setShowRecordModal(true); return }
    if (actionId === 'upload')     { setShowUploadModal(true) }
  }

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
              >
                chevron_right
              </span>
            </button>
          </div>

          <div className="studio-section">
            <button className="studio-link primary-session-btn" type="button" onClick={() => navigate('/blank-note')}>
              <span className="studio-icon"><PlusIcon /></span>
              <span className="studio-text">New session</span>
            </button>
            <button className="studio-link active" type="button" onClick={() => navigate('/summarizer')}>
              <span className="studio-icon"><HomeIcon /></span>
              <span className="studio-text">Dashboard</span>
            </button>
            <button className="studio-link" type="button" onClick={() => navigate('/flashcards')}>
              <span className="studio-icon"><NotesIcon /></span>
              <span className="studio-text">Flashcards</span>
            </button>
            <button className="studio-link" type="button" onClick={() => navigate('/conversations')}>
              <span className="studio-icon"><ChatIcon /></span>
              <span className="studio-text">Notes</span>
            </button>
            <button className="studio-link" type="button" onClick={() => recentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
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
              {avatarUrl && (
                <img className="user-avatar-img" src={avatarUrl} alt="" referrerPolicy="no-referrer" />
              )}
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
      <main className="dash-main">

        {/* Header */}
        <header className="dash-header">
          <div>
            <h1 className="dash-greeting">Good {timeOfDay}, {displayName}</h1>
            <p className="dash-tagline">
              {hasStudyData
                ? `You have ${totalFlashcards} flashcards ready. Keep the momentum.`
                : 'What are we studying today?'}
            </p>
          </div>
          <input
            className="dash-search"
            type="text"
            placeholder="Search notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </header>

        {/* Quick Actions */}
        <section className="dash-actions">
          <p className="dash-section-label">Quick actions</p>
          <div className="dash-action-grid">
            {quickActions.map((item) => (
              <button
                key={item.id}
                type="button"
                className="dac"
                onClick={() => handleQuickAction(item.id)}
              >
                <span className="dac-icon">{item.icon}</span>
                <span className="dac-title">{item.title}</span>
                <span className="dac-sub">{item.subtitle}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Content area */}
        <div className="dash-content" ref={recentSectionRef}>

          {/* Recent notes */}
          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Recent notes</h2>
              <button type="button" className="dash-view-all" onClick={() => navigate('/conversations')}>
                View all
              </button>
            </div>
            <div className="dash-note-list">
              {filteredRecent.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="dash-note-row"
                  onClick={() => navigate(`/blank-note/${item.id}`)}
                >
                  <span className="dnr-icon">{item.icon}</span>
                  <span className="dnr-copy">
                    <span className="dnr-title">{item.title}</span>
                    <span className="dnr-sub">{item.subtitle}</span>
                  </span>
                  <span className="dnr-time">{item.timestamp}</span>
                </button>
              ))}
              {filteredRecent.length === 0 && (
                <p className="dash-empty">
                  {dashboardLoaded ? 'No notes yet. Create your first one above.' : 'Loading…'}
                </p>
              )}
            </div>
          </section>

          {/* Right column */}
          <aside className="dash-side">

            {/* Stats */}
            {hasStudyData && (
              <section className="dash-panel">
                <div className="dash-panel-head"><h2>Stats</h2></div>
                <div className="dash-stats-grid">
                  {stats.map((item) => (
                    <div key={item.id} className="dash-stat">
                      <span className="ds-icon">{item.icon}</span>
                      <span className="ds-value">{item.value}</span>
                      <span className="ds-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AI Insights */}
            <section className="dash-panel">
              <div className="dash-panel-head"><h2>AI Insights</h2></div>
              <div className="dash-insights">
                {aiInsights.length === 0 ? (
                  <div className="dash-insight">
                    <p className="di-label">No insights yet</p>
                    <p className="di-desc">Complete quizzes or generate flashcards to unlock insights here.</p>
                    <button type="button" className="di-cta" onClick={() => navigate('/blank-note')}>
                      Create first note
                    </button>
                  </div>
                ) : (
                  aiInsights.map((item) => (
                    <div key={item.id} className="dash-insight">
                      <p className="di-label">{item.label}</p>
                      <p className="di-desc">{item.description}</p>
                      <button type="button" className="di-cta" onClick={() => navigate('/conversations')}>
                        {item.cta}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

          </aside>
        </div>
      </main>

      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onUpload={() => {}} />
      <RecordModal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} />

      {/* Floating AI Tutor bubble */}
      <button
        type="button"
        className="ai-tutor-fab"
        onClick={() => navigate('/conversations')}
        aria-label="Open AI Tutor"
      >
        <span className="ai-tutor-fab-icon"><ChatIcon /></span>
        <span className="ai-tutor-fab-label">Ask Iris</span>
      </button>
    </div>
  )
}

export default SummarizerPage
