// A small custom hook that ties the History page to localStorage.
//
// On first render it reads what is already saved. The `record` function
// it returns appends a new attempt, persists it, and updates the React
// state so any component using this hook re-renders right away.
//
// Custom hooks live in their own file because they get reused — the
// Study page uses this to record an attempt, the History page uses it
// to list everything that has been recorded.

import { useState, useCallback } from 'react'
import { loadHistory, saveAttempt, clearHistory } from '../lib/storage.js'

export default function useLocalHistory() {
  // useState seeds React with whatever was already in localStorage.
  const [history, setHistory] = useState(() => loadHistory())

  // useCallback so child components that take this function as a prop
  // do not re-render every time the parent re-renders.
  const record = useCallback((attempt) => {
    const next = saveAttempt({
      ...attempt,
      timestamp: new Date().toISOString()
    })
    setHistory(next)
  }, [])

  const reset = useCallback(() => {
    clearHistory()
    setHistory([])
  }, [])

  return { history, record, reset }
}
