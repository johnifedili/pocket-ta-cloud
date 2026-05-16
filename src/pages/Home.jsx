// The landing page. Its job is small: introduce the app and let the
// student pick a subject. Most of the work is delegated to SubjectCard
// so this file stays short and readable.

import { SUBJECTS } from '../lib/subjects.js'
import SubjectCard from '../components/SubjectCard.jsx'

export default function Home() {
  return (
    <section className="page home">
      <div className="hero">
        <p className="kicker">A STUDENT, NOT A STATISTIC</p>
        <h1>Meet your pocket teaching assistant.</h1>
        <p className="lede">
          Pocket TA helps you understand a concept, try a practice question,
          and keep track of what you have mastered — without sending anything
          to the cloud.
        </p>
      </div>

      <section className="subjects">
        <h2>Pick a subject</h2>
        {/* Array.map is the React way to turn a list of data into JSX. */}
        <div className="subject-grid">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </section>
    </section>
  )
}
