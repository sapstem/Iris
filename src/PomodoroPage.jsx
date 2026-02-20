import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SummarizerPage.css'
import './PomodoroPage.css'
import irisLogo from './assets/irislogo.png'
import {
  ChatIcon,
  ClockIcon,
  HomeIcon,
  NotesIcon,
  RefreshIcon,
  SettingsIcon
} from './Icons'

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

function PomodoroPage() {
  const navigate = useNavigate()
  const userMenuRef = useRef(null)
  const intervalRef = useRef(null)

  const [displayName, setDisplayName] = useState('Guest')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [profileLoaded, setProfileLoaded] = useState(false)

  const [focusMinutes, setFocusMinutes] = useState(25)
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5)
  const [longBreakMinutes, setLongBreakMinutes] = useState(15)
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    let mounted = true

    fetchJson('/api/auth/me')
      .then((result) => {
        if (!mounted) return
        const name = result.user?.display_name || result.user?.email || 'Guest'
        setDisplayName(name.split(' ')[0])
        setAvatarUrl(result.user?.avatar_url || '')
        setTheme(result.user?.theme || 'dark')
        setProfileLoaded(true)
      })
      .catch((error) => {
        console.error('Failed to load profile:', error)
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

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  useEffect(() => {
    if (secondsLeft > 0) return
    const timer = setTimeout(() => {
      setIsRunning(false)

      if (mode === 'focus') {
        const nextSessionCount = sessionCount + 1
        setSessionCount(nextSessionCount)
        if (nextSessionCount % 4 === 0) {
          setMode('longBreak')
          setSecondsLeft(longBreakMinutes * 60)
        } else {
          setMode('shortBreak')
          setSecondsLeft(shortBreakMinutes * 60)
        }
        return
      }

      setMode('focus')
      setSecondsLeft(focusMinutes * 60)
    }, 0)

    return () => clearTimeout(timer)
  }, [secondsLeft, mode, sessionCount, focusMinutes, shortBreakMinutes, longBreakMinutes])

  const applyModeTime = (nextMode) => {
    setMode(nextMode)
    setIsRunning(false)
    if (nextMode === 'focus') setSecondsLeft(focusMinutes * 60)
    if (nextMode === 'shortBreak') setSecondsLeft(shortBreakMinutes * 60)
    if (nextMode === 'longBreak') setSecondsLeft(longBreakMinutes * 60)
  }

  const onMinutesChange = (setter, value) => {
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return
    const clamped = Math.max(1, Math.min(90, parsed))
    setter(clamped)
  }

  const handleReset = () => {
    setIsRunning(false)
    if (mode === 'focus') setSecondsLeft(focusMinutes * 60)
    if (mode === 'shortBreak') setSecondsLeft(shortBreakMinutes * 60)
    if (mode === 'longBreak') setSecondsLeft(longBreakMinutes * 60)
  }

  const handleLogout = () => {
    fetchJson('/api/auth/logout', { method: 'POST' })
      .catch((error) => console.error('Failed to logout:', error))
      .finally(() => navigate('/auth'))
  }

  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60)
    const secs = secondsLeft % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [secondsLeft])

  const modeLabel =
    mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'

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
            <button className="studio-link" type="button" onClick={() => navigate('/summarizer')}>
              <span className="studio-icon"><HomeIcon /></span>
              <span className="studio-text">Dashboard</span>
            </button>
            <button className="studio-link" type="button">
              <span className="studio-icon"><NotesIcon /></span>
              <span className="studio-text">Projects</span>
            </button>
            <button className="studio-link" type="button" onClick={() => navigate('/conversations')}>
              <span className="studio-icon"><ChatIcon /></span>
              <span className="studio-text">Notes</span>
            </button>
            <button className="studio-link" type="button" onClick={() => navigate('/summarizer')}>
              <span className="studio-icon"><RefreshIcon /></span>
              <span className="studio-text">Recent</span>
            </button>
            <button className="studio-link" type="button">
              <span className="studio-icon"><ClockIcon /></span>
              <span className="studio-text">Pomodoro</span>
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
                <img className="user-avatar-img" src={avatarUrl} alt="" referrerPolicy="no-referrer" />
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

      <main className="studio-main pomodoro-main">
        <div className="pomodoro-header">
          <h1 className="workspace-title">Pomodoro Timer</h1>
          <p className="pomodoro-subtitle">Use focused intervals and breaks to stay consistent.</p>
        </div>

        <section className="pomodoro-card">
          <div className="pomodoro-mode-row">
            <button
              type="button"
              className={`pomodoro-mode-btn ${mode === 'focus' ? 'active' : ''}`}
              onClick={() => applyModeTime('focus')}
            >
              Focus
            </button>
            <button
              type="button"
              className={`pomodoro-mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => applyModeTime('shortBreak')}
            >
              Short Break
            </button>
            <button
              type="button"
              className={`pomodoro-mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
              onClick={() => applyModeTime('longBreak')}
            >
              Long Break
            </button>
          </div>

          <p className="pomodoro-label">{modeLabel}</p>
          <p className="pomodoro-time">{formattedTime}</p>

          <div className="pomodoro-actions">
            <button type="button" className="pomodoro-primary" onClick={() => setIsRunning((prev) => !prev)}>
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button type="button" className="pomodoro-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>

          <p className="pomodoro-sessions">Completed focus sessions: {sessionCount}</p>
        </section>

        <section className="pomodoro-settings">
          <h2>Timer Lengths</h2>
          <div className="pomodoro-input-grid">
            <label>
              Focus (minutes)
              <input
                type="number"
                min="1"
                max="90"
                value={focusMinutes}
                onChange={(event) => onMinutesChange(setFocusMinutes, event.target.value)}
              />
            </label>
            <label>
              Short break (minutes)
              <input
                type="number"
                min="1"
                max="90"
                value={shortBreakMinutes}
                onChange={(event) => onMinutesChange(setShortBreakMinutes, event.target.value)}
              />
            </label>
            <label>
              Long break (minutes)
              <input
                type="number"
                min="1"
                max="90"
                value={longBreakMinutes}
                onChange={(event) => onMinutesChange(setLongBreakMinutes, event.target.value)}
              />
            </label>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PomodoroPage
