import dot from '../assets/dot.mp3'
import { DEBUG } from '../config'

class ClickFeedback {
  private readonly isVibrationSupported: boolean
  private readonly os: string = 'unknown'
  private vibratePattern = [50]
  private buffer: AudioBuffer | undefined
  private readonly context: AudioContext | undefined
  constructor() {
    this.isVibrationSupported = 'vibrate' in navigator
    const ua = navigator.userAgent || navigator.vendor || (window as any)?.opera
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any)?.MSStream) this.os = 'ios'
    if (/android/i.test(ua)) this.os = 'android'
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  private async loadAudio() {
    if (!this.buffer) {
      const response = await fetch(dot)
      const arrayBuffer = await response.arrayBuffer()
      this.buffer = await this.context!.decodeAudioData(arrayBuffer)
    }
    return this.buffer
  }
  private vibrate() {
    DEBUG && console.log('vibrate')
    navigator.vibrate(this.vibratePattern)
  }
  private async playAudio() {
    DEBUG && console.log('play audio')
    if (this.context?.state === 'suspended') {
      await this.context.resume()
    }
    let buffer = await this.loadAudio()
    if (this.context) {
      const source = this.context.createBufferSource()
      if (!source || !buffer) return
      source.buffer = buffer
      source.connect(this.context.destination)
      source.start(0)
    }
  }
  public async feedback() {
    DEBUG && console.log('click feedback')
    if (this.os === 'ios') {
      await this.playAudio()
    } else if (this.os === 'android') {
      if (this.isVibrationSupported) {
        this.vibrate()
      }
    } else {
      await this.playAudio()
    }
  }
}

const clickFeedback = new ClickFeedback()
export default clickFeedback