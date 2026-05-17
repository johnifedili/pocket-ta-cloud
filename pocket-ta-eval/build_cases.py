"""Generates the 20-case PTA-MB benchmark as one JSON file per case.

Each case is a single concrete student-typed concept plus the ground-truth
misconception we expect any decent tutor to identify when grading a wrong
answer. The misconception labels are drawn from K-12 pedagogy and the cited
literature (Confrey, Smith diSessa Roschelle, Driver et al.).

Why 20 not 30: the writeup said "N=30 obvious next step", and we're shipping
a 20-case starter that's small enough to single-rater grade by the hackathon
deadline. Caveats are documented in the writeup.
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent / "cases"

CASES = [
    # ---------- MATH (7 cases) ----------
    {
        "id": "math-01-fractions-denominator",
        "subject": "math", "concept": "fractions",
        "reading_level": "Grade 3-5",
        "student_typed": "fractions",
        "student_wrong_answer": "3/5",
        "question_context": "Sarah cuts a pizza into 8 equal slices and eats 3. What fraction did she eat?",
        "ground_truth_misconception": "Student writes leftover-count in the denominator. They are reading 'parts you have / parts you don't have' instead of 'parts you have / total equal parts'.",
        "misconception_keywords": ["denominator", "leftover", "remaining", "total", "whole"],
        "expected_analogy_target": "Total equal pieces stays fixed even after some are taken away.",
        "grader_notes": "Watch for the trap of restating 'denominator = bottom number' without naming WHY the student wrote 5."
    },
    {
        "id": "math-02-multiplication-additive",
        "subject": "math", "concept": "multiplication",
        "reading_level": "Grade 3-5",
        "student_typed": "multiplication word problems",
        "student_wrong_answer": "11",
        "question_context": "There are 5 baskets and each has 6 apples. How many apples in total?",
        "ground_truth_misconception": "Student adds the two numbers instead of multiplying. The word 'each' signals repeated groups but the student treats both numbers as one-time counts.",
        "misconception_keywords": ["added", "addition", "groups", "each", "repeated"],
        "expected_analogy_target": "Multiple equal groups (5 baskets of 6) versus two separate piles (5 and 6).",
        "grader_notes": "A correct response should mention the word 'each' as the linguistic signal."
    },
    {
        "id": "math-03-place-value",
        "subject": "math", "concept": "place value",
        "reading_level": "Grade 3-5",
        "student_typed": "place value",
        "student_wrong_answer": "5",
        "question_context": "In the number 537, what is the value of the digit 5?",
        "ground_truth_misconception": "Student reads digit at face value, ignoring column position. The misconception is 'digits are worth themselves' rather than 'digit value = face value × column power'.",
        "misconception_keywords": ["column", "position", "hundreds", "place", "worth"],
        "expected_analogy_target": "Same digit means different amounts based on where it sits.",
        "grader_notes": "Should NOT just say 'because it's in hundreds'. Should name the underlying belief 'a 5 is always 5'."
    },
    {
        "id": "math-04-decimal-longer-bigger",
        "subject": "math", "concept": "decimals",
        "reading_level": "Grade 3-5",
        "student_typed": "comparing decimals",
        "student_wrong_answer": "0.125 is bigger than 0.5",
        "question_context": "Which is bigger: 0.125 or 0.5?",
        "ground_truth_misconception": "Whole-number transfer error: student applies 'more digits = bigger' from whole numbers. 125 > 5, so they say 0.125 > 0.5.",
        "misconception_keywords": ["longer", "more digits", "whole number", "place value", "tenths"],
        "expected_analogy_target": "Money intuition: $0.5 = 50 cents; $0.125 = 12.5 cents.",
        "grader_notes": "Classic Resnick/Smith finding. Strong tutor names 'longer-is-larger' as a transferred whole-number rule."
    },
    {
        "id": "math-05-negative-bigger",
        "subject": "math", "concept": "negative numbers",
        "reading_level": "Grade 6-8",
        "student_typed": "negative numbers comparison",
        "student_wrong_answer": "-10 is bigger than -2",
        "question_context": "Which is bigger: -10 or -2?",
        "ground_truth_misconception": "Student applies absolute-value intuition from positive numbers: 10 > 2 so they say -10 > -2. Ignores that on a number line further left = smaller.",
        "misconception_keywords": ["absolute value", "number line", "left", "further", "size"],
        "expected_analogy_target": "Temperature or debt analogy: -10 degrees is colder than -2; owing $10 is worse than owing $2.",
        "grader_notes": "Should explicitly contrast 'magnitude' with 'position on the number line'."
    },
    {
        "id": "math-06-area-perimeter-confusion",
        "subject": "math", "concept": "area vs perimeter",
        "reading_level": "Grade 3-5",
        "student_typed": "area and perimeter",
        "student_wrong_answer": "The area of a 4 by 3 rectangle is 14",
        "question_context": "What is the area of a rectangle that is 4 units wide and 3 units tall?",
        "ground_truth_misconception": "Student computes perimeter (4+3+4+3=14) instead of area. They conflate 'measure the rectangle' with 'add up the sides'.",
        "misconception_keywords": ["perimeter", "around", "inside", "cover", "rows"],
        "expected_analogy_target": "Perimeter = walking around the edge; area = filling the inside with tiles.",
        "grader_notes": "Should name both concepts side by side, not just correct the answer."
    },
    {
        "id": "math-07-percent-bigger-than-100",
        "subject": "math", "concept": "percentages",
        "reading_level": "Grade 6-8",
        "student_typed": "percentages over 100",
        "student_wrong_answer": "You can't have more than 100%",
        "question_context": "A store's sales grew 150% from last year. Is that possible?",
        "ground_truth_misconception": "Student treats 100% as a ceiling because they only encountered percentages in 'percent of a whole' contexts (test scores, pie charts). They lack the 'percentage as ratio scaling' frame.",
        "misconception_keywords": ["ceiling", "ratio", "growth", "more than the whole", "scaling"],
        "expected_analogy_target": "Doubling = 200%; tripling = 300%. Percent is a ratio, not a cap.",
        "grader_notes": "Should distinguish 'percent OF something' from 'percent CHANGE'."
    },

    # ---------- SCIENCE (7 cases) ----------
    {
        "id": "sci-01-moon-phases-shadow",
        "subject": "science", "concept": "the moon's phases",
        "reading_level": "Grade 6-8",
        "student_typed": "the moon's phases",
        "student_wrong_answer": "Earth's shadow is what causes the phases",
        "question_context": "Why does the moon look different on different nights?",
        "ground_truth_misconception": "Confusing phases with lunar eclipses. Phases are caused by which part of the moon is lit BY THE SUN (depending on its orbital position), not by Earth's shadow. Earth's shadow on the moon is an eclipse, which is rare.",
        "misconception_keywords": ["eclipse", "shadow", "sun", "orbit", "lit", "illuminated"],
        "expected_analogy_target": "Walk around a friend holding a flashlight on one side — different views show different lit portions of their face.",
        "grader_notes": "This is THE canonical moon-phase misconception (Driver et al.). Strong tutor names eclipse explicitly."
    },
    {
        "id": "sci-02-seasons-distance",
        "subject": "science", "concept": "why we have seasons",
        "reading_level": "Grade 6-8",
        "student_typed": "why is summer hotter",
        "student_wrong_answer": "Earth is closer to the sun in summer",
        "question_context": "Why is summer hotter than winter?",
        "ground_truth_misconception": "Distance-from-sun misconception. Seasons are caused by Earth's axial tilt (23.5°) changing the angle and duration of sunlight, not by the very slight orbital distance variation. Famously caught in 'A Private Universe' (Harvard).",
        "misconception_keywords": ["tilt", "axis", "angle", "direct sunlight", "hemisphere"],
        "expected_analogy_target": "Holding a flashlight straight down vs. at an angle on a piece of paper — same bulb, very different brightness per area.",
        "grader_notes": "If the tutor only says 'tilt' without explaining WHY tilt creates more heat (angle/concentration), grade analogy as 2 not 3."
    },
    {
        "id": "sci-03-plants-soil-eating",
        "subject": "science", "concept": "where plants get their mass",
        "reading_level": "Grade 6-8",
        "student_typed": "where does the wood in a tree come from",
        "student_wrong_answer": "From the soil",
        "question_context": "When a small tree grows into a big tree, where does all that extra wood come from?",
        "ground_truth_misconception": "Plants-eat-soil misconception. Most of a plant's dry mass comes from carbon pulled out of the air (CO2) during photosynthesis, NOT from the soil. Soil supplies water and trace minerals.",
        "misconception_keywords": ["air", "carbon dioxide", "photosynthesis", "soil", "mass"],
        "expected_analogy_target": "A tree is mostly 'made of air' — the trunk is rearranged CO2 plus water.",
        "grader_notes": "Classic Driver et al. + the famous Van Helmont willow tree experiment. Should mention CO2/air explicitly."
    },
    {
        "id": "sci-04-evolution-need",
        "subject": "science", "concept": "evolution",
        "reading_level": "Grade 6-8",
        "student_typed": "evolution",
        "student_wrong_answer": "Giraffes grew long necks because they needed to reach high leaves",
        "question_context": "Why do giraffes have such long necks?",
        "ground_truth_misconception": "Lamarckian / teleological misconception: organisms develop traits because they 'need' them within their lifetime. Real mechanism: random variation in neck length pre-existed; longer-necked individuals had a survival advantage and left more offspring (natural selection).",
        "misconception_keywords": ["natural selection", "variation", "random", "survival", "offspring", "need"],
        "expected_analogy_target": "Bag of mixed marbles where the longer ones are easier to grab — keep doing that and the bag fills with longer marbles. Nobody MADE the marbles longer.",
        "grader_notes": "The 'need' verb is the diagnostic. Tutor must reframe from intentional adaptation to differential reproduction."
    },
    {
        "id": "sci-05-electricity-current-used-up",
        "subject": "science", "concept": "electric current",
        "reading_level": "Grade 6-8",
        "student_typed": "electric current in a circuit",
        "student_wrong_answer": "The bulb uses up the electricity",
        "question_context": "In a simple circuit with a battery and a bulb, what happens to the electricity?",
        "ground_truth_misconception": "Current-consumed misconception. Charge is conserved — the same current that enters the bulb leaves it. What is transferred is energy, not charge. (Shipstone, Osborne)",
        "misconception_keywords": ["energy", "charge", "conserved", "same current", "transfer"],
        "expected_analogy_target": "Water in a closed pipe loop — the water doesn't get used up by a paddle wheel, the water's energy turns the wheel.",
        "grader_notes": "Tutor must distinguish energy (transferred) from current (conserved)."
    },
    {
        "id": "sci-06-heavy-falls-faster",
        "subject": "science", "concept": "gravity and falling objects",
        "reading_level": "Grade 6-8",
        "student_typed": "do heavy things fall faster",
        "student_wrong_answer": "Yes, heavier things fall faster",
        "question_context": "If I drop a brick and a small rock at the same time from the same height, which lands first (ignoring air)?",
        "ground_truth_misconception": "Aristotelian intuition. Without air resistance, all objects fall at the same rate regardless of mass (Galileo). The misconception persists because in everyday life air resistance dominates for light objects like feathers.",
        "misconception_keywords": ["air resistance", "same rate", "mass", "vacuum", "Galileo"],
        "expected_analogy_target": "Feather and a hammer on the moon (Apollo 15) — both hit at the same time because no air.",
        "grader_notes": "Tutor must address WHY the intuition exists (air resistance), not just say 'they fall the same'."
    },
    {
        "id": "sci-07-dna-genes-traits",
        "subject": "science", "concept": "genes and traits",
        "reading_level": "Grade 6-8",
        "student_typed": "genes",
        "student_wrong_answer": "I have a gene for being tall",
        "question_context": "Do tall people have a 'gene for being tall'?",
        "ground_truth_misconception": "One-gene-one-trait misconception. Almost all visible traits are polygenic (many genes contribute, each by a small amount) and modulated by environment. The 'gene for X' frame comes from rare single-gene Mendelian traits and pop-science shorthand.",
        "misconception_keywords": ["polygenic", "many genes", "environment", "small contribution", "Mendelian"],
        "expected_analogy_target": "Height is more like a recipe with hundreds of ingredients than a single switch.",
        "grader_notes": "Avoid letting the tutor say 'there is a gene for tallness but also others'. Should explicitly reframe the model."
    },

    # ---------- READING (6 cases) ----------
    {
        "id": "read-01-main-idea-detail",
        "subject": "reading", "concept": "main idea",
        "reading_level": "Grade 3-5",
        "student_typed": "main idea",
        "student_wrong_answer": "Dogs rescue lost hikers",
        "question_context": "A paragraph describes how dogs guard houses, help blind people, and rescue lost hikers. What is the main idea?",
        "ground_truth_misconception": "Detail-as-main-idea: student picks one specific example from the paragraph instead of the umbrella claim that covers all examples.",
        "misconception_keywords": ["umbrella", "all", "detail", "example", "cover"],
        "expected_analogy_target": "Whole pizza vs. one slice — the main idea is the pizza, the details are the slices.",
        "grader_notes": "Student picked the most vivid detail. Tutor should diagnose 'most memorable ≠ main'."
    },
    {
        "id": "read-02-synonym-antonym-confusion",
        "subject": "reading", "concept": "synonyms",
        "reading_level": "Grade 3-5",
        "student_typed": "synonyms",
        "student_wrong_answer": "sad",
        "question_context": "Which word means almost the same as 'happy'?",
        "ground_truth_misconception": "Synonym/antonym swap: student picks the opposite-meaning word, often because both 'happy' and 'sad' are common emotion words and the prompt's 'almost' didn't anchor.",
        "misconception_keywords": ["opposite", "antonym", "similar", "same side"],
        "expected_analogy_target": "Synonyms sit on the same side of a seesaw; antonyms sit on the other side.",
        "grader_notes": "Should distinguish 'related word' from 'similar-meaning word'."
    },
    {
        "id": "read-03-context-clue-skip",
        "subject": "reading", "concept": "context clues",
        "reading_level": "Grade 3-5",
        "student_typed": "context clues",
        "student_wrong_answer": "clean and organized",
        "question_context": "In 'The room was so cluttered, with toys, books, and clothes piled everywhere, that I couldn't walk through it,' what does 'cluttered' mean?",
        "ground_truth_misconception": "Context-skip: student guesses without using surrounding sentence. The phrase 'piled everywhere' directly contradicts 'clean' but the student didn't anchor on it.",
        "misconception_keywords": ["context", "surrounding", "clue", "evidence", "guess"],
        "expected_analogy_target": "Witnesses around a suspect — look at who they're with.",
        "grader_notes": "Tutor must specifically point to 'piled everywhere' as the textual evidence."
    },
    {
        "id": "read-04-author-purpose-only-entertain",
        "subject": "reading", "concept": "author's purpose",
        "reading_level": "Grade 6-8",
        "student_typed": "author's purpose",
        "student_wrong_answer": "To entertain",
        "question_context": "Why did the author write a how-to article about taking care of a hamster?",
        "ground_truth_misconception": "Default-to-entertain misconception. Students learn 'authors entertain' from fiction and default to it. Three common purposes are entertain / inform / persuade; how-to writing is informational.",
        "misconception_keywords": ["inform", "entertain", "persuade", "instructional", "purpose"],
        "expected_analogy_target": "A recipe is not a story — author's job there is to teach you how to do something.",
        "grader_notes": "Tutor should name all three purposes and explain how to tell them apart."
    },
    {
        "id": "read-05-inference-literal",
        "subject": "reading", "concept": "making inferences",
        "reading_level": "Grade 6-8",
        "student_typed": "inferences",
        "student_wrong_answer": "Nothing — the story doesn't say",
        "question_context": "A character slams a door and walks out without saying goodbye. How is she feeling?",
        "ground_truth_misconception": "Literal-reading misconception: student refuses to draw inferences because 'it doesn't say'. Inferring is the act of using clues + prior knowledge to fill a gap the author left open on purpose.",
        "misconception_keywords": ["clues", "prior knowledge", "implied", "between the lines", "evidence"],
        "expected_analogy_target": "Footprints in sand — you weren't there but you can tell someone walked through.",
        "grader_notes": "Should name the two ingredients of inference: text clues + reader's knowledge."
    },
    {
        "id": "read-06-figurative-literal",
        "subject": "reading", "concept": "figurative language",
        "reading_level": "Grade 3-5",
        "student_typed": "metaphors",
        "student_wrong_answer": "It means his stomach is a bear",
        "question_context": "What does it mean when a story says 'He was a bear before his morning coffee'?",
        "ground_truth_misconception": "Literal interpretation of metaphor: student parses the sentence syntactically rather than figuratively. Common in younger readers and ESL learners.",
        "misconception_keywords": ["figurative", "literal", "like", "compare", "metaphor"],
        "expected_analogy_target": "When you say 'it's raining cats and dogs', no real pets are falling.",
        "grader_notes": "Tutor should explicitly contrast literal vs figurative reading."
    }
]

if __name__ == "__main__":
    counts = {"math": 0, "science": 0, "reading": 0}
    for case in CASES:
        subj = case["subject"]
        target = ROOT / subj / f"{case['id']}.json"
        target.write_text(json.dumps(case, indent=2))
        counts[subj] += 1
    print(f"Wrote {sum(counts.values())} cases.")
    for k, v in counts.items():
        print(f"  {k}: {v}")
