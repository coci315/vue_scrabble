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

const isValidWord = function (word, wordList) {
  if (wordList.indexOf(word) === -1) {
    return false
  } else {
    return true
  }
}

const getWordScore = function (word, n) {
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

const getWord = function (hand, wordList, n, isBest) {
  function isValidWord (word, hand, n) {
    if (word.length > n) {
      return false
    }
    const handCopy = hand.slice(0)
    for (let i in word) {
      const index = handCopy.indexOf(word[i])
      if (index === -1) {
        return false
      } else {
        handCopy.splice(index, 1)
      }
    }
    return true
  }
  let bestScore = 0
  let bestWord = ''
  for (let i = 0; i < wordList.length; i++) {
    if (isValidWord(wordList[i], hand, n)) {
      if (!isBest) {
        return wordList[i]
      } else {
        const score = getWordScore(wordList[i], n)
        if (score > bestScore) {
          bestScore = score
          bestWord = wordList[i]
          if (bestWord.length === n) {
            break
          }
        }
      }
    }
  }
  return bestWord
}

module.exports = {
  isValidWord,
  getWordScore,
  getWord
}
