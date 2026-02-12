import { Link } from 'react-router-dom'
import './About.css'

function About() {
  return (
    <main className="about-page">
      <section className="about-card">
        <p className="about-label">About</p>
        <h1>Hi, I am Nora.</h1>
        <p>
          I built Iris to make studying easier and less overwhelming. Instead of
          jumping between tools, I wanted one simple place to turn class notes
          into clear summaries, flashcards, and quick practice.
        </p>
        <p>
          This project is still growing, but the goal stays the same: keep it
          clean, useful, and focused on helping students learn faster.
        </p>
        <Link to="/" className="about-back-link">
          Back to home
        </Link>
      </section>
    </main>
  )
}

export default About
