<template>
  <section class="home-scroll-section">
    <div ref="rootRef" class="home--container">
      <div class="logo home--logo">
        <div class="home--logo-inner">
          <NuxtImg
            v-if="logoUrl"
            :src="logoUrl"
            :alt="logoAlt"
            class="home--logo-image"
          />
          <Logo v-else />
          <p v-if="hasLogoText" class="home--logo-text mono">{{ logoText.trim() }}</p>
        </div>
      </div>

      <div v-if="hasItems" ref="containerRef" class="container">
        <div
          v-for="item in items"
          :key="item._key"
          class="media"
        >
          <div class="media-content">
            <NuxtImg
              v-if="getImageUrl(item.image)"
              :src="getImageUrl(item.image)"
              :alt="item.title || ''"
            />
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import gsap from 'gsap'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  logo: {
    type: Object,
    default: null,
  },
  logoText: {
    type: String,
    default: '',
  },
})

const rootRef = ref(null)
const containerRef = ref(null)

const { getImageSrc } = useSanityImage()

const getImageUrl = (imageSource) => {
  if (!imageSource?.asset) return ''
  return getImageSrc(imageSource.asset) || ''
}

const logoUrl = computed(() => getImageUrl(props.logo))
const logoAlt = computed(() => props.logo?.alt || '')
const hasLogoText = computed(() => Boolean(props.logoText?.trim()))

const hasItems = computed(() => Array.isArray(props.items) && props.items.length > 0)

/** Animation tuning — z density is fixed via zSpacing, not item count. */
const HOME_SCROLL = {
  fadeIn: 3,
  hold: 5,
  fadeOut: 2,
  /**
   * Gap between consecutive items along the z path,
   * as a fraction of one full cycle (0–1). Independent of item count.
   * Lower = more space in depth · higher = tighter packing.
   */
  zSpacing: 0.15,
  /** Overall speed — higher = slower (timeline + z travel). */
  pace: 2,
  orbitMin: 0.72,
  orbitRandom: 0.55,
  orbitSpreadX: 1.3,
  orbitSpreadY: 1.05,
  zDepthVw: 1400,
  zIndexScale: 5,
  blurPx: 80,
  /** Number of intertwined spiral strands (2 = double helix, 4 = quad helix). */
  helixStrands: 4,
  /** Full rotations around centre while travelling from back to front. */
  helixTwistTurns: 1.75,
  /** Radius grows along each strand’s spiral (0 = constant orbit). */
  helixSpiralRadiusSpread: 0.22,
  /** Odd strands twist the opposite way — strongest with helixStrands: 2. */
  helixOpposingTwist: true,
  enableHover: false,
}

function getZStagger(itemCycle) {
  return itemCycle * HOME_SCROLL.zSpacing
}

let incr = 800
const deltaObject = ref({ delta: 0 })
let deltaTo
let tl
let isWheeling
const mediaArray = ref([])
let helixMeta = []
let hoveredMedia = null
const mediaVisualTweens = new WeakMap()
const mediaHoverTweens = new WeakMap()
let mediaPointerCleanups = []
const isMobile = ref(false)

function createHelixMeta(count) {
  if (count <= 0) return []

  const { helixStrands, orbitMin, orbitRandom } = HOME_SCROLL
  const strands = Math.max(1, Math.min(helixStrands, count))

  return Array.from({ length: count }, (_, index) => {
    const strand = index % strands
    const strandIndex = Math.floor(index / strands)
    const itemsOnStrand = Math.ceil((count - strand) / strands)
    const opposingPair = HOME_SCROLL.helixOpposingTwist && strands === 2 && strand === 1

    return {
      strand,
      strandIndex,
      itemsOnStrand,
      strandPhase: (360 / strands) * strand,
      twistSign: opposingPair ? -1 : 1,
      distanceRatio: orbitMin + Math.random() * orbitRandom,
    }
  })
}

function getMediaVisualTween(media) {
  return mediaVisualTweens.get(media)
}

function bindMediaHover(medias, manageZIndex) {
  mediaPointerCleanups = []

  medias.forEach((media) => {
    const onEnter = () => {
      hoveredMedia = media
      mediaHoverTweens.get(media)?.kill()

      const visualTween = getMediaVisualTween(media)
      visualTween?.pause()

      mediaHoverTweens.set(
        media,
        gsap.to(media, {
          filter: 'blur(0px)',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        }),
      )

      gsap.set(media, { zIndex: 5000 })
    }

    const onLeave = () => {
      if (hoveredMedia === media) {
        hoveredMedia = null
      }

      mediaHoverTweens.get(media)?.kill()

      const visualTween = getMediaVisualTween(media)
      if (visualTween) {
        visualTween.resume()
        visualTween.render(visualTween.time(), false, true)
      }

      if (manageZIndex) {
        setStackOrderFromZ(media)
      }
    }

    media.addEventListener('mouseenter', onEnter)
    media.addEventListener('mouseleave', onLeave)
    mediaPointerCleanups.push(() => {
      media.removeEventListener('mouseenter', onEnter)
      media.removeEventListener('mouseleave', onLeave)
    })
  })
}

