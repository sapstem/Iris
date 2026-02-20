import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Draggable from 'react-draggable'
import { usePomodoro } from './usePomodoro'
import './MiniTimer.css'

function MiniTimer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { minutes, seconds, mode } = usePomodoro()
  const [isDragging, setIsDragging] = useState(false)
  const nodeRef = useRef(null)

  const visible = useMemo(() => {
    const path = location.pathname || ''
    if (path === '/' || path === '/auth' || path === '/about' || path === '/how-it-works') return false
    return true
  }, [location.pathname])

  if (!visible) return null

  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="mini-timer-anchor">
      <Draggable
        nodeRef={nodeRef}
        axis="y"
        bounds="parent"
        defaultPosition={{ x: 0, y: 0 }}
        handle=".mini-timer-grip"
        onStart={() => setIsDragging(true)}
        onStop={() => setIsDragging(false)}
      >
        <div ref={nodeRef} className={`mini-timer-wrap ${isDragging ? 'is-dragging' : ''}`}>
          <span className="mini-timer-grip" aria-hidden="true" title="Drag timer">
            <span className="mini-timer-grip-dot" />
            <span className="mini-timer-grip-dot" />
          </span>
          <button
            type="button"
            className="mini-timer"
            onClick={() => navigate('/pomodoro')}
            aria-label="Open pomodoro timer"
            title="Open Pomodoro"
          >
            <span className={`mini-timer-dot ${mode === 'focus' ? 'focus' : 'break'}`} />
            <span className="mini-timer-time">{display}</span>
          </button>
        </div>
      </Draggable>
    </div>
  )
}

export default MiniTimer
