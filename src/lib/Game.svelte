<script>
  import { onMount } from 'svelte'
  import { Emulator } from '../func/Emulator.js'
  import { loadBinary } from '../utils.ts'
  import { NES_HEIGHT, NES_WIDTH } from '../config.ts'

  let canvas, ctx, emulator
  onMount(async () => {
    ctx = canvas.getContext('2d')
    let rom = await loadBinary('/roms/mxt.nes')
    emulator = new Emulator({
      screen:ctx
    })
    emulator.loadRom(rom)
    emulator.start()
    setTimeout(_=>{
      emulator.stop()
    },1000*10)
  })
</script>

<canvas width={NES_WIDTH} height={NES_HEIGHT} bind:this={canvas} class="w-full h-full"></canvas>

<style>
  canvas {
    image-rendering: pixelated;
  }
</style>
