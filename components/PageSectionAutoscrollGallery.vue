<template>

  <section class="autoscroll-gallery-section rounded-medium">
    <div
      ref="wrapperRef"
      data-draggable-marquee-init=""
      :data-direction="direction"
      class="draggable-marquee"
      :style="sectionStyle"
      @dragstart.prevent
      @selectstart.prevent
    >
      <div data-draggable-marquee-collection="" class="draggable-marquee__collection">
        <div data-draggable-marquee-list="" class="draggable-marquee__list">
          <component
            :is="item.link ? 'a' : 'div'"
            v-for="(item, index) in items"
            :key="`${item._key || index}-a`"
            class="draggable-marquee__item"
            draggable="false"
            :href="item.link || undefined"
            :target="item.link ? '_blank' : undefined"
            :rel="item.link ? 'noopener noreferrer' : undefined"
            @dragstart.prevent
          >
            <video
              v-if="item.mediaType === 'video' && item.video?.asset?.url"
              class="draggable-marquee__item-media"
              draggable="false"
              autoplay
              muted
              loop
              playsinline
              preload="metadata"
            >
              <source :src="item.video.asset.url" type="video/mp4">
            </video>
            <NuxtImg
              v-else-if="item.image?.asset?.url"
              :src="item.image.asset.url"
              :alt="''"
              fit="cover"
              class="draggable-marquee__item-media"
              draggable="false"
            />
          </component>
        </div>
        <div aria-hidden="true" class="draggable-marquee__list draggable-marquee__list--clone">
          <component
            :is="item.link ? 'a' : 'div'"
            v-for="(item, index) in items"
            :key="`${item._key || index}-b`"
            class="draggable-marquee__item"
            draggable="false"
            :href="item.link || undefined"
            :target="item.link ? '_blank' : undefined"
            :rel="item.link ? 'noopener noreferrer' : undefined"
            @dragstart.prevent
          >
            <video
              v-if="item.mediaType === 'video' && item.video?.asset?.url"
              class="draggable-marquee__item-media"
              draggable="false"
              autoplay
              muted
              loop
              playsinline
              preload="metadata"
            >
              <source :src="item.video.asset.url" type="video/mp4">
            </video>
            <NuxtImg
              v-else-if="item.image?.asset?.url"
              :src="item.image.asset.url"
              :alt="''"
              fit="cover"
              class="draggable-marquee__item-media"
              draggable="false"
            />
          </component>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'
import { Observer } from 'gsap/Observer'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(Observer, ScrollTrigger)

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const wrapperRef = ref(null)

function parseAspectRatio(input) {
  const raw = (input || '3/5').trim()
  const parts = raw.split('/').map(s => s.trim()).filter(Boolean)
  if (parts.length === 2) {
    const w = Number.parseFloat(parts[0])
    const h = Number.parseFloat(parts[1])
    if (w > 0 && h > 0 && Number.isFinite(w) && Number.isFinite(h)) {
      return `${w} / ${h}`
    }
  }
  return '3 / 5'
}

const sectionStyle = computed(() => ({
  '--autoscroll-gallery-aspect-ratio': parseAspectRatio(props.section?.autoscrollGalleryAspectRatio),
}))

const speed = computed(() => {
  const raw = Number.parseFloat(String(props.section?.autoscrollGallerySpeed ?? 60))
  return Number.isFinite(raw) && raw > 0 ? raw : 60
})

const direction = computed(() => {
  const raw = (props.section?.autoscrollGalleryDirection || 'left').toLowerCase()
  return raw === 'right' ? 'right' : 'left'
})

const items = computed(() => (props.section?.autoscrollGalleryItems || []).filter((item) => {
  if (!item) return false
  if (item.mediaType === 'video') return Boolean(item.video?.asset?.url)
  return Boolean(item.image?.asset?.url)
}))

const cleanupFns = []
let layoutObserver = null

function disconnectLayoutObserver() {
  layoutObserver?.disconnect()
  layoutObserver = null
}

