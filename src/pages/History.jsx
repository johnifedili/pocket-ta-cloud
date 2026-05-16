// The History page lists every practice attempt the student has made on
// this browser. The data comes from localStorage by way of the
// useLocalHistory hook.

import useLocalHistory from '../hooks/useLocalHistory.js'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function History() {
  const { history, reset } = useLocalHistory()

  // A tiny summary line so the student gets feedback at a glance.
  const total = history.length
  const correctCount = history.filter((a) => a.correct).length
  const accuracy = total === 0 ? 0 : Math.round((correctCount / total) * 100)

  function handleClear() {
    // Confirm before wiping — easy to misclick when reviewing history.
    const ok = window.confirm('Clear all saved practice history? This cannot be undone.')
    if (ok) reset()
  }

  return (
    <section className="page history">
      <header className="study-header">
        <h1>Your practice history</h1>
        <p className="study-sub">
          Everything you have tried so far. Stored in this browser only —
          nothing is sent anywhere.
        </p>
      </header>

      {total === 0 ? (
        <div className="empty">
          <p>No practice attempts yet. Head to the Study page to try one.</p>
        </div>
      ) : (
        <>
          <div className="history-summary">
            <span><strong>{total}</strong> attempts</span>
            <span><strong>{correctCount}</strong> correct</span>
            <span><strong>{accuracy}%</strong> accuracy</span>
            <button onClick={handleClear} className="ghost">Clear history</button>
          </div>

          <ul className="history-list">
            {history.map((attempt, index) => (
              <li
                key={`${attempt.timestamp}-${index}`}
                className={`history-item ${attempt.correct ? 'good' : 'recover'}`}
              >
                <div className="history-row top">
                  <span className="subject-pill">{attempt.subject}</span>
                  <span className="when">{formatDate(attempt.timestamp)}</span>
                </div>
                <p className="q">{attempt.question}</p>
                <p className="a">
                  Your answer: <strong>{attempt.answer}</strong> ·{' '}
                  {attempt.correct ? '✓ correct' : '✗ not yet'}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
