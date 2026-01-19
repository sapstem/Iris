import { useState, useEffect, useRef } from 'react'
import './NotesView.css'

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

function NotesView({ conversation }) {
  const [notes, setNotes] = useState('')
  const [title, setTitle] = useState('Untitled Document')
  const saveTimerRef = useRef(null)

  useEffect(() => {
    if (!conversation) return
    if (conversation.notes) {
      setNotes(conversation.notes)
    } else {
      setNotes(conversation.content || '')
    }

    if (conversation.notes_title) {
      setTitle(conversation.notes_title)
    } else if (conversation.title) {
      setTitle(conversation.title)
    } else {
      const defaultTitle = (conversation.content || '').slice(0, 50).trim() || 'Untitled Document'
      setTitle(defaultTitle)
    }
  }, [conversation])

  const handleNotesChange = (e) => {
    const content = e.target.value
    setNotes(content)
    if (!conversation?.id) return
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      fetchJson(`/api/conversations/${conversation.id}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes: content, title })
      }).catch((error) => {
        console.error('Failed to save notes:', error)
      })
    }, 500)
  }

  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!conversation?.id) return
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      fetchJson(`/api/conversations/${conversation.id}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes, title: newTitle })
      }).catch((error) => {
        console.error('Failed to save notes:', error)
      })
    }, 500)
  }

  return (
    <div className="notes-editor-page">
      <input
        type="text"
        className="notes-title-input"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled Document"
      />
      
      <textarea
        className="notes-textarea"
        value={notes}
        onChange={handleNotesChange}
        placeholder="Start typing..."
        spellCheck="true"
      />
    </div>
  )
}

export default NotesView
