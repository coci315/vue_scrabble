import Vue from 'vue'
import Router from 'vue-router'
import Scrabble from '@/components/Scrabble'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'Scrabble',
    component: Scrabble
  }]
})
