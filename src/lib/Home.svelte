<script>
  import dayjs from 'dayjs'
  import { onMount } from 'svelte'
  import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config.ts'
  import { ScreenTrigger } from '../event.ts'

  let homewidth, homeheight

  let time = ''
  let left = '1rem'
  let home = null
  $: {
    let num = current - 1
    num = num <= 0 ? 0 : num
    left = `calc(1rem - ${num * homeheight * 0.4}px - ${num * 0.75}rem)`
  }
  let current = 0
  let list = [
    { title: 'mxt', url: '/roms/mxt.nes', cover: '' },
    { title: '五子棋', url: '/roms/wzq.nes', cover: '' },
    { title: 'test', url: '', cover: '' },
    { title: 'test', url: '', cover: '' },
  ]
  export function onEvent(e) {
    if (e.key === 'left') {
      if (e.type === 'keydown') current = (current - 1 + list.length) % list.length
    } else if (e.key === 'right') {
      if (e.type === 'keydown') current = (current + 1) % list.length
    } else if (e.key === 'a') {
      ScreenTrigger.next({ type: 'game', ...list[current], action: 'start game' })
    }
  }

  onMount(() => {
    homewidth = home?.getBoundingClientRect().width
    homeheight = home?.getBoundingClientRect().height
    let interval = setInterval(() => {
      time = dayjs().format('HH:mm')
    }, 1000)
    return () => clearInterval(interval)
  })
</script>

<div
  style:width={'calc(' + SCREEN_WIDTH + 'px - ' + '1rem)'}
  style:height={'calc(' + SCREEN_HEIGHT + 'px - ' + '1rem)'}
  class="p-2 flex-shrink-0 mr-3"
>
  <div bind:this={home} class="w-full h-full bg-[#eaeaea] relative overflow-hidden">
    <div
      style:height={homeheight * 0.25 + 'px'}
      class="flex justify-between w-full items-center px-4"
    >
      <div class="text-2xl text-[#ce28ae]">{time}</div>
    </div>
    <div style:height={homeheight * 0.5 + 'px'} class="px-4 w-full overflow-hidden relative">
      <div class="flex transform-gpu transition-all absolute bottom-0" style:left>
        {#each list as item, index}
          <div
            style:height={homeheight * 0.4 + 'px'}
            style:width={homeheight * 0.4 + 'px'}
            class="rounded-sm mr-3 p-0.5 {index === current
              ? 'border-4 border-[#ce28ae]'
              : ''} relative"
          >
            <div class="rounded-sm bg-amber-100 w-full h-full"></div>
            {#if index === current}
              <p class="text-[#ce28ae] absolute -top-7 left-1/2 -translate-x-1/2">{item.title}</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <div></div>
  </div>
</div>
