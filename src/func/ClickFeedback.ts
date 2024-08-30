class ClickFeedback{
  private isVibrationSupported: boolean
  private os:string = 'unknown'
  private vibratePattern = [50];
  constructor() {
    this.isVibrationSupported = "vibrate" in navigator;
    const ua = navigator.userAgent || navigator.vendor || (window as any)?.opera;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any)?.MSStream) this.os = 'ios';
    if (/android/i.test(ua)) this.os = 'android';
  }
  private vibrate() {
    navigator.vibrate(this.vibratePattern);
  }
  private playAudio() {}
}