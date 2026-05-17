# Pocket TA Misconception Benchmark (PTA-MB) v1

A small, hand-built benchmark that asks one question: **does an LLM tutor name the specific wrong mental model a student is using, or does it just hand them the right answer?**

This benchmark was built alongside [Pocket TA](https://github.com/johnifedili/pocket-ta-cloud) for the Kaggle Gemma 4 Good Hackathon. It is intentionally small (N=20 cases) and single-rater so that every case could be hand-graded against rubric definitions drawn from misconception-pedagogy and clinical-reasoning literature. A two-rater v2 with N=200 is the obvious next step and is on the roadmap.

## What the benchmark measures

For each case, we record three things about a tutor's response:

1. **Misconception identification (binary)** — Did the tutor name the specific wrong mental model the student was using, or did it give a generic "you're wrong because…"? Scored against a labeled ground-truth misconception per case.
2. **Analogy quality (0–2)** — Does the analogy target *that specific* misconception (2), the subject generally (1), or feel pasted in (0)?
3. **Follow-up validity (binary)** — Does the follow-up question re-test the *same* mental model in a *different* surface form?

Two graders were used: (a) keyword-anchored automated scoring in `score_results.py`, and (b) an LLM judge (`llm_judge.py`) given the rubric and the labeled ground-truth misconception per case. We report the LLM-judge numbers as the headline; the keyword-anchored numbers are reported alongside in `results/scored_results.csv` for transparency.

## Results (N=20)

LLM-judge scoring, Pocket TA vs vanilla Gemma 4 on the same underlying model:

| Metric                          | Vanilla Gemma | Pocket TA |
|---------------------------------|--------------:|----------:|
| Misconception named             |           5%  |     100%  |
| Analogy quality (0–2 mean)      |          0.55 |     1.95  |
| Follow-up validity              |          20%  |     100%  |

Raw judge output is in [`results/llm_judge_scores.csv`](results/llm_judge_scores.csv) and aggregated in [`results/llm_judge_summary.json`](results/llm_judge_summary.json).

### Honest limits on these numbers

- N=20 is small. Treat these as effect-size estimates, not confidence intervals.
- One human rater (the author), with LLM-judge as a second pass. No blinded second human.
- Both systems run on the same model. The contrast measures *prompt scaffolding*, not model quality.
- All cases are elementary-school subject matter. Generalization to older students is untested.

## Folder layout

```
pocket-ta-eval/
├── README.md                       (this file)
├── build_cases.py                  generates the 20 labeled cases
├── run_benchmark.py                runs both prompt strategies on every case
├── score_results.py                keyword-anchored auto-scoring
├── llm_judge.py                    LLM-judge scoring against the rubric
├── retry_timeouts.py               re-runs any cases that timed out
├── cases/                          one JSON file per case
│   ├── math/      (7 cases)
│   ├── reading/   (6 cases)
│   └── science/   (7 cases)
└── results/
    ├── pocket_ta_responses.json    raw Pocket TA responses
    ├── vanilla_gemma_responses.json raw vanilla responses
    ├── scored_results.csv          per-case keyword-anchored grades
    ├── summary.json                aggregate keyword-anchored metrics
    ├── llm_judge_scores.csv        per-case LLM-judge grades
    └── llm_judge_summary.json      aggregate LLM-judge metrics
```

## How to reproduce

```bash
# 1. Install
pip install -r requirements.txt  # standard library + nothing exotic

# 2. Set your API key (Google AI Studio, free tier is fine for 40 calls)
export GEMMA_API_KEY=your_key_here

# 3. Re-run the benchmark
python run_benchmark.py            # 20 cases × 2 prompts ≈ 40 calls
python score_results.py            # keyword-anchored scoring
python llm_judge.py                # LLM-judge scoring
```

The benchmark is deterministic with respect to the cases (loaded from `cases/`); generation is at temperature 0 in `run_benchmark.py` so re-runs should match closely.

### Reproducing locally with Ollama

If you'd rather run everything on-device (the whole point of Pocket TA), point `run_benchmark.py` at a local Ollama instance:

```bash
ollama pull gemma3:4b
ollama serve
# then edit ENDPOINT in run_benchmark.py to http://localhost:11434/api/generate
```

The case set and rubric are identical; numbers will shift a few points because the 4B local model is smaller than the hosted 26B used in our headline run.

## License

CC-BY 4.0. If you use PTA-MB in your own research, please cite:

> Ifedili, C. (2026). *Pocket TA Misconception Benchmark (PTA-MB) v1.* Kaggle Gemma 4 Good Hackathon. Available at https://github.com/johnifedili/pocket-ta-cloud/tree/main/pocket-ta-eval

## Roadmap

- v2 with N≥200 cases across math, reading, science, and social studies
- Two-rater inter-annotator agreement (Cohen's κ) on the binary fields
- Blinded human evaluation alongside the LLM judge
- Cases authored by classroom teachers rather than the system author
