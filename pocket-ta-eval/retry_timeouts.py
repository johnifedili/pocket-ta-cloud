"""Retries the 6 pocket_ta cases that timed out in the first run.

Same prompt, same model, longer timeout (180s instead of 90s).
The original timeout was tuned for vanilla calls; pocket_ta prompts produce
longer thought-token streams from Gemma 4 26B and need more headroom.

Merges retried responses back into pocket_ta_responses.json.
"""
import json
import time
from pathlib import Path

from run_benchmark import call_gemma, load_cases, pocket_ta_prompt

ROOT = Path(__file__).parent
RESULTS = ROOT / "results" / "pocket_ta_responses.json"

# Cases that timed out in the first run.
TIMED_OUT = {
    "math-02-multiplication-additive",
    "math-07-percent-bigger-than-100",
    "read-02-synonym-antonym-confusion",
    "read-04-author-purpose-only-entertain",
    "read-05-inference-literal",
    "sci-05-electricity-current-used-up",
}


def run():
    cases = {c["id"]: c for c in load_cases()}
    existing = json.loads(RESULTS.read_text())
    by_id = {r["case_id"]: r for r in existing}

    for i, case_id in enumerate(sorted(TIMED_OUT), 1):
        case = cases[case_id]
        print(f"[{i}/{len(TIMED_OUT)}] retrying {case_id}")
        r = call_gemma(pocket_ta_prompt(case), max_tokens=700, timeout_s=180)
        r["case_id"] = case_id
        r["prompt_kind"] = "pocket_ta"
        r["retried"] = True
        status = "OK" if r["text"] else f"EMPTY/ERR: {r.get('error')}"
        print(f"   {r['latency_s']:5.1f}s  {status}")
        by_id[case_id] = r
        time.sleep(2)

    # Preserve original order.
    ordered_ids = [r["case_id"] for r in existing]
    merged = [by_id[i] for i in ordered_ids]
    RESULTS.write_text(json.dumps(merged, indent=2))
    print(f"\nUpdated {RESULTS}")
    succeeded = sum(1 for r in merged if r["text"])
    print(f"Pocket TA successful responses: {succeeded}/{len(merged)}")


if __name__ == "__main__":
    run()
