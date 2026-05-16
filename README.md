# Pocket TA

A small single-page web app that acts like a patient teaching assistant for kids. The student picks a subject, types a topic they are stuck on, picks a reading level, gets a kid-friendly explanation, then tries a practice question. If they miss it, the app explains the common misconception, walks through an analogy, and gives them one more try at a follow-up question. Everything they do is saved to the browser so they can see their own progress on a History page.

Built with React + Vite. No backend required — it runs entirely in the browser. There is an optional integration with a local Gemma model (via Ollama) for richer explanations if the grader happens to have it installed.

---

## How to run it

You need Node.js 18 or newer. Anything in the LTS range works.

```bash
npm install
npm run dev
```

That will start the dev server at `http://localhost:5173`. Open that URL in any modern browser (tested in Chrome and Safari).

To build a production bundle:

```bash
npm run build
npm run preview
```

`npm run preview` serves the built bundle at `http://localhost:4173` so you can confirm the production build works too.

---

## What you'll see

- **Home** — a short hero blurb and three subject cards (Math, Science, Reading). Click one to start studying.
- **Study** — pick a subject from a dropdown, type in what you want help with, pick a reading level, and hit "Explain it to me." A practice question follows. If you get it wrong, you get the misconception + an analogy + a follow-up question. Your result is saved to history.
- **History** — every practice attempt, oldest at the bottom, with subject, reading level, accuracy, and timestamp. There's a "Clear history" button (with a confirm dialog) if you want a fresh start.
- **About** — a short walkthrough of what the project is and where each piece of code lives, so you don't have to dig through the source to grade it.

---

## Optional: Gemma via Ollama

The app works fully without any model. The built-in explanation library has hand-written kid-friendly explanations for the included topics, and the practice questions are baked into `src/lib/subjects.js`.

If you want to see the optional model integration, install Ollama and pull a small Gemma model:

```bash
# install Ollama from https://ollama.com
ollama pull gemma3:4b
ollama serve
```

Then refresh the app. On the Study page you should see a small green pill that says **"Gemma connected"** instead of **"Gemma offline — using built-in explanations."** When connected, the "Explain it to me" button will hit `http://localhost:11434/api/generate` to get a fresh explanation written by the model. If anything fails (timeout, model not pulled, port blocked), the app falls back to the built-in explanation without breaking. The check has an 800 ms timeout so it won't hang the page even if Ollama is down.

Source for the bridge: `src/lib/gemma.js`.

---

## File map (the short version)

```
pocket-ta-class/
├── index.html              # Vite entry
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx            # React mount + <BrowserRouter>
│   ├── App.jsx             # nav + <Routes>
│   ├── styles.css          # everything visual lives here
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Study.jsx       # the main flow
│   │   ├── History.jsx
│   │   └── About.jsx
│   ├── components/
│   │   ├── SubjectCard.jsx
│   │   └── MasteryBar.jsx
│   ├── hooks/
│   │   └── useLocalHistory.js   # custom hook
│   └── lib/
│       ├── subjects.js     # the SUBJECTS array (data)
│       ├── storage.js      # localStorage wrapper
│       └── gemma.js        # optional Ollama bridge
```

See `REQUIREMENTS_CHECKLIST.md` for a line-by-line mapping of the assignment rubric to specific files.

---

## Notes for the grader

- The app uses React Router 6, so the nav links and the subject cards both route through `<Link>` / `<NavLink>` and `<Routes>`. If you visit `/study?subject=math` directly, the page reads the URL param with `useSearchParams` and pre-selects the subject.
- History is capped at the last 100 attempts so localStorage doesn't grow forever.
- The Reflection answers are in `REFLECTION.md`.

— Chijioke Ifedili
