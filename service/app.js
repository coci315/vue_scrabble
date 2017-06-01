const express = require('express')
const app = express()
const fs = require('fs')

const HAND_SIZE = 7
const helper = require('./helper')

const words = fs.readFileSync('./words.txt', 'utf-8')
let wordList = words.split(/\s+/)
wordList = wordList.map(item => {
  return item.toLowerCase()
})
console.log(wordList.length + ' words loaded.')

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.get('/api/score', function (req, res) {
  const word = req.query.word
  if (word === undefined) {
    res.json({
      success: false,
      score: 0,
      message: 'no query'
    })
  } else {
    const isValid = helper.isValidWord(word, wordList)
    if (isValid) {
      res.json({
        success: true,
        score: helper.getWordScore(word, HAND_SIZE),
        message: ''
      })
    } else {
      res.json({
        success: false,
        score: 0,
        message: 'not valid word'
      })
    }
  }
})

app.get('/api/hint', function (req, res) {
  let hand = req.query.hand
  if (hand === undefined) {
    res.json({
      success: false,
      word: '',
      message: 'no query'
    })
  } else {
    hand = hand.split('')
    if (hand.length < 2) {
      res.json({
        success: false,
        word: '',
        message: 'hand should contain >=2 letters'
      })
    } else {
      let word
      if (req.query.best === 'true') {
        word = helper.getWord(hand, wordList, HAND_SIZE, true)
      } else {
        word = helper.getWord(hand, wordList, HAND_SIZE)
      }
      if (word === '') {
        res.json({
          success: false,
          word: '',
          message: 'not found'
        })
      } else {
        res.json({
          success: true,
          word: word,
          message: ''
        })
      }
    }
  }
})

const server = app.listen(3000, function () {
  const host = server.address().address
  const port = server.address().port

  console.log('app listening at http://%s:%s', host, port)
})
