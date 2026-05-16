// A small reusable card the Home page uses to show one subject. Pulling
// this out of Home.jsx makes the parent file easier to read and shows
// how React components compose.

import { Link } from 'react-router-dom'

export default function SubjectCard({ subject }) {
  return (
    <article className="subject-card">
      <h3 className="subject-name">{subject.name}</h3>
      <p className="subject-examples">
        Try a concept like <em>{subject.examples.join(', ')}</em>
      </p>
      <Link className="subject-cta" to={`/study?subject=${subject.id}`}>
        Start studying →
      </Link>
    </article>
  )
}
