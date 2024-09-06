import { NES, Controller } from 'jsnes'
import RingBuffer from 'ringbufferjs'
import { NES_WIDTH, NES_HEIGHT } from '../config.ts'
import { KeyTrigger } from '../event.ts'

class Audio {
  constructor({ onBufferUnderrun }) {
    this.onBufferUnderrun = onBufferUnderrun
    this.bufferSize = 8192
    this.buffer = new RingBuffer(this.bufferSize * 2, Uint8Array)
  }
  getSampleRate() {
    if (!(window.AudioContext || window.webkitAudioContext)) {
      return 44100
    }
    let myAudioContext = new (window.AudioContext || window.webkitAudioContext)()
    let sampleRate = myAudioContext.sampleRate
    myAudioContext.close().then()
    return sampleRate
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
    requestAnimationFrame(this.writeBuffer.bind(this))
  }
  getCanvas() {
    return this.canvas
  }
}

export class Emulator {
  constructor() {
    this.Audio = new Audio({
      onBufferUnderrun: () => {
        console.log(`Buffer overrun`)
      },
    })
    this.Video = new Video()
    this.nes = new NES({
      onFrame: this.Video.setBuffer.bind(this.Video),
      onStatusUpdate: console.log,
      sampleRate: this.Audio.getSampleRate(),
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
    KeyTrigger.subscribe({
      next: (e) => {
        let code = this.getButtonCode(e.key)
        if (e.type === 'keydown') {
          this.nes.buttonDown(1, code)
        } else {
          this.nes.buttonUp(1, code)
        }
      },
    })
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
    this.Video.writeBuffer()
  }
  frame() {
    this.nes.frame()
  }
  getFrame() {
    return this.Video.getCanvas()
  }
}
