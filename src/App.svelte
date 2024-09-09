<script lang="ts">
  import Screen from './lib/Screen.svelte'
  import Control from './lib/Control.svelte'
  import Contact from './lib/Contact.svelte'
  import { PADDING, WIDTH, HEIGHT } from './config.ts'
  import { KeyTrigger } from './event.ts'
  import ClickFeedback from './func/ClickFeedback'

  KeyTrigger.subscribe({
    next: (e) => {
      if (e.type === 'keydown') {
        ClickFeedback.feedback()
      }
    },
  })
</script>

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
