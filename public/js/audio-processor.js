class FloatRingBuffer {
  constructor(capacity) {
    this.capacity = capacity
    this.buffer = new Float32Array(capacity)
    this.readIndex = 0
    this.writeIndex = 0
    this.size = 0
  }

  pushStereo(left, right) {
    this.push(left)
    this.push(right)
  }

  push(value) {
    this.buffer[this.writeIndex] = value
    this.writeIndex = (this.writeIndex + 1) % this.capacity
    if (this.size < this.capacity) {
      this.size++
    } else {
      this.readIndex = (this.readIndex + 1) % this.capacity
    }
  }

  readTo(target, count) {
    const toRead = Math.min(count, this.size)
    for (let i = 0; i < toRead; i++) {
      target[i] = this.buffer[(this.readIndex + i) % this.capacity]
    }
    this.readIndex = (this.readIndex + toRead) % this.capacity
    this.size -= toRead
    return toRead
  }
}

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.channelCount = 2
    this.bufferSize = 8192
    this.scratch = new Float32Array(this.bufferSize * this.channelCount)
    this.buffer = new FloatRingBuffer(this.bufferSize * this.channelCount * 4)
    this.underrunReportInterval = 300
    this.lastUnderrunReport = 0
    this.port.onmessage = this.onMessage.bind(this)
  }

  onMessage(event) {
    if (event.data.type === 'writeSample') {
      this.writeSample(event.data.left, event.data.right)
    }
    if (event.data.type === 'config') {
      this.reconfigure(event.data)
    }
  }

  reconfigure(config) {
    if (typeof config.bufferSize === 'number' && config.bufferSize > 0) {
      this.bufferSize = config.bufferSize
      this.scratch = new Float32Array(this.bufferSize * this.channelCount)
      this.buffer = new FloatRingBuffer(this.bufferSize * this.channelCount * 4)
    }
  }

  writeSample(left, right) {
    this.buffer.pushStereo(left, right)
  }

  reportUnderrun(needed) {
    const now = currentTime * 1000
    if (now - this.lastUnderrunReport >= this.underrunReportInterval) {
      this.lastUnderrunReport = now
      this.port.postMessage({ type: 'bufferUnderrun', size: this.buffer.size, needed })
    }
  }

  process(inputs, outputs) {
    const output = outputs[0]
    const size = output[0].length
    const requiredSamples = size * this.channelCount

    if (this.buffer.size < requiredSamples) {
      this.reportUnderrun(requiredSamples)
    }

    if (this.scratch.length < requiredSamples) {
      this.scratch = new Float32Array(requiredSamples)
    } else {
      this.scratch.fill(0)
    }

    this.buffer.readTo(this.scratch, requiredSamples)

    for (let i = 0; i < size; i++) {
      output[0][i] = this.scratch[i * 2] || 0
      output[1][i] = this.scratch[i * 2 + 1] || 0
    }

    return true
  }
}

registerProcessor('audio-processor', AudioProcessor)
