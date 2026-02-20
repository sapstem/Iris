import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SlashCommand from './editor/SlashCommand'
import irisLogo from './assets/irislogo.png'
import {
  CardsIcon,
  ChatIcon,
  NotesIcon,
  QuizIcon
} from './Icons'
import './BlankNotePage.css'
import 'tippy.js/dist/tippy.css'

function BlankNotePage() {
  const navigate = useNavigate()
  const [activeTool, setActiveTool] = useState('notes')
  const editor = useEditor({
    extensions: [StarterKit, SlashCommand],
    content: '<p></p>',
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'blank-editor-content',
        spellcheck: 'true'
      }
    }
  })

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
            onClick={() => setActiveTool('chat')}
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
            onClick={() => setActiveTool('flashcards')}
            aria-label="Flashcards"
          >
            <CardsIcon />
          </button>
          <button
            type="button"
            className={`blank-note-tool ${activeTool === 'quiz' ? 'is-active' : ''}`}
            onClick={() => setActiveTool('quiz')}
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
            <h1>New note</h1>
          </div>
          <button type="button" className="blank-note-back" onClick={() => navigate('/summarizer')}>
            Back to Dashboard
          </button>
        </header>

        {activeTool !== 'notes' && (
          <div className="blank-note-tool-banner">
            {activeTool === 'chat' && 'Chat will be available after you save this note as a conversation.'}
            {activeTool === 'flashcards' && 'Flashcard generation appears after note content is saved.'}
            {activeTool === 'quiz' && 'Quiz generator appears after note content is saved.'}
          </div>
        )}

        <section className="blank-note-editor-wrap">
          <p className="blank-note-hint">
            Type <code>/</code> to open commands
          </p>
          <EditorContent editor={editor} />
        </section>
      </div>
    </main>
  )
}

export default BlankNotePage
