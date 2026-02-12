import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LandingPage.css'
import irisLogo from './assets/irislogo.png'

const ROTATING_WORDS = ['summaries', 'flashcards', 'guides', 'notes', 'quizzes']
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
      <header className="landing-nav">
        <div className="nav-brand">
          <img className="nav-logo-image" src={irisLogo} alt="Iris logo" />
        </div>
        <nav className="nav-links" aria-label="Primary">
          <Link to="/about">About me</Link>
          <span className="nav-sep" aria-hidden="true">/</span>
          <Link to="/how-it-works">How it works</Link>
          <span className="nav-sep" aria-hidden="true">/</span>
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
              <span className="hero-line">
                Generate {' '}
                <span className="typing-container">
                  <span className="typing-line">
                <span className="typing-text" data-text={currentText}>
                  {currentText}
                </span>
                <span className="typing-cursor">|</span>
              </span>
            </span>
          </span>
              <span className="hero-subline">from your materials</span>
            </h1>
            <p className="subtitle">
              <span className="subtitle-dot" aria-hidden="true">✦</span>
              any format in, study materials out.
            </p>
            
            <div className="cta-group">
              <button className="cta-primary" onClick={() => navigate('/auth')}>
                Start Learning
              </button>
            </div>
          </div>
          <div className="hero-image-wrap">
            <img className="hero-image" src={new URL('./assets/study1.png', import.meta.url).href} alt="Study illustration" />
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
            <path d="M6 10C72 6 116 16 132 54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M122 46L132 54L124 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
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
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Paste Your Notes</h3>
            <p>Copy and paste any text - lecture notes, articles, or textbook excerpts</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Magic</h3>
            <p>Our AI analyzes your content and identifies key concepts</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Results</h3>
            <p>Receive summaries, flashcards, and study guides instantly</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Study & Review</h3>
            <p>Use the generated materials to study efficiently</p>
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