/** Client navigations often mount before NuxtImg/media have intrinsic width; retry when layout settles. */
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

  const existingState = wrapper.getAttribute('data-draggable-marquee-init')
  if (existingState === 'initialized') return

  const collection = wrapper.querySelector('[data-draggable-marquee-collection]')
  const lists = collection.querySelectorAll('.draggable-marquee__list')
  const primaryList = lists[0]
  const cloneList = lists[1]
  if (!collection || !primaryList || !cloneList || !items.value.length) return

  const firstItem = primaryList.querySelector('.draggable-marquee__item')
  const listStyles = getComputedStyle(primaryList)
  const cardWidth = firstItem ? firstItem.getBoundingClientRect().width : 0
  const gapWidth = Number.parseFloat(listStyles.columnGap || listStyles.gap || '0')
  const seamDistanceFromFormula = Math.round((items.value.length * cardWidth) + (items.value.length * gapWidth))
  const seamDistanceFromOffsets = cloneList.offsetLeft - primaryList.offsetLeft
  const seamDistanceFromWidth = Math.round(primaryList.scrollWidth || primaryList.getBoundingClientRect().width)
  const seamDistance = Math.round(seamDistanceFromFormula || seamDistanceFromOffsets || seamDistanceFromWidth)
  if (!seamDistance) return

  let total = 0
  const baseDirection = direction.value === 'right' ? 1 : -1
  const pxPerMs = Math.max(0.01, speed.value / 1000)
  const wrapX = gsap.utils.wrap(-seamDistance, 0)
  const xTo = gsap.quickTo(collection, 'x', {
    duration: 0.5,
    ease: 'power3',
    modifiers: {
      x: (x) => {
        const wrapped = wrapX(Number.parseFloat(x) || 0)
        return `${Math.round(wrapped)}px`
      },
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
    total += baseDirection * (deltaTime * pxPerMs)
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
  () => [
    props.section?.autoscrollGalleryAspectRatio,
    props.section?.autoscrollGallerySpeed,
    props.section?.autoscrollGalleryDirection,
    items.value.length,
  ],
  () => {
    cleanupFns.splice(0).forEach(fn => fn())
    disconnectLayoutObserver()
    scheduleMarqueeInit()
  }
)

onBeforeUnmount(() => {
  disconnectLayoutObserver()
  cleanupFns.splice(0).forEach(fn => fn())
})
</script>

<style scoped>

.draggable-marquee {
  --card-width: 50vw;
}
@media all and (min-width: 700px) {
  .draggable-marquee {
    --card-width: 40vw;
  }
}
@media all and (min-width: 1000px) {
  .draggable-marquee {
    --card-width: 25vw;
  }
}

.autoscroll-gallery-section {
  width: calc(100vw - calc(var(--gutter) * 2));
  overflow: hidden;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: visible;
  position: relative;
}

.draggable-marquee {
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


.draggable-marquee__collection {
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
  border-radius: var(--rounded-medium);
  overflow: hidden;
}

.draggable-marquee__list {
  display: flex;
  align-items: center;
  flex: none;
  gap: var(--gutter);
  padding-right: var(--gutter);
}

.draggable-marquee__list--clone {
  padding-right: 0;
}

.draggable-marquee__item {
  flex: 0 0 var(--card-width);
  width: var(--card-width);
  min-width: var(--card-width);
  max-width: var(--card-width);
  aspect-ratio: var(--autoscroll-gallery-aspect-ratio, 2/3);
  border-radius: var(--rounded-medium);
  overflow: hidden;
  display: block;
  text-decoration: none;
  user-select: none;
  -webkit-user-drag: none;
}

.draggable-marquee[data-dragging='true'] .draggable-marquee__collection {
  cursor: grabbing;
}

.draggable-marquee__item-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.draggable-marquee__item-media:deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media all and (max-width: 999px) {
  .draggable-marquee {
    --card-width: calc(min(100vw, 100%) / 6);
  }
}
</style>
