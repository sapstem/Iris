import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LandingPage.css'
import irisLogo from './assets/irislogo.png'

const ROTATING_WORDS = ['practice exams', 'flashcard decks', 'key concepts', 'study guides']
const QUIZ_DEMO_QUESTIONS = [
  {
    question: 'Which learning method is most effective for long-term recall?',
    options: ['Re-reading notes repeatedly', 'Active recall with spaced practice', 'Highlighting everything', 'Watching videos at 2x'],
    answer: 1
  },
  {
    question: 'What does active recall mean?',
    options: ['Reading summaries silently', 'Testing yourself without looking at notes', 'Copying notes word-for-word', 'Listening to background lectures'],
    answer: 1
  },
  {
    question: 'When is spaced repetition most useful?',
    options: ['The night before exams only', 'For repeated review over time', 'Only for math formulas', 'Only when using flashcards'],
    answer: 1
  }
]

function LandingPage() {
  const navigate = useNavigate()
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  // typing animation effect
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

  const currentQuiz = QUIZ_DEMO_QUESTIONS[quizIndex]
  const isLastQuestion = quizIndex === QUIZ_DEMO_QUESTIONS.length - 1

  const handleQuizAction = () => {
    if (!revealed) {
      if (selectedOption === null) return
      setRevealed(true)
      if (selectedOption === currentQuiz.answer) {
        setCorrectCount((prev) => prev + 1)
      }
      return
    }

    if (isLastQuestion) {
      setQuizIndex(0)
      setSelectedOption(null)
      setRevealed(false)
      setCorrectCount(0)
      return
    }

    setQuizIndex((prev) => prev + 1)
    setSelectedOption(null)
    setRevealed(false)
  }

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
        <span className="marginalia-doodle doodle-quote">“...”</span>
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
        <span className="marginalia-doodle doodle-lit">“theme?”</span>
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
          <a href="#quiz-demo">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-auth-actions">
          <Link to="/auth?mode=signin" className="nav-login-link">
            Log in
          </Link>
          <Link to="/auth?mode=signup" className="nav-signup-btn">
            Sign up
          </Link>
        </div>
      </header>
      {/* Hero Section - Your existing content */}
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
                      <span className="typing-text" data-text={currentText}>
                        {currentText}
                      </span>
                      <span className="typing-cursor">|</span>
                    </span>
                  </span>
                  <span className="hero-bracket" aria-hidden="true">]</span>
                </span>
                <span className="hero-line-tail">.</span>
              </span>
            </h1>
            <p className="subtitle">
              From hour long videos to massive textbooks, Iris finds the stuff that actually matters.
            </p>
            
            <div className="cta-group">
              <button className="cta-primary" onClick={() => navigate('/auth')}>
                Start Learning
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* New Features Section - Add this below */}

      
      
      <section className="quiz-demo-section" id="quiz-demo">
        <div className="quiz-annotation" aria-hidden="true">
          <span className="quiz-annotation-text">try it out</span>
          <svg
            className="quiz-annotation-arrow"
            viewBox="0 0 160 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 8C78 8 126 20 142 56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M132 48L142 56L134 66" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="section-subtitle">Sample question {quizIndex + 1} of {QUIZ_DEMO_QUESTIONS.length}</p>

        <div className="quiz-demo-card">
          <p className="quiz-question">{currentQuiz.question}</p>

          <div className="quiz-options">
            {currentQuiz.options.map((option, index) => {
              const isSelected = selectedOption === index
              const isCorrect = index === currentQuiz.answer
              const isWrongPick = revealed && isSelected && !isCorrect
              const classes = [
                'quiz-option',
                isSelected ? 'selected' : '',
                revealed && isCorrect ? 'correct' : '',
                isWrongPick ? 'wrong' : ''
              ].join(' ')
              return (
                <button
                  key={option}
                  type="button"
                  className={classes}
                  onClick={() => !revealed && setSelectedOption(index)}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {revealed && (
            <p className="quiz-feedback">
              {selectedOption === currentQuiz.answer ? 'Correct.' : `Correct answer: ${currentQuiz.options[currentQuiz.answer]}`}
            </p>
          )}

          <div className="quiz-footer">
            <p className="quiz-score">Score: {correctCount} / {QUIZ_DEMO_QUESTIONS.length}</p>
            <button
              type="button"
              className="cta-primary quiz-action"
              onClick={handleQuizAction}
              disabled={!revealed && selectedOption === null}
            >
              {!revealed ? 'Check answer' : isLastQuestion ? 'Restart' : 'Next question'}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <h2 className="section-title how-title-ink">
          <span className="how-title-word how-title-word-1">How</span>{' '}
          <span className="how-title-word how-title-word-2">it</span>{' '}
          <span className="how-title-word how-title-word-3">works</span>
        </h2>
        <div className="steps-ink-path">
          <svg
            className="ink-connector-svg"
            viewBox="0 0 120 640"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M60 10 C 45 70, 75 145, 60 210 C 44 280, 77 355, 60 430 C 46 500, 74 565, 60 630"
              pathLength="1"
            />
          </svg>
          <span className="ink-marginalia ink-marginalia-star" aria-hidden="true">✶</span>
          <span className="ink-marginalia ink-marginalia-arrow" aria-hidden="true">↘</span>
          <span className="step-marginalia step-marginalia-1" aria-hidden="true">→ note</span>
          <span className="step-marginalia step-marginalia-2" aria-hidden="true">∫</span>
          <span className="step-marginalia step-marginalia-3" aria-hidden="true">✶</span>
          <span className="step-marginalia step-marginalia-4" aria-hidden="true">Δ</span>
          <span className="step-marginalia step-marginalia-5" aria-hidden="true">#key</span>
          <span className="step-marginalia step-marginalia-6" aria-hidden="true">↺</span>
          <div className="step step-ink step-left">
            <div className="step-number-ink" aria-hidden="true"><span>1</span></div>
            <h3>Input Your Materials</h3>
            <p>Add lecture notes, reading excerpts, links, or transcripts into one workspace.</p>
          </div>
          
          <div className="step step-ink step-right">
            <div className="step-number-ink" aria-hidden="true"><span>2</span></div>
            <h3>Iris Synthesizes</h3>
            <p>Iris reads your source material and maps themes, key ideas, and terms.</p>
          </div>
          
          <div className="step step-ink step-left">
            <div className="step-number-ink" aria-hidden="true"><span>3</span></div>
            <h3>Generate Study Aids</h3>
            <p>Create structured notes, focused summaries, flashcards, and quiz prompts.</p>
          </div>
          
          <div className="step step-ink step-right">
            <div className="step-number-ink" aria-hidden="true"><span>4</span></div>
            <h3>Master the Material</h3>
            <p>Review with active recall, refine weak spots, and track progress by project.</p>
          </div>
        </div>
      </section>

      <section className="notes-showcase-section" id="notes-showcase">
        <div className="notes-container">
          <aside className="notes-sidebar">
            <div className="notes-title-group">
              <span className="notes-pen-icon" aria-hidden="true">{'\u270E'}</span>
              <h2 className="notes-title">notes</h2>
            </div>
            <ul className="notes-description">
              <li>
                <span className="notes-point-title">Refine</span> Use the toolbar to{' '}
                <span className="ink-highlight">bold</span> key concepts or{' '}
                <span className="ink-highlight">highlight</span> insights you don't want to forget.
              </li>
              <li>
                <span className="notes-point-title">Collaborate</span> Highlight confusing text and ask{' '}
                <span className="ink-highlight">Iris</span> to explain it,
                summarize it, or turn it into a quick quiz question.
              </li>
            </ul>
          </aside>

          <main className="notes-card">
            <header className="notes-card-header">
              <button type="button" className="notes-expand" aria-label="Expand note">
                ⤢
              </button>
            </header>

            <div className="notes-card-content">
              <p>
                <strong>Contemporary Psychology - Lecture 4</strong>
              </p>
              <p>
                Today's lecture focused on <strong>Neuroplasticity</strong>, which is the brain's ability to
                reorganize itself by forming new neural connections throughout life.
              </p>
              <p>
                <u>Key Takeaway</u>: The brain isn't "hard-wired" like a computer; it's more like a muscle
                that adapts to new experiences.
              </p>
              <p>
                <mark>Iris, can you summarize the difference between structural and functional plasticity here?</mark>
              </p>
              <p>
                I need to look up more about the <strong>Hippocampus</strong> and its role in long-term
                memory. It's fascinating how <u>synaptic pruning</u> works to "delete" unused information to
                make room for more important data.
              </p>
              <p>
                Note: I should turn these points into flashcards before the study session tonight.
              </p>
            </div>
          </main>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <h2>Ready to <span className="marker-underline">Transform</span> Your Study Habits?</h2>
        <p>Join students who are already learning smarter with AI</p>
        <button className="cta-primary" onClick={() => navigate('/auth')}>
          Start Learning Now
        </button>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="faq">
        <h2>Frequently Asked Questions</h2>
        <p className="faq-subtitle">Everything you need to know about Iris</p>

        <div className="faq-list">
          <details className="faq-item">
            <summary>Can I turn lecture notes into summaries and study guides?</summary>
            <p>Yes. Paste your notes and Iris will generate concise summaries and topic overviews.</p>
          </details>

          <details className="faq-item">
            <summary>Does Iris support flashcards and quizzes?</summary>
            <p>Absolutely. You can create flashcards for recall and quizzes for self-testing.</p>
          </details>

          <details className="faq-item">
            <summary>Can Iris answer questions about my uploaded content?</summary>
            <p>Yes. The AI tutor is designed to respond based on your notes and materials.</p>
          </details>

          <details className="faq-item">
            <summary>Is Iris free to use?</summary>
            <p>Yes. We're testing the platform before launching.</p>
          </details>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <h3>Iris</h3>
          <p>AI-powered study support built for clarity, speed, and confidence.</p>
        </div>
        <div className="footer-links">
          <a href="#">Blogs</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Iris. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
