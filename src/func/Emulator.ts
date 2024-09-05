import {NES} from 'jsnes'

class Emulator {
  private nes:NES
  constructor() {
    this.nes = new NES()
  }

  loadRom(rom: ArrayBuffer) {
    this.nes.loadROM(rom)
  }
}