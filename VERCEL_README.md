# Pocket TA — Cloud Demo (Vercel)

This is the **instant cloud demo** variant of Pocket TA. It is the same React app and the same Gemma 4 model as the offline-first build, deployed to Vercel so any judge can click a link and get a real model response in their browser.

## Two-tab presentation

Pocket TA ships in two flavors, both included in the hackathon submission:

| Build | URL | Inference path | What it proves |
|---|---|---|---|
| **Cloud demo** (this repo) | `pocket-ta-cloud.vercel.app` | Gemma 4 26B-A4B via Google AI Studio, proxied through a Vercel serverless function (60s ceiling) | A judge with zero setup can experience the diagnostic-tutor loop end to end |
| **Offline-first build** ([main repo](https://github.com/chijiokeifedili/pocket-ta)) | `teal-bavarois-1cb95a.netlify.app` | Gemma 4 via local Ollama on the student's laptop | The real production story: no internet, no subscription, no data leaving the device |

Both call the same model family. The Vercel build exists so the judge experience is reliable; the Ollama build is what an actual student in Maya's household would run.

## Why two deploys instead of one

Netlify free-tier sync functions cap at 10 seconds. Gemma 4 26B-A4B is a reasoning model and the four-field tool-schema output (`misconception_name`, `analogy`, `next_question`, `mastery_signal`) typically takes 9-12 seconds end to end. That puts the Netlify path right at the cliff edge. Vercel Hobby allows 60 seconds, which fits the response budget comfortably.

The bottleneck is the serverless host, not the model. Ollama sidesteps the problem entirely by moving inference next to the student.

## Local development

```bash
npm install
npm run dev
```

Set `GEMMA_API_KEY` in `.env.local` if you want the `/api/gemma` function to work locally. Without it, the app falls back to local Ollama or hand-validated offline explanations.

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Then set the env var in the dashboard: `GEMMA_API_KEY` = your Google AI Studio key (Gemma access).

## File layout

- `api/gemma.js` — Vercel serverless function (the only difference from the offline-first build)
- `src/lib/gemma.js` — three-tier fallback: cloud → local Ollama → curated offline explanations
- `vercel.json` — build config and SPA rewrites
- `src/` — everything else, identical to the offline-first build
