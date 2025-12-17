<script>
  import { onMount } from 'svelte'
  import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config.ts'
  import { KeyTrigger, ScreenTrigger } from '../event.ts'
  import Game from './Game.svelte'
  import Home from './Home.svelte'
  let home, game
  let mode = 'home'
  let left = ''
  onMount(() => {
    KeyTrigger.subscribe({
      next: (e) => {
        if (mode === 'home') {
          home.onEvent(e)
        } else if (mode === 'game') {
          game.onEvent(e)
        }
      },
    })
    ScreenTrigger.subscribe({
      next: (e) => {
        mode = e.type
        if (mode === 'game') {
          left = `calc(0px - ${SCREEN_WIDTH}px + .25rem)`
          if (e.action === 'start game') {
            game.startGame(e)
          }
        } else if (mode === 'home') {
          left = '0px'
        }
      },
    })
  })
</script>

<div
  style:width={SCREEN_WIDTH + 'px'}
  style:height={SCREEN_HEIGHT + 'px'}
  class="screen p-2 overflow-hidden"
>
  <div class="flex transition-all" style:transform="translateX({left})">
    <Home bind:this={home} />
    <Game bind:this={game} />
  </div>
</div>

<style>
  .screen {
    background-image: url('../assets/img/21.png');
    background-size: 100% 100%;
    margin: 0 auto;
  }
</style>
