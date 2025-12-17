<script lang="ts">
  import Screen from './lib/Screen.svelte'
  import Control from './lib/Control.svelte'
  import Contact from './lib/Contact.svelte'
  import { PADDING, WIDTH, HEIGHT } from './config'
  import { KeyTrigger } from './event'
  import ClickFeedback from './func/ClickFeedback'

  KeyTrigger.subscribe({
    next: (e) => {
      if ((e as any).type === 'keydown') {
        ClickFeedback.feedback()
      }
    },
  })
</script>

<div class="app-shell">
  <div
    class="bg-[#ab2a29]"
    style:width={WIDTH + 'px'}
    style:height={HEIGHT + 'px'}
    style:padding-top={PADDING + 'px'}
  >
    <Screen />
    <div style:height={PADDING + 'px'} class="w-full"></div>
    <Control />
    <Contact />
  </div>
</div>

<style>
  .app-shell {
    background: #f2f2f2;
    width: 100vw;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
