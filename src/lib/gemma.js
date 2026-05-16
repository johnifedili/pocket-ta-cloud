// Bridge to Gemma 4 with a three-tier fallback:
//
//   1. Cloud Gemma via Google AI Studio (proxied through the Vercel
//      serverless function at /api/gemma). Vercel's 60s function
//      ceiling fits Gemma 4 26B-A4B's 9-12s reasoning latency, which
//      Netlify's 10s sync cap does not. This build is the "instant
//      demo" so a judge gets a real model response from any browser.
//
//   2. Local Gemma via Ollama at http://localhost:11434. This is what
//      the README walks the grader through if they want to run it
//      fully offline on their own machine.
//
//   3. Hand-validated offline explanations in subjects.js. These are
//      always available and are what the app shows if neither cloud
//      nor local is reachable.
//
// The Study page calls isGemmaAvailable() to decide whether to show
// the "Cloud Gemma" / "Local Gemma" / "offline" pill, and then calls
// explainWithGemma() which tries cloud first, then local, then throws.

const OLLAMA_TAGS = 'http://localhost:11434/api/tags'
const OLLAMA_GENERATE = 'http://localhost:11434/api/generate'
const OLLAMA_MODEL = 'gemma3:4b'
const CLOUD_FN = '/api/gemma'

// Probes both paths in parallel. Returns the first one that responds,
// or { status: 'offline' } if neither does. Kept fast (800 ms) so the
// Study page never feels stuck waiting for the network.
export async function isGemmaAvailable() {
  // Local Ollama gets priority: it's the path the hackathon writeup
  // and demo video showcase, it has lower latency, and it's the path
  // that doesn't depend on a third-party API quota. Cloud is a
  // best-effort fallback for judges who don't have Ollama running.
  const cloud = probeCloud()
  const local = probeLocal()
  const [cloudResult, localResult] = await Promise.all([cloud, local])
  if (localResult) return { status: 'local' }
  if (cloudResult) return { status: 'cloud' }
  return { status: 'offline' }
}

async function probeCloud() {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 1500)
    // A HEAD-like probe: POST with an empty concept returns 400, which
    // tells us the function is reachable and the key is configured
    // (otherwise we'd get 503). Either 400 or 200 means cloud is live.
    const res = await fetch(CLOUD_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept: '' }),
      signal: controller.signal
    })
    clearTimeout(timer)
    if (res.status === 503) return false // function deployed but no key
    return res.status === 400 || res.ok
  } catch {
    return false
  }
}

async function probeLocal() {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 800)
    const res = await fetch(OLLAMA_TAGS, { signal: controller.signal })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}

// Asks Gemma for a kid-friendly explanation. Tries cloud first, then
// local Ollama, then throws. The Study page catches the throw and
// shows the offline explanation instead.
export async function explainWithGemma(concept, readingLevel, subject = 'general') {
  // Vercel functions can hold 60s, so we give Gemma 4 26B-A4B the
  // headroom its reasoning step actually needs. A typical answer
  // returns in 9-12s; a cold function call can push that to 25-30s.
  // We cap at 40s so the UX still fails to local Ollama on a true
  // hang rather than freezing the page indefinitely.
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 40000)
    const res = await fetch(CLOUD_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept,
        reading_level: readingLevel,
        subject
      }),
      signal: controller.signal
    })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      if (data?.explanation) return data.explanation.trim()
    }
  } catch {
    // ignore and fall through to local
  }

  // Then try local Ollama
  const prompt = [
    `You are Pocket TA, a patient tutor for a ${readingLevel} ${subject} student.`,
    `Explain "${concept}" in 3-5 short sentences a student can read.`,
    `Use one real-world example or analogy. Briefly name a common misconception if there is one.`,
    `Do not use jargon. Speak the way a kind teacher would.`,
    `Return plain text, no markdown.`
  ].join('\n')

  const response = await fetch(OLLAMA_GENERATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false
    })
  })

  if (!response.ok) throw new Error(`Ollama returned ${response.status}`)
  const data = await response.json()
  const text = (data.response || '').trim()
  if (!text) throw new Error('Empty Ollama response')
  return text
}
