<script>
  import { onMount } from 'svelte'
  import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config.ts'
  import { KeyTrigger, ScreenTrigger } from '../event.ts'
  import Game from './Game.svelte'
  import Home from './Home.svelte'
  import GameDetail from './GameDetail.svelte'
  let home, game
  let detail
  let mode = 'home'
  let left = ''
  let detailItem = null
  onMount(() => {
    KeyTrigger.subscribe({
      next: (e) => {
        if (mode === 'home') {
          home.onEvent(e)
        } else if (mode === 'game') {
          game.onEvent(e)
        } else if (mode === 'detail') {
          detail.onEvent(e)
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
          detailItem = e
        } else if (mode === 'detail') {
          detailItem = e
          left = `calc(0px - ${SCREEN_WIDTH * 2}px + .5rem)`
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
    <GameDetail bind:this={detail} item={detailItem} />
  </div>
</div>

<style>
  .screen {
    background-image: url('../assets/img/21.png');
    background-size: 100% 100%;
    margin: 0 auto;
  }
</style>
