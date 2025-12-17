import { NES, Controller } from 'jsnes'
import { NES_WIDTH, NES_HEIGHT, FPS } from '../config.ts'

class Audio {
  constructor({ onBufferUnderrun }) {
    this.onBufferUnderrun = onBufferUnderrun
    this.audioContext = null
    this.workletNode = null
    this.gainNode = null
    this.volume = 1
    this.moduleLoaded = false
    this.underrunCooldownMs = 120
    this.lastUnderrunAt = 0
    this.preferWorklet = false
    this.useWorklet = false
    this.processorNode = null
    this.fallbackMaxSamples = 32768
    this.fallbackCapacity = this.fallbackMaxSamples * 2
    this.fallbackRing = new Float32Array(this.fallbackCapacity)
    this.fallbackRead = 0
    this.fallbackWrite = 0
    this.fallbackSize = 0
    this.unlocked = false
  }

  async start() {
    // 首先在当前调用栈内尝试解锁音频，避免因等待异步加载导致用户手势丢失
    this.unlock()

    if (!this.audioContext) return

    this.useWorklet = !!this.audioContext.audioWorklet && this.preferWorklet
    if (this.useWorklet) {
      await this.setupWorklet()
    } else {
      if (this.preferWorklet && !this.audioContext.audioWorklet) {
        console.warn('AudioWorklet is not supported; falling back to ScriptProcessorNode')
      }
      this.setupFallbackProcessor()
    }

    await this.resume()
  }

  stop() {
    if (this.workletNode) {
      this.workletNode.port.onmessage = null
      this.workletNode.disconnect()
      this.workletNode = null
    }
    if (this.processorNode) {
      this.processorNode.disconnect()
      this.processorNode.onaudioprocess = null
      this.processorNode = null
    }
    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }
    if (this.audioContext) {
      const ctx = this.audioContext
      this.audioContext = null
      ctx.close().catch(console.error)
    }
  }

  writeSample(left, right) {
    if (this.useWorklet && this.workletNode) {
      this.workletNode.port.postMessage({ type: 'writeSample', left, right })
    } else if (this.processorNode) {
      this.pushFallback(left)
      this.pushFallback(right)
    }
  }

  getSampleRate() {
    return this.audioContext ? this.audioContext.sampleRate : 44100
  }

  unlock() {
    if (!(window.AudioContext || window.webkitAudioContext)) {
      console.error('Web Audio API is not supported in this browser')
      return
    }
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.gainNode = this.audioContext.createGain()
      this.gainNode.gain.value = this.volume
    }
    if (this.audioContext.state === 'suspended') {
      // 不等待 Promise，确保在用户手势调用栈内触发
      this.audioContext.resume().catch(console.error)
    }
    if (!this.unlocked && this.audioContext && this.gainNode) {
      // 播放极短静音以满足部分浏览器的解锁要求
      const buffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate)
      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.audioContext.destination)
      source.start(0)
      this.unlocked = true
    }
  }

  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  setVolume(value) {
    this.volume = Math.min(Math.max(value, 0), 1)
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume
    }
  }

  async setupWorklet() {
    if (!this.audioContext || this.workletNode) return
    try {
      if (!this.moduleLoaded) {
        await this.audioContext.audioWorklet.addModule('/js/audio-processor.js')
        this.moduleLoaded = true
      }
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor')
      this.workletNode.port.onmessage = (event) => {
        if (event.data.type === 'bufferUnderrun' && this.onBufferUnderrun) {
          const now = performance.now()
          if (now - this.lastUnderrunAt >= this.underrunCooldownMs) {
            this.lastUnderrunAt = now
            this.onBufferUnderrun(event.data.size, event.data.needed)
          }
        }
      }
      if (this.gainNode) {
        this.workletNode.connect(this.gainNode)
        this.gainNode.connect(this.audioContext.destination)
      } else {
        this.workletNode.connect(this.audioContext.destination)
      }
      this.workletNode.port.postMessage({
        type: 'config',
        bufferSize: 8192,
      })
    } catch (error) {
      console.error('Error setting up AudioWorklet:', error)
      this.useWorklet = false
      this.setupFallbackProcessor()
    }
  }

  setupFallbackProcessor() {
    if (!this.audioContext || this.processorNode) return
    const bufferSize = 2048
    this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 0, 2)
    this.processorNode.onaudioprocess = (event) => {
      const outputL = event.outputBuffer.getChannelData(0)
      const outputR = event.outputBuffer.getChannelData(1)
      const available = Math.floor(this.fallbackSize / 2)
      if (available < bufferSize && this.onBufferUnderrun) {
        const now = performance.now()
        if (now - this.lastUnderrunAt >= this.underrunCooldownMs) {
          this.lastUnderrunAt = now
          this.onBufferUnderrun(this.fallbackSize, bufferSize * 2)
        }
      }
      for (let i = 0; i < bufferSize; i++) {
        if (this.fallbackSize >= 2) {
          outputL[i] = this.popFallback()
          outputR[i] = this.popFallback()
        } else {
          outputL[i] = 0
          outputR[i] = 0
        }
      }
    }
    if (this.gainNode) {
      this.processorNode.connect(this.gainNode)
      this.gainNode.connect(this.audioContext.destination)
    } else {
      this.processorNode.connect(this.audioContext.destination)
    }
  }

  pushFallback(value) {
    this.fallbackRing[this.fallbackWrite] = value
    this.fallbackWrite = (this.fallbackWrite + 1) % this.fallbackCapacity
    if (this.fallbackSize < this.fallbackCapacity) {
      this.fallbackSize++
    } else {
      // 覆盖最旧数据
      this.fallbackRead = (this.fallbackRead + 1) % this.fallbackCapacity
    }
  }

  popFallback() {
    if (this.fallbackSize === 0) return 0
    const value = this.fallbackRing[this.fallbackRead]
    this.fallbackRead = (this.fallbackRead + 1) % this.fallbackCapacity
    this.fallbackSize--
    return value
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
    this.running = false
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
    if (typeof this.lastFrameTime === 'number') {
      this.lastFrameTime += this.interval
    }
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
    if (!this.running) return
    this._requestID = window.requestAnimationFrame(this.onanimationframe)
  }
  onanimationframe(time) {
    if (!this.running) return
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
