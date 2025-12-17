<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import Screen from './lib/Screen.svelte'
  import Control from './lib/Control.svelte'
  import Contact from './lib/Contact.svelte'
  import { PADDING, WIDTH, HEIGHT } from './config'
  import { KeyTrigger } from './event'
  import ClickFeedback from './func/ClickFeedback'

  const isDesktop =
    (window.matchMedia && window.matchMedia('(pointer: fine)').matches) ||
    (window.innerWidth || 0) >= 1024

  const keyMap: Record<string, string> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    z: 'a',
    Z: 'a',
    x: 'b',
    X: 'b',
    Enter: 'start',
    Shift: 'select',
    Escape: 'home',
  }

  const handleKey = (event: KeyboardEvent) => {
    const mapped = keyMap[event.key]
    if (!mapped) return
    event.preventDefault()
    KeyTrigger.next({ key: mapped, type: event.type })
  }

  onMount(() => {
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKey)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKey)
    window.removeEventListener('keyup', handleKey)
  })

  KeyTrigger.subscribe({
    next: (e) => {
      if ((e as any).type === 'keydown') {
        ClickFeedback.feedback()
      }
    },
  })
</script>

<div class="page">
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
  {#if isDesktop}
    <div class="hint-card">
      <div class="font-semibold text-sm text-gray-800 mb-2">键位映射</div>
      <ul class="text-xs text-gray-700 space-y-1">
        <li class="flex justify-between gap-3">
          <span class="text-gray-500">方向</span>
          <span class="font-medium">↑ ↓ ← →</span>
        </li>
        <li class="flex justify-between gap-3">
          <span class="text-gray-500">A</span>
          <span class="font-medium">Z</span>
        </li>
        <li class="flex justify-between gap-3">
          <span class="text-gray-500">B</span>
          <span class="font-medium">X</span>
        </li>
        <li class="flex justify-between gap-3">
          <span class="text-gray-500">Start</span>
          <span class="font-medium">Enter</span>
        </li>
        <li class="flex justify-between gap-3">
          <span class="text-gray-500">Select</span>
          <span class="font-medium">Shift</span>
        </li>
        <li class="flex justify-between gap-3">
          <span class="text-gray-500">Home</span>
          <span class="font-medium">Esc</span>
        </li>
      </ul>
      <div class="text-[11px] text-gray-500 mt-3 leading-snug">支持长按与快速连按操作。</div>
    </div>
  {/if}
</div>

<style>
  .page {
    background: #f2f2f2;
    width: 100vw;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px;
    box-sizing: border-box;
  }
  .app-shell {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hint-card {
    width: 200px;
    background: #ffffff;
    padding: 12px 14px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  }
</style>
