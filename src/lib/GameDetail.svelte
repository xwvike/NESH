<script>
  import { onMount } from 'svelte'
  import { ScreenTrigger } from '../event.ts'

  export let item = null
  let description = ''

  const loadDescription = async () => {
    if (!item?.description) {
      description = '暂无介绍'
      return
    }
    try {
      const res = await fetch(item.description)
      if (!res.ok) throw new Error('load description failed')
      description = await res.text()
    } catch (err) {
      console.error(err)
      description = '暂无介绍'
    }
  }

  export function onEvent(e) {
    if (e.type !== 'keydown') return
    if (e.key === 'home' || e.key === 'b') {
      ScreenTrigger.next({ type: 'home' })
    } else if (e.key === 'a') {
      ScreenTrigger.next({
        type: 'game',
        ...item,
        url: item?.rom,
        action: 'start game',
      })
    }
  }

  onMount(() => {
    loadDescription()
  })

  $: if (item) {
    loadDescription()
  }
</script>

{#if item}
  <div class="w-full h-full bg-[#eaeaea] p-4 flex flex-col gap-4 overflow-hidden">
    <div class="text-xl font-bold text-[#ce28ae]">{item.title}</div>
    <div class="flex gap-3 overflow-x-auto pb-2">
      {#each item.screens && item.screens.length ? item.screens : [item.cover] as shot}
        <img
          src={shot || item.cover}
          alt={item.title}
          class="h-32 w-auto rounded-md object-cover flex-shrink-0"
          draggable="false"
          on:contextmenu|preventDefault
        />
      {/each}
    </div>
    <div class="text-sm leading-relaxed bg-white rounded-md p-3 h-full overflow-auto">
      {description}
    </div>
  </div>
{:else}
  <div class="w-full h-full flex items-center justify-center text-[#ce28ae]">暂无数据</div>
{/if}
