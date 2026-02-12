import { Link } from 'react-router-dom'
import './HowitWorks.css'

function HowitWorks() {
  return (
    <main className="how-page">
      <section className="how-card">
        <p className="how-label">How It Works</p>
        <h1>Study flow in Iris</h1>

        <ol className="how-steps">
          <li>
            <h2>Add your content</h2>
            <p>Paste text, upload files, or bring in a link.</p>
          </li>
          <li>
            <h2>Generate the core summary</h2>
            <p>
              Iris creates a quick overview, key takeaways, and keyword chips
              so you can review faster.
            </p>
          </li>
          <li>
            <h2>Ask the AI chat tutor</h2>
            <p>
              Open the chat tab in a conversation and ask follow-up questions
              grounded in your material.
            </p>
          </li>
          <li>
            <h2>Create flashcards</h2>
            <p>
              Generate cards from the same conversation and review with
              question-answer flips.
            </p>
          </li>
          <li>
            <h2>Refine notes</h2>
            <p>
              Use the Notes tab to write and organize your own version.
              Changes save automatically.
            </p>
          </li>
          <li>
            <h2>Practice with quizzes</h2>
            <p>
              Quiz mode is the next step in the workflow and is currently marked
              in progress in the app.
            </p>
          </li>
        </ol>

        <div className="how-links">
          <Link to="/" className="how-link">Back to home</Link>
          <Link to="/auth" className="how-link">Open app</Link>
        </div>
      </section>
    </main>
  )
}

export default HowitWorks
