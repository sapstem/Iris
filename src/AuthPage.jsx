import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import './AuthPage.css'
import irisLogo from './assets/Pin_by_Linnéa_Eklöf_on_Pins_av_dig___Stippling_art__Body_art_tattoos__Tattoo-removebg-preview.png'
import peekABoo from './assets/peek_a_boo-removebg-preview.png'
import exclamation from './assets/PNG_черный_виджет-removebg-preview.png'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const googleButtonRef = useRef(null)
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [googleReady, setGoogleReady] = useState(false)
  const [showCat, setShowCat] = useState(false)
  const [showExclamation, setShowExclamation] = useState(false)
  const exclamationTimer = useRef(null)

  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'signup' || modeParam === 'signin') {
      setMode(modeParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setStatus('Missing Google client ID. Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.')
      return
    }

    const existingScript = document.querySelector('script[data-google-identity]')
    if (existingScript) {
      initializeGoogle()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = initializeGoogle
    script.onerror = () => setStatus('Failed to load Google Identity Services.')
    document.head.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
    }
  }, [])

  const initializeGoogle = () => {
    if (!window.google || !googleButtonRef.current) {
      return
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential
    })

    googleButtonRef.current.innerHTML = ''
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'continue_with'
    })

    setGoogleReady(true)
  }

  const handleGoogleCredential = async (response) => {
    if (!response?.credential) {
      setStatus('Google sign-in failed. Please try again.')
      return
    }

    setLoading(true)
    setStatus('')

    try {
      await postJson('/api/auth/google', { credential: response.credential })
      navigate('/summarizer')
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (event) => {
    event.preventDefault()

    if (!email || !password) {
      setStatus('Email and password are required.')
      return
    }

    setLoading(true)
    setStatus('')

    const endpoint = mode == 'signin' ? '/api/auth/signin' : '/api/auth/signup'

    try {
      await postJson(endpoint, { email, password })
      navigate('/summarizer')
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCatHover = () => {
    clearTimeout(exclamationTimer.current)
    setShowExclamation(true)
    exclamationTimer.current = setTimeout(() => {
      setShowExclamation(false)
      setShowCat(false)
    }, 2000)
  }

  return (
    <div className="auth-page">

      {/* Left decorative panel */}
      <div className="auth-panel-left">

        <div className="auth-panel-doodles" aria-hidden="true">
          <span className="apd apd-1">E=mc²</span>
          <span className="apd apd-3">✶ ✶</span>
          <span className="apd apd-5">Σ</span>
          <span className="apd apd-8">π ≈ 3.14</span>
          <span className="apd apd-11">lim x→∞</span>
        </div>

        <Link to="/" className="auth-back">← Back to Iris</Link>

        <div className="auth-panel-inner">
          <h2 className="auth-panel-heading">
            Study smarter, not harder.
          </h2>
          <p className="auth-panel-sub">
            Iris turns your lectures, textbooks, and notes into tools you can actually study with.
          </p>
          <ul className="auth-panel-features">
            <li>Instant summaries from any source</li>
            <li>Flashcard decks and quizzes in one click</li>
            <li>An AI tutor that knows your notes</li>
          </ul>
        </div>

      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        <div className="auth-card">
          <img src={irisLogo} alt="Iris" className="auth-card-logo" />
          <h1>{mode == 'signin' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth-subtitle">
            {mode == 'signin'
              ? 'Sign in to access your summaries and study tools.'
              : 'Sign up to save summaries and sync across devices.'}
          </p>

          <div className="auth-google" ref={googleButtonRef} />
          {!googleReady && (
            <button className="auth-google-fallback" type="button" disabled>
              Loading Google sign-in...
            </button>
          )}

          <div className="auth-divider"><span>or</span></div>

          <form className="auth-form" onSubmit={handleEmailSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => { setEmail(event.target.value); if (!showCat && event.target.value) setShowCat(true) }}
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); if (!showCat && event.target.value) setShowCat(true) }}
            />

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Working...' : mode == 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {status && <p className="auth-status">{status}</p>}

          {showCat && (
            <div className="auth-cat" onMouseEnter={handleCatHover}>
              {showExclamation && (
                <img src={exclamation} className="auth-exclamation" alt="" />
              )}
              <img src={peekABoo} className="auth-cat-img" alt="" />
            </div>
          )}

          <p className="auth-footer">
            {mode == 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              className="auth-link"
              type="button"
              onClick={() => setMode(mode == 'signin' ? 'signup' : 'signin')}
            >
              {mode == 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

    </div>
  )
}

const postJson = async (path, payload) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include'
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

export default AuthPage
