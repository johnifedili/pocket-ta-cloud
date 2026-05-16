// The top-level App component holds the navigation bar and the route table.
// Each page is its own component file under src/pages/ so the code stays
// easy to follow.

import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Study from './pages/Study.jsx'
import History from './pages/History.jsx'
import About from './pages/About.jsx'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="logo-dot" />
          <span className="brand-name">Pocket TA</span>
          <span className="brand-tag">your pocket teaching assistant</span>
        </div>

        {/* Navigation uses NavLink so the active route gets highlighted. */}
        <nav className="app-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/study">Study</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>

      <div className="deploy-banner">
        <span className="deploy-banner-tag">Cloud demo</span>
        <span className="deploy-banner-text">
          You are on the instant cloud build. The offline-first build runs Gemma 4 locally through Ollama — see the GitHub README for the two-command setup.
        </span>
      </div>

      <main className="app-main">
        {/* React Router decides which page to render based on the URL. */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/study" element={<Study />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
          {/* Fallback for any unknown URL. */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <small>Built by Chijioke Ifedili · React + Vite · cloud demo on Vercel · also runs fully offline with Ollama</small>
      </footer>
    </div>
  )
}

export default App
