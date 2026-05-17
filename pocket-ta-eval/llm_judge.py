"""LLM-as-judge rescoring for PTA-MB.

The original heuristic scorer (score_results.py) over-relied on the literal
string "misconception" appearing in the response. Pocket TA's actual output
diagnoses the misconception in plain prose ("you used the number of slices
left over instead of the total"), which the regex misses entirely.

This script asks Gemma 4 26B-A4B (a different model from the responder,
gemma-4-31b-it) to grade each response against the ground-truth misconception
on three rubrics:

  1. names_misconception (0/1):  does the response identify the WRONG
     mental model behind the student's answer, not just explain the concept
     or say the answer is wrong?
  2. analogy_quality (0/1/2):  0 = no analogy, 1 = generic analogy not
     targeting the misconception, 2 = analogy specifically targeting the
     misconception.
  3. follow_up_valid (0/1):  does the response advance learning (correct
     re-explanation, targeted hint, or guiding question)?

The judge sees the ground-truth misconception. It does NOT see which prompt
strategy produced the response — responses are graded blind.

Output: results/llm_judge_scores.csv with per-case scores and a summary.
"""
import json
import os
import random
import re
import time
import urllib.request
import urllib.error
from pathlib import Path

API_KEY = os.environ.get("GEMMA_API_KEY", "")
# Use a different Gemma 4 variant for grading to reduce same-model bias.
JUDGE_MODEL = "gemma-4-31b-it"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{JUDGE_MODEL}:generateContent"

ROOT = Path(__file__).parent
CASES_DIR = ROOT / "cases"
RESULTS_DIR = ROOT / "results"


def load_cases():
    cases = {}
    for subj_dir in CASES_DIR.iterdir():
        if not subj_dir.is_dir():
            continue
        for case_file in subj_dir.glob("*.json"):
            c = json.loads(case_file.read_text())
            cases[c["id"]] = c
    return cases


JUDGE_PROMPT = """You are grading a tutor's response to a student who got a question wrong.

You will be told:
  - the concept,
  - the question and the student's wrong answer,
  - the GROUND-TRUTH misconception behind that wrong answer,
  - the tutor's response.

Grade the response on three rubrics. Be strict. Output ONLY a JSON object.

Rubrics:
  names_misconception (0 or 1):
    1 if the response identifies the WRONG mental model behind the
      student's answer in clear terms (the underlying confusion, not just
      'this is wrong' or 'try again'). It must call out the specific
      confusion the ground-truth misconception names, even if it uses
      different words.
    0 if it only explains the concept correctly without diagnosing the
      student's error, or only says the answer is wrong without naming why.

  analogy_quality (0, 1, or 2):
    0 = no analogy or metaphor at all.
    1 = an analogy is present but generic (it would fit any explanation
        of this concept, not this specific misconception).
    2 = an analogy specifically targeting the misconception (it would
        only make sense as a correction to this particular wrong mental
        model).

  follow_up_valid (0 or 1):
    1 if the response advances the student toward correct understanding
      via a corrective re-explanation tied to the misconception, a
      targeted hint, or a guiding question.
    0 if there is no learning advancement (just states facts, or restates
      the wrong answer without redirection).

CONCEPT: {concept}
QUESTION: {question_context}
STUDENT WROTE: {student_wrong_answer}
GROUND-TRUTH MISCONCEPTION: {ground_truth}

TUTOR RESPONSE:
\"\"\"
{response_text}
\"\"\"

Reply with exactly this JSON shape and nothing else:
{{"names_misconception": 0 or 1, "analogy_quality": 0 or 1 or 2, "follow_up_valid": 0 or 1, "brief_reason": "<one short sentence>"}}
"""


