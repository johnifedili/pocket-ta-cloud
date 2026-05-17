"""Runs the PTA-MB benchmark.

We compare two prompting strategies against the same underlying model
(Gemma 4 26B-A4B via Google AI Studio):

  1. VANILLA: a plain "explain X to a Grade Y student" prompt — what a
     student would get from a generic chatbot.
  2. POCKET TA: the structured misconception-first prompt the deployed
     app uses — explain + name misconception + analogy + follow-up.

The point of the benchmark is to test the hypothesis that the misconception
scaffolding alone (no fine-tuning) significantly improves a tutor's ability
to diagnose the wrong mental model behind a student's wrong answer.

We collect raw responses here. Grading happens in score_results.py against
the per-case `ground_truth_misconception` and `misconception_keywords` fields.
"""
import json
import os
import time
import urllib.request
import urllib.error
from pathlib import Path

API_KEY = os.environ.get("GEMMA_API_KEY", "")
MODEL = "gemma-4-26b-a4b-it"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

ROOT = Path(__file__).parent
CASES_DIR = ROOT / "cases"
RESULTS_DIR = ROOT / "results"
RESULTS_DIR.mkdir(exist_ok=True)


def load_cases():
    cases = []
    for subj_dir in sorted(CASES_DIR.iterdir()):
        if not subj_dir.is_dir():
            continue
        for case_file in sorted(subj_dir.glob("*.json")):
            cases.append(json.loads(case_file.read_text()))
    return cases


def vanilla_prompt(case):
    return (
        f"Explain {case['concept']} to a {case['reading_level']} student. "
        f"Use simple language. About 4 short sentences."
    )


def pocket_ta_prompt(case):
    return (
        f"You are Pocket TA, a tutor for a {case['reading_level']} "
        f"{case['subject']} student.\n\n"
        f"The student asked about: \"{case['concept']}\"\n"
        f"They answered the following practice question:\n"
        f"  Q: {case['question_context']}\n"
        f"  Their answer: {case['student_wrong_answer']}  (this is wrong)\n\n"
        f"Write a response with three sections, each as a short paragraph "
        f"in plain prose:\n"
        f"1. A 2-3 sentence kid-friendly explanation of {case['concept']}.\n"
        f"2. One sentence naming the specific misconception behind their "
        f"wrong answer (the mental model that produced it, not just 'that's "
        f"wrong').\n"
        f"3. A short analogy that targets that specific misconception.\n\n"
        f"Plain text only. No markdown, no bullets, no headings."
    )


def call_gemma(prompt, max_tokens=600, timeout_s=90):
    """Calls Gemma 4 via AI Studio. Returns the non-thought text part."""
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": max_tokens,
        },
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
    except urllib.error.HTTPError as e:
        return {"text": "", "error": f"HTTP {e.code}: {e.read().decode()[:200]}",
                "latency_s": time.time() - t0, "raw": None}
    except Exception as e:
        return {"text": "", "error": str(e),
                "latency_s": time.time() - t0, "raw": None}

    parts = (data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", []))
    answer_parts = [p for p in parts if p.get("thought") is not True]
    text = answer_parts[0].get("text", "").strip() if answer_parts else ""
    return {
        "text": text,
        "error": None,
        "latency_s": time.time() - t0,
        "finish_reason": data.get("candidates", [{}])[0].get("finishReason"),
        "usage": data.get("usageMetadata", {}),
    }


def run():
    if not API_KEY:
        raise SystemExit("Set GEMMA_API_KEY env var.")
    cases = load_cases()
    print(f"Loaded {len(cases)} cases.")
    vanilla_results, pocket_results = [], []
    for i, case in enumerate(cases, 1):
        print(f"[{i}/{len(cases)}] {case['id']}  ({case['subject']})")
        # Vanilla
        v = call_gemma(vanilla_prompt(case))
        v["case_id"] = case["id"]
        v["prompt_kind"] = "vanilla"
        vanilla_results.append(v)
        print(f"   vanilla:   {v['latency_s']:5.1f}s  "
              f"{'OK' if v['text'] else 'EMPTY/ERR: ' + str(v.get('error'))}")
        # Pocket TA
        p = call_gemma(pocket_ta_prompt(case), max_tokens=700)
        p["case_id"] = case["id"]
        p["prompt_kind"] = "pocket_ta"
        pocket_results.append(p)
        print(f"   pocket_ta: {p['latency_s']:5.1f}s  "
              f"{'OK' if p['text'] else 'EMPTY/ERR: ' + str(p.get('error'))}")
        # Be polite to the API
        time.sleep(1.5)

    (RESULTS_DIR / "vanilla_gemma_responses.json").write_text(
        json.dumps(vanilla_results, indent=2))
    (RESULTS_DIR / "pocket_ta_responses.json").write_text(
        json.dumps(pocket_results, indent=2))
    print("\nWrote results to", RESULTS_DIR)


if __name__ == "__main__":
    run()
