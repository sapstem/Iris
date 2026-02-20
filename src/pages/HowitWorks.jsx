import { Link } from 'react-router-dom'
import './HowitWorks.css'

const FLOW_STEPS = [
  {
    title: 'Drop in your material',
    body: 'Paste notes, upload files, or add a video/article link. Iris treats everything as one study project.'
  },
  {
    title: 'Iris maps the important ideas',
    body: 'The AI study tool extracts key concepts, definitions, and likely exam targets so you skip the noise.'
  },
  {
    title: 'Generate practice assets',
    body: 'Turn that same source into quizzes, flashcards, and clean notes without rewriting your content.'
  },
  {
    title: 'Practice and close gaps',
    body: 'Use quiz results and card review to spot weak areas, then ask the tutor to reteach only those topics.'
  }
]

const FEATURE_CARDS = [
  {
    title: 'Quiz Generator',
    tag: 'Exam mode',
    points: [
      'Creates multiple-choice and short-answer checks from your uploaded material.',
      'Focuses on high-yield concepts so practice looks like what you will actually be tested on.',
      'Lets you quickly rerun questions to reinforce missed topics.'
    ]
  },
  {
    title: 'Flashcards',
    tag: 'Recall mode',
    points: [
      'Builds Q&A cards from your notes, transcripts, and summaries.',
      'Designed for active recall instead of passive rereading.',
      'Works as a fast drill set before class, quizzes, and finals.'
    ]
  },
  {
    title: 'AI Study Tool',
    tag: 'Tutor mode',
    points: [
      'Answers questions using your own source content as context.',
      'Can simplify hard sections, compare concepts, and explain step-by-step.',
      'Turns unclear notes into clean explanations you can actually study from.'
    ]
  }
]

function HowitWorks() {
  return (
    <main className="how-ink-page">
      <div className="how-marginalia" aria-hidden="true">
        <span className="how-doodle doodle-eq">E=mc2</span>
        <span className="how-doodle doodle-int">int f(x)dx</span>
        <span className="how-doodle doodle-stars">* * *</span>
        <span className="how-doodle doodle-note">note:</span>
        <span className="how-doodle doodle-arrow">{'->'}</span>
        <span className="how-doodle doodle-pi">pi ~= 3.14</span>
      </div>

      <div className="how-shell">
        <header className="how-nav">
          <Link to="/" className="how-brand">Iris</Link>
          <div className="how-nav-links">
            <Link to="/" className="how-nav-link">Home</Link>
            <Link to="/auth" className="how-nav-cta">Open app</Link>
          </div>
        </header>

        <section className="how-hero">
          <p className="how-label">How It Works</p>
          <h1>Turn one source into quizzes, flashcards, and tutoring.</h1>
          <p className="how-intro">
            Iris follows a simple notebook flow: collect material once, convert it into study tools, and practice
            only what you still miss.
          </p>
        </section>

        <section className="how-flow" aria-label="Study workflow">
          <h2 className="how-section-title">Study Flow</h2>
          <div className="how-steps-grid">
            {FLOW_STEPS.map((step, index) => (
              <article key={step.title} className={`how-step-card ${index % 2 === 0 ? 'left' : 'right'}`}>
                <span className="how-step-number" aria-hidden="true">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="how-features" aria-label="Core features">
          <h2 className="how-section-title">Core Features</h2>
          <div className="how-feature-grid">
            {FEATURE_CARDS.map((feature) => (
              <article className="how-feature-card" key={feature.title}>
                <p className="how-feature-tag">{feature.tag}</p>
                <h3>{feature.title}</h3>
                <ul>
                  {feature.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="how-rhythm" aria-label="Weekly study loop">
          <h2 className="how-section-title">Typical Weekly Loop</h2>
          <div className="how-rhythm-card">
            <p><strong>Day 1:</strong> Upload notes, readings, or lecture transcript.</p>
            <p><strong>Day 2:</strong> Generate summary + ask AI tutor what you did not understand.</p>
            <p><strong>Day 3:</strong> Drill flashcards for active recall.</p>
            <p><strong>Day 4:</strong> Run generated quizzes and review misses.</p>
            <p><strong>Before exam:</strong> Repeat only weak topics until score stabilizes.</p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default HowitWorks
