const VOWELS = 'aeiou'
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz'
// const HAND_SIZE = 7

const SCRABBLE_LETTER_VALUES = {
  'a': 1,
  'b': 3,
  'c': 3,
  'd': 2,
  'e': 1,
  'f': 4,
  'g': 2,
  'h': 4,
  'i': 1,
  'j': 8,
  'k': 5,
  'l': 1,
  'm': 3,
  'n': 1,
  'o': 1,
  'p': 3,
  'q': 10,
  'r': 1,
  's': 1,
  't': 1,
  'u': 1,
  'v': 4,
  'w': 4,
  'x': 8,
  'y': 4,
  'z': 10
}

// function getFrequencyDict (sequence) {
//   const freq = {}
//   for (let x in sequence) {
//     if (typeof (freq[x]) === 'undefined') {
//       freq[x] = 0
//     }
//     freq[x] += 1
//   }
//   return freq
// }

export function getWordScore (word, n) {
  let score = 0
  if (word === '') return 0
  for (let i in word) {
    score += SCRABBLE_LETTER_VALUES[word[i]]
  }
  score *= word.length
  if (word.length === n) {
    score += 50
  }
  return score
}

export function dealHand (n) {
  const hand = []
  const numVowels = Math.floor(n / 3)
  for (let i = 0; i < numVowels; i++) {
    const letter = VOWELS[Math.floor(Math.random() * VOWELS.length)]
    hand.push(letter)
  }

  for (let i = 0; i < n - numVowels; i++) {
    const letter = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]
    hand.push(letter)
  }
  return hand
}