function getSpiralProgress(meta, progress) {
  const strandOffset = meta.itemsOnStrand > 1
    ? meta.strandIndex / meta.itemsOnStrand
    : 0
  return (strandOffset + progress) % 1
}

function updateMediaPosition(media, progress = 0) {
  const mediaIndex = getMediaIndex(media)
  const meta = helixMeta[mediaIndex]
  if (!meta) return

  const spiralT = getSpiralProgress(meta, progress)
  const twistDegrees = meta.twistSign * HOME_SCROLL.helixTwistTurns * 360 * spiralT
  const angle = (meta.strandPhase + twistDegrees) * (Math.PI / 180)
  const spread = Math.max(window.innerWidth, window.innerHeight)
  const radiusScale = 1 + HOME_SCROLL.helixSpiralRadiusSpread * spiralT
  const distance = meta.distanceRatio * spread * radiusScale
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  const x = centerX + Math.cos(angle) * distance * HOME_SCROLL.orbitSpreadX
  const y = centerY + Math.sin(angle) * distance * HOME_SCROLL.orbitSpreadY

  gsap.set(media, {
    xPercent: -50,
    yPercent: -50,
    x,
    y,
  })
}

function getMediaIndex(media) {
  return Array.from(media.parentNode.children).indexOf(media)
}

function refreshMediaOrbit(media) {
  const mediaIndex = getMediaIndex(media)
  const meta = helixMeta[mediaIndex]
  if (!meta) return

  meta.distanceRatio = HOME_SCROLL.orbitMin + Math.random() * HOME_SCROLL.orbitRandom

  const zTween = gsap.getTweensOf(media).find((tween) => tween.vars?.z === 0)
  updateMediaPosition(media, zTween ? zTween.progress() : 0)
}

function syncAllMediaPositions(medias) {
  medias.forEach((media) => {
    const zTween = gsap.getTweensOf(media).find((tween) => tween.vars?.z === 0)
    updateMediaPosition(media, zTween ? zTween.progress() : 0)
  })
}

function handleResize() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 1024
    if (rootRef.value) {
      const medias = rootRef.value.querySelectorAll('.media')
      if (medias.length) {
        syncAllMediaPositions(medias)
      }
    }
  }
}

function setStackOrderFromZ(media) {
  const z = gsap.getProperty(media, 'z')
  const numericZ = typeof z === 'number' ? z : parseFloat(String(z)) || 0
  gsap.set(media, { zIndex: Math.round(1000 - numericZ * HOME_SCROLL.zIndexScale) })
}

function handleWheel(e) {
  deltaTo(e.deltaY)
  window.clearTimeout(isWheeling)
  isWheeling = setTimeout(() => {
    deltaTo(0)
  }, 120)
}

function tick(_time, dt) {
  const pace = HOME_SCROLL.pace || 1
  incr += (deltaObject.value.delta / 600 + dt / 800) / pace
  tl.time(incr)
}

