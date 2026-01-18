import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'
import RecordModal from './RecordModal'
import './SummarizerPage.css'
import UploadModal from './UploadModal'
import LinkModal from './LinkModal'
import PasteModal from './PasteModal'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

const base64UrlToBase64 = (input) => {
  let output = input.replace(/-/g, '+').replace(/_/g, '/')
  while (output.length % 4 !== 0) output += '='
  return output
}

const getDisplayName = () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return 'Guest'
  try {
    const payload = JSON.parse(atob(base64UrlToBase64(token.split('.')[1] || '')))
    // Use actual Google account name
    return payload?.name || payload?.given_name || 'Guest'
  } catch (e) {
    return 'Guest'
  }
}

const loadSummaries = (name) => {
  const key = name ? `summaries:${name}` : 'summaries:anon'
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : []
}

const saveSummaries = (name, items) => {
  const key = name ? `summaries:${name}` : 'summaries:anon'
  localStorage.setItem(key, JSON.stringify(items))
}

function SummarizerPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('Guest')
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
  const [activeSpace, setActiveSpace] = useState(null)
  const [showCreateSpace, setShowCreateSpace] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })
  const userMenuRef = useRef(null)

  useEffect(() => {
    const name = getDisplayName()
    setDisplayName(name)
    const items = loadSummaries(name)
    setSavedSummaries(items)
    
    // Load spaces
    const spacesKey = name ? `spaces:${name}` : 'spaces:anon'
    const savedSpaces = localStorage.getItem(spacesKey)
    if (savedSpaces) {
      setSpaces(JSON.parse(savedSpaces))
    }
    
    // Load active space
    const activeSpaceKey = name ? `activeSpace:${name}` : 'activeSpace:anon'
    const savedActiveSpace = localStorage.getItem(activeSpaceKey)
    if (savedActiveSpace && savedActiveSpace !== 'null') {
      setActiveSpace(Number(savedActiveSpace))
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

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

  useEffect(() => {
    if (!isHydrated) return
    saveSummaries(displayName, savedSummaries)
  }, [displayName, savedSummaries, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    // Save spaces
    const spacesKey = displayName ? `spaces:${displayName}` : 'spaces:anon'
    localStorage.setItem(spacesKey, JSON.stringify(spaces))
  }, [displayName, spaces, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    // Save active space
    const activeSpaceKey = displayName ? `activeSpace:${displayName}` : 'activeSpace:anon'
    if (activeSpace !== null) {
      localStorage.setItem(activeSpaceKey, activeSpace.toString())
    } else {
      localStorage.removeItem(activeSpaceKey)
    }
  }, [displayName, activeSpace, isHydrated])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    navigate('/auth')
  }

  const createSpace = () => {
    if (!newSpaceName.trim()) return
    
    const newSpace = {
      id: Date.now(),
      name: newSpaceName.trim(),
      conversationIds: [],
      createdAt: new Date().toLocaleString()
    }
    
    setSpaces([newSpace, ...spaces])
    setNewSpaceName('')
    setShowCreateSpace(false)
  }

  const filteredSummaries = activeSpace
    ? savedSummaries.filter(s => 
        spaces.find(space => space.id === activeSpace)?.conversationIds.includes(s.id)
      )
    : savedSummaries.filter(s => 
        !spaces.some(space => space.conversationIds.includes(s.id))
      )

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

      const newItem = {
        id: Date.now(),
        text: noteText.trim(),
        summary: parsed.overview || '',
        takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        date: new Date().toLocaleString()
      }

      setOverview(newItem.summary)
      setTakeaways(newItem.takeaways)
      setKeywords(newItem.keywords)
      
      const updatedSummaries = [newItem, ...savedSummaries]
      setSavedSummaries(updatedSummaries)
      
      // Save summaries immediately to localStorage
      saveSummaries(displayName, updatedSummaries)
      
      // If viewing a space, add conversation to that space
      if (activeSpace) {
        const updatedSpaces = spaces.map(space => 
          space.id === activeSpace 
            ? { ...space, conversationIds: [...space.conversationIds, newItem.id] }
            : space
        )
        setSpaces(updatedSpaces)
        
        // Save immediately to localStorage before navigating
        const spacesKey = displayName ? `spaces:${displayName}` : 'spaces:anon'
        localStorage.setItem(spacesKey, JSON.stringify(updatedSpaces))
      }
      
      navigate(`/conversation/${newItem.id}`)
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

  return (
    <div
      className={`studio-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${
        sidebarCollapsed ? 'sidebar-collapsed' : ''
      }`}
    >
      <aside className={`studio-rail ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="studio-header">
          <button className="logo-button" type="button" onClick={() => navigate('/summarizer')}>
            <div className="logo-mark">S</div>
            <span className="logo-name">Sage</span>
          </button>
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '≡' : '<<'}
          </button>
        </div>

        <div className="studio-section">
          <button className="studio-link" type="button" onClick={() => navigate('/summarizer')}>
            <span className="studio-icon">⌂</span>
            <span className="studio-text">Dashboard</span>
          </button>
          <button className="studio-link" type="button">
            <span className="studio-icon">⚙</span>
            <span className="studio-text">Settings</span>
          </button>
        </div>

        <div className="studio-section">
          <button
            className="studio-link active"
            onClick={() => {
              setNoteText('')
              setOverview('')
              setTakeaways([])
              setKeywords([])
            }}
          >
            <span className="studio-icon">+</span>
            <span className="studio-text">Add content</span>
          </button>
        </div>

        <div className="studio-section">
          <p className="studio-label">Spaces</p>
          <button 
            className="studio-link"
            onClick={() => setShowCreateSpace(true)}
          >
            <span className="studio-icon">+</span>
            <span className="studio-text">Create Space</span>
          </button>
          {spaces.map((space) => (
            <button
              key={space.id}
              className={`studio-link ${activeSpace === space.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSpace(space.id)
                const activeSpaceKey = displayName ? `activeSpace:${displayName}` : 'activeSpace:anon'
                localStorage.setItem(activeSpaceKey, space.id.toString())
              }}
            >
              <span className="studio-text">{space.name}</span>
            </button>
          ))}
        </div>

        <div className="studio-section">
          <p className="studio-label">Recents</p>
          {filteredSummaries.slice(0, 4).map((item) => (
            <button
              key={item.id}
              className="studio-link"
              onClick={() => navigate(`/conversation/${item.id}`)}
            >
              <span className="studio-text">
                {item.text.slice(0, 25) || 'Summary'}...
              </span>
            </button>
          ))}
          {filteredSummaries.length === 0 && (
            <p className="studio-empty">No recent conversations</p>
          )}
        </div>

        <div className="user-profile" ref={userMenuRef}>
          <button
            className="user-profile-button"
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
          >
            <div className="user-avatar"></div>
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
        <div className="studio-hero">
          {activeSpace ? (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button 
                onClick={() => {
                  setActiveSpace(null)
                  const activeSpaceKey = displayName ? `activeSpace:${displayName}` : 'activeSpace:anon'
                  localStorage.removeItem(activeSpaceKey)
                }}
                style={{
                  background: '#f5f5f5',
                  border: '1px solid #e5e5e5',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                ← All Notes
              </button>
              <h1>
                {spaces.find(s => s.id === activeSpace)?.name || 'Space'}
              </h1>
            </div>
          ) : (
            <h1>Hey {displayName}, ready to learn?</h1>
          )}

          <div className="action-row">
            <div className="action-tile" onClick={() => setShowUploadModal(true)}>
              <div className="icon">⭱</div>
              <div>
                <p className="title">Upload</p>
                <p className="sub">File, audio, video</p>
              </div>
            </div>
            <div className="action-tile" onClick={() => setShowLinkModal(true)}>
              <div className="icon">🔗</div>
              <div>
                <p className="title">Link</p>
                <p className="sub">YouTube, Website</p>
              </div>
            </div>
            <div className="action-tile" onClick={() => setShowPasteModal(true)}>
              <div className="icon">📋</div>
              <div>
                <p className="title">Paste</p>
                <p className="sub">Copied Text</p>
              </div>
            </div>
            <div className="action-tile" onClick={() => setShowRecordModal(true)}>
              <div className="icon">🎙</div>
              <div>
                <p className="title">Record</p>
                <p className="sub">Record Lecture</p>
              </div>
            </div>
          </div>

          <div className="prompt-bar">
            <input
              type="text"
              placeholder="Learn anything"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && runSummarize()}
            />
            <div className="prompt-controls">
            </div>
            <button className="send-btn" onClick={runSummarize} disabled={loading}>
              ↑
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

        <div className="spaces-area">
          <div className="spaces-header">
            <h2>Spaces</h2>
            <span className="muted">Newest ▼</span>
          </div>
          <div className="spaces-grid">
            <div 
              className="space-card dashed"
              onClick={() => setShowCreateSpace(true)}
            >
              ＋
            </div>
            {spaces.map((space) => {
              const spaceConvos = savedSummaries.filter(s => 
                space.conversationIds.includes(s.id)
              )
              const recentConvo = spaceConvos[0]
              return (
                <div 
                  key={space.id} 
                  className="space-card"
                  onClick={() => {
                    setActiveSpace(space.id)
                    const activeSpaceKey = displayName ? `activeSpace:${displayName}` : 'activeSpace:anon'
                    localStorage.setItem(activeSpaceKey, space.id.toString())
                  }}
                >
                  <p className="space-title">{space.name}</p>
                  <p className="space-sub">
                    {spaceConvos.length} conversation{spaceConvos.length !== 1 ? 's' : ''}
                  </p>
                  {recentConvo && (
                    <p className="space-preview">{recentConvo.text.slice(0, 50)}...</p>
                  )}
                </div>
              )
            })}
          </div>
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
              <h2>Create Space</h2>
              <button className="close-btn" onClick={() => setShowCreateSpace(false)}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <input
                type="text"
                placeholder="Space name (e.g., Computer Science, History)"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createSpace()}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              <button
                onClick={createSpace}
                disabled={!newSpaceName.trim()}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '14px',
                  background: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: !newSpaceName.trim() ? 0.5 : 1
                }}
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
