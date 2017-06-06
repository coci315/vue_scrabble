const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})) // for parsing application/x-www-form-urlencoded

const HAND_SIZE = 7
const helper = require('./helper')

const words = fs.readFileSync('./words.txt', 'utf-8')
let wordList = words.split(/\s+/)
wordList = wordList.map(item => {
  return item.toLowerCase()
})
console.log(wordList.length + ' words loaded.')
app.use(express.static('./dist'))
app.get('/', function (req, res, next) {
  req.url = '/index.html'
  next()
})

app.get('/api/highscores', function (req, res) {
  fs.readFile('./highScores.json', 'utf-8', (err, data) => {
    if (err) {
      res.json({
        success: false,
        data: '',
        message: 'failed to get data'
      })
    } else {
      res.json({
        success: true,
        data: JSON.parse(data),
        message: ''
      })
    }
  })
})

app.post('/api/highscores', function (req, res) {
  const newData = req.body
  if (newData.name && newData.bestScore) {
    fs.readFile('./highScores.json', 'utf-8', (err, data) => {
      if (err) {
        res.json({
          success: false,
          message: 'failed to post data'
        })
      } else {
        const dataArr = JSON.parse(data)
        const maxLen = Math.min(dataArr.length, 100)
        for (let i = 0; i < maxLen; i++) {
          if (newData.bestScore > dataArr[i].bestScore) {
            dataArr.splice(i, 0, newData)
            break
          } else {
            if (i === maxLen - 1) {
              dataArr.push(newData)
            }
          }
        }
        fs.writeFile('./highScores.json', JSON.stringify(dataArr), (err) => {
          if (err) {
            res.json({
              success: false,
              message: 'failed to post data'
            })
          }
          res.json({
            success: true,
            message: 'successed to post data'
          })
        })
      }
    })
  } else {
    res.json({
      success: false,
      message: 'incorrect params'
    })
  }
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

const server = app.listen(3001, function () {
  const host = server.address().address
  const port = server.address().port

  console.log('app listening at http://%s:%s', host, port)
})
