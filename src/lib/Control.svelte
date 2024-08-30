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
    DEBUG,
    WIDTH,
    HEIGHT,
  } from '../config.ts'
  import { KeyTrigger, TouchTrigger } from '../event.ts'
  import directionImg from '../assets/img/18.png'
  import buttonImg from '../assets/img/button.png'
  import homeImg from '../assets/img/14.png'
  import startImg from '../assets/img/15.png'
  import selectImg from '../assets/img/16.png'

  let debug, ctx

  let directionButton, bButton, aButton, selectButton, startButton, homeButton

  const touchPoint = [
    { x: 0, y: 0, status: '', touchId: null, activeKey: new Set() },
    { x: 0, y: 0, status: '', touchId: null, activeKey: new Set() },
    { x: 0, y: 0, status: '', touchId: null, activeKey: new Set() },
    { x: 0, y: 0, status: '', touchId: null, activeKey: new Set() },
  ]

  onMount(() => {
    TouchTrigger.subscribe({
      next: (value) => {
        const {
          event: { changedTouches, type },
        } = value
        for (let i = 0; i < changedTouches.length; i++) {
          updateTouch(changedTouches[i], type)
        }
      },
    })
    if (DEBUG) {
      ctx = debug.getContext('2d')
      debugDraw()
    }
  })

  const debugDraw = () => {
    const info = getButtonInfo()
    ctx.clearRect(0, 0, CONTROLS_WIDTH, CONTROLS_HEIGHT)
    ctx.strokeStyle = 'red'
    ctx.strokeWidth = 2
    for (let item in info) {
      const { type, x, y, r, a, b, c, d } = info[item]
      ctx.beginPath()
      if (type === 'circle') {
        ctx.arc(x, y, r, 0, 2 * Math.PI)
      } else if (type === 'square') {
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.lineTo(c.x, c.y)
        ctx.lineTo(d.x, d.y)
        ctx.lineTo(a.x, a.y)
      }
      ctx.stroke()
    }
    requestAnimationFrame(debugDraw)
  }
  const updateTouch = (touch, status) => {
    const index = findIndexByTouchId(touch.identifier)
    if (status === 'touchend') {
      if (index !== -1) {
        touchPoint[index].state = ''
        touchPoint[index].x = 0
        touchPoint[index].y = 0
        touchPoint[index].touchId = null
        for (let key of touchPoint[index].activeKey) {
          KeyTrigger.next({ key, type: 'keyup' })
        }
        touchPoint[index].activeKey.clear()
      }
      return
    }
    const emptySlot = touchPoint.findIndex((item) => item.touchId === null)
    const x = touch.clientX
    const y = touch.clientY

    if (index === -1) {
      if (emptySlot !== -1) {
        touchPoint[emptySlot].touchId = touch.identifier
        touchPoint[emptySlot].status = status
        touchPoint[emptySlot].x = x
        touchPoint[emptySlot].y = y
      } else {
        console.error('No available slot for touch', touch.identifier)
      }
    } else {
      touchPoint[index].status = status
      touchPoint[index].x = x
      touchPoint[index].y = y
    }

    let _index = index < 0 ? emptySlot : index
    if (_index < 0) return
    const otherPointIndex = { 0: [1, 2, 3], 1: [0, 2, 3], 2: [0, 1, 3], 3: [0, 1, 2] }
    let otherActiveKey = new Set()
    otherPointIndex[_index].forEach((i) => {
      otherActiveKey = new Set([...otherActiveKey, ...touchPoint[i].activeKey])
    })

    let activeKey = getKeyByPosition(x, y)
    activeKey = activeKey.filter((key) => !otherActiveKey.has(key))
    DEBUG && console.log('activeKey', activeKey)
    let oldActiveKey = touchPoint[_index].activeKey

    let diff = arrayDifference([...oldActiveKey], activeKey)
    if (diff.length <= 0) return

    diff.forEach((key) => {
      let include = activeKey.includes(key)
      if (include) {
        KeyTrigger.next({ key, type: 'keydown' })
      } else {
        KeyTrigger.next({ key, type: 'keyup' })
      }
    })
    touchPoint[_index].activeKey = new Set(activeKey)
  }
  const arrayDifference = (array1, array2) => {
    return array1
      .filter((x) => !array2.includes(x))
      .concat(array2.filter((x) => !array1.includes(x)))
  }
  const findIndexByTouchId = (id) => {
    for (let i = 0; i < touchPoint.length; i++) {
      if (touchPoint[i].touchId === id) {
        return i
      }
    }
    return -1
  }
  const getButtonInfo = () => {
    const aButtonRect = aButton.getBoundingClientRect()
    const bButtonRect = bButton.getBoundingClientRect()
    const directionButtonRect = directionButton.getBoundingClientRect()
    const homeButtonRect = homeButton.getBoundingClientRect()
    const selectButtonRect = selectButton.getBoundingClientRect()
    const startButtonRect = startButton.getBoundingClientRect()
    return {
      a: {
        type: 'circle',
        x: aButtonRect.x + aButtonRect.width / 2,
        y: aButtonRect.y + aButtonRect.height / 2,
        r: aButtonRect.width / 2,
      },
      b: {
        type: 'circle',
        x: bButtonRect.x + bButtonRect.width / 2,
        y: bButtonRect.y + bButtonRect.height / 2,
        r: bButtonRect.width / 2,
      },
      up: {
        type: 'square',
        a: { x: directionButtonRect.x, y: directionButtonRect.y },
        b: { x: directionButtonRect.x + directionButtonRect.width, y: directionButtonRect.y },
        c: {
          x: directionButtonRect.x + directionButtonRect.width * 0.666,
          y: directionButtonRect.y + directionButtonRect.height * 0.333,
        },
        d: {
          x: directionButtonRect.x + directionButtonRect.width * 0.333,
          y: directionButtonRect.y + directionButtonRect.height * 0.333,
        },
      },
      down: {
        type: 'square',
        a: {
          x: directionButtonRect.x,
          y: directionButtonRect.y + directionButtonRect.height,
        },
        b: {
          x: directionButtonRect.x + directionButtonRect.width,
          y: directionButtonRect.y + directionButtonRect.height,
        },
        c: {
          x: directionButtonRect.x + directionButtonRect.width * 0.666,
          y: directionButtonRect.y + directionButtonRect.height * 0.666,
        },
        d: {
          x: directionButtonRect.x + directionButtonRect.width * 0.333,
          y: directionButtonRect.y + directionButtonRect.height * 0.666,
        },
      },
      left: {
        type: 'square',
        a: { x: directionButtonRect.x, y: directionButtonRect.y },
        b: {
          x: directionButtonRect.x + directionButtonRect.width * 0.333,
          y: directionButtonRect.y + directionButtonRect.height * 0.333,
        },
        c: {
          x: directionButtonRect.x + directionButtonRect.width * 0.333,
          y: directionButtonRect.y + directionButtonRect.height * 0.666,
        },
        d: { x: directionButtonRect.x, y: directionButtonRect.y + directionButtonRect.height },
      },
      right: {
        type: 'square',
        a: {
          x: directionButtonRect.x + directionButtonRect.width,
          y: directionButtonRect.y,
        },
        b: {
          x: directionButtonRect.x + directionButtonRect.width,
          y: directionButtonRect.y + directionButtonRect.height,
        },
        c: {
          x: directionButtonRect.x + directionButtonRect.width * 0.666,
          y: directionButtonRect.y + directionButtonRect.height * 0.666,
        },
        d: {
          x: directionButtonRect.x + directionButtonRect.width * 0.666,
          y: directionButtonRect.y + directionButtonRect.height * 0.333,
        },
      },
      home: {
        type: 'square',
        a: {
          x: homeButtonRect.x,
          y: homeButtonRect.y,
        },
        b: {
          x: homeButtonRect.x + homeButtonRect.width,
          y: homeButtonRect.y,
        },
        c: {
          x: homeButtonRect.x + homeButtonRect.width,
          y: homeButtonRect.y + homeButtonRect.height,
        },
        d: {
          x: homeButtonRect.x,
          y: homeButtonRect.y + homeButtonRect.height,
        },
      },
      select: {
        type: 'square',
        a: {
          x: selectButtonRect.x,
          y: selectButtonRect.y,
        },
        b: {
          x: selectButtonRect.x + selectButtonRect.width,
          y: selectButtonRect.y,
        },
        c: {
          x: selectButtonRect.x + selectButtonRect.width,
          y: selectButtonRect.y + selectButtonRect.height,
        },
        d: {
          x: selectButtonRect.x,
          y: selectButtonRect.y + selectButtonRect.height,
        },
      },
      start: {
        type: 'square',
        a: {
          x: startButtonRect.x,
          y: startButtonRect.y,
        },
        b: {
          x: startButtonRect.x + startButtonRect.width,
          y: startButtonRect.y,
        },
        c: {
          x: startButtonRect.x + startButtonRect.width,
          y: startButtonRect.y + startButtonRect.height,
        },
        d: {
          x: startButtonRect.x,
          y: startButtonRect.y + startButtonRect.height,
        },
      },
    }
  }
  const getKeyByPosition = (x, y) => {
    const keyList = getButtonInfo()
    let keyName = []
    for (let key in keyList) {
      switch (keyList[key]['type']) {
        case 'circle':
          if (
            Math.pow(x - keyList[key]['x'], 2) + Math.pow(y - keyList[key]['y'], 2) <
            Math.pow(keyList[key]['r'] + DIRECTION_WIDTH * 0.15, 2)
          ) {
            keyName.push(key)
          }
          break
        case 'square':
          if (
            isOverlap({ x, y, r: DIRECTION_WIDTH * 0.15 }, [
              keyList[key]['a'],
              keyList[key]['b'],
              keyList[key]['c'],
              keyList[key]['d'],
            ])
          ) {
            keyName.push(key)
          }
          break
        default:
          break
      }
    }
    return keyName
  }
  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }
  const isOverlap = (circle, trapezoid) => {
    let { x: cx, y: cy, r } = circle

    for (let i = 0; i < 4; i++) {
      let p1 = trapezoid[i]
      let p2 = trapezoid[(i + 1) % 4]
      let d = distance(p1.x, p1.y, p2.x, p2.y)
      let det = (cx - p1.x) * (p2.x - p1.x) + (cy - p1.y) * (p2.y - p1.y)
      if (det >= 0 && det <= d ** 2) {
        let perpD = ((p2.y - p1.y) * (cx - p1.x) - (p2.x - p1.x) * (cy - p1.y)) / d
        if (Math.abs(perpD) <= r) {
          return true
        }
      }
    }
    
    for (let p of trapezoid) {
      if (distance(cx, cy, p.x, p.y) <= r) {
        return true
      }
    }

    return false
  }
</script>

<div
  on:click={() => KeyTrigger.next({ key: 'control' })}
  style:width={CONTROLS_WIDTH + 'px'}
  style:height={CONTROLS_HEIGHT + 'px'}
  style:padding={PADDING + 'px'}
  class="control box-border relative"
>
  {#if DEBUG}
    <canvas
      style:width={WIDTH + 'px'}
      style:height={HEIGHT + 'px'}
      width={WIDTH}
      height={HEIGHT}
      class="fixed top-0 left-0"
      bind:this={debug}
    />
  {/if}
  <img
    style:width={BUTTON_WIDTH * 0.8 + 'px'}
    bind:this={selectButton}
    src={selectImg}
    alt="select button"
  />
  <img
    style:width={BUTTON_WIDTH * 0.8 + 'px'}
    bind:this={startButton}
    style:left={BUTTON_WIDTH * 1.6 + 'px'}
    style:top={PADDING + 'px'}
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
    style:top={PADDING + 'px'}
    class="absolute"
  />
  <img
    bind:this={directionButton}
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
