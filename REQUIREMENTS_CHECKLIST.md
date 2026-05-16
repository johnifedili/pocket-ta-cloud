# Requirements Checklist

This is a direct mapping from the assignment rubric to the code, so it's quick to grade.

| # | Requirement | Where it lives | Notes |
|---|---|---|---|
| 1 | **Array** | `src/lib/subjects.js` → `SUBJECTS` (top of file); also `READING_LEVELS` in `src/pages/Study.jsx`; and the `history` state in `src/hooks/useLocalHistory.js` | `SUBJECTS` is mapped over in `Home.jsx` to render cards. |
| 2 | **React JSX syntax** | Every `.jsx` file in `src/` | `App.jsx`, all pages, both components. |
| 3 | **Form elements** | `src/pages/Study.jsx` — the setup `<form>` uses `<select>` (subject), `<input type="text">` (topic), and another `<select>` (reading level). The practice phase uses radio `<input>` elements. The follow-up phase uses a text `<input>`. | All inputs are controlled components. |
| 4 | **Interactive events** | `onSubmit` on the setup form (`Study.jsx`), `onChange` on every input/select, `onClick` on the answer buttons and the "Clear history" button (`History.jsx`), `onClick` on the "Try the follow-up" button. | |
| 5 | **React component** | `src/components/SubjectCard.jsx`, `src/components/MasteryBar.jsx`, all page components in `src/pages/`, and `App.jsx`. | `SubjectCard` and `MasteryBar` are reusable presentational components. |
| 6 | **React module** | Every file uses ES6 `import` / `export`. Non-component modules: `src/lib/subjects.js`, `src/lib/storage.js`, `src/lib/gemma.js`. | The data, storage, and API layers are separated from the UI. |
| 7 | **At least one React Hook** | `useState` (used in `Study.jsx`, `History.jsx`), `useEffect` (Gemma availability check in `Study.jsx`), `useCallback` (in the custom hook), `useSearchParams` (`Study.jsx`), plus a **custom hook** `useLocalHistory` in `src/hooks/useLocalHistory.js`. | Custom hook composes `useState` + `useCallback` and is consumed by both `Study.jsx` and `History.jsx`. |
| 8 | **API access OR storage** | **Both.** Storage: `src/lib/storage.js` reads/writes `localStorage` under the key `pocket_ta_history_v1`. API: `src/lib/gemma.js` fetches `http://localhost:11434/api/generate` and `/api/tags` when Ollama is running locally. | Either one alone satisfies the rubric; both are wired in. |
| 9 | **React Routes** | `src/App.jsx` declares `<Routes>` with paths `/`, `/study`, `/history`, `/about`, and a catch-all that redirects home. Navigation uses `<NavLink>` for the top nav and `<Link>` inside `SubjectCard`. | `BrowserRouter` is set up in `src/main.jsx`. |

---

## Quick file index

```
src/App.jsx                    Routes + nav
src/main.jsx                   BrowserRouter wrap
src/pages/Home.jsx             SUBJECTS.map → cards
src/pages/Study.jsx            Form, hooks, useSearchParams, API call
src/pages/History.jsx          List, clear button, custom hook
src/pages/About.jsx            Walkthrough
src/components/SubjectCard.jsx Component used by Home
src/components/MasteryBar.jsx  Component used by History
src/hooks/useLocalHistory.js   Custom hook
src/lib/subjects.js            Data (array)
src/lib/storage.js             localStorage wrapper
src/lib/gemma.js               Optional API bridge
```

If any of the above is unclear, `About.jsx` (the in-app About page) also explains where each piece lives, in plain English.
