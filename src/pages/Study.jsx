// The Study page is the core of the app. It walks a student through a
// short loop:
//
//   1. Pick a subject and reading level (form elements + state).
//   2. See an explanation (offline by default, optionally from Gemma).
//   3. Try a practice question.
//   4. Wrong answer -> see the misconception + analogy -> try the
//      simpler follow-up question.
//   5. Right answer -> mastery bar fills + the attempt is saved to
//      local history.
//
// Most of the work here is React state management, so I leaned on
// useState, useEffect, and a custom hook (useLocalHistory) to keep the
// flow readable.

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SUBJECTS, findSubject, findPractice } from '../lib/subjects.js'
import { isGemmaAvailable, explainWithGemma } from '../lib/gemma.js'
import useLocalHistory from '../hooks/useLocalHistory.js'
import MasteryBar from '../components/MasteryBar.jsx'

const READING_LEVELS = ['Grade 3-5', 'Grade 6-8', 'Grade 9-12']

export default function Study() {
  // The URL can pre-select a subject (e.g. /study?subject=math) so the
  // Home page's links land directly on the right subject.
  const [searchParams] = useSearchParams()
  const presetId = searchParams.get('subject')

  // Core form state.
  const [subjectId, setSubjectId] = useState(presetId || SUBJECTS[0].id)
  const [readingLevel, setReadingLevel] = useState(READING_LEVELS[0])
  const [conceptInput, setConceptInput] = useState('fractions')

  // Practice flow state.
  const [step, setStep] = useState('setup') // setup -> explained -> answering -> result
  const [explanation, setExplanation] = useState('')
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [usedGemma, setUsedGemma] = useState(false)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null) // { correct, misconception?, analogy?, followUp? }
  const [followUpAnswer, setFollowUpAnswer] = useState('')
  const [followUpResult, setFollowUpResult] = useState(null)
  const [mastery, setMastery] = useState(0)

  // Which Gemma path is reachable: 'cloud' (Google AI Studio via the
  // Netlify function), 'local' (Ollama on the student's machine), or
  // 'offline' (neither). Checked once on mount.
  const [gemmaStatus, setGemmaStatus] = useState('offline')
  const gemmaReady = gemmaStatus !== 'offline'

  // The history hook is shared with the History page. Recording an
  // attempt here makes it show up there immediately.
  const { record } = useLocalHistory()

  // Check for a local Gemma on first render. useEffect with an empty
  // dependency array is the React way of saying "run once".
  useEffect(() => {
    let cancelled = false
    isGemmaAvailable().then((result) => {
      if (!cancelled) setGemmaStatus(result.status)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const subject = findSubject(subjectId) || SUBJECTS[0]
  // Try to find a hand-written practice question that matches what the
  // student typed. If there's no match we fall back to the first one in
  // the subject so the practice flow still works, but we also remember
  // whether we matched so the explanation can be honest about it.
  const matchedPractice = findPractice(subject, conceptInput)
  const practice = matchedPractice || subject.practice[0]

  // Build a short hard-coded explanation that always works offline,
  // plus a longer Gemma-generated one when available.
  async function handleExplain(event) {
    event.preventDefault()
    setLoadingExplanation(true)
    setUsedGemma(false)

    // Honest offline explanation: if we have a hand-written intro for the
    // exact concept the student typed, use it. Otherwise use the subject's
    // general intro and tell the student we'll practice with a related
    // question. This is more useful than gluing the wrong analogy on top
    // of an unrelated topic.
    // The offline explanation has two cases:
    //   1. We have a hand-validated lesson for the exact concept — use it.
    //   2. We don't — give the subject overview, be honest about the limit,
    //      and explain that the full Pocket TA uses Gemma 4 to generate
    //      explanations for any topic. This is the curated classroom build.
    const offline = matchedPractice
      ? matchedPractice.intro
      : `${subject.defaultIntro}\n\nThis offline preview ships with a small set of teacher-validated topics per subject so the deployed demo always works without a model. "${conceptInput.trim()}" isn't in that curated set, so we'll practice with a ${subject.name.toLowerCase()} question on ${practice.concept} to keep you moving. To explain any topic on the fly, run Pocket TA against Gemma 4 locally with Ollama — the README has a one-command setup.`

    if (gemmaReady) {
      try {
        const gemmaText = await explainWithGemma(conceptInput, readingLevel, subject.name.toLowerCase())
        if (gemmaText) {
          setExplanation(gemmaText)
          setUsedGemma(true)
        } else {
          setExplanation(offline)
        }
      } catch {
        // If Gemma errors mid-call (model not pulled, etc.), fall back
        // silently so the student never sees a broken state.
        setExplanation(offline)
      }
    } else {
      setExplanation(offline)
    }

    setLoadingExplanation(false)
    setStep('explained')
  }

  // Move from explanation into the practice question.
  function handleStartPractice() {
    setAnswer('')
    setResult(null)
    setFollowUpAnswer('')
    setFollowUpResult(null)
    setStep('answering')
  }

  // Grading the first attempt. The point of this app is not just
  // "right vs wrong" — when the student is wrong we surface the
  // misconception so they can recover.
  function handleSubmitAnswer(event) {
    event.preventDefault()
    const normalized = answer.trim().toLowerCase()
    if (!normalized) return

    if (normalized === practice.correct.toLowerCase()) {
      const next = {
        subject: subject.name,
        concept: practice.concept,
        question: practice.question,
        answer,
        correct: true
      }
      record(next)
      setResult({ correct: true })
      setMastery(100)
      setStep('result')
    } else {
      // Wrong answer path — show the misconception card and the
      // simpler follow-up question.
      setResult({
        correct: false,
        misconception: practice.misconception,
        analogy: practice.analogy,
        followUp: practice.followUp
      })
      setMastery(0)
      setStep('result')
    }
  }

  // Grade the simpler follow-up. Even getting this one right is a real
  // win, so we record it and bump mastery to 50%.
  function handleSubmitFollowUp(event) {
    event.preventDefault()
    const normalized = followUpAnswer.trim().toLowerCase()
    if (!normalized) return

    const correct = normalized === practice.followUp.correct.toLowerCase()
    record({
      subject: subject.name,
      concept: practice.concept,
      question: practice.followUp.question,
      answer: followUpAnswer,
      correct
    })
    setFollowUpResult({ correct })
    if (correct) setMastery(50)
  }

  function handleReset() {
    setStep('setup')
    setExplanation('')
    setAnswer('')
    setResult(null)
    setFollowUpAnswer('')
    setFollowUpResult(null)
    setMastery(0)
  }

  return (
    <section className="page study">
      <header className="study-header">
        <h1>Study</h1>
        <p className="study-sub">
          Pick a subject, ask for an explanation, then try a practice question.
        </p>
        <div className="gemma-badge">
          {gemmaStatus === 'local' && (
            <span className="badge ok">
              Gemma 4 running locally via Ollama · live explanations
            </span>
          )}
          {gemmaStatus === 'cloud' && (
            <span className="badge ok">
              Cloud Gemma 4 live · any topic · for the true offline build, run Ollama locally
            </span>
          )}
          {gemmaStatus === 'offline' && (
            <span className="badge dim">
              Running offline · teacher-validated explanations (run Ollama locally for any topic)
            </span>
          )}
        </div>
      </header>

      {step === 'setup' && (
        <form className="setup-form" onSubmit={handleExplain}>
          <label className="field">
            <span>Subject</span>
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Reading level</span>
            <select
              value={readingLevel}
              onChange={(event) => setReadingLevel(event.target.value)}
            >
              {READING_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>What do you want to learn?</span>
            <input
              type="text"
              value={conceptInput}
              onChange={(event) => setConceptInput(event.target.value)}
              placeholder="e.g. fractions"
            />
          </label>

          <button type="submit" className="primary" disabled={loadingExplanation}>
            {loadingExplanation ? 'Thinking…' : 'Explain it to me'}
          </button>
        </form>
      )}

      {step === 'explained' && (
        <div className="explanation-card">
          <p className="card-label">
            Explanation {usedGemma
              ? `· generated by Gemma 4 (${gemmaStatus})`
              : '· teacher-validated lesson'}
          </p>
          <div className="explanation-body">
            {explanation.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="row">
            <button onClick={handleStartPractice} className="primary">
              Try a practice question
            </button>
            <button onClick={handleReset} className="ghost">Pick something else</button>
          </div>
        </div>
      )}

      {step === 'answering' && (
        <form className="practice-card" onSubmit={handleSubmitAnswer}>
          <p className="card-label">Practice · {practice.concept}</p>
          <p className="practice-question">{practice.question}</p>
          <input
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer"
            autoFocus
          />
          <div className="row">
            <button type="submit" className="primary">Submit</button>
            <button type="button" onClick={handleReset} className="ghost">Start over</button>
          </div>
        </form>
      )}

      {step === 'result' && result && (
        <div className={`result-card ${result.correct ? 'good' : 'recover'}`}>
          {result.correct ? (
            <>
              <p className="card-label">Great work</p>
              <p className="result-body">{subject.successNote}</p>
              <MasteryBar percent={mastery} label="Mastery" />
              <div className="row">
                <button onClick={handleReset} className="primary">Study something else</button>
              </div>
            </>
          ) : (
            <>
              <p className="card-label">Not quite — let's look at why</p>
              <p className="misconception"><strong>Misconception:</strong> {result.misconception}</p>
              <p className="analogy"><strong>Think of it like this:</strong> {result.analogy}</p>

              {/* Simpler follow-up question to help the student recover. */}
              <form className="followup" onSubmit={handleSubmitFollowUp}>
                <p className="practice-question">{result.followUp.question}</p>
                <input
                  type="text"
                  value={followUpAnswer}
                  onChange={(event) => setFollowUpAnswer(event.target.value)}
                  placeholder="Try again"
                  autoFocus
                />
                <button type="submit" className="primary">Submit</button>
              </form>

              {followUpResult && (
                <p className={`followup-result ${followUpResult.correct ? 'good' : 'recover'}`}>
                  {followUpResult.correct
                    ? 'There it is — you worked through the misconception.'
                    : 'Still not quite. Re-read the analogy and give it one more try.'}
                </p>
              )}

              <MasteryBar percent={mastery} label="Mastery" />

              <div className="row">
                <button onClick={handleReset} className="ghost">Start over</button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
