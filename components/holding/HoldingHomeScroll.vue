<template>
  <section class="home-scroll-section">
    <div ref="rootRef" class="home--container">
      <div class="logo home--logo">
        <NuxtImg
          v-if="logoUrl"
          :src="logoUrl"
          :alt="logoAlt"
          class="home--logo-image"
        />
        <Logo v-else />
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

const hasItems = computed(() => Array.isArray(props.items) && props.items.length > 0)

/** Animation tuning — stagger is computed per item count for even z distribution. */
const HOME_SCROLL = {
  fadeIn: 3,
  hold: 5,
  fadeOut: 2,
  orbitMin: 0.72,
  orbitRandom: 0.55,
  orbitSpreadX: 1.3,
  orbitSpreadY: 1.05,
  zDepthVw: 1400,
  zIndexScale: 5,
  blurPx: 80,
}

let incr = 800
const deltaObject = ref({ delta: 0 })
let deltaTo
let tl
let isWheeling
const mediaArray = ref([])
let trajectoryAngles = []
const isMobile = ref(false)

function createTrajectoryAngles(count) {
  if (count <= 0) return []
  return Array.from({ length: count }, (_, i) => (360 / count) * i)
}

function handleResize() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 1024
  }
}

function setStackOrderFromZ(media) {
  const z = gsap.getProperty(media, 'z')
  const numericZ = typeof z === 'number' ? z : parseFloat(String(z)) || 0
  gsap.set(media, { zIndex: Math.round(1000 - numericZ * HOME_SCROLL.zIndexScale) })
}

function updateMedia(media) {
  const mediaIndex = Array.from(media.parentNode.children).indexOf(media)
  const angle = (trajectoryAngles[mediaIndex] ?? 0) * (Math.PI / 180)
  const spread = Math.max(window.innerWidth, window.innerHeight)
  const distance = (HOME_SCROLL.orbitMin + Math.random() * HOME_SCROLL.orbitRandom) * spread
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

function handleWheel(e) {
  deltaTo(e.deltaY)
  window.clearTimeout(isWheeling)
  isWheeling = setTimeout(() => {
    deltaTo(0)
  }, 120)
}

function tick(_time, dt) {
  incr += deltaObject.value.delta / 600 + dt / 800
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

  trajectoryAngles = createTrajectoryAngles(medias.length)

  root.style.setProperty('--home-scroll-z-depth', `${HOME_SCROLL.zDepthVw}vw`)
  gsap.set(medias, { z: `-${HOME_SCROLL.zDepthVw}vw` })

  medias.forEach((media) => {
    updateMedia(media)
  })

  tl = gsap.timeline({ paused: true })

  const manageZIndex = !isMobile.value
  if (manageZIndex) {
    gsap.set(medias, { zIndex: 1 })
  }

  const { fadeIn, hold, fadeOut, blurPx } = HOME_SCROLL
  const itemCycle = fadeIn + hold + fadeOut
  const staggerEach = itemCycle / medias.length

  tl.to(medias, {
    z: 0,
    ease: 'none',
    duration: itemCycle,
    stagger: {
      each: staggerEach,
      repeat: -1,
      onRepeat() {
        updateMedia(this.targets()[0])
      },
    },
    onUpdate() {
      if (manageZIndex) {
        setStackOrderFromZ(this.targets()[0])
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
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.home--logo-image {
  max-width: min(40vw, 320px);
  height: auto;
  display: block;
}

.home--container {
  height: 100vh;
  height: 100dvh;
  perspective: 280vw;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
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
    width: min(48vw, 1800px);
  }
}

.home--container .media-content:hover img {
  /* transform: scale(1.05); */
}

@media (max-width: 768px) {
  .home--container .media {
    width: 62%;
    z-index: 2;
  }
}
</style>
