// Tiny wrapper around window.localStorage so the rest of the app does not
// have to deal with JSON parsing or missing keys. I kept these as plain
// functions instead of a class because they only need to do two things.
//
// All practice attempts are stored under one key as an array; that makes
// the History page a single read.

const HISTORY_KEY = 'pocket_ta_history_v1'

// Read the whole history array. If nothing has been stored yet, or the
// stored value is somehow not an array, return an empty array so the
// caller can rely on a stable shape.
export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    // If localStorage is disabled (private browsing in some browsers) or
    // the JSON is corrupted, the app should still keep working — just
    // without persistence.
    console.warn('Could not load history:', error)
    return []
  }
}

// Append a new attempt to the existing history and write the whole array
// back. I cap the array at 100 entries so the browser does not fill up
// over time.
export function saveAttempt(attempt) {
  const history = loadHistory()
  const next = [attempt, ...history].slice(0, 100)
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch (error) {
    console.warn('Could not save attempt:', error)
  }
  return next
}

// Wipes the saved history. The History page uses this with a confirm()
// prompt so a stray click does not nuke a student's progress.
export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.warn('Could not clear history:', error)
  }
}
