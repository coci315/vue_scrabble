<template>
  <transition name='fade'>
    <div v-show='visible' :class='position' class='toast'>
      <i>{{message}}</i>
    </div>
  </transition>
</template>

<script>
export default {
  data () {
    return {
      visible: false,
      message: '',
      position: ''
    }
  }
}
</script>


<style>
.toast {
  position: fixed;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  word-wrap: break-word;
  padding: 10px;
  text-align: center;
  z-index: 9999;
  font-size: 16px;
  max-width: 80%;
  color: #333;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0);
  overflow: hidden;
}

.toast.middle {
  top: 50%;
}

.toast.top {
  top: 20%;
}

.toast.bottom {
  top: 90%;
}

.fade-enter-active,
.fade-leave-active {
  transition: all .5s;
}

.fade-enter {
  transform: translate3d(-50%, 50%, 0);
  opacity: 0;
}

.fade-leave-active {
  transform: translate3d(-50%, -100%, 0);
  opacity: 0;
}
</style>
