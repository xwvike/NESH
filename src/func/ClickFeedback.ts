import dot from '../assets/dot.mp3'
import { DEBUG } from '../config'

class ClickFeedback {
  private isVibrationSupported: boolean
  private os: string = 'unknown'
  private vibratePattern = [50]
  private audio = this.createAudio()
  constructor() {
    this.isVibrationSupported = 'vibrate' in navigator
    const ua = navigator.userAgent || navigator.vendor || (window as any)?.opera
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any)?.MSStream) this.os = 'ios'
    if (/android/i.test(ua)) this.os = 'android'
  }
  private createAudio() {
    const audio = new Audio()
    audio.src = dot
    return audio
  }
  private vibrate() {
    DEBUG && console.log('vibrate')
    navigator.vibrate(this.vibratePattern)
  }
  private playAudio() {
    DEBUG && console.log('play audio')
    this.audio
      .play()
      .then((r) => console.log(r))
      .catch((e) => console.error(e))
  }
  public feedback() {
    DEBUG && console.log('click feedback')
    if (this.os === 'ios') {
      this.playAudio()
    } else if (this.os === 'android') {
      if (this.isVibrationSupported) {
        this.vibrate()
      }
    } else {
      this.playAudio()
    }
  }
}

const clickFeedback = new ClickFeedback()
export default clickFeedback
