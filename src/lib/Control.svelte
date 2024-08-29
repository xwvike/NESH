<script>
  import { onMount } from 'svelte'
  import {
    CONTROLS_HEIGHT,
    PADDING,
    CONTROLS_WIDTH,
    DIRECTION_WIDTH,
    DIRECTION_HEIGHT,
    BUTTON_HEIGHT,
    BUTTON_WIDTH,
  } from '../config.ts'
  import { KeyTrigger } from '../event.ts'
  import directionImg from '../assets/img/18.png'
  import buttonImg from '../assets/img/button.png'
  import homeImg from '../assets/img/14.png'
  import startImg from '../assets/img/15.png'
  import selectImg from '../assets/img/16.png'

  let directionButton, bButton, aButton, selectButton, startButton, homeButton

  onMount(() => {})

  const getInfo = (e) => {
    console.log(directionButton.getBoundingClientRect())
  }
</script>

<div
  on:click={() => KeyTrigger.next({ key: 'control' })}
  style:width={CONTROLS_WIDTH + 'px'}
  style:height={CONTROLS_HEIGHT + 'px'}
  style:padding={PADDING + 'px'}
  class="control box-border relative"
>
  <img
    style:width={BUTTON_WIDTH * 0.8 + 'px'}
    bind:this={selectButton}
    src={selectImg}
    alt="select button"
  />
  <img
    style:width={BUTTON_WIDTH * 0.8 + 'px'}
    bind:this={startButton}
    style:left={BUTTON_WIDTH*1.6+'px'}
    style:top={PADDING+'px'}
    src={startImg}
    class="absolute"
    alt="start button"
  />
  <img
    bind:this={homeButton}
    src={homeImg}
    alt="homeButton"
    style:width={BUTTON_WIDTH * 0.6 + 'px'}
    style:right={PADDING + 'px'}
    style:top={PADDING+'px'}
    class="absolute"
  />
  <img
    bind:this={directionButton}
    on:click={getInfo}
    src={directionImg}
    style:width={DIRECTION_WIDTH + 'px'}
    style:height={DIRECTION_HEIGHT + 'px'}
    class="absolute top-[60%] -translate-y-1/2"
    alt="directionButton"
  />
  <div
    style:width={BUTTON_WIDTH * 2 + 'px'}
    style:height={BUTTON_HEIGHT * 2 + 'px'}
    style:right={PADDING + 'px'}
    class="grid grid-cols-8 grid-rows-8 absolute top-[60%] -translate-y-1/2"
  >
    <div
      bind:this={aButton}
      style:width={BUTTON_WIDTH + 'px'}
      style:height={BUTTON_HEIGHT + 'px'}
      style:--height={BUTTON_WIDTH * 0.3 + 'px'}
      data-key="A"
      class="col-start-5 relative col-end-9 row-start-2 row-end-6 beforeTag"
    >
      <img class="w-full h-full" src={buttonImg} alt="aButton" />
    </div>
    <div
      bind:this={bButton}
      style:width={BUTTON_WIDTH + 'px'}
      style:height={BUTTON_HEIGHT + 'px'}
      style:--height={BUTTON_WIDTH * 0.3 + 'px'}
      data-key="B"
      class="col-start-1 relative col-end-5 row-start-5 row-end-9 beforeTag"
    >
      <img class="w-full h-full" alt="bButton" src={buttonImg} />
    </div>
  </div>
</div>

<style>
  .control {
    background-image: url('../assets/img/17.png');
    background-size: 100% 100%;
    margin: 0 auto;
  }
  .beforeTag:before {
    content: Attr(data-key);
    @apply absolute text-white left-1/2 font-bold -translate-x-1/2 px-3 rounded-3xl;
    background: #2c2c2c;
    height: var(--height);
    line-height: var(--height);
    top: calc(0% - var(--height) - 2px);
  }
</style>