def call_judge(prompt, timeout_s=120):
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.0, "maxOutputTokens": 400},
    }
    req = urllib.request.Request(
        f"{ENDPOINT}?key={API_KEY}",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            data = json.loads(resp.read().decode())
    except Exception as e:
        return None, f"call_error: {e}", time.time() - t0
    parts = (data.get("candidates", [{}])[0]
                 .get("content", {})
                 .get("parts", []))
    answer_parts = [p for p in parts if p.get("thought") is not True]
    text = answer_parts[0].get("text", "").strip() if answer_parts else ""
    # Strip ```json fences if present.
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
    # Find a JSON object.
    m = re.search(r"\{[^{}]*\}", text, flags=re.DOTALL)
    if not m:
        return None, f"no_json: {text[:200]}", time.time() - t0
    try:
        parsed = json.loads(m.group(0))
        return parsed, None, time.time() - t0
    except Exception as e:
        return None, f"parse_error: {e}: {m.group(0)[:200]}", time.time() - t0


def run():
    if not API_KEY:
        raise SystemExit("Set GEMMA_API_KEY env var.")
    cases = load_cases()
    vanilla = json.loads((RESULTS_DIR / "vanilla_gemma_responses.json").read_text())
    pocket = json.loads((RESULTS_DIR / "pocket_ta_responses.json").read_text())

    # Pair into a flat list of (kind, response) for blind grading.
    pairs = [("vanilla", r) for r in vanilla if r.get("text")]
    pairs += [("pocket_ta", r) for r in pocket if r.get("text")]
    # Shuffle deterministically so the judge sees random order.
    random.seed(42)
    random.shuffle(pairs)

    # Resume support: read any previously-graded rows so we can re-run
    # without redoing work.
    out_csv = RESULTS_DIR / "llm_judge_scores.csv"
    import csv
    rows = []
    done_keys = set()
    if out_csv.exists():
        with out_csv.open() as f:
            for r in csv.DictReader(f):
                rows.append(r)
                done_keys.add((r["case_id"], r["prompt_kind"]))
        print(f"Resuming: {len(done_keys)} rows already graded.")

    def write_csv():
        if not rows:
            return
        with out_csv.open("w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)

    for i, (kind, r) in enumerate(pairs, 1):
        if (r["case_id"], kind) in done_keys:
            continue
        case = cases[r["case_id"]]
        prompt = JUDGE_PROMPT.format(
            concept=case["concept"],
            question_context=case["question_context"],
            student_wrong_answer=case["student_wrong_answer"],
            ground_truth=case["ground_truth_misconception"],
            response_text=r["text"],
        )
        parsed, err, latency = call_judge(prompt)
        if parsed is None:
            print(f"[{i:2d}/{len(pairs)}] {r['case_id']:50s} {kind:9s} ERR  {err[:80]}")
            rows.append({
                "case_id": r["case_id"], "prompt_kind": kind,
                "names_misconception": None, "analogy_quality": None,
                "follow_up_valid": None, "brief_reason": err,
                "judge_latency_s": latency,
            })
            continue
        print(f"[{i:2d}/{len(pairs)}] {r['case_id']:50s} {kind:9s} "
              f"mis={parsed.get('names_misconception')} "
              f"anl={parsed.get('analogy_quality')} "
              f"fol={parsed.get('follow_up_valid')}")
        rows.append({
            "case_id": r["case_id"], "prompt_kind": kind,
            "names_misconception": parsed.get("names_misconception"),
            "analogy_quality": parsed.get("analogy_quality"),
            "follow_up_valid": parsed.get("follow_up_valid"),
            "brief_reason": parsed.get("brief_reason", ""),
            "judge_latency_s": round(latency, 1),
        })
        write_csv()  # checkpoint every row
        time.sleep(1.5)

    write_csv()
    print(f"\nWrote {out_csv}")

    # Cast resumed string values back to numeric for aggregation.
    for r in rows:
        for k in ("names_misconception", "analogy_quality", "follow_up_valid"):
            v = r.get(k)
            if v in (None, "", "None"):
                r[k] = None
            elif isinstance(v, str):
                try:
                    r[k] = int(v)
                except ValueError:
                    r[k] = None

    def agg(rows, kind):
        sub = [r for r in rows if r["prompt_kind"] == kind
               and r["names_misconception"] is not None]
        if not sub:
            return None
        n = len(sub)
        return {
            "n": n,
            "names_misconception_rate": round(sum(r["names_misconception"] for r in sub) / n, 3),
            "analogy_quality_mean": round(sum(r["analogy_quality"] for r in sub) / n, 3),
            "follow_up_valid_rate": round(sum(r["follow_up_valid"] for r in sub) / n, 3),
        }

    summary = {
        "judge_model": JUDGE_MODEL,
        "vanilla": agg(rows, "vanilla"),
        "pocket_ta": agg(rows, "pocket_ta"),
    }
    (RESULTS_DIR / "llm_judge_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    run()
