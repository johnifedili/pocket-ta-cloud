// A purely presentational component — given a percentage between 0 and
// 100, it draws a filled bar. Separating it from the page that uses it
// keeps the Study page focused on the practice flow.

export default function MasteryBar({ percent, label }) {
  // Clamp so a weird value never breaks the layout.
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)))

  return (
    <div className="mastery-wrap" aria-label={label || 'Mastery'}>
      <div className="mastery-track">
        <div
          className="mastery-fill"
          style={{ width: `${safePercent}%` }}
          role="progressbar"
          aria-valuenow={safePercent}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      <span className="mastery-percent">{safePercent}%</span>
    </div>
  )
}
