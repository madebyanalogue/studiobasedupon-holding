<template>
  <section class="home-scroll-section">
    <div class="home--container">
      <div class="logo home--logo"><Logo /></div>
      <div class="container" v-if="hasItems">
        <div
          v-for="item in section.homeScrollContent.items"
          :key="item._key"
          class="media"
        >
          <NuxtLink
            v-if="item.link && item.link.page && item.link.page.slug && item.link.page.slug.current"
            :to="`/${item.link.page.slug.current}`"
            class="media-link"
          >
            <NuxtImg
              :src="getImageUrl(item.image)"
              :alt="item.title"
            />
            <h3 class="media-title">{{ item.title }}</h3>
          </NuxtLink>
          <a
            v-else-if="item.link && item.link.url"
            :href="item.link.url"
            class="media-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <NuxtImg
              :src="getImageUrl(item.image)"
              :alt="item.title"
            />
            <h3 class="media-title">{{ item.title }}</h3>
          </a>
          <div v-else>
            <p class="error">Missing link for item: {{ item.title }}</p>
          </div>
        </div>
      </div>
      <div v-else class="wrapper py6">
        <p class="error">
          Home Scroll section is missing <b>homeScrollContent</b> or <b>items</b>.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { getImageSrc } = useSanityImage()

const getImageUrl = (imageSource) => {
  if (!imageSource?.asset) return ''
  return getImageSrc(imageSource.asset) || ''
}

const hasItems = computed(() => {
  return (
    props.section &&
    props.section.homeScrollContent &&
    Array.isArray(props.section.homeScrollContent.items) &&
    props.section.homeScrollContent.items.length > 0
  )
})

let incr = 800
const deltaObject = ref({ delta: 0 })
let deltaTo
let tl
let isWheeling
const mediaArray = ref([])
let currentCycle = 0
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function updateMedia(media) {
  const mediaIndex = Array.from(media.parentNode.children).indexOf(media)

  if (mediaIndex === 0) {
    currentCycle++
    if (currentCycle > 0) {
      const count = media.parentNode?.children?.length || trajectoryAngles.length
      trajectoryAngles = shuffleArray(createTrajectoryAngles(count))
    }
  }

  const angle = (trajectoryAngles[mediaIndex] ?? 0) * (Math.PI / 180)
  const distance = (0.45 + Math.random() * 0.2) * Math.min(window.innerWidth, window.innerHeight)
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2

  const x = centerX + Math.cos(angle) * distance
  const y = centerY + Math.sin(angle) * distance

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

  if (!hasItems.value) {
    return
  }

  if (typeof document !== 'undefined') {
    document.body.classList.add('no-smooth')
    document.body.classList.add('has-home-scroll')
  }

  const root = typeof document !== 'undefined' ? document.querySelector('.home--container') : null
  const container = root ? root.querySelector('.container') : null

  mediaArray.value = props.section.homeScrollContent.items.map((item) =>
    getImageUrl(item.image)
  )

  const medias = root ? root.querySelectorAll('.media') : []
  const mediasImg = root ? root.querySelectorAll('.media img') : []

  mediasImg.forEach((img, index) => {
    img.setAttribute('src', mediaArray.value[index])
  })

  deltaTo = gsap.quickTo(deltaObject.value, 'delta', { duration: 2, ease: 'power1' })
  const rotY = container ? gsap.quickTo(container, 'rotationY', { duration: 0.5, ease: 'power1' }) : () => {}
  const rotX = container ? gsap.quickTo(container, 'rotationX', { duration: 0.5, ease: 'power1' }) : () => {}

  trajectoryAngles = createTrajectoryAngles(medias.length)

  medias.forEach((media) => {
    updateMedia(media)
  })

  tl = gsap.timeline({
    paused: true,
  })

  const manageZIndex = !isMobile.value
  if (manageZIndex) {
    gsap.set(medias, { zIndex: 1 })
  }

  tl.to(medias, {
    z: 0,
    ease: 'none',
    duration: 12,
    stagger: {
      each: 1,
      repeat: -1,
      onRepeat() {
        updateMedia(this.targets()[0])
      },
    },
  })

  tl.to(
    medias,
    {
      keyframes: manageZIndex
        ? [
            { opacity: 0, filter: 'blur(40px)', duration: 0, ease: 'none', zIndex: 1 },
            { opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.in', zIndex: 1000 },
            { filter: 'blur(0px)', duration: 10, ease: 'none', zIndex: 1000 },
            { filter: 'blur(40px)', opacity: 0, duration: 1, ease: 'power2.out', zIndex: 1 },
          ]
        : [
            { opacity: 0, filter: 'blur(40px)', duration: 0, ease: 'none' },
            { opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.in' },
            { filter: 'blur(0px)', duration: 10, ease: 'none' },
            { filter: 'blur(40px)', opacity: 0, duration: 1, ease: 'power2.out' },
          ],
      stagger: {
        each: 1,
        repeat: -1,
      },
    },
    '<'
  )

  if (typeof window !== 'undefined') {
    gsap.ticker.add(tick)
    window.addEventListener('wheel', handleWheel, { passive: true })
  }

  if (root) {
    root.addEventListener('mousemove', (e) => {
      const valY = (e.clientX / window.innerWidth - 0.5) * 10
      const valX = (e.clientY / window.innerHeight - 0.5) * 10

      rotY(valY)
      rotX(-valX)
    })
  }

  if (root) {
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
  }
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
  if (typeof document === 'undefined') return
  const root = document.querySelector('.home--container')
  if (!root) return

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

body.has-home-scroll .footer-back-to-top {
  display: none !important;
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

.home--container {
  height: 100vh;
  perspective: 100vw;
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
  width: 24%;
  height: auto;
  position: absolute;
  transform: translateZ(-200vw);
  z-index: 2;
  pointer-events: auto;
  opacity: 0;
}

.home--container.ready .media {
  opacity: 1;
}

.home--container .media-link {
  text-decoration: none;
  color: inherit;
  display: block;
  position: relative;
  z-index: 2;
  pointer-events: auto !important;
  cursor: pointer;
}

.home--container .media-title {
  margin-top: calc(var(--unit) * 1);
  font-size: calc(var(--unit) * 1);
  text-align: center;
  color: #fff;
  font-weight: 500;
  text-transform: uppercase;
}

.home--container .media img {
  width: 100%;
  height: auto;
  display: block;
  box-shadow: 1px 1px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.6s ease;
  transform-origin: bottom;
}

@media (min-width: 1023px) {
  .home--container .media-title {
    margin-top: 15px;
    font-size: 30px;
  }

  .home--container .media {
    width: 280px;
  }
}

.home--container .media-link:hover img {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .home--container .media {
    width: 40%;
    z-index: 2;
  }

  .home--container .media-link {
    z-index: 9999;
    pointer-events: all;
  }
}

.home--container.mobile .media .media-title {
  opacity: 0;
}
</style>
