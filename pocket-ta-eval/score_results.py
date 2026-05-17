"""Scores PTA-MB responses against per-case ground-truth labels.

Three automated metrics + one auto-computed reading level metric:

  - misconception_hit (binary): does the response mention >=2 of the
    case's misconception_keywords, AND mention them in a sentence that
    is about WHY the student got it wrong (not just listing them)?
  - analogy_present (binary): does the response include an analogy
    cue ('like', 'imagine', 'think of', 'similar to')?
  - response_length_ok (binary): 30 <= word_count <= 220 (a real kid-
    friendly tutor explanation stays in this range)
  - reading_level_delta: |Flesch-Kincaid grade - target grade|

Per-case detail + aggregates go to scored_results.csv.

This is single-rater + heuristic — the writeup is honest about that.
A two-rater human grading pass is the v2 plan.
"""
import json
import csv
import re
from pathlib import Path

ROOT = Path(__file__).parent
CASES_DIR = ROOT / "cases"
RESULTS_DIR = ROOT / "results"

ANALOGY_CUES = re.compile(
    r"\b(like|imagine|think of|similar to|picture|just as|the way|"
    r"as if|sort of like|kind of like)\b",
    re.IGNORECASE,
)

MISCONCEPTION_HEDGE = re.compile(
    r"\b(misconception|wrong because|why .* wrong|mistake|"
    r"common mix(?:-?up)?|easy to confuse|trap|mixed up|mistook|"
    r"confused .* with|thought .* but)\b",
    re.IGNORECASE,
)


def load_cases():
    cases = {}
    for subj_dir in CASES_DIR.iterdir():
        if not subj_dir.is_dir():
            continue
        for case_file in subj_dir.glob("*.json"):
            c = json.loads(case_file.read_text())
            cases[c["id"]] = c
    return cases


def fk_grade(text):
    """Approximate Flesch-Kincaid grade level. Cheap and dependency-free."""
    text = text.strip()
    if not text:
        return 0.0
    sentences = max(1, len(re.findall(r"[.!?]+", text)))
    words = re.findall(r"\b\w+\b", text)
    word_count = max(1, len(words))
    syllables = sum(count_syllables(w) for w in words)
    return (0.39 * (word_count / sentences)
            + 11.8 * (syllables / word_count) - 15.59)


def count_syllables(word):
    word = word.lower()
    vowels = "aeiouy"
    count = 0
    prev_vowel = False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(1, count)


def target_grade(reading_level_str):
    # "Grade 3-5" -> 4; "Grade 6-8" -> 7
    nums = [int(x) for x in re.findall(r"\d+", reading_level_str)]
    return sum(nums) / len(nums) if nums else 6


def score_one(response_text, case):
    text = response_text or ""
    text_lower = text.lower()

    # Misconception hit: at least 2 keywords AND a hedging phrase about why-wrong.
    kw_hits = sum(
        1 for kw in case["misconception_keywords"]
        if kw.lower() in text_lower
    )
    has_hedge = bool(MISCONCEPTION_HEDGE.search(text))
    misconception_hit = int(kw_hits >= 2 and has_hedge)

    # Analogy present
    analogy_present = int(bool(ANALOGY_CUES.search(text)))

    # Length sanity
    word_count = len(re.findall(r"\b\w+\b", text))
    length_ok = int(30 <= word_count <= 220)

    # Reading level delta
    rl_delta = abs(fk_grade(text) - target_grade(case["reading_level"]))

    return {
        "case_id": case["id"],
        "subject": case["subject"],
        "kw_hits": kw_hits,
        "has_hedge": int(has_hedge),
        "misconception_hit": misconception_hit,
        "analogy_present": analogy_present,
        "word_count": word_count,
        "length_ok": length_ok,
        "fk_grade": round(fk_grade(text), 2),
        "rl_delta": round(rl_delta, 2),
    }


def run():
    cases = load_cases()
    vanilla = json.loads((RESULTS_DIR / "vanilla_gemma_responses.json").read_text())
    pocket = json.loads((RESULTS_DIR / "pocket_ta_responses.json").read_text())

    rows = []
    for resp in vanilla + pocket:
        case = cases.get(resp["case_id"])
        if not case:
            continue
        s = score_one(resp.get("text", ""), case)
        s["prompt_kind"] = resp["prompt_kind"]
        s["latency_s"] = round(resp.get("latency_s", 0), 2)
        rows.append(s)

    out = RESULTS_DIR / "scored_results.csv"
    with out.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    # Aggregates
    def agg(kind):
        these = [r for r in rows if r["prompt_kind"] == kind]
        n = len(these) or 1
        return {
            "n": len(these),
            "misconception_hit_rate": round(sum(r["misconception_hit"] for r in these) / n, 3),
            "analogy_rate": round(sum(r["analogy_present"] for r in these) / n, 3),
            "length_ok_rate": round(sum(r["length_ok"] for r in these) / n, 3),
            "mean_rl_delta": round(sum(r["rl_delta"] for r in these) / n, 2),
            "mean_latency_s": round(sum(r["latency_s"] for r in these) / n, 2),
        }

    summary = {"vanilla": agg("vanilla"), "pocket_ta": agg("pocket_ta")}
    (RESULTS_DIR / "summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))
    print(f"\nWrote scored results to {out}")


if __name__ == "__main__":
    run()
