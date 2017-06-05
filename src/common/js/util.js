export function sleep (time = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export function paddingZero (num) {
  return num < 10 ? '0' + num : '' + num
}
