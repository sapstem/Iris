import { useState } from 'react'
import './RecordModal.css'
import { CloseIcon } from './Icons'

function PasteModal({ isOpen, onClose, onPaste }) {
  const [text, setText] = useState('')

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
    } catch (err) {
      console.log('Failed to read clipboard')
    }
  }

  const handleSubmit = () => {
    if (text.trim()) {
      onPaste(text)
      setText('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Paste Text</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <textarea
            placeholder="Paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="modal-textarea"
          />
          <div className="modal-actions">
            <button className="modal-secondary" onClick={handlePaste}>
              Paste from Clipboard
            </button>
            <button className="modal-primary" onClick={handleSubmit} disabled={!text.trim()}>
              Add Text
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasteModal
