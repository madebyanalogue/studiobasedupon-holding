<template>
  <section v-if="logos.length > 0" class="logo-marquee-section grid gap-40 pad-md-100 pad-top-bottom">
    <h2 v-if="props.section.logoMarqueeTitle || props.section.title" class="subtitle subtitle--circle yellow-dot">
      {{ props.section.logoMarqueeTitle || props.section.title }}
    </h2>

    <div
      ref="wrapperRef"
      data-draggable-marquee-init=""
      data-direction="left"
      class="logo-draggable-marquee"
      @dragstart.prevent
      @selectstart.prevent
    >
      <div data-draggable-marquee-collection="" class="logo-draggable-marquee__collection">
        <div data-draggable-marquee-list="" class="logo-draggable-marquee__list">
          <div
            v-for="(logo, index) in logos"
            :key="`${logo._key || index}-a`"
            class="logo-draggable-marquee__item"
            draggable="false"
          >
            <NuxtImg
              v-if="logo.asset?.url"
              :src="logo.asset.url"
              :alt="logo.alt || ''"
              fit="contain"
              class="logo-draggable-marquee__item-media"
              draggable="false"
            />
          </div>
        </div>
        <div aria-hidden="true" class="logo-draggable-marquee__list logo-draggable-marquee__list--clone">
          <div
            v-for="(logo, index) in logos"
            :key="`${logo._key || index}-b`"
            class="logo-draggable-marquee__item"
            draggable="false"
          >
            <NuxtImg
              v-if="logo.asset?.url"
              :src="logo.asset.url"
              :alt="logo.alt || ''"
              fit="contain"
              class="logo-draggable-marquee__item-media"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'
import { Observer } from 'gsap/Observer'

gsap.registerPlugin(Observer)

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const wrapperRef = ref(null)

const logos = computed(() => (props.section?.logoMarqueeLogos || []).filter(logo => logo?.asset?.url))
const cleanupFns = []
let layoutObserver = null

function disconnectLayoutObserver() {
  layoutObserver?.disconnect()
  layoutObserver = null
}

function ensureLayoutObserver() {
  const wrapper = wrapperRef.value
  if (!wrapper || wrapper.getAttribute('data-draggable-marquee-init') === 'initialized')
    return
  if (layoutObserver)
    return

  layoutObserver = new ResizeObserver(() => {
    initDraggableMarquee()
    if (wrapperRef.value?.getAttribute('data-draggable-marquee-init') === 'initialized')
      disconnectLayoutObserver()
  })
  layoutObserver.observe(wrapper)
}

function scheduleMarqueeInit() {
  nextTick(() => {
    initDraggableMarquee()
    ensureLayoutObserver()
  })
}

function initDraggableMarquee() {
  const wrapper = wrapperRef.value
  if (!wrapper) return

  if (wrapper.getAttribute('data-draggable-marquee-init') === 'initialized') return

  const collection = wrapper.querySelector('[data-draggable-marquee-collection]')
  const lists = collection?.querySelectorAll('.logo-draggable-marquee__list')
  const primaryList = lists?.[0]
  const cloneList = lists?.[1]
  if (!collection || !primaryList || !cloneList || !logos.value.length) return

  const firstItem = primaryList.querySelector('.logo-draggable-marquee__item')
  const listStyles = getComputedStyle(primaryList)
  const cardWidth = firstItem ? firstItem.getBoundingClientRect().width : 0
  const gapWidth = Number.parseFloat(listStyles.columnGap || listStyles.gap || '0')
  const seamDistanceFromFormula = Math.round((logos.value.length * cardWidth) + (logos.value.length * gapWidth))
  const seamDistanceFromOffsets = cloneList.offsetLeft - primaryList.offsetLeft
  const seamDistanceFromWidth = Math.round(primaryList.scrollWidth || primaryList.getBoundingClientRect().width)
  const seamDistance = Math.round(seamDistanceFromFormula || seamDistanceFromOffsets || seamDistanceFromWidth)
  if (!seamDistance) return

  let total = 0
  const pxPerMs = 0.04
  const wrapX = gsap.utils.wrap(-seamDistance, 0)
  const xTo = gsap.quickTo(collection, 'x', {
    duration: 0.5,
    ease: 'power3',
    modifiers: {
      x: (x) => `${Math.round(wrapX(Number.parseFloat(x) || 0))}px`,
    },
  })
  xTo(total)

  const marqueeObserver = Observer.create({
    target: collection,
    type: 'pointer,touch',
    preventDefault: true,
    debounce: false,
    onPress: () => {
      wrapper.setAttribute('data-dragging', 'true')
    },
    onDrag: (observerEvent) => {
      total += observerEvent.deltaX
      xTo(total)
    },
    onRelease: () => {
      wrapper.setAttribute('data-dragging', 'false')
    },
    onStop: () => {
      wrapper.setAttribute('data-dragging', 'false')
    },
  })

  function tick(_, deltaTime) {
    total -= deltaTime * pxPerMs
    xTo(total)
  }
  gsap.ticker.add(tick)

  wrapper.setAttribute('data-draggable-marquee-init', 'initialized')

  cleanupFns.push(() => {
    marqueeObserver.kill()
    gsap.ticker.remove(tick)
    gsap.killTweensOf(collection)
    wrapper.setAttribute('data-draggable-marquee-init', '')
    wrapper.setAttribute('data-dragging', 'false')
    gsap.set(collection, { clearProps: 'transform' })
  })
}

onMounted(() => {
  scheduleMarqueeInit()
})

watch(
  () => logos.value.length,
  () => {
    cleanupFns.splice(0).forEach(fn => fn())
    disconnectLayoutObserver()
    scheduleMarqueeInit()
  },
)

onBeforeUnmount(() => {
  disconnectLayoutObserver()
  cleanupFns.splice(0).forEach(fn => fn())
})
</script>

<style scoped>
.logo-marquee-section {
  width: calc(100% + calc(var(--gutter) * 2));
  overflow: visible;
  margin-left: calc(var(--gutter) * -1);
  margin-right: calc(var(--gutter) * -1);
}

.logo-draggable-marquee {
  --card-width: 24vw;
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: visible;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  contain: layout paint;
}

@media (min-width: 1000px) {
  .logo-draggable-marquee {
    --card-width: 20vw;
  }
}

.logo-draggable-marquee__collection {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex: none;
  width: max-content;
  max-width: none;
  min-width: 0;
  will-change: transform;
  gap: 0;
  cursor: grab;
}

.logo-draggable-marquee__list {
  display: flex;
  align-items: center;
  flex: none;
  gap: var(--gutter);
  padding-right: var(--gutter);
}

.logo-draggable-marquee__list--clone {
  padding-right: 0;
}

.logo-draggable-marquee__item {
  flex: 0 0 var(--card-width);
  width: var(--card-width);
  min-width: var(--card-width);
  max-width: var(--card-width);
  aspect-ratio: 3 / 1;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-draggable-marquee[data-dragging='true'] .logo-draggable-marquee__collection {
  cursor: grabbing;
}

.logo-draggable-marquee__item-media {
  width: 70%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
  object-position: center center;
}

.logo-draggable-marquee__item-media:deep(img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>
