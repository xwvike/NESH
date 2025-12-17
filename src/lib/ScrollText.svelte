<script>
  import { onMount, onDestroy } from 'svelte'

  let container
  let content
  let scrolling = false
  let duration = 8
  let distance = 0

  const measure = () => {
    const containerWidth = container?.clientWidth || 0
    const contentWidth = content?.scrollWidth || 0
    distance = Math.max(contentWidth - containerWidth, 0)
    scrolling = distance > 1
    // 40px/s 基准速度，最长内容时不至于过快
    duration = Math.max(6, (contentWidth + containerWidth) / 40)
  }

  let resizeObserver
  onMount(() => {
    measure()
    resizeObserver = new ResizeObserver(measure)
    if (container) resizeObserver.observe(container)
    if (content) resizeObserver.observe(content)
  })

  onDestroy(() => {
    if (resizeObserver) resizeObserver.disconnect()
  })
</script>

<div class="w-full overflow-hidden" bind:this={container}>
  <div class={`w-full flex ${scrolling ? 'justify-start' : 'justify-center'}`}>
    <span
      bind:this={content}
      class={`inline-block whitespace-nowrap ${scrolling ? 'scrolling' : ''}`}
      style={`--distance:${distance}px; --duration:${duration}s;`}
    >
      <slot />
    </span>
  </div>
</div>

<style>
  .scrolling {
    animation: marquee var(--duration, 8s) linear infinite;
  }
  .scrolling:hover {
    animation-play-state: paused;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-1 * var(--distance, 0px)));
    }
  }
</style>
