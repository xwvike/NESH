import { NES, Controller } from 'jsnes'
import { NES_WIDTH, NES_HEIGHT, FPS } from '../config.ts'

class Audio {
  constructor({ onBufferUnderrun }) {
    this.onBufferUnderrun = onBufferUnderrun
    this.audioContext = null
    this.workletNode = null
  }

  async start() {
    if (!(window.AudioContext || window.webkitAudioContext)) {
      console.error('Web Audio API is not supported in this browser')
      return
    }

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    try {
      await this.audioContext.audioWorklet.addModule('/js/audio-processor.js')
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor')

      this.workletNode.port.onmessage = (event) => {
        if (event.data.type === 'bufferUnderrun' && this.onBufferUnderrun) {
          this.onBufferUnderrun(event.data.size, event.data.needed)
        }
      }

      this.workletNode.connect(this.audioContext.destination)
    } catch (error) {
      console.error('Error setting up AudioWorklet:', error)
    }
  }

  stop() {
    if (this.workletNode) {
      this.workletNode.disconnect()
      this.workletNode = null
    }
    if (this.audioContext) {
      this.audioContext.close().catch(console.error)
      this.audioContext = null
    }
  }

  writeSample(left, right) {
    if (this.workletNode) {
      this.workletNode.port.postMessage({ type: 'writeSample', left, right })
    }
  }

  getSampleRate() {
    return this.audioContext ? this.audioContext.sampleRate : 44100
  }
}
class Video {
  constructor() {
    this.canvas = new OffscreenCanvas(NES_WIDTH, NES_HEIGHT)
    this.ctx = this.canvas.getContext('2d')
    this.imageData = this.ctx.getImageData(0, 0, NES_WIDTH, NES_HEIGHT)
    this.buffer = new ArrayBuffer(this.imageData.data.length)
    this.buffer_u8 = new Uint8ClampedArray(this.buffer)
    this.buffer_u32 = new Uint32Array(this.buffer)
    for (let i = 0; i < this.buffer_u32.length; ++i) {
      this.buffer_u32[i] = 0xff000000
    }
  }
  setBuffer(buffer) {
    let i = 0
    for (let y = 0; y < NES_HEIGHT; ++y) {
      for (let x = 0; x < NES_WIDTH; ++x) {
        i = y * NES_WIDTH + x
        this.buffer_u32[i] = 0xff000000 | buffer[i]
      }
    }
  }
  writeBuffer() {
    this.imageData.data.set(this.buffer_u8)
    this.ctx.putImageData(this.imageData, 0, 0)
  }
  getCanvas() {
    return this.canvas
  }
}

export class Emulator {
  constructor(props) {
    this.running = true
    this.interval = 1e3 / FPS
    this.lastFrameTime = false
    this.screen = props.screen
    this._requestID = null
    this.Audio = new Audio({
      onBufferUnderrun: (actualSize, desiredSize) => {
        if (!this.running) return
        this.generateFrame()
        if (actualSize < desiredSize) {
          console.log('Still buffer underrun, running a second frame')
          this.generateFrame()
        }
      },
    })
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.loadRom = this.loadRom.bind(this)
    this._requestAnimationFrame = this._requestAnimationFrame.bind(this)
    this.generateFrame = this.generateFrame.bind(this)
    this.writeFrame = this.writeFrame.bind(this)
    this.onanimationframe = this.onanimationframe.bind(this)
    this.Video = new Video()
    this.nes = new NES({
      onFrame: this.Video.setBuffer.bind(this.Video),
      onStatusUpdate: console.log,
      sampleRate: this.Audio.getSampleRate(),
      onAudioSample: this.Audio.writeSample.bind(this.Audio),
    })
    this.codeMap = {
      up: Controller.BUTTON_UP,
      down: Controller.BUTTON_DOWN,
      left: Controller.BUTTON_LEFT,
      right: Controller.BUTTON_RIGHT,
      a: Controller.BUTTON_A,
      b: Controller.BUTTON_B,
      select: Controller.BUTTON_SELECT,
      start: Controller.BUTTON_START,
    }
  }
  onEvent(e) {
    let code = this.getButtonCode(e.key)
    if (e.type === 'keydown') {
      this.nes.buttonDown(1, code)
    } else {
      this.nes.buttonUp(1, code)
    }
  }
  getButtonCode(key) {
    let code = -1
    if (this.codeMap[key] !== undefined) {
      code = this.codeMap[key]
    }
    return code
  }

  loadRom(rom) {
    this.nes.loadROM(rom)
  }
  generateFrame() {
    this.nes.frame()
    this.lastFrameTime += this.interval
  }
  writeFrame() {
    this.Video.writeBuffer()
    this.screen.drawImage(this.Video.getCanvas(), 0, 0)
  }
  async start() {
    await this.Audio.start()
    this.running = true
    this._requestAnimationFrame()
  }
  stop() {
    this.Audio.stop()
    this.running = false
    if (this._requestID) window.cancelAnimationFrame(this._requestID)
    this.lastFrameTime = false
  }
  _requestAnimationFrame() {
    this._requestID = window.requestAnimationFrame(this.onanimationframe)
  }
  onanimationframe(time) {
    this._requestAnimationFrame()
    let excess = time % this.interval
    let newFrameTime = time - excess
    if (!this.lastFrameTime) {
      this.lastFrameTime = newFrameTime
      return
    }
    let numFrames = Math.round((newFrameTime - this.lastFrameTime) / this.interval)
    if (numFrames === 0) return
    this.generateFrame()
    this.writeFrame()
    let timeToNextFrame = this.interval - excess
    for (let i = 1; i < numFrames; i++) {
      setTimeout(
        () => {
          this.generateFrame()
        },
        (i * timeToNextFrame) / numFrames
      )
    }
  }
}
