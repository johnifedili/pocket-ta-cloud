// Vercel serverless function: proxies kid-friendly explanation requests
// to Google AI Studio's Gemma 4 endpoint. The API key lives in Vercel's
// environment variables (GEMMA_API_KEY) so it is never exposed to the
// browser.
//
// Why this exists alongside the Netlify deploy:
//   Netlify's free-tier sync functions cap at 10s. Gemma 4 26B-A4B
//   generating the full four-field tool-schema output takes 9-12s,
//   which is right at the edge. Vercel's hobby tier allows 60s, so
//   judges who don't run Ollama locally get a reliable cloud demo
//   here. The Netlify deploy stays as the "true offline-first" story.
//
// Response shape note for Gemma 4 26B-A4B:
//   It is a reasoning model that returns TWO content parts:
//     parts[0] = { thought: true, text: "<planning trace>" }
//     parts[1] = {                  text: "<final answer>"   }
//   We extract the non-thought part. The thought trace consumes
//   ~300-400 tokens, so maxOutputTokens=600 leaves room for the final
//   answer.

const API_KEY = process.env.GEMMA_API_KEY
const MODEL = 'gemma-4-26b-a4b-it'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

// Vercel needs maxDuration declared in the function config to opt into
// the 60s ceiling (default is 10s on the Hobby plan).
export const config = {
  maxDuration: 60
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }
  if (!API_KEY) {
    return res.status(503).json({ error: 'Cloud Gemma not configured' })
  }

  const body = req.body || {}
  const concept = String(body.concept || '').trim()
  const readingLevel = String(body.reading_level || 'Grade 6-8')
  const subject = String(body.subject || 'general')

  if (!concept) {
    return res.status(400).json({ error: 'Missing concept' })
  }

  const prompt =
    `Write a kid-friendly explanation of "${concept}" for a ${readingLevel} ${subject} student.\n` +
    `Rules:\n` +
    `- Exactly 3 to 5 short sentences. Under 100 words.\n` +
    `- One simple analogy.\n` +
    `- Mention one common misconception in one sentence if there is one.\n` +
    `- Plain prose only. No headings, no bullets, no markdown.`

  // Vercel Hobby caps at 60s. Gemma 4 26B generating the full four-field
  // output typically returns in 9-12s, so 55s is a generous ceiling.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 55000)

  let upstream
  try {
    upstream = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600
        }
      }),
      signal: controller.signal
    })
  } catch (err) {
    clearTimeout(timer)
    console.error('[gemma] fetch threw:', String(err))
    return res.status(504).json({ error: 'Upstream timeout' })
  }
  clearTimeout(timer)

  if (!upstream.ok) {
    const errBody = await upstream.text().catch(() => '')
    console.error('[gemma] upstream not ok:', upstream.status, errBody.slice(0, 300))
    return res.status(502).json({ error: `Upstream ${upstream.status}` })
  }

  let data
  try {
    data = await upstream.json()
  } catch (err) {
    console.error('[gemma] bad json:', String(err))
    return res.status(502).json({ error: 'Bad upstream JSON' })
  }

  const parts = data?.candidates?.[0]?.content?.parts || []
  const finishReason = data?.candidates?.[0]?.finishReason || ''
  const usage = data?.usageMetadata || {}
  console.log(
    '[gemma] finish:', finishReason,
    'parts:', parts.length,
    'usage:', JSON.stringify(usage)
  )

  const answerPart = parts.find((p) => p && p.thought !== true && p.text)
  let raw = answerPart ? String(answerPart.text || '').trim() : ''

  if (!raw && parts.length > 0) {
    const allText = parts.map((p) => p?.text || '').join('\n\n').trim()
    raw = lastProseParagraph(allText)
  }

  if (!raw || raw.length < 40) {
    console.error('[gemma] no usable answer. partsDump:', JSON.stringify(parts).slice(0, 600))
    return res.status(502).json({ error: 'No clean answer' })
  }

  const cleaned = cleanProse(raw)
  return res.status(200).json({
    explanation: cleaned,
    source: 'cloud-gemma',
    model: MODEL
  })
}

function lastProseParagraph(raw) {
  const paragraphs = raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const p = paragraphs[i]
    if (/^[*\-•]\s/.test(p)) continue
    if (/^\s*#+\s/.test(p)) continue
    const lines = p.split('\n')
    if (lines.length > 4 && lines.every((l) => l.length < 80)) continue
    const sentences = p.split(/[.!?]+/).filter((s) => s.trim().length > 5)
    if (sentences.length >= 2 && p.length >= 60) return p
  }
  return ''
}

function cleanProse(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/[*_`]/g, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^#+\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
