// This is the small "database" the app ships with. It lives in its own file
// so the rest of the codebase can pull from a single source of truth.
//
// Each subject has a name, a few example concepts you might ask about,
// a default intro (used when the student types a concept we don't have a
// hand-written one for), and a set of practice questions used by the
// Study page. The practice questions deliberately include a common wrong
// answer so the app can teach how to recover from a misconception —
// that's the part that makes this more than a quiz.
//
// The library is intentionally small and hand-validated rather than
// auto-generated, so every analogy and follow-up has been read and
// rewritten by a human before a student sees it. The full Pocket TA
// (hackathon build) uses Gemma 4 to generate the same structure for
// any concept on the fly.

export const SUBJECTS = [
  {
    id: 'math',
    name: 'Math',
    examples: ['fractions', 'multiplication', 'place value', 'word problems'],
    defaultIntro:
      'Math is the language we use to talk about amounts, shapes, and patterns. The trick with any math topic is to slow down, name the parts (numbers, signs, what each part means), and then look at how they fit together. Once the parts have names, the rule usually makes sense.',
    successNote:
      'You got it. The big idea here is that the parts of a problem have names, and once you know what each part is doing, the rule follows.',
    practice: [
      {
        concept: 'fractions',
        intro:
          'A fraction is a way of writing a part of a whole. The bottom number (the denominator) tells you how many equal pieces the whole has been cut into. The top number (the numerator) tells you how many of those pieces you have. If a pizza is cut into 8 equal slices and you take 3, you have 3/8 of the pizza.',
        question: 'Sarah cuts a pizza into 8 equal slices and eats 3. What fraction of the pizza did she eat?',
        correct: '3/8',
        commonWrong: '3/5',
        misconception:
          'When the answer comes out as 3/5, the student is counting only the leftover slices on the bottom. The bottom number — the denominator — is the total number of equal pieces, not what is left.',
        analogy:
          'In this problem the pizza is cut into 8 slices, so the denominator is 8 — eating some doesn\'t change how many equal pieces the whole was cut into. The bottom number is the size of the whole; the top number is how many of those pieces you took.',
        followUp: {
          question: 'A pizza is cut into 4 equal slices. What is the denominator?',
          correct: '4'
        }
      },
      {
        concept: 'multiplication',
        intro:
          'Multiplication is a fast way of doing repeated addition. 4 × 3 means "four groups of three," which is 3 + 3 + 3 + 3 = 12. The order doesn\'t change the answer: 4 × 3 and 3 × 4 are the same. That property is called the commutative property.',
        question: 'There are 5 baskets and each basket has 6 apples. How many apples are there in total?',
        correct: '30',
        commonWrong: '11',
        misconception:
          'When the answer comes out as 11, the student added the two numbers (5 + 6) instead of multiplying them. The word "each" is the signal that you have groups of the same size — that\'s multiplication, not addition.',
        analogy:
          'Think of 5 baskets lined up. If you put 6 apples into every basket, you don\'t end up with 11 apples — you end up with 6 apples five times in a row. That\'s 6 + 6 + 6 + 6 + 6, which is 5 × 6.',
        followUp: {
          question: 'There are 3 bags with 4 marbles in each bag. How many marbles in total?',
          correct: '12'
        }
      },
      {
        concept: 'place value',
        intro:
          'In our number system, the position of a digit tells you what it\'s worth. In 342, the 3 is in the hundreds place (worth 300), the 4 is in the tens place (worth 40), and the 2 is in the ones place (worth 2). The same digit means different things depending on where it sits.',
        question: 'In the number 537, what is the value of the digit 5?',
        correct: '500',
        commonWrong: '5',
        misconception:
          'When the answer is just "5", the student is reading the digit as its face value instead of its place value. The digit 5 is in the hundreds column, so it\'s worth five hundred — not five.',
        analogy:
          'Think of the columns like rooms in a house. The same person standing in the hundreds room is worth a hundred times more than the same person standing in the ones room. The digit hasn\'t changed; the room has.',
        followUp: {
          question: 'In the number 248, what is the value of the digit 2?',
          correct: '200'
        }
      }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    examples: ['states of matter', 'the water cycle', 'gravity', 'photosynthesis'],
    defaultIntro:
      'Science is the practice of asking how the world works and then checking the answer against what we can actually see. Every science topic comes down to two things: what is happening, and why it is happening. Get those two clear and the vocabulary follows.',
    successNote:
      'You got it. The key in science is to slow down, name what is happening, and then name why — once you have both, the vocabulary stops feeling like memorization.',
    practice: [
      {
        concept: 'states of matter',
        intro:
          'Matter is anything that takes up space and has weight — the chair, the air, the water in a glass. It comes in three everyday states: solid (holds its shape), liquid (takes the shape of its container but keeps the same amount), and gas (spreads out to fill whatever space it is in). Heating and cooling are what move matter between these states.',
        question: 'A liquid is heated until it turns into a gas. What is this process called?',
        correct: 'evaporation',
        commonWrong: 'melting',
        misconception:
          'When the answer is "melting", the student is mixing up the change from solid to liquid (melting) with the change from liquid to gas (evaporation).',
        analogy:
          'Think of an ice cube melting on a counter — that is melting. Now picture a puddle slowly disappearing on a hot sidewalk — that is evaporation.',
        followUp: {
          question: 'A solid is heated until it turns into a liquid. What is this process called?',
          correct: 'melting'
        }
      },
      {
        concept: 'the water cycle',
        intro:
          'The water cycle is how the same water moves around our planet, over and over. The sun heats water in oceans, rivers, and lakes; that water turns into invisible water vapor and rises (evaporation); high in the sky it cools and becomes tiny droplets that form clouds (condensation); when the droplets get heavy they fall as rain or snow (precipitation); and then the water flows back into rivers and oceans to start again.',
        question: 'Water vapor in the sky cools down and forms tiny droplets that make clouds. What is this step called?',
        correct: 'condensation',
        commonWrong: 'precipitation',
        misconception:
          'When the answer is "precipitation", the student is jumping ahead to the step where water falls from the sky. Forming the cloud comes first; falling from the cloud comes later.',
        analogy:
          'Think of a cold glass of lemonade on a hot day. The little drops that appear on the outside of the glass — that\'s condensation, the same thing the cloud does. Precipitation is what happens after the cloud gets too heavy and the drops fall out as rain.',
        followUp: {
          question: 'Rain falling from a cloud is which step of the water cycle?',
          correct: 'precipitation'
        }
      },
      {
        concept: 'photosynthesis',
        intro:
          'Photosynthesis is how plants make their own food. They take in sunlight through their leaves, water through their roots, and carbon dioxide from the air, and they turn those three ingredients into sugar (which the plant eats) and oxygen (which they release for us to breathe). Plants are one of the few kinds of living things on Earth that can make food directly from sunlight — algae and some tiny bacteria do it too.',
        question: 'What gas do plants release as a result of photosynthesis?',
        correct: 'oxygen',
        commonWrong: 'carbon dioxide',
        misconception:
          'When the answer is "carbon dioxide", the student has the cycle running backwards. Plants take carbon dioxide in and give oxygen out — it\'s the opposite of what we do when we breathe.',
        analogy:
          'Think of plants and humans as trading partners. We breathe out carbon dioxide; plants take it in and breathe out oxygen for us. The deal only works because each side gives what the other side needs.',
        followUp: {
          question: 'What gas do plants take in from the air during photosynthesis?',
          correct: 'carbon dioxide'
        }
      }
    ]
  },
  {
    id: 'reading',
    name: 'Reading',
    examples: ['main idea', 'context clues', 'synonyms', 'antonyms'],
    defaultIntro:
      'Reading is more than sounding out words — it is figuring out what the writer is trying to say. Strong readers notice how words relate to each other, look for clues in the sentence around a tricky word, and ask themselves what the whole paragraph is really about.',
    successNote:
      'You got it. Strong readers slow down, ask what the writer is really trying to say, and use the words around a tricky word as clues.',
    practice: [
      {
        concept: 'synonyms',
        intro:
          'A synonym is a word that means almost the same thing as another word. "Big" and "large" are synonyms. "Happy" and "joyful" are synonyms. The opposite — a word that means the reverse, like "happy" and "sad" — is called an antonym.',
        question: 'Which word means almost the same thing as "happy"?',
        correct: 'joyful',
        commonWrong: 'sad',
        misconception:
          'When the answer is "sad", the student picked the opposite word (an antonym) instead of a word with a similar meaning (a synonym).',
        analogy:
          'A synonym is a word that sits on the same side of a seesaw as the original — both meanings lift you up. An antonym sits on the other side.',
        followUp: {
          question: 'Which word means almost the same thing as "big"?',
          correct: 'large'
        }
      },
      {
        concept: 'main idea',
        intro:
          'The main idea of a paragraph is the one big thing the writer wants you to remember. It\'s not every detail in the paragraph — it\'s the umbrella sentence that all the details sit underneath. A good test: if you could only keep one sentence, the main idea is the one you\'d keep.',
        question: 'A paragraph describes how dogs guard houses, help blind people, and rescue lost hikers. What is the main idea?',
        correct: 'Dogs help people in many different ways.',
        commonWrong: 'Dogs rescue lost hikers.',
        misconception:
          'When the answer picks one example from the paragraph, the student is mistaking a supporting detail for the main idea. "Rescue hikers" is one example; the main idea has to be big enough to cover all the examples in the paragraph.',
        analogy:
          'Think of a paragraph like a pizza. The main idea is the whole pizza. The supporting details are individual slices. If someone asks what kind of pizza it is, you don\'t say "pepperoni slice" — you say what the whole pizza is.',
        followUp: {
          question: 'A paragraph lists apples, bananas, and oranges and says they all grow on trees. The main idea is most likely about ___.',
          correct: 'fruits'
        }
      },
      {
        concept: 'context clues',
        intro:
          'Context clues are hints in the sentences around a word that help you figure out what that word means without a dictionary. The clue might be a definition right next to the word, a synonym, an example, or a contrast like "but" or "unlike." Strong readers slow down at hard words and look around for these hints instead of skipping ahead.',
        question: 'In the sentence "The room was so cluttered, with toys, books, and clothes piled everywhere, that I couldn\'t walk through it," what does "cluttered" most likely mean?',
        correct: 'messy and full of things',
        commonWrong: 'clean and organized',
        misconception:
          'When the answer is the opposite, the student guessed instead of reading the rest of the sentence. The phrase "toys, books, and clothes piled everywhere" is the context clue telling you the room is full of stuff — not tidy.',
        analogy:
          'Context clues are like the witnesses around a suspect. You don\'t need to know the suspect personally — you just look at who they\'re hanging out with and what\'s happening around them.',
        followUp: {
          question: 'In "The food was so bland I added salt and pepper," what does "bland" mean?',
          correct: 'lacking flavor'
        }
      }
    ]
  }
]

// Helper that the Home page uses to render a list of subject names.
// Keeping it next to the data so the rest of the app does not need to
// know how SUBJECTS is shaped internally.
export function getSubjectNames() {
  return SUBJECTS.map((subject) => subject.name)
}

// Looks a subject up by its id. Returns undefined if the id is unknown,
// which lets the calling component decide how to handle bad input.
export function findSubject(id) {
  return SUBJECTS.find((subject) => subject.id === id)
}

// Find a practice item whose concept matches the typed text (case-insensitive,
// loose match). Returns null if nothing matches, which lets Study.jsx decide
// to fall back to the subject's default intro instead of pretending it knows.
export function findPractice(subject, concept) {
  if (!subject || !concept) return null
  const needle = concept.trim().toLowerCase()
  if (!needle) return null
  return (
    subject.practice.find((p) =>
      needle.includes(p.concept.toLowerCase()) ||
      p.concept.toLowerCase().includes(needle)
    ) || null
  )
}