onMounted(() => {
  handleResize()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }

  if (!hasItems.value || !rootRef.value) {
    return
  }

  if (typeof document !== 'undefined') {
    document.body.classList.add('no-smooth')
    document.body.classList.add('has-home-scroll')
  }

  const root = rootRef.value
  const container = containerRef.value

  mediaArray.value = props.items.map((item) => getImageUrl(item.image))

  const medias = root.querySelectorAll('.media')
  const mediasImg = root.querySelectorAll('.media img')

  mediasImg.forEach((img, index) => {
    img.setAttribute('src', mediaArray.value[index])
  })

  deltaTo = gsap.quickTo(deltaObject.value, 'delta', { duration: 2, ease: 'power1' })
  const rotY = container ? gsap.quickTo(container, 'rotationY', { duration: 0.5, ease: 'power1' }) : () => {}
  const rotX = container ? gsap.quickTo(container, 'rotationX', { duration: 0.5, ease: 'power1' }) : () => {}

  helixMeta = createHelixMeta(medias.length)

  root.style.setProperty('--home-scroll-z-depth', `${HOME_SCROLL.zDepthVw}vw`)
  gsap.set(medias, { z: `-${HOME_SCROLL.zDepthVw}vw` })

  medias.forEach((media) => {
    updateMediaPosition(media, 0)
  })

  tl = gsap.timeline({ paused: true })

  const manageZIndex = !isMobile.value
  if (manageZIndex) {
    gsap.set(medias, { zIndex: 1 })
  }

  const { fadeIn, hold, fadeOut, blurPx } = HOME_SCROLL
  const itemCycle = fadeIn + hold + fadeOut
  const staggerEach = getZStagger(itemCycle)

  tl.to(medias, {
    z: 0,
    ease: 'none',
    duration: itemCycle,
    stagger: {
      each: staggerEach,
      repeat: -1,
      onRepeat() {
        refreshMediaOrbit(this.targets()[0])
      },
    },
    onUpdate() {
      const media = this.targets()[0]
      updateMediaPosition(media, this.progress())
      if (manageZIndex) {
        setStackOrderFromZ(media)
      }
    },
  })

  tl.to(
    medias,
    {
      keyframes: [
        { opacity: 0, filter: `blur(${blurPx}px)`, duration: 0, ease: 'none' },
        { opacity: 1, filter: 'blur(0px)', duration: fadeIn, ease: 'power2.in' },
        { filter: 'blur(0px)', duration: hold, ease: 'none' },
        { filter: `blur(${blurPx}px)`, opacity: 0, duration: fadeOut, ease: 'power2.out' },
      ],
      stagger: {
        each: staggerEach,
        repeat: -1,
      },
    },
    '<',
  )

  medias.forEach((media) => {
    const visualTween = gsap.getTweensOf(media).find((tween) => tween.vars?.keyframes)
    if (visualTween) {
      mediaVisualTweens.set(media, visualTween)
    }
  })

  if (HOME_SCROLL.enableHover) {
    bindMediaHover(medias, manageZIndex)
  }

  if (typeof window !== 'undefined') {
    gsap.ticker.add(tick)
    window.addEventListener('wheel', handleWheel, { passive: true })
  }

  root.addEventListener('mousemove', (e) => {
    const valY = (e.clientX / window.innerWidth - 0.5) * 10
    const valX = (e.clientY / window.innerHeight - 0.5) * 10
    rotY(valY)
    rotX(-valX)
  })

  if (isMobile.value) {
    root.classList.add('mobile')
    root.classList.remove('desktop')
  } else {
    root.classList.remove('mobile')
    root.classList.add('desktop')
  }

  requestAnimationFrame(() => {
    root.classList.add('ready')
  })
})

onUnmounted(() => {
  hoveredMedia = null
  mediaPointerCleanups.forEach((cleanup) => cleanup())
  mediaPointerCleanups = []

  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('wheel', handleWheel)
    gsap.ticker.remove(tick)
  }

  if (typeof document !== 'undefined') {
    document.body.classList.remove('has-home-scroll')
    document.body.classList.remove('no-smooth')
  }

  if (tl) {
    tl.kill()
  }
})

watch(isMobile, (newVal) => {
  if (!rootRef.value) return
  const root = rootRef.value

  if (newVal) {
    root.classList.add('mobile')
    root.classList.remove('desktop')
  } else {
    root.classList.remove('mobile')
    root.classList.add('desktop')
  }
})
</script>

<style>
body.has-home-scroll main.page-wrapper {
  min-height: unset !important;
  padding-top: 0 !important;
}
</style>

<style scoped>
.home--logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;
}

.home--logo-inner {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home--logo-image {
  max-width: min(40vw, 320px);
  height: auto;
  display: block;
}

.home--logo-text {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  margin-top: calc(var(--gutter) * 4);
  text-align: center;
  white-space: pre-line;
  width: 100%;
}

.home-scroll-section {
  position: relative;
  z-index: var(--holding-scroll-z, 0);
  min-height: 100dvh;
}

.home--container {
  height: 100vh;
  height: 100dvh;
  perspective: 200vw;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--holding-scroll-z, 0);
}

.home--container .container {
  height: 100%;
  transform-style: preserve-3d;
  position: relative;
  pointer-events: none;
}

.home--container .media {
  width: 42%;
  height: auto;
  position: absolute;
  transform: translateZ(calc(-1 * var(--home-scroll-z-depth, 1400vw)));
  z-index: 2;
  pointer-events: auto;
  opacity: 0;
}

.home--container.ready .media {
  opacity: 1;
}

.home--container .media-content {
  display: block;
  position: relative;
  z-index: 2;
}

.home--container .media img {
  width: 100%;
  height: auto;
  display: block;
  /* box-shadow: 1px 1px 30px rgba(0, 0, 0, 0.08); */
  transition: transform 0.6s ease;
  transform-origin: bottom;
}

@media (min-width: 1023px) {
  .home--container .media {
    width: min(62vw, 1800px);
  }
}

@media (max-width: 768px) {
  .home--container .media {
    width: 62%;
    z-index: 2;
  }
}
</style>
