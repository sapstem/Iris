import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'
import FlashcardView from './FlashcardView'
import NotesView from './NotesView'
import './ConversationView.css'
import {
  ArrowLeftIcon,
  CardsIcon,
  ChatIcon,
  NotesIcon,
  QuizIcon,
  SendIcon
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
  } catch (error) {
    data = null
  }

  if (!response.ok) {
    const message = data?.error || 'Request failed.'
    throw new Error(message)
  }

  return data
}

function ConversationView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(null)
  const [activeTab, setActiveTab] = useState('chat')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    let mounted = true

    const loadConversation = async () => {
      const data = await fetchJson(`/api/conversations/${id}`)
      if (!mounted) return
      setConversation(data)
    }

    const loadMessages = async () => {
      const data = await fetchJson(`/api/chat_messages/${id}`)
      if (!mounted) return
      setMessages(Array.isArray(data) ? data : [])
    }

    Promise.all([loadConversation(), loadMessages()]).catch((error) => {
      console.error('Failed to load conversation:', error)
      navigate('/summarizer')
    })

    return () => {
      mounted = false
    }
  }, [id, navigate])

  useEffect(() => {
    let mounted = true
    fetchJson('/api/auth/me')
      .then((data) => {
        if (!mounted) return
        setTheme(data?.user?.theme || 'dark')
      })
      .catch(() => {
        if (!mounted) return
        setTheme('dark')
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !genAI) return

    const userMessage = chatInput.trim()
    setChatInput('')
    
    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      await fetchJson('/api/chat_messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: id, role: 'user', content: userMessage })
      })
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      
      // Build context from original content and chat history
      const context = `
You are a helpful study assistant. The user is studying the following content:

${conversation.content}

Summary: ${conversation.summary}

Answer the user's question based on this content. Be concise and helpful.

User's question: ${userMessage}`

      const result = await model.generateContent(context)
      const response = await result.response
      const aiMessage = response.text()

      // Add AI response to chat
      const updatedMessages = [...newMessages, { role: 'assistant', content: aiMessage }]
      setMessages(updatedMessages)

      await fetchJson('/api/chat_messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: id, role: 'assistant', content: aiMessage })
      })
    } catch (error) {
      console.error('Failed to get response:', error)
      const errorMessages = [...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]
      setMessages(errorMessages)
    } finally {
      setLoading(false)
    }
  }

  if (!conversation) {
    return <div>Loading...</div>
  }

  return (
    <div className={`conversation-view ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      {/* Sidebar - toggleable */}
      <aside className="studio-rail compact">
        <button
          className="studio-header"
          onClick={() => {
            navigate('/summarizer')
          }}
          aria-label="Go to dashboard"
        >
          <div className="logo-mark">I</div>
        </button>

        <div className="sidebar-actions">
          <button 
            className="sidebar-action-btn"
            onClick={() => {
              setActiveTab('chat')
            }}
            aria-label="Chat Bot"
            title="Chat Bot"
          >
            <span className="action-icon"><ChatIcon /></span>
          </button>

          <button 
            className="sidebar-action-btn"
            onClick={() => {
              setActiveTab('notes')
            }}
            aria-label="Document"
            title="Document"
          >
            <span className="action-icon"><NotesIcon /></span>
          </button>

          <button 
            className="sidebar-action-btn"
            onClick={() => {
              setActiveTab('flashcards')
            }}
            aria-label="Flashcards"
            title="Flashcards"
          >
            <span className="action-icon"><CardsIcon /></span>
          </button>

          <button 
            className="sidebar-action-btn"
            onClick={() => {
              setActiveTab('quizzes')
            }}
            aria-label="Quiz"
            title="Quiz"
          >
            <span className="action-icon"><QuizIcon /></span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="conversation-main">{/* Top Bar */}
        <div className="conversation-header">
          <button className="back-btn" onClick={() => navigate('/summarizer')}>
            <ArrowLeftIcon />
          </button>
          <h1 className="conversation-title">
            {conversation.content.slice(0, 50)}...
          </h1>
          <div className="header-actions">
            <button className="share-btn">Share</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="conversation-content">
          {activeTab === 'chat' && (
            <div className="chat-view">
              {/* Summary Card */}
              <div className="summary-card">
                <p>{conversation.summary}</p>
              </div>

              {/* Takeaways */}
              {conversation.takeaways && conversation.takeaways.length > 0 && (
                <div className="summary-section">
                  <h3>Key Takeaways</h3>
                  <ul>
                    {conversation.takeaways.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              {conversation.keywords && conversation.keywords.length > 0 && (
                <div className="summary-section">
                  <h3>Keywords</h3>
                  <div className="keyword-chips">
                    {conversation.keywords.map((k, i) => (
                      <span key={i} className="chip">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.length > 0 && (
                <div className="chat-messages-container">
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Conversation</h3>
                  {messages.map((msg, i) => (
                    <div key={i} className={`chat-message ${msg.role}`}>
                      <div className="message-label">
                        {msg.role === 'user' ? 'You' : 'Iris'}
                      </div>
                      <div className="message-content">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="chat-message assistant">
                      <div className="message-label">Iris</div>
                      <div className="message-content typing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'flashcards' && (
            <FlashcardView conversation={conversation} />
          )}

          {activeTab === 'quizzes' && (
            <div className="feature-placeholder">
            <div className="placeholder-icon"><NotesIcon /></div>
              <h2>Quizzes</h2>
              <p>Coming soon! Test yourself with AI-generated quizzes.</p>
            </div>
          )}

          {activeTab === 'notes' && (
            <NotesView conversation={conversation} />
          )}
        </div>

        {/* Bottom Input Bar */}
        {activeTab === 'chat' && (
          <div className="conversation-input-bar">
            <input
              type="text"
              placeholder="Ask a question about this content..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              disabled={loading}
            />
            <button 
              className="send-message-btn"
              onClick={handleSendMessage}
              disabled={loading || !chatInput.trim()}
            >
              <SendIcon />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default ConversationView
