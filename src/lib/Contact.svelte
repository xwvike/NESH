<script>
  import { WIDTH, HEIGHT, DIRECTION_WIDTH } from '../config.ts'
  import { onMount } from 'svelte'
  import { TouchTrigger } from '../event.ts'

  let canvas, ctx
  let touchPoints = []
  onMount(() => {
    ctx = canvas.getContext('2d')
    draw()
  })

  const draw = () => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    for (let i = 0; i < touchPoints.length; i++) {
      const touch = touchPoints[i]
      ctx.beginPath()
      ctx.arc(touch.clientX, touch.clientY, DIRECTION_WIDTH * 0.15, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.fill()
    }
    requestAnimationFrame(draw)
  }

  const touchEvent = (event) => {
    touchPoints = event.touches
    TouchTrigger.next({ event })
    event.preventDefault()
  }
</script>

<canvas
  width={WIDTH}
  height={HEIGHT}
  on:touchstart={touchEvent}
  on:touchmove={touchEvent}
  on:touchend={touchEvent}
  class="fixed top-0 left-0"
  bind:this={canvas}
  style:width={WIDTH + 'px'}
  style:height={HEIGHT + 'px'}
></canvas>
