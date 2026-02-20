import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import SlashCommand from './editor/SlashCommand'
import Toolbar from './editor/Toolbar'
import FlashcardView from './FlashcardView'
import irisLogo from './assets/irislogo.png'
import {
  CardsIcon,
  ChatIcon,
  NotesIcon,
  QuizIcon,
  SendIcon
} from './Icons'
import './BlankNotePage.css'
import 'tippy.js/dist/tippy.css'

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
    throw new Error(data?.error || 'Request failed.')
  }

  return data
}

function BlankNotePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [activeTool, setActiveTool] = useState('notes')
  const [editorFontSize, setEditorFontSize] = useState(16)
  const [noteTitle, setNoteTitle] = useState('Untitled Document')
  const [noteBody, setNoteBody] = useState('')
  const [conversationId, setConversationId] = useState(id || null)
  const [conversationSummary, setConversationSummary] = useState('')
  const [saveState, setSaveState] = useState('Saved')
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [quizScore, setQuizScore] = useState(0)
  const saveTimerRef = useRef(null)
  const saveInFlightRef = useRef(false)

  const editor = useEditor({
    extensions: [StarterKit, SlashCommand],
    content: '<p></p>',
    autofocus: 'end',
    onUpdate: ({ editor: currentEditor }) => {
      setNoteBody(currentEditor.getText())
      setSaveState('Unsaved')
      scheduleSave(currentEditor.getText(), noteTitle)
    },
    editorProps: {
      attributes: {
        class: 'blank-editor-content',
        spellcheck: 'true'
      }
    }
  })

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (!tab) return
    if (tab === 'chat' || tab === 'notes' || tab === 'flashcards') {
      setActiveTool(tab)
      return
    }
    if (tab === 'quizzes') {
      setActiveTool('quiz')
    }
  }, [searchParams])

  useEffect(() => {
    if (!id || !editor) return

    let mounted = true
    fetchJson(`/api/conversations/${id}`)
      .then((data) => {
        if (!mounted || !data) return
        setConversationId(data.id)
        const loadedTitle = data.notes_title || data.title || 'Untitled Document'
        const loadedBody = data.notes || data.content || ''
        setConversationSummary(data.summary || '')
        setNoteTitle(loadedTitle)
        setNoteBody(loadedBody)
        setSaveState('Saved')

        const escaped = (loadedBody || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        const html = escaped ? `<p>${escaped.replace(/\n/g, '</p><p>')}</p>` : '<p></p>'
        editor.commands.setContent(html, { emitUpdate: false })
      })
      .catch((error) => {
        console.error('Failed to load blank note conversation:', error)
      })

    return () => {
      mounted = false
    }
  }, [id, editor])

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return
    }
    let mounted = true
    fetchJson(`/api/chat_messages/${conversationId}`)
      .then((data) => {
        if (!mounted) return
        setMessages(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        console.error('Failed to load chat messages:', error)
      })
    return () => {
      mounted = false
    }
  }, [conversationId])

  const ensureConversation = async (title, body) => {
    if (conversationId) return conversationId

    const created = await fetchJson('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({
        title: title || 'Untitled Document',
        content: body && body.trim() ? body : 'Blank note started.',
        summary: '',
        takeaways: [],
        keywords: []
      })
    })

    setConversationId(created.id)
    return created.id
  }

  const persistNow = async (body, title) => {
    if (saveInFlightRef.current) return conversationId
    saveInFlightRef.current = true
    setSaveState('Saving...')
    try {
      const id = await ensureConversation(title, body)
      await fetchJson(`/api/conversations/${id}/notes`, {
        method: 'PUT',
        body: JSON.stringify({
          notes: body || '',
          title: title || 'Untitled Document'
        })
      })
      setSaveState('Saved')
      return id
    } catch (error) {
      console.error('Failed to save blank note:', error)
      setSaveState('Error saving')
      return null
    } finally {
      saveInFlightRef.current = false
    }
  }

  const scheduleSave = (body, title) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      persistNow(body, title)
    }, 700)
  }

  const handleTitleChange = (event) => {
    const value = event.target.value
    setNoteTitle(value)
    setSaveState('Unsaved')
    scheduleSave(noteBody, value)
  }

  const handleBackDashboard = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    await persistNow(noteBody, noteTitle)
    navigate('/summarizer')
  }

  const handleToolSwitch = async (tool) => {
    if (tool === 'notes') {
      setActiveTool(tool)
      return
    }
    if (!conversationId) {
      await persistNow(noteBody, noteTitle)
    }
    setActiveTool(tool)
  }

  const handleSendMessage = async () => {
    const message = chatInput.trim()
    if (!message || chatLoading) return

    const conversation = conversationId || (await persistNow(noteBody, noteTitle))
    if (!conversation) return

    const nextMessages = [...messages, { role: 'user', content: message }]
    setMessages(nextMessages)
    setChatInput('')
    setChatLoading(true)

    try {
      await fetchJson('/api/chat_messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: conversation, role: 'user', content: message })
      })

      if (!genAI) {
        throw new Error('Missing API key.')
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const context = `
You are a helpful study assistant. The user is studying this content:
${noteBody || 'Blank note started.'}

Summary:
${conversationSummary || 'No summary yet.'}

Answer the user clearly and concisely.
User question: ${message}`

      const result = await model.generateContent(context)
      const response = await result.response
      const aiMessage = response.text()
      const updatedMessages = [...nextMessages, { role: 'assistant', content: aiMessage }]
      setMessages(updatedMessages)

      await fetchJson('/api/chat_messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: conversation, role: 'assistant', content: aiMessage })
      })
    } catch (error) {
      console.error('Failed to send chat message:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I hit an error while answering. Please try again.' }
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const generateQuiz = async () => {
    if (quizLoading) return
    if (!noteBody.trim()) return
    if (!genAI) {
      alert('Missing API key')
      return
    }

    setQuizLoading(true)
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const prompt = `
Create 5 multiple choice quiz questions from these notes.
Return ONLY JSON in this exact format:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "answerIndex": 1
  }
]
Notes:
${noteBody}`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const raw = response.text().replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(raw)
      const valid = Array.isArray(parsed)
        ? parsed.filter(
            (q) =>
              q &&
              typeof q.question === 'string' &&
              Array.isArray(q.options) &&
              q.options.length >= 2 &&
              Number.isInteger(q.answerIndex)
          )
        : []

      setQuizQuestions(valid)
      setQuizIndex(0)
      setSelectedAnswer(null)
      setQuizScore(0)
    } catch (error) {
      console.error('Failed to generate quiz:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
      setQuizLoading(false)
    }
  }

  const currentQuiz = quizQuestions[quizIndex]

  const handleSelectAnswer = (optionIndex) => {
    if (!currentQuiz || selectedAnswer !== null) return
    setSelectedAnswer(optionIndex)
    if (optionIndex === currentQuiz.answerIndex) {
      setQuizScore((prev) => prev + 1)
    }
  }

  const handleNextQuiz = () => {
    if (!currentQuiz) return
    if (quizIndex >= quizQuestions.length - 1) return
    setQuizIndex((prev) => prev + 1)
    setSelectedAnswer(null)
  }

  return (
    <main className="blank-note-page">
      <aside className="blank-note-sidebar">
        <button
          className="blank-note-brand"
          type="button"
          onClick={() => navigate('/summarizer')}
          aria-label="Back to dashboard"
        >
          <img src={irisLogo} alt="Iris logo" className="blank-note-logo" />
        </button>

        <div className="blank-note-tool-list">
          <button
            type="button"
            className={`blank-note-tool ${activeTool === 'chat' ? 'is-active' : ''}`}
            onClick={() => handleToolSwitch('chat')}
            aria-label="Chat Bot"
          >
            <ChatIcon />
          </button>
          <button
            type="button"
            className={`blank-note-tool ${activeTool === 'notes' ? 'is-active' : ''}`}
            onClick={() => setActiveTool('notes')}
            aria-label="Document"
          >
            <NotesIcon />
          </button>
          <button
            type="button"
            className={`blank-note-tool ${activeTool === 'flashcards' ? 'is-active' : ''}`}
            onClick={() => handleToolSwitch('flashcards')}
            aria-label="Flashcards"
          >
            <CardsIcon />
          </button>
          <button
            type="button"
            className={`blank-note-tool ${activeTool === 'quiz' ? 'is-active' : ''}`}
            onClick={() => handleToolSwitch('quiz')}
            aria-label="Quiz Generator"
          >
            <QuizIcon />
          </button>
        </div>
      </aside>

      <div className="blank-note-shell">
        <header className="blank-note-head">
          <div>
            <p className="blank-note-kicker">Blank Note</p>
            <input
              type="text"
              className="blank-note-title-input"
              value={noteTitle}
              onChange={handleTitleChange}
              aria-label="Document title"
            />
          </div>
          <div className="blank-note-header-right">
            <span className={`blank-note-save-state ${saveState === 'Error saving' ? 'error' : ''}`}>{saveState}</span>
            <button type="button" className="blank-note-back" onClick={handleBackDashboard}>
            Back to Dashboard
            </button>
          </div>
        </header>

        <section className="blank-note-editor-wrap">
          {activeTool === 'notes' && (
            <>
              <Toolbar
                editor={editor}
                fontSize={editorFontSize}
                onDecreaseFontSize={() => setEditorFontSize((prev) => Math.max(12, prev - 1))}
                onIncreaseFontSize={() => setEditorFontSize((prev) => Math.min(28, prev + 1))}
              />
              <p className="blank-note-hint">
                Type <code>/</code> to open commands
              </p>
              <div style={{ '--editor-font-size': `${editorFontSize}px` }}>
                <EditorContent editor={editor} />
              </div>
            </>
          )}

          {activeTool === 'chat' && (
            <div className="blank-tool-panel">
              <div className="blank-chat-messages">
                {messages.length === 0 && (
                  <p className="blank-empty-copy">Ask Iris anything about your notes.</p>
                )}
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`blank-chat-message ${message.role}`}>
                    <p className="blank-chat-role">{message.role === 'user' ? 'You' : 'Iris'}</p>
                    <p>{message.content}</p>
                  </div>
                ))}
                {chatLoading && (
                  <div className="blank-chat-message assistant">
                    <p className="blank-chat-role">Iris</p>
                    <p>Thinking...</p>
                  </div>
                )}
              </div>
              <div className="blank-chat-input-bar">
                <input
                  type="text"
                  value={chatInput}
                  placeholder="Ask a question about your notes..."
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSendMessage()
                    }
                  }}
                />
                <button type="button" onClick={handleSendMessage} disabled={!chatInput.trim() || chatLoading}>
                  <SendIcon />
                </button>
              </div>
            </div>
          )}

          {activeTool === 'flashcards' && (
            <div className="blank-tool-panel">
              {conversationId ? (
                <FlashcardView
                  conversation={{
                    id: conversationId,
                    content: noteBody || 'Blank note started.',
                    summary: conversationSummary || ''
                  }}
                />
              ) : (
                <p className="blank-empty-copy">Start typing and save to generate flashcards.</p>
              )}
            </div>
          )}

          {activeTool === 'quiz' && (
            <div className="blank-tool-panel">
              <div className="blank-quiz-head">
                <h2>Quiz Generator</h2>
                <button type="button" onClick={generateQuiz} disabled={quizLoading || !noteBody.trim()}>
                  {quizLoading ? 'Generating...' : quizQuestions.length ? 'Regenerate' : 'Generate Quiz'}
                </button>
              </div>
              {quizQuestions.length === 0 && !quizLoading && (
                <p className="blank-empty-copy">Generate questions from your current note to test yourself.</p>
              )}
              {currentQuiz && (
                <div className="blank-quiz-card">
                  <p className="blank-quiz-progress">Question {quizIndex + 1} of {quizQuestions.length}</p>
                  <h3>{currentQuiz.question}</h3>
                  <div className="blank-quiz-options">
                    {currentQuiz.options.map((option, optionIndex) => {
                      const isSelected = selectedAnswer === optionIndex
                      const isCorrect = selectedAnswer !== null && optionIndex === currentQuiz.answerIndex
                      const isWrongSelected = isSelected && optionIndex !== currentQuiz.answerIndex
                      return (
                        <button
                          key={`${option}-${optionIndex}`}
                          type="button"
                          className={`blank-quiz-option ${isCorrect ? 'correct' : ''} ${isWrongSelected ? 'wrong' : ''}`}
                          onClick={() => handleSelectAnswer(optionIndex)}
                          disabled={selectedAnswer !== null}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                  <div className="blank-quiz-footer">
                    <p>Score: {quizScore} / {quizQuestions.length}</p>
                    <button
                      type="button"
                      onClick={handleNextQuiz}
                      disabled={selectedAnswer === null || quizIndex >= quizQuestions.length - 1}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default BlankNotePage
