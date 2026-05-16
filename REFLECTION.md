# Reflection

### 1. The most satisfying part

Honestly, the part that felt best was the moment the wrong-answer flow actually clicked. For a while I was treating "wrong answer" as just a red X and a number going down, which is what most quiz apps do. It bugged me because that isn't how a tutor would react. A real tutor would stop, name the thing you actually got mixed up on, give you an analogy, and let you try one more time without judgment.

Once I split the Study page into four states — setup, explained, answering, result — and added the "misconception → analogy → follow-up question" branch, the whole project started to feel like the thing I had in my head from day one instead of just a quiz app dressed up in nicer colors. Watching it run end to end the first time, with the explanation showing up, then the wrong answer being met with "lots of people mix that up because…" instead of just "incorrect," was the moment I actually believed the project was worth shipping.

### 2. If I had two more weeks, I would…

A few things, in order of how much I'd want them:

- **Hand-write more topics.** Right now there are three subjects with a handful of practice questions each. Two more weeks would let me sit down and write 20–30 solid topic entries per subject, with multiple practice questions and at least two misconception paths per question. The structure already supports that — it's just content work.
- **Voice input for younger kids.** A lot of the kids I'm imagining using this can read, but typing a topic into a search box is a real friction point for an eight-year-old. The Web Speech API would handle this in the browser without any backend changes.
- **A simple "teacher view."** A second route, maybe `/teacher`, that reads from the same localStorage history and shows where the student got stuck most often. The data is already being saved; it just isn't being summarized anywhere except the list on the History page.
- **Real Gemma streaming, not single-shot.** Right now the optional Gemma call waits for the whole response. Streaming the tokens would make the explanation feel alive instead of feeling like a loading spinner followed by a wall of text. The Ollama API supports it; I just didn't want to add the complexity in v1.

### 3. The most useful thing I learned in this class

Component thinking. I came into this writing one big file and reaching for global state for everything, which is how I'd been writing Python scripts for years. The thing that finally clicked was that a component is basically a small contract: it takes props in, it renders, it might own a little state, and that's it. Once I started designing in those terms, the file structure stopped feeling like a chore and started feeling like the thing that was keeping the project from collapsing under its own weight.

A close second is React Router. Before this class I'd been faking routes with conditional rendering and a giant switch statement on some `view` state variable, which works for about ten minutes and then breaks the back button and bookmarks. Seeing how `<Routes>`, `<Link>`, and `useSearchParams` fit together changed how I think about any multi-screen UI — the URL is part of the state, not a decoration on top of it.

— Chijioke Ifedili
