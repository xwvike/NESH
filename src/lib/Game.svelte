<script>
  import { onMount } from 'svelte'
  import { Emulator } from '../func/Emulator.js'
  import { loadBinary } from '../utils.ts'
  import { NES_HEIGHT, NES_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH } from '../config.ts'
  import { ScreenTrigger } from '../event.ts'

  let canvas, ctx, emulator
  const init = async () => {
    ctx = canvas.getContext('2d')
    emulator = new Emulator({
      screen: ctx,
    })
  }
  export async function startGame(arg) {
    let rom = await loadBinary(arg.url)
    emulator.loadRom(rom)
    emulator.start()
  }
  export function continueGame() {
    emulator.start()
  }
  export function onEvent(e) {
    if (e.type === 'keydown' && e.key === 'home') {
      emulator.stop()
      ScreenTrigger.next({ type: 'home' })
      return
    }
    emulator.onEvent(e)
  }
  onMount(async () => {
    await init()
  })
</script>

<canvas
  style:width={'calc(' + SCREEN_WIDTH + 'px - ' + '1rem)'}
  style:height={'calc(' + SCREEN_HEIGHT + 'px - ' + '1rem)'}
  width={NES_WIDTH}
  height={NES_HEIGHT}
  bind:this={canvas}
  class="w-full h-full flex-shrink-0"
></canvas>

<style>
  canvas {
    image-rendering: pixelated;
  }
</style>
