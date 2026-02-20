import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'
import RecordModal from './RecordModal'
import './SummarizerPage.css'
import UploadModal from './UploadModal'
import LinkModal from './LinkModal'
import PasteModal from './PasteModal'
import irisLogo from './assets/irislogo.png'
import {
  ArrowRightIcon,
  ChatIcon,
  ChevronDownIcon,
  CloseIcon,
  ClipboardIcon,
  HomeIcon,
  LinkIcon,
  MicIcon,
  NotesIcon,
  PlusIcon,
  RefreshIcon,
  SettingsIcon,
  UploadIcon
} from './Icons'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null
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

function SummarizerPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('Guest')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [noteText, setNoteText] = useState('')
  const [savedSummaries, setSavedSummaries] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [overview, setOverview] = useState('')
  const [takeaways, setTakeaways] = useState([])
  const [keywords, setKeywords] = useState([])
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [spaces, setSpaces] = useState([])
  const [showCreateSpace, setShowCreateSpace] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [profileLoaded, setProfileLoaded] = useState(false)
  const recentSectionRef = useRef(null)
  const userMenuRef = useRef(null)
  const activeSpace = null

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      const result = await fetchJson('/api/auth/me')
      if (!mounted) return
      const name = result.user?.display_name || result.user?.email || 'Guest'
      setDisplayName(name.split(' ')[0])
      setAvatarUrl(result.user?.avatar_url || '')
      setTheme(result.user?.theme || 'dark')
      setProfileLoaded(true)
    }

    const loadSpaces = async () => {
      const data = await fetchJson('/api/spaces')
      if (!mounted) return
      setSpaces(Array.isArray(data) ? data : [])
    }

    const loadConversations = async () => {
      const data = await fetchJson('/api/conversations')
      if (!mounted) return
      setSavedSummaries(Array.isArray(data) ? data : [])
    }

    Promise.all([loadProfile(), loadSpaces(), loadConversations()]).catch((error) => {
      console.error('Failed to load dashboard data:', error)
    })

    return () => {
      mounted = false
    }
  }, [])

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
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    fetchJson('/api/auth/logout', { method: 'POST' })
      .catch((error) => console.error('Failed to logout:', error))
      .finally(() => navigate('/auth'))
  }

  const createSpace = async () => {
    if (!newSpaceName.trim()) return

    try {
      const newSpace = await fetchJson('/api/spaces', {
        method: 'POST',
        body: JSON.stringify({ name: newSpaceName.trim() })
      })
      setSpaces([newSpace, ...spaces])
      setNewSpaceName('')
      setShowCreateSpace(false)
    } catch (error) {
      console.error('Failed to create space:', error)
      setStatus('Failed to create space.')
    }
  }

  const filteredSummaries = savedSummaries

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const visibleRecent = normalizedSearch
    ? filteredSummaries.filter((item) =>
        `${item.notes_title || item.title || ''} ${item.content || ''}`.toLowerCase().includes(normalizedSearch)
      )
    : filteredSummaries

  const formatRelativeTime = (value) => {
    if (!value) return 'Updated recently'
    const time = new Date(value).getTime()
    if (Number.isNaN(time)) return 'Updated recently'
    const diffMs = Date.now() - time
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `Edited ${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `Edited ${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    return `Edited ${diffDay}d ago`
  }

  const getRecentContext = (item) => {
    const cardCount = Array.isArray(item?.flashcards) ? item.flashcards.length : 0
    if (cardCount > 0) {
      return `${cardCount} cards ready`
    }
    if (Array.isArray(item?.takeaways) && item.takeaways.length > 0) {
      return `${item.takeaways.length} key points`
    }
    return formatRelativeTime(item?.updated_at || item?.created_at)
  }

  const runSummarize = async () => {
    if (!noteText.trim()) {
      setStatus('Enter some text first.')
      return
    }
    if (!genAI) {
      setStatus('Missing API key.')
      return
    }
    setLoading(true)
    setStatus('')
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const prompt = `
You are a study assistant. Read the notes and produce JSON:
{ "overview": "2-3 sentences", "takeaways": ["bullet1","bullet2","bullet3"], "keywords": ["k1","k2","k3"] }
Notes:
${noteText}`
      const result = await model.generateContent(prompt)
      const response = await result.response
      const raw = response.text().replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(raw)

      const newItem = await fetchJson('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Conversation',
          content: noteText.trim(),
          summary: parsed.overview || '',
          takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways : [],
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
          spaceId: activeSpace
        })
      })

      setOverview(newItem.summary || '')
      setTakeaways(newItem.takeaways || [])
      setKeywords(newItem.keywords || [])
      setSavedSummaries([newItem, ...savedSummaries])
      navigate(`/blank-note/${newItem.id}`)
    } catch (error) {
      console.error(error)
      setStatus('Failed to summarize.')
    } finally {
      setLoading(false)
    }
  }

  // HANDLERS
  const handleUpload = (content, filename) => {
    setNoteText(content)
    setStatus(`Loaded: ${filename}`)
  }

  const handleLink = async (url) => {
  setLoading(true);
  setStatus('Processing link...');
  
  try {
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    let finalContent = '';

    if (isYouTube) {
      setStatus('Extracting YouTube transcript...');
      // Using a specialized transcript fetcher (this is a public tool)
      // Note: In a production app, you'd use a dedicated backend or RapidAPI for this.
      const transcriptUrl = `https://api.scrapetube.com/transcript?url=${encodeURIComponent(url)}`;
      const proxyUrl = 'https://corsproxy.io/?';
      
      const response = await fetch(proxyUrl + encodeURIComponent(transcriptUrl));
      const data = await response.json();
      
      // Combine transcript segments into one block of text
      finalContent = data.segments.map(s => s.text).join(' ');
    } else {
      setStatus('Fetching website content...');
      const jinaUrl = `https://r.jina.ai/${url}`;
      const proxyUrl = 'https://corsproxy.io/?';
      
      const response = await fetch(proxyUrl + encodeURIComponent(jinaUrl));
      finalContent = await response.text();
    }

    if (finalContent && finalContent.length > 50) {
      setNoteText(finalContent);
      setStatus(`Loaded ${isYouTube ? 'transcript' : 'content'} from: ${url}`);
    } else {
      throw new Error('Content too short or unavailable.');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    setStatus('Failed to fetch. The site might be protected. Please paste text manually.');
  } finally {
    setLoading(false);
  }
};

  const handlePaste = (text) => {
    setNoteText(text)
  }

  const scrollToSection = (ref) => {
    if (!ref.current) return
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const lastSession = savedSummaries.reduce((latest, item) => {
    const itemTime = new Date(item.updated_at || item.created_at || 0).getTime()
    const latestTime = latest ? new Date(latest.updated_at || latest.created_at || 0).getTime() : -Infinity
    return itemTime > latestTime ? item : latest
  }, null)

  const getSourceType = (item) => {
    const explicitSource = (item?.source_type || '').toLowerCase()
    if (explicitSource.includes('youtube') || explicitSource.includes('video')) return 'youtube'
    if (explicitSource.includes('pdf') || explicitSource.includes('document')) return 'pdf'
    const text = `${item?.title || ''} ${item?.content || ''}`.toLowerCase()
    if (text.includes('youtube.com') || text.includes('youtu.be')) return 'youtube'
    if (text.includes('.pdf')) return 'pdf'
    return 'notes'
  }

  const sourceMeta = {
    youtube: { label: 'YouTube', icon: <LinkIcon /> },
    pdf: { label: 'PDF', icon: <UploadIcon /> },
    notes: { label: 'Notes', icon: <ClipboardIcon /> }
  }

  const getConversationRoute = (item) => {
    return `/blank-note/${item.id}`
  }

  return (
    <div
      className={`studio-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${
        sidebarCollapsed ? 'sidebar-collapsed' : ''
      }`}
    >
      <aside className={`studio-rail ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="studio-rail-scroll">
        <div className="studio-header">
          <button className="logo-button" type="button" onClick={() => navigate('/summarizer')}>
            <img className="logo-mark" src={irisLogo} alt="Iris logo" />
            <span className="logo-name">Iris</span>
          </button>
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span
              className={`material-symbols-outlined sidebar-toggle-glyph ${
                sidebarCollapsed ? '' : 'is-open'
              }`}
              aria-hidden="true"
            >
              chevron_right
            </span>
          </button>
        </div>

        <div className="studio-section">
          <button
            className="studio-link"
            type="button"
            onClick={() => {
              navigate('/summarizer')
            }}
          >
            <span className="studio-icon"><HomeIcon /></span>
            <span className="studio-text">Dashboard</span>
          </button>
          <button className="studio-link" type="button">
            <span className="studio-icon"><NotesIcon /></span>
            <span className="studio-text">Projects</span>
          </button>
          <button className="studio-link" type="button" onClick={() => navigate('/conversations')}>
            <span className="studio-icon"><ChatIcon /></span>
            <span className="studio-text">Conversations</span>
          </button>
          <button className="studio-link" type="button" onClick={() => scrollToSection(recentSectionRef)}>
            <span className="studio-icon"><RefreshIcon /></span>
            <span className="studio-text">Recent</span>
          </button>
          <button className="studio-link" type="button">
            <span className="studio-icon"><SettingsIcon /></span>
            <span className="studio-text">Settings</span>
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
                <img
                  className="user-avatar-img"
                  src={avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <span className="user-name">{displayName}</span>
          </button>
          {userMenuOpen && (
            <div className="user-menu">
              <button className="user-menu-item" type="button">
                Account
              </button>
              <button className="user-menu-item" type="button" onClick={() => setTheme('light')}>
                Theme: Light
              </button>
              <button className="user-menu-item" type="button" onClick={() => setTheme('dark')}>
                Theme: Dark
              </button>
              <button className="user-menu-item logout" type="button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="studio-main">
        <div className="workspace-top">
          <h1 className="workspace-title">Dashboard</h1>
          <div className="workspace-actions">
            <div className="workspace-search">
              <input
                type="text"
                placeholder="Search projects or notes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="studio-hero">
          <div className="action-row">
            <div
              className="action-tile"
              onClick={() => {
                navigate('/blank-note')
              }}
            >
              <div className="icon"><NotesIcon /></div>
              <div>
                <p className="title">Blank Note</p>
                <p className="sub">Start from scratch</p>
              </div>
            </div>
            <div className="action-tile" onClick={() => setShowUploadModal(true)}>
              <div className="icon"><UploadIcon /></div>
              <div>
                <p className="title">Upload</p>
                <p className="sub">File, Audio, Video</p>
              </div>
            </div>
            <div className="action-tile" onClick={() => setShowLinkModal(true)}>
              <div className="icon"><LinkIcon /></div>
              <div>
                <p className="title">Link</p>
                <p className="sub">YouTube, Website</p>
              </div>
            </div>
            <div className="action-tile" onClick={() => setShowRecordModal(true)}>
              <div className="icon"><MicIcon /></div>
              <div>
                <p className="title">Record</p>
                <p className="sub">Record Lecture</p>
              </div>
            </div>
          </div>
        </div>

        <section className="continue-learning-bar">
          <p className="resume-label">Continue Learning</p>
          {lastSession ? (
            <>
              <h2>{lastSession.notes_title || lastSession.title || 'Untitled Conversation'}</h2>
              <p className="resume-preview">{(lastSession.content || '').slice(0, 160)}</p>
              <div className="resume-actions">
                <button
                  type="button"
                  className="resume-open-btn"
                  onClick={() => navigate(getConversationRoute(lastSession))}
                >
                  Continue where you left off
                </button>
                <span className="resume-meta">{getRecentContext(lastSession)}</span>
              </div>
            </>
          ) : (
            <>
              <h2>No previous session yet</h2>
              <p className="resume-preview">Add content to start your first project and conversation.</p>
            </>
          )}
        </section>

        <section className="recent-sessions-table" ref={recentSectionRef}>
          <div className="recent-table-head">
            <h2>Recent Sessions</h2>
            <button
              type="button"
              className="view-all-link"
              onClick={() => navigate('/conversations')}
            >
              View all
            </button>
          </div>
          <div className="recent-table-list">
            {visibleRecent.slice(0, 12).map((item) => {
              const source = sourceMeta[getSourceType(item)]
              return (
              <button
                key={item.id}
                className="recent-table-row"
                onClick={() => navigate(getConversationRoute(item))}
              >
                <span className="recent-source">
                  {source.icon}
                </span>
                <span className="recent-title">{item.notes_title || item.title || item.content || 'Conversation'}</span>
                <span className="recent-source-label">{source.label}</span>
                <span className="recent-meta">{getRecentContext(item)}</span>
              </button>
            )})}
            {visibleRecent.length === 0 && (
              <div className="recent-table-empty">
                <p className="recent-title">
                  {normalizedSearch ? 'No recent matches' : 'No recent conversations yet'}
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="capture-panel">
          <div className="prompt-bar">
            <input
              type="text"
              placeholder="Quick capture: paste notes and press enter"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && runSummarize()}
            />
            <button className="send-btn" onClick={runSummarize} disabled={loading}>
              <ArrowRightIcon className="send-icon" />
            </button>
          </div>
          {status && <p className="muted">{status}</p>}

          {(overview || takeaways.length > 0 || keywords.length > 0) && (
            <div className="summary-output">
              {overview && <p className="summary-overview">{overview}</p>}
              <div className="summary-grid">
                {takeaways.length > 0 && (
                  <div>
                    <p className="summary-heading">Takeaways</p>
                    <ul>
                      {takeaways.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                )}
                {keywords.length > 0 && (
                  <div>
                    <p className="summary-heading">Keywords</p>
                    <div className="keyword-chips">
                      {keywords.map((k, i) => <span key={i} className="chip">{k}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      <LinkModal 
        isOpen={showLinkModal} 
        onClose={() => setShowLinkModal(false)}
        onSubmit={handleLink}
      />

      <PasteModal 
        isOpen={showPasteModal} 
        onClose={() => setShowPasteModal(false)}
        onPaste={handlePaste}
      />

      <RecordModal 
        isOpen={showRecordModal} 
        onClose={() => setShowRecordModal(false)} 
      />

      {/* Create Space Modal */}
      {showCreateSpace && (
        <div className="modal-overlay" onClick={() => setShowCreateSpace(false)}>
          <div className="create-space-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Project</h2>
              <button className="close-btn" onClick={() => setShowCreateSpace(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="create-space-body">
              <input
                type="text"
                placeholder="Space name (e.g., Computer Science, History)"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createSpace()}
                className="create-space-input"
              />
              <button
                onClick={createSpace}
                disabled={!newSpaceName.trim()}
                className="create-space-submit"
              >
                Create Space
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SummarizerPage
