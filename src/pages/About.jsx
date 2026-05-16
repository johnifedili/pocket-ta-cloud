// A short page explaining what the project is and how it was built.
// Doubles as a place to list which class requirements each piece of
// code satisfies, so the grader can find them quickly.

export default function About() {
  return (
    <section className="page about">
      <h1>About Pocket TA</h1>
      <p>
        Pocket TA is a small Single Page Web App I built for the class
        final. The idea grew out of a hackathon project I am also
        working on — an offline AI tutor — but this version is trimmed
        down so each part of the React stack the class covered is easy
        to see.
      </p>

      <h2>What it does</h2>
      <ul>
        <li>Pick a subject and a reading level.</li>
        <li>Get a short, kid-friendly explanation of the concept.</li>
        <li>Try a practice question. If you get it wrong, the app shows
            the underlying misconception and gives you a simpler
            follow-up question to recover.</li>
        <li>Every attempt is saved locally so you can see your progress
            on the History page.</li>
      </ul>

      <h2>How it is built</h2>
      <p>
        The whole thing is React + Vite + React Router. Persistent
        progress lives in <code>localStorage</code>. If a local Gemma
        model is running through Ollama on the grader's machine, the
        Study page will use it to generate fresh explanations; otherwise
        it falls back to the built-in ones.
      </p>

      <h2>Where to look in the code</h2>
      <ul>
        <li><code>src/App.jsx</code> — top-level component and routes.</li>
        <li><code>src/pages/</code> — Home, Study, History, About.</li>
        <li><code>src/components/</code> — SubjectCard, MasteryBar.</li>
        <li><code>src/hooks/useLocalHistory.js</code> — custom hook for
            reading and writing practice history.</li>
        <li><code>src/lib/subjects.js</code> — the subjects array and
            helper functions.</li>
        <li><code>src/lib/storage.js</code> — localStorage wrapper.</li>
        <li><code>src/lib/gemma.js</code> — optional bridge to a local
            Gemma model via Ollama.</li>
      </ul>
    </section>
  )
}
