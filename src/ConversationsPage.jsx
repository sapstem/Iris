import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ConversationsPage.css'

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

function ConversationsPage() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [spaces, setSpaces] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([fetchJson('/api/conversations'), fetchJson('/api/spaces')])
      .then(([conversationsData, spacesData]) => {
        if (!mounted) return
        setConversations(Array.isArray(conversationsData) ? conversationsData : [])
        setSpaces(Array.isArray(spacesData) ? spacesData : [])
      })
      .catch((error) => {
        console.error('Failed to load conversations:', error)
      })
    return () => {
      mounted = false
    }
  }, [])

  const spaceNameById = useMemo(() => {
    const map = new Map()
    spaces.forEach((space) => map.set(space.id, space.name))
    return map
  }, [spaces])

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return conversations
    return conversations.filter((item) =>
      `${item.title || ''} ${item.content || ''}`.toLowerCase().includes(query)
    )
  }, [conversations, searchQuery])

  const formatRelativeTime = (value) => {
    if (!value) return 'Updated recently'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Updated recently'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <main className="conversations-page">
      <div className="conversations-shell">
        <header className="conversations-head">
          <div>
            <p className="conversations-kicker">Conversations</p>
            <h1>All study conversations</h1>
          </div>
          <div className="conversations-actions">
            <input
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button type="button" onClick={() => navigate('/summarizer')}>
              Back to Dashboard
            </button>
          </div>
        </header>

        <section className="conversations-grid">
          <p className="conversations-period">Previous 30 days</p>
          {filteredConversations.map((item) => (
            <button
              key={item.id}
              type="button"
              className="conversation-card"
              onClick={() => navigate(`/conversation/${item.id}`)}
            >
              <span className="conversation-project">{spaceNameById.get(item.space_id) || 'General'}</span>
              <span className="conversation-title">{item.title || 'Untitled Conversation'}</span>
              <span className="conversation-preview">{(item.content || '').slice(0, 140)}</span>
              <span className="conversation-time">{formatRelativeTime(item.updated_at || item.created_at)}</span>
            </button>
          ))}
          {filteredConversations.length === 0 && (
            <div className="conversation-empty">
              {searchQuery.trim() ? 'No conversations match your search.' : 'No conversations yet.'}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ConversationsPage
