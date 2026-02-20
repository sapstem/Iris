import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SummarizerPage.css'
import './PomodoroPage.css'
import irisLogo from './assets/irislogo.png'
import { usePomodoro } from './usePomodoro'
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

  const [displayName, setDisplayName] = useState('Guest')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [profileLoaded, setProfileLoaded] = useState(false)

  const {
    mode,
    minutes,
    seconds,
    isActive,
    focusDuration,
    breakDuration,
    completedFocusSessions,
    setFocusDuration,
    setBreakDuration,
    setTimerMode,
    toggleTimer,
    resetTimer
  } = usePomodoro()

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

  const handleLogout = () => {
    fetchJson('/api/auth/logout', { method: 'POST' })
      .catch((error) => console.error('Failed to logout:', error))
      .finally(() => navigate('/auth'))
  }

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const modeLabel = mode === 'focus' ? 'Focus' : 'Break'

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
              onClick={() => setTimerMode('focus')}
            >
              Focus
            </button>
            <button
              type="button"
              className={`pomodoro-mode-btn ${mode === 'break' ? 'active' : ''}`}
              onClick={() => setTimerMode('break')}
            >
              Break
            </button>
          </div>

          <p className="pomodoro-label">{modeLabel}</p>
          <p className="pomodoro-time">{formattedTime}</p>

          <div className="pomodoro-actions">
            <button type="button" className="pomodoro-primary" onClick={toggleTimer}>
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button type="button" className="pomodoro-secondary" onClick={resetTimer}>
              Reset
            </button>
          </div>

          <p className="pomodoro-sessions">Completed focus sessions: {completedFocusSessions}</p>
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
                value={focusDuration}
                onChange={(event) => setFocusDuration(event.target.value)}
              />
            </label>
            <label>
              Break (minutes)
              <input
                type="number"
                min="1"
                max="90"
                value={breakDuration}
                onChange={(event) => setBreakDuration(event.target.value)}
              />
            </label>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PomodoroPage
