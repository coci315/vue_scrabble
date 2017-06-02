<template>
  <div class="scrabble">
    <div v-show="isShowCountDown" class="countdown">
      <div class="number number3">3</div>
      <div class="number number2">2</div>
      <div class="number number1">1</div>
    </div>
    <div class="info">
      <span class="score">Total Score: {{score}}</span>
      <span class="round">Remaining Rounds: {{round}}</span>
    </div>
    <input type="text" v-model="word" disabled>
    <div class="card-wrap-container">
      <transition name="drop">
        <transition-group tag="ul" name="list" class="card-wrap" v-if="cards.length > 0">
          <li v-for="(card,index) in cards" v-if="card.letter" :key="index" :class="{select: card.isSelected}" @click="toggleSelect(index)" @mouseenter="slideUp(index)" @mouseleave="slideDown(index)" :ref="'li'+index">{{card.letter}}</li>
        </transition-group>
      </transition>
    </div>
    <button @click="play" type="button">play</button>
    <button @click="end" type="button">end</button>
    <button @click="nextRound" type="button">nextRound</button>
    <button @click="pop" type="button">pop</button>
    <button @click="push" type="button">push</button>
    <button @click="hint" type="button">hint</button>
    <button @click="hint(true)" type="button">bestHint</button>
    <button @click="autoPlay" type="button">autoPlay</button>
    <button @click="submit" type="button" :disabled="selectedIndex.length < 2">submit</button>
  </div>
</template>

