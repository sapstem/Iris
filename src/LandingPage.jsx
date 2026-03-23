import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LandingPage.css'
import irisLogo from './assets/Pin_by_Linnéa_Eklöf_on_Pins_av_dig___Stippling_art__Body_art_tattoos__Tattoo-removebg-preview.png'

const ROTATING_WORDS = ['practice exams', 'flashcard decks', 'key concepts', 'study guides']

const SUBJECTS = [
  'Biology', 'Chemistry', 'Physics', 'History', 'Computer Science',
  'Mathematics', 'Economics', 'Psychology', 'Literature', 'Political Science',
  'Medicine', 'Engineering', 'Philosophy', 'Sociology', 'Law'
]

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

      {/* ── Subject ticker ──────────────────────────── */}
      <div className="lp-ticker-wrap">
        <p className="lp-ticker-label">Works across every subject</p>
        <div className="lp-ticker">
          <div className="lp-ticker-track">
            {[...SUBJECTS, ...SUBJECTS].map((s, i) => (
              <span key={i} className="lp-ticker-pill">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ────────────────────────────────── */}
      <section className="lp-features" id="features">
        <p className="lp-eyebrow">What Iris does</p>
        <h2 className="lp-h2">Everything you need to go from notes to mastery</h2>
        <div className="lp-bento">

          {/* Summaries — wide */}
          <div className="lp-bento-card lp-bento-wide">
            <div className="lp-bento-copy">
              <span className="lp-bento-badge">Summaries</span>
              <h3>Hours of reading, distilled in seconds</h3>
              <p>Paste a lecture transcript, a chapter, or an article. Iris identifies what matters and builds clean, structured notes you can actually use.</p>
            </div>
            <div className="lp-mock lp-mock-summary" aria-hidden="true">
              <div className="mock-doc-header">
                <span className="mock-doc-tag">Summary</span>
                <span className="mock-doc-lines"><span/><span/></span>
              </div>
              <div className="mock-doc-body">
                <div className="mock-line mock-line-heading" />
                <div className="mock-line" />
                <div className="mock-line mock-line-short" />
                <div className="mock-spacer" />
                <div className="mock-line mock-line-heading" />
                <div className="mock-line" />
                <div className="mock-line mock-line-med" />
                <div className="mock-line mock-line-short" />
              </div>
            </div>
          </div>

          {/* Flashcards — narrow */}
          <div className="lp-bento-card lp-bento-narrow">
            <span className="lp-bento-badge">Flashcards</span>
            <h3>Smart decks, built from your own material</h3>
            <p>Auto-generated term–definition pairs ready for spaced repetition.</p>
            <div className="lp-mock lp-mock-card" aria-hidden="true">
              <div className="mock-flashcard">
                <p className="mock-fc-q">What is osmosis?</p>
                <div className="mock-fc-divider" />
                <p className="mock-fc-a">Movement of water across a semipermeable membrane from low to high solute concentration.</p>
              </div>
            </div>
          </div>

          {/* Quizzes — narrow */}
          <div className="lp-bento-card lp-bento-narrow">
            <span className="lp-bento-badge">Quizzes</span>
            <h3>Test yourself with questions from your notes</h3>
            <p>Active recall practice that actually sticks — no generic question banks.</p>
            <div className="lp-mock lp-mock-quiz" aria-hidden="true">
              <p className="mock-quiz-q">Which organelle produces ATP?</p>
              <div className="mock-quiz-opts">
                <span className="mock-opt">A. Nucleus</span>
                <span className="mock-opt mock-opt-correct">B. Mitochondria ✓</span>
                <span className="mock-opt">C. Ribosome</span>
              </div>
            </div>
          </div>

          {/* AI Tutor — wide */}
          <div className="lp-bento-card lp-bento-wide">
            <div className="lp-bento-copy">
              <span className="lp-bento-badge">AI Tutor</span>
              <h3>Ask anything. Get answers grounded in your notes.</h3>
              <p>The AI tutor reads your uploaded material before responding — so every explanation is specific to what you're actually studying, not generic search results.</p>
            </div>
            <div className="lp-mock lp-mock-chat" aria-hidden="true">
              <div className="mock-bubble mock-bubble-user">Can you explain the krebs cycle simply?</div>
              <div className="mock-bubble mock-bubble-ai">Sure. The Krebs cycle is a series of reactions in the mitochondria that breaks down acetyl-CoA to release energy stored as ATP, NADH, and FADH₂.</div>
              <div className="mock-bubble mock-bubble-user">Generate 5 flashcards on this.</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Statement ───────────────────────────────── */}
      <div className="lp-statement">
        <p className="lp-statement-text">Stop re-reading the same chapter.<br/>Start remembering it.</p>
        <p className="lp-statement-sub">Iris turns passive studying into active recall — the method that actually works.</p>
      </div>

      {/* ── How it works ────────────────────────────── */}
      <section className="lp-how" id="how-it-works">
        <div className="lp-how-head">
          <p className="lp-eyebrow">The process</p>
          <h2 className="lp-h2">From source material to study-ready in minutes</h2>
        </div>
        <div className="lp-steps">
          <div className="lp-step">
            <span className="lp-step-num">01</span>
            <div>
              <h3>Add your material</h3>
              <p>Paste text, upload a PDF, drop a YouTube link, or record directly in-app. Iris accepts any format.</p>
            </div>
          </div>
          <div className="lp-step">
            <span className="lp-step-num">02</span>
            <div>
              <h3>Iris processes it</h3>
              <p>The AI reads your source, identifies core concepts, key terms, and recurring themes — automatically.</p>
            </div>
          </div>
          <div className="lp-step">
            <span className="lp-step-num">03</span>
            <div>
              <h3>Get your toolkit</h3>
              <p>Summaries, flashcard decks, and practice quizzes — generated and ready to use in under a minute.</p>
            </div>
          </div>
          <div className="lp-step">
            <span className="lp-step-num">04</span>
            <div>
              <h3>Review and retain</h3>
              <p>Use the built-in Pomodoro timer, track progress across subjects, and ask the AI tutor anything that's unclear.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="lp-cta">
        <p className="lp-cta-kicker">Free to use · No credit card required</p>
        <h2 className="lp-cta-heading">Your next exam starts here.</h2>
        <button className="lp-cta-btn" onClick={() => navigate('/auth')}>Get started</button>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section className="lp-faq" id="faq">
        <div className="lp-faq-head">
          <p className="lp-eyebrow">FAQ</p>
          <h2 className="lp-h2">Common questions</h2>
          <p>Everything you need to know before getting started.</p>
        </div>
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
          <details className="lp-faq-item">
            <summary>What file formats does Iris support?</summary>
            <p>You can paste plain text, upload PDFs and documents, drop YouTube or web links, or record audio directly. Iris handles the rest.</p>
          </details>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
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
