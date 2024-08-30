<script>
  import { onMount } from 'svelte'
  import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config.ts'
  import { KeyTrigger } from '../event.ts'

  onMount(() => {
    KeyTrigger.subscribe({
      next: (e) => {
        console.log(e)
      },
    })
  })
</script>

<div style:width={SCREEN_WIDTH + 'px'} style:height={SCREEN_HEIGHT + 'px'} class="screen"></div>

<style>
  .screen {
    background-image: url('../assets/img/21.png');
    background-size: 100% 100%;
    margin: 0 auto;
  }
</style>
