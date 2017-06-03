<template>
  <div class="scrabble" @click="isShowMenu=false">
    <div class="title">Scrabble</div>
    <div v-show="isShowCountDown" class="countdown">
      <div class="number number3">3</div>
      <div class="number number2">2</div>
      <div class="number number1">1</div>
    </div>
    <div class="info">
      <span class="score">Total Score: {{score}}</span>
      <span class="round">Remaining Rounds: {{round}}</span>
    </div>
    <input type="text" v-model="word" disabled class="word-display">
    <div class="game-title" v-if="!isPlaying">Scrabble Game</div>
    <transition name="slide">
      <transition-group tag="ul" name="list" class="card-wrap" v-if="cards.length > 0">
        <li v-for="(card,index) in cards" v-if="card.letter" :key="index" :class="{select: card.isSelected}" @click.stop="toggleSelect(index)" @mouseenter="slideUp(index)" @mouseleave="slideDown(index)" :ref="'li'+index">{{card.letter}}</li>
      </transition-group>
    </transition>
  
    <div class="btn-group">
      <button @click.stop="play" type="button" v-show="!isPlaying">Play</button>
      <!--<button @click.stop="end" type="button">end</button>-->
      <button @click.stop="nextRound" type="button" v-show="isPlaying&&!isAuto">NextRound</button>
      <button @click.stop="submit" type="button" :disabled="selectedIndex.length < 2" v-show="isPlaying&&!isAuto">Submit</button>
      <!--<button @click.stop="pop" type="button">pop</button>-->
      <!--<button @click.stop="hint" type="button">hint</button>-->
      <!--<button @click.stop="hint(true)" type="button">bestHint</button>-->
      <button @click.stop="autoPlay" type="button" v-show="!isAuto">AutoPlay</button>
      <button @click.stop="cancleAutoPlay" type="button" v-show="isAuto">Cancle AutoPlay</button>
    </div>
    <div class="menu-icon" @click.stop="toggleMenu" :class="{active: isShowMenu}"></div>
    <div class="menu" :class="{active: isShowMenu}">
      <div class="btn-wrap">
        <button @click.stop="restart" type="button">ReStart</button>
      </div>
      <div class="btn-wrap">
        <button @click.stop="hint" type="button">Hint</button>
      </div>
      <div class="btn-wrap">
        <button @click.stop="showHelp" type="button">Help</button>
      </div>
      <div class="btn-wrap">
        <button @click.stop="showAbout" type="button">About</button>
      </div>
      <div class="btn-wrap">
        <button @click.stop="quit" type="button">Quit</button>
      </div>
    </div>
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
      round: 10,
      isAuto: false,
      isPlaying: false,
      isShowMenu: false
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
    showHelp () {
      this.$toast('123')
    },
    toggleMenu () {
      this.isShowMenu = !this.isShowMenu
    },
    async autoPlay () {
      this.isAuto = true
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
      if (!this.isAuto) {
        return
      }
      this.isPlaying = true
      while (this.round >= 0) {
        while (this.hand.length >= 2) {
          if (!this.isAuto) {
            return
          }
          const response = await this.$http.get('/api/hint', {
            params: {
              hand: this.hand.join(''),
              best: true
            }
          })
          const result = response.data
          if (!this.isAuto) {
            return
          }
          if (result.success) {
            await (() => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  this.selectedIndex = wordToIndex(result.word, this.hand)
                  resolve()
                }, 1000)
              })
            })()
            if (!this.isAuto) {
              return
            }
            await (() => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  const selectedIndexCopy = this.selectedIndex.slice(0)
                  selectedIndexCopy.sort((a, b) => { return b - a })
                  selectedIndexCopy.forEach(item => {
                    this.hand.splice(item, 1)
                  })
                  this.selectedIndex = []
                  const score = getWordScore(result.word, HAND_SIZE)
                  this.score += score
                  this.$toast('you got ' + score + ' points')
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
          this.selectedIndex = []
          this.score = 0
          this.round = 10
          await sleep(500)
          this.isPlaying = false
          this.isAuto = false
          break
        } else {
          await this.nextRound()
        }
      }
    },
    cancleAutoPlay () {
      this.isAuto = false
    },
    async play () {
      // this.hand = []
      // this.selectedIndex = []
      // this.score = 0
      // this.round = 10

      await this.countDown()
      this.isPlaying = true
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
      this.selectedIndex = []
      this.score = 0
      this.round = 10
      this.isPlaying = false
    },
    quit () {
      const isTrue = confirm('Confirm to quit?')
      if (isTrue) {
        this.end()
      }
    },
    restart () {
      const isTrue = confirm('Confirm to restart?')
      if (isTrue) {
        this.end()
        this.play()
      }
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
          this.hand = []
          this.selectedIndex = []
          this.score = 0
          this.round = 10
          this.isPlaying = false
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
        this.$toast('you got ' + result.score + ' points')
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
.scrabble {
  position: relative;
  width: 100%;
  height: 100%;
  .title {
    padding: 20px 0;
    font-size: 40px;
    line-height: 1;
    color: #42b983;
    cursor: default;
  }
  .menu {
    box-sizing: border-box;
    border-left: 2px solid #42b983;
    border-top: 2px solid #42b983;
    padding: 150px 0;
    position: absolute;
    z-index: 100;
    top: 0;
    right: -260px;
    width: 260px;
    height: 100%;
    background-color: #eee;
    transition: transform .3s;
    transform: translate3d(0, 0, 0);
    &.active {
      transform: translate3d(-100%, 0, 0);
    }
    .btn-wrap {
      margin-bottom: 50px;
    }
  }
  .menu-icon {
    position: absolute;
    z-index: 101;
    top: 40px;
    right: 30px;
    width: 30px;
    height: 25px;
    box-sizing: border-box;
    border-top: 5px solid #42b983;
    border-bottom: 5px solid #42b983;
    background-color: #42b983;
    padding: 5px 0;
    background-clip: content-box;
    cursor: pointer;
    transition: transform .1s;
    transform: translate3d(0, 0, 0);
    &.active {
      transform: translate3d(-160px, 0, 0);
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all .5s;
}

.slide-enter,
{
  opacity: 0;
  transform: translate3d(-100%, 0, 0);
}

.slide-leave-active {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}

.list-enter,
.list-leave-active {
  opacity: 0;
  transform: translate3d(0, -100%, 0);
}

.list-leave-active {
  position: absolute;
}

.game-title {
  position: absolute;
  left: 50%;
  bottom: 180px;
  transform: translateX(-50%);
  box-sizing: border-box;
  width: 60%;
  height: 300px;
  border: 2px dashed #f35626;
  margin: 20px auto;
  font-size: 100px;
  line-height: 300px;
  color: #f35626;
  background-image: -webkit-linear-gradient(92deg, #f35626, #feab3a);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: hue 60s infinite linear;
}

.card-wrap {
  font-size: 0;
  user-select: none;
  li {
    display: inline-block;
    width: 50px;
    margin-right: 10px;
    padding: 50px 40px;
    border: 2px solid #bbb;
    border-radius: 10px;
    font-size: 60px;
    cursor: pointer;
    transition: transform .4s;
    transform: translate3d(0, 0, 0);
    &.select {
      transform: translate3d(0, -20%, 0);
      border-color: #42b983;
      box-shadow: 0 0 5px 1px #42b983;
    }
  }
}

.countdown {
  position: fixed;
  z-index: 200;
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
    margin-top: -165px;
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

@keyframes hue {
  0% {
    -webkit-filter: hue-rotate(0deg);
  }
  100% {
    -webkit-filter: hue-rotate(-360deg);
  }
}

.btn-group {
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 60px;
}

.btn-group,
.menu {
  button {
    padding: 10px 20px;
    margin-right: 20px;
    font-size: 20px;
    font-weight: bold;
    border-radius: 8px;
    border: 2px solid #42b983;
    color: #42b983;
    transition: transform .15s;
    background-color: #eee;
    &:hover {
      transform: scale3d(1.1, 1.1, 1.1);
      color: darken(#42b983, 5%);
      border-color: darken(#42b983, 5%);
    }
    &:active {
      transform: scale3d(.9, .9, .9)
    }
    &:disabled {
      color: #ccc;
      border-color: #ccc;
      cursor: not-allowed;
    }
  }
}

.menu {
  button {
    box-sizing: border-box;
    width: 160px;
    margin-right: 0;
    background-color: #42b983;
    color: #eee;
    border-color: darken(#42b983, 5%);
    &:hover {
      color: #fff;
      border-color: darken(#42b983, 10%);
    }
  }
}

.info {
  cursor: default;
  span {
    margin-right: 40px;
    font-size: 16px;
    font-weight: bold;
  }
}

.word-display {
  margin: 50px 0 50px;
  text-align: center;
  border: none;
  font-size: 70px;
  font-weight: bold;
  color: #42b983;
  background-color: #f1f1f1;
}
</style>
