const NES_WIDTH = 256
const NES_HEIGHT = 240
const RATIO = NES_HEIGHT / NES_WIDTH
const WIDTH = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
const HEIGHT =
  window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
const PADDING = 20
const SCREEN_WIDTH = WIDTH - PADDING * 2
const SCREEN_HEIGHT = SCREEN_WIDTH * RATIO
const CONTROLS_HEIGHT = HEIGHT - SCREEN_HEIGHT - PADDING * 3
const CONTROLS_WIDTH = SCREEN_WIDTH

const DIRECTION_WIDTH = CONTROLS_WIDTH * 0.4
const DIRECTION_HEIGHT = CONTROLS_WIDTH * 0.4

const BUTTON_WIDTH = DIRECTION_WIDTH * 0.5
const BUTTON_HEIGHT = DIRECTION_WIDTH * 0.5

export {
  CONTROLS_HEIGHT,
  CONTROLS_WIDTH,
  NES_WIDTH,
  NES_HEIGHT,
  RATIO,
  WIDTH,
  HEIGHT,
  PADDING,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  DIRECTION_WIDTH,
  DIRECTION_HEIGHT,
  BUTTON_WIDTH,
  BUTTON_HEIGHT,
}
