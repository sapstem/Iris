import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './ProjectWorkspacePage.css'
import irisLogo from './assets/irislogo.png'

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
  } catch (error) {
    data = null
  }

  if (!response.ok) {
    const message = data?.error || 'Request failed.'
    throw new Error(message)
  }

  return data
}

function ProjectWorkspacePage() {
  const navigate = useNavigate()
  const { spaceId } = useParams()
  const userMenuRef = useRef(null)
  const [theme, setTheme] = useState('dark')
  const [displayName, setDisplayName] = useState('Guest')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [spaces, setSpaces] = useState([])
  const [conversations, setConversations] = useState([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetchJson('/api/auth/me'),
      fetchJson('/api/spaces'),
      fetchJson('/api/conversations')
    ])
      .then(([profile, spacesData, conversationsData]) => {
        if (!mounted) return
        const name = profile.user?.display_name || profile.user?.email || 'Guest'
        setDisplayName(name.split(' ')[0])
        setAvatarUrl(profile.user?.avatar_url || '')
        setTheme(profile.user?.theme || 'dark')
        setSpaces(Array.isArray(spacesData) ? spacesData : [])
        setConversations(Array.isArray(conversationsData) ? conversationsData : [])
      })
      .catch((error) => {
        console.error('Failed to load project workspace:', error)
        navigate('/summarizer')
      })

    return () => {
      mounted = false
    }
  }, [navigate])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentSpaceId = Number(spaceId)

  const currentSpace = useMemo(
    () => spaces.find((space) => space.id === currentSpaceId) || null,
    [spaces, currentSpaceId]
  )

  const projectConversations = useMemo(
    () => conversations.filter((conversation) => conversation.space_id === currentSpaceId),
    [conversations, currentSpaceId]
  )

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return projectConversations
    return projectConversations.filter((item) => {
      const title = (item.title || '').toLowerCase()
      const content = (item.content || '').toLowerCase()
      return title.includes(q) || content.includes(q)
    })
  }, [projectConversations, searchQuery])

  const formatDate = (value) => {
    if (!value) return 'Updated recently'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Updated recently'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const handleLogout = () => {
    fetchJson('/api/auth/logout', { method: 'POST' })
      .catch((error) => console.error('Failed to logout:', error))
      .finally(() => navigate('/auth'))
  }

  return (
    <div className={`project-workspace ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`project-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="project-sidebar-inner">
          <div className="project-sidebar-top">
            <button
              className="project-brand"
              type="button"
              onClick={() => navigate('/summarizer')}
              aria-label="Back to dashboard"
            >
              <img src={irisLogo} alt="Iris logo" className="project-logo" />
              {!sidebarCollapsed && <span>Iris</span>}
            </button>
            <button
              className="project-sidebar-toggle"
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
            >
              <span className={`material-symbols-outlined project-toggle-glyph ${sidebarCollapsed ? '' : 'is-open'}`}>
                chevron_right
              </span>
            </button>
          </div>

          {!sidebarCollapsed && (
            <>
              <div className="project-meta">
                <p className="project-meta-label">Project</p>
                <h2>{currentSpace?.name || 'Workspace'}</h2>
              </div>
            </>
          )}
        </div>

        <div className="project-user" ref={userMenuRef}>
          <button
            className="project-user-button"
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
          >
            <div className="project-user-avatar">
              {avatarUrl && <img src={avatarUrl} alt="" referrerPolicy="no-referrer" />}
            </div>
            {!sidebarCollapsed && <span>{displayName}</span>}
          </button>
          {userMenuOpen && !sidebarCollapsed && (
            <div className="project-user-menu">
              <button type="button" onClick={() => setTheme('light')}>Theme: Light</button>
              <button type="button" onClick={() => setTheme('dark')}>Theme: Dark</button>
              <button type="button" className="logout" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </aside>

      <main className="project-main">
        <header className="project-main-header">
          <div className="project-breadcrumb">
            <span className="crumb-home">Home</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{currentSpace?.name || 'Project'}</span>
          </div>
          <div className="project-top-actions">
            <div className="project-search-wrap">
              <input
                type="text"
                placeholder="Search documents"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <button type="button" className="project-share-btn">Share</button>
          </div>
        </header>

        <section className="project-doc-area">
          <div className="project-board">
            <div className="project-board-actions">
              <button
                type="button"
                className="project-action-btn"
                onClick={() => navigate('/summarizer')}
              >
                + New Note
              </button>
              <button type="button" className="project-action-btn">
                + New Folder
              </button>
            </div>

            {filteredConversations.length > 0 ? (
              <div className="project-doc-grid">
                {filteredConversations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="project-doc-card"
                    onClick={() => navigate(`/conversation/${item.id}`)}
                  >
                    <p className="project-doc-card-title">{item.title || 'Untitled Document'}</p>
                    <p className="project-doc-card-meta">{formatDate(item.updated_at || item.created_at)}</p>
                    <p className="project-doc-card-preview">{(item.content || '').slice(0, 90) || 'Open to view notes and study modes.'}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="project-empty-state">
                <h2>There's nothing in this folder yet!</h2>
                <p>Add folders or notes to see them here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ProjectWorkspacePage
