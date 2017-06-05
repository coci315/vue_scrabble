export function saveToLocal (key, value) {
  let scrabble = window.localStorage.__scrabble__
  if (!scrabble) {
    scrabble = {}
  } else {
    scrabble = JSON.parse(scrabble)
  }
  scrabble[key] = value
  window.localStorage.__scrabble__ = JSON.stringify(scrabble)
}

export function loadFromLocal (key, def) {
  let scrabble = window.localStorage.__scrabble__
  if (!scrabble) {
    return def
  }
  scrabble = JSON.parse(scrabble)
  let ret = scrabble[key]
  return ret || def
}
