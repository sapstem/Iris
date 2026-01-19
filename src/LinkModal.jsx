import { useState } from 'react'
import './RecordModal.css'

function LinkModal({ isOpen, onClose, onSubmit }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!url.trim()) return
    
    setLoading(true)
    await onSubmit(url)
    setLoading(false)
    setUrl('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Link</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <input
            type="url"
            placeholder="Paste YouTube or website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="modal-input"
          />
          <button
            onClick={handleSubmit}
            disabled={!url.trim() || loading}
            className="modal-primary full-width"
          >
            {loading ? 'Loading...' : 'Add Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LinkModal