<script>
const HAND_SIZE = 7
import { getWordScore, dealHand, wordToIndex } from '../common/js/scrabble.js'
import { sleep } from '../common/js/util.js'
export default {
  data () {
    return {
      hand: [],
      cards: [],
      selectedIndex: [],
      score: 0,
      isShowCountDown: false,
      round: 10
    }
  },
  computed: {
    word () {
      let str = ''
      this.selectedIndex.forEach(item => {
        str += this.cards[item].letter
      })
      return str
    }
  },
  watch: {
    hand (val) {
      const arr = []
      val.forEach(item => {
        arr.push({
          letter: item,
          isSelected: false
        })
      })
      this.cards = arr
    },
    selectedIndex (val, oldVal) {
      if (val.length === 0 && oldVal.length > 0) {
        oldVal.forEach(item => {
          const nodeLi = this.$refs['li' + item][0]
          nodeLi.style.transform = 'translate3d(0,0,0)'
        })
      }
      if (val.length > 0) {
        val.forEach(item => {
          this.cards[item].isSelected = true
          this.$refs['li' + item][0].style.transform = 'translate3d(0,-20%,0)'
        })
      }
    }
  },
  methods: {
    async autoPlay () {
      if (this.round === 0) {
        const isRestart = confirm('you have no round,do you want to restart game?')
        if (isRestart) {
          await this.play()
        } else {
          return
        }
      }
      if (this.round === 10) {
        await this.play()
      }
      while (this.round >= 0) {
        while (this.hand.length >= 2) {
          const response = await this.$http.get('/api/hint', {
            params: {
              hand: this.hand.join(''),
              best: true
            }
          })
          const result = response.data
          if (result.success) {
            await (() => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  this.selectedIndex = wordToIndex(result.word, this.hand)
                  resolve()
                }, 1000)
              })
            })()
            await (() => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  const selectedIndexCopy = this.selectedIndex.slice(0)
                  selectedIndexCopy.sort((a, b) => { return b - a })
                  selectedIndexCopy.forEach(item => {
                    this.hand.splice(item, 1)
                  })
                  this.selectedIndex = []
                  this.score += getWordScore(result.word, HAND_SIZE)
                  resolve()
                }, 1000)
              })
            })()
          } else {
            break
          }
        }
        await sleep()
        if (this.round === 0) {
          this.hand = []
          alert('your total score is ' + this.score + ' points')
          break
        } else {
          await this.nextRound()
        }
      }
    },
    async play () {
      this.hand = []
      this.selectedIndex = []
      this.score = 0
      this.round = 10
      await this.countDown()
      this.hand = dealHand(HAND_SIZE)
      this.round -= 1
    },
    countDown () {
      return new Promise((resolve, reject) => {
        this.isShowCountDown = true
        setTimeout(() => {
          this.isShowCountDown = false
          resolve()
        }, 3000)
      })
    },
    end () {
      this.hand = []
    },
    pop () {
      this.hand.pop()
    },
    push () {
      this.selectedIndex.push(3)
    },
    async hint (isBest) {
      const response = await this.$http.get('/api/hint', {
        params: {
          hand: this.hand.join(''),
          best: isBest === true
        }
      })
      const result = response.data
      if (result.success) {
        alert('you can try "' + result.word + '"')
      } else {
        alert(result.message)
      }
    },
    nextRound () {
      return new Promise((resolve, reject) => {
        if (this.round > 0) {
          this.hand = []
          setTimeout(() => {
            this.hand = dealHand(HAND_SIZE)
            resolve()
          }, 50)
          this.round -= 1
          this.selectedIndex = []
        } else {
          alert('you have no round, your total score is ' + this.score + ' points')
        }
      })
    },
    async submit () {
      const response = await this.$http.get('/api/score', {
        params: {
          word: this.word
        }
      })
      const result = response.data
      if (result.success) {
        alert('you got ' + result.score + ' points')
        const selectedIndexCopy = this.selectedIndex.slice(0)
        selectedIndexCopy.sort((a, b) => { return b - a })
        selectedIndexCopy.forEach(item => {
          this.hand.splice(item, 1)
        })
        this.selectedIndex = []
        this.score += result.score
      } else {
        alert(result.message)
        this.cancelAllSelect()
      }
    },
    toggleSelect (index) {
      this.cards[index].isSelected = !this.cards[index].isSelected
      if (this.cards[index].isSelected) {
        this.selectedIndex.push(index)
      } else {
        this.cancelAllSelect()
      }
    },
    cancelAllSelect () {
      this.selectedIndex.forEach(item => {
        this.cards[item].isSelected = false
        this.$refs['li' + item][0].style.transform = 'translate3d(0,0,0)'
      })
      this.selectedIndex = []
    },
    slideUp (index) {
      const nodeLi = this.$refs['li' + index][0]
      if (!this.cards[index].isSelected) {
        nodeLi.style.transform = 'translate3d(0,-20%,0)'
      }
    },
    slideDown (index) {
      const nodeLi = this.$refs['li' + index][0]
      if (!this.cards[index].isSelected) {
        nodeLi.style.transform = 'translate3d(0,0,0)'
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.drop-enter-active,
.drop-leave-active {
  transition: all .5s;
}

.drop-enter,
{
  opacity: 0;
  transform: translate3d(-100%, 0, 0);
}

.drop-leave-active {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}

.list-enter,
.list-leave-active {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-active {
  position: absolute;
}

.card-wrap-container {
  padding: 100px 0;
  height: 200px;
  width: 100%;
  overflow-x: hidden;
}

.card-wrap {
  font-size: 0;
  user-select: none;
  li {
    display: inline-block;
    width: 50px;
    margin-right: 10px;
    padding: 50px 40px;
    border: 2px solid #ccc;
    border-radius: 10px;
    font-size: 60px;
    cursor: pointer;
    transition: all .4s;
    transform: translate3d(0, 0, 0);
    &.select {
      transform: translate3d(0, -20%, 0);
      border-color: #42b983
    }
  }
}

.countdown {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, .4);
  z-index: 10;
  .number {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 120px;
    height: 230px;
    margin-left: -60px;
    margin-top: -115px;
    font-size: 200px;
    opacity: 0;
    animation: zoomOut 1s ease 0s 1 both;
  }
  .number3 {
    z-index: 23;
  }
  .number2 {
    z-index: 22;
    animation-delay: 1s;
  }
  .number1 {
    z-index: 21;
    animation-delay: 2s;
  }
}

@keyframes zoomOut {
  from {
    opacity: 0;
    transform: scale3d(1, 1, 1);
  }

  50% {
    opacity: 1;
    transform: scale3d(.5, .5, .5);
  }

  to {
    opacity: 0;
    transform: scale3d(0, 0, 0);
  }
}
</style>
