import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LandingPage.css'
import irisLogo from './assets/Pin_by_Linnéa_Eklöf_on_Pins_av_dig___Stippling_art__Body_art_tattoos__Tattoo-removebg-preview.png'

const ROTATING_WORDS = ['practice exams', 'flashcard decks', 'key concepts', 'study guides']

function LandingPage() {
  const navigate = useNavigate()
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = ROTATING_WORDS[currentWordIndex]
    const typingSpeed = isDeleting ? 50 : 100

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < word.length) {
          setCurrentText(word.substring(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 1500)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.substring(0, currentText.length - 1))
        } else {
          setIsDeleting(false)
          setCurrentWordIndex((currentWordIndex + 1) % ROTATING_WORDS.length)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, currentWordIndex])

  return (
    <div className="landing-page">
      <div className="marginalia-layer" aria-hidden="true">
        <span className="marginalia-doodle doodle-einstein">E=mc²</span>
        <span className="marginalia-doodle doodle-integral">∫x²dx</span>
        <span className="marginalia-doodle doodle-benzene">⌬</span>
        <span className="marginalia-doodle doodle-stars">✶ ✶ ✶</span>
        <span className="marginalia-doodle doodle-arrow">↗</span>
        <span className="marginalia-doodle doodle-spiral">@</span>
        <span className="marginalia-doodle doodle-speech" />
        <span className="marginalia-doodle doodle-chem">C₆H₆</span>
        <span className="marginalia-doodle doodle-derivative">d/dx</span>
        <span className="marginalia-doodle doodle-pi">π ≈ 3.14</span>
        <span className="marginalia-doodle doodle-quote">"..."</span>
        <span className="marginalia-doodle doodle-check">✓ ✓</span>
        <span className="marginalia-doodle doodle-xes">x x x</span>
        <span className="marginalia-doodle doodle-wave">~ ~ ~</span>
        <span className="marginalia-doodle doodle-atom">⚛</span>
        <span className="marginalia-doodle doodle-focus">focus?</span>
        <span className="marginalia-doodle doodle-arrow-down">↘</span>
        <span className="marginalia-doodle doodle-arrow-left">↙</span>
        <span className="marginalia-doodle doodle-stars-two">✦ ✶</span>
        <span className="marginalia-doodle doodle-note">note:</span>
        <span className="marginalia-doodle doodle-ring">◌</span>
        <span className="marginalia-doodle doodle-sigma">Σ</span>
        <span className="marginalia-doodle doodle-theta">θ</span>
        <span className="marginalia-doodle doodle-lambda">λ</span>
        <span className="marginalia-doodle doodle-sqrt">√n</span>
        <span className="marginalia-doodle doodle-sum">∑ i=1..n</span>
        <span className="marginalia-doodle doodle-dna">DNA</span>
        <span className="marginalia-doodle doodle-axis">x|y</span>
        <span className="marginalia-doodle doodle-grid">[ ] [ ]</span>
        <span className="marginalia-doodle doodle-idea">idea!</span>
        <span className="marginalia-doodle doodle-loop">↺</span>
        <span className="marginalia-doodle doodle-brain">brain</span>
        <span className="marginalia-doodle doodle-eq2">a²+b²=c²</span>
        <span className="marginalia-doodle doodle-eq3">f(x)=mx+b</span>
        <span className="marginalia-doodle doodle-quote-two">"revise"</span>
        <span className="marginalia-doodle doodle-aster">* * *</span>
        <span className="marginalia-doodle doodle-arrow-up-left">↖</span>
        <span className="marginalia-doodle doodle-arrow-up-right">↗</span>
        <span className="marginalia-doodle doodle-orbit">⊙</span>
        <span className="marginalia-doodle doodle-memo">memo</span>
        <span className="marginalia-doodle doodle-lit">"theme?"</span>
        <span className="marginalia-doodle doodle-lab">H₂O</span>
        <span className="marginalia-doodle doodle-geo">△</span>
        <span className="marginalia-doodle doodle-check-two">✓</span>
        <span className="marginalia-doodle doodle-wave-two">≈≈≈</span>
        <span className="marginalia-doodle doodle-intab">∫ₐᵇ f(x)dx</span>
        <span className="marginalia-doodle doodle-limit">lim x→∞</span>
        <span className="marginalia-doodle doodle-vector-f">F→</span>
        <span className="marginalia-doodle doodle-vector-v">v→</span>
        <span className="marginalia-doodle doodle-delta">Δ</span>
        <span className="marginalia-doodle doodle-benzene-ring">⌬ //</span>
        <span className="marginalia-doodle doodle-helix">~x~x~</span>
      </div>

      <header className="landing-nav">
        <Link to="/" className="nav-brand" aria-label="Iris home">
          <img className="nav-logo-image" src={irisLogo} alt="Iris logo" />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-auth-actions">
          <Link to="/auth?mode=signin" className="nav-login-link">Log in</Link>
          <Link to="/auth?mode=signup" className="nav-signup-btn">Sign up</Link>
        </div>
      </header>

      {/* Hero — untouched */}
      <section className="hero-section">
        <div className="hero-layout">
          <div className="hero-copy">
            <h1 className="hero-title">
              <span className="hero-line hero-line-primary">Your entire syllabus, decoded into</span>
              <span className="hero-line hero-line-secondary">
                <span className="hero-bracketed">
                  <span className="hero-bracket" aria-hidden="true">[</span>
                  <span className="typing-container">
                    <span className="typing-line">
                      <span className="typing-text" data-text={currentText}>{currentText}</span>
                      <span className="typing-cursor">|</span>
                    </span>
                  </span>
                  <span className="hero-bracket" aria-hidden="true">]</span>
                </span>
                <span className="hero-line-tail" aria-hidden="true" />
              </span>
            </h1>
            <p className="subtitle">
              From hour long videos to massive textbooks, Iris finds the things that actually matter.
            </p>
            <div className="cta-group">
              <button className="cta-primary" onClick={() => navigate('/auth')}>
                Start Learning
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-features" id="features">
        <p className="lp-eyebrow">What Iris does</p>
        <h2 className="lp-h2">Turn any material into a complete study toolkit</h2>
        <div className="lp-feature-grid">
          <div className="lp-feature-card">
            <div className="lp-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
            <h3>Instant Summaries</h3>
            <p>Paste a lecture, article, or chapter. Iris distills it into clear, structured notes in seconds.</p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="14" rx="2"/>
                <path d="M8 20h8M12 16v4"/>
                <line x1="7" y1="10" x2="17" y2="10"/>
                <line x1="7" y1="13" x2="13" y2="13"/>
              </svg>
            </div>
            <h3>Flashcard Decks</h3>
            <p>Automatically generate term–definition pairs from your material, ready for spaced repetition.</p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <h3>Practice Quizzes</h3>
            <p>Test yourself with AI-generated questions written directly from your notes and readings.</p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>AI Tutor</h3>
            <p>Highlight anything confusing and ask Iris to explain, expand, or quiz you on it instantly.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="lp-how" id="how-it-works">
        <p className="lp-eyebrow">The process</p>
        <h2 className="lp-h2">From raw material to mastery</h2>
        <div className="lp-steps">
          <div className="lp-step">
            <span className="lp-step-num">01</span>
            <h3>Add your material</h3>
            <p>Upload notes, paste text, record audio, or drop a link. Iris handles any format.</p>
          </div>
          <div className="lp-step-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12,5 19,12 12,19"/>
            </svg>
          </div>
          <div className="lp-step">
            <span className="lp-step-num">02</span>
            <h3>Iris synthesizes</h3>
            <p>Iris reads your source and maps the key concepts, themes, and terminology.</p>
          </div>
          <div className="lp-step-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12,5 19,12 12,19"/>
            </svg>
          </div>
          <div className="lp-step">
            <span className="lp-step-num">03</span>
            <h3>Generate study aids</h3>
            <p>Create summaries, flashcards, and quizzes from your material with one click.</p>
          </div>
          <div className="lp-step-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12,5 19,12 12,19"/>
            </svg>
          </div>
          <div className="lp-step">
            <span className="lp-step-num">04</span>
            <h3>Review and retain</h3>
            <p>Study with active recall and track your progress project by project.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <h2>Ready to study smarter?</h2>
        <p>Free to use. No credit card required.</p>
        <button className="cta-primary" onClick={() => navigate('/auth')}>Get started</button>
      </section>

      {/* FAQ */}
      <section className="lp-faq" id="faq">
        <p className="lp-eyebrow">FAQ</p>
        <h2 className="lp-h2">Common questions</h2>
        <div className="lp-faq-list">
          <details className="lp-faq-item">
            <summary>Can I turn lecture notes into summaries and study guides?</summary>
            <p>Yes. Paste your notes and Iris will generate concise summaries and topic overviews tailored to your content.</p>
          </details>
          <details className="lp-faq-item">
            <summary>Does Iris support flashcards and quizzes?</summary>
            <p>Absolutely. You can generate flashcard decks for spaced repetition and quizzes for active recall practice.</p>
          </details>
          <details className="lp-faq-item">
            <summary>Can Iris answer questions about my uploaded content?</summary>
            <p>Yes. The AI tutor responds based on your own notes and materials, not generic knowledge alone.</p>
          </details>
          <details className="lp-faq-item">
            <summary>Is Iris free to use?</summary>
            <p>Yes — we're in open testing before our full launch. Sign up and start for free today.</p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <span className="lp-footer-name">Iris</span>
        <nav className="lp-footer-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </nav>
        <p className="lp-footer-copy">© 2026 Iris. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage
