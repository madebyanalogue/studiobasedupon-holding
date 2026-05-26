<template>
  <section
    v-if="logos.length"
    ref="rootRef"
    :data-logo-wall-shuffle="shuffleEnabled ? 'true' : 'false'"
    data-logo-wall-cycle-init
    class="logo-wall"
  >
    <div class="logo-wall__collection">
      <div data-logo-wall-list class="logo-wall__list">
        <div
          v-for="(logo, index) in logos"
          :key="logo._key || `logo-${index}`"
          data-logo-wall-item
          class="logo-wall__item"
        >
          <div data-logo-wall-target-parent class="logo-wall__logo">
            <div class="logo-wall__logo-before" />
            <div data-logo-wall-target class="logo-wall__logo-target">
              <NuxtImg
                v-if="getLogoSrc(logo)"
                :src="getLogoSrc(logo)"
                loading="lazy"
                width="100"
                :alt="logo.alt || ''"
                class="logo-wall__logo-img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { getImageSrc: getSanityImageSrc } = useSanityImage()
const rootRef = ref(null)
const timelineRef = ref(null)
const scrollTriggerRef = ref(null)

const logos = computed(() => props.section?.logoWallLogos || [])
const shuffleEnabled = computed(() => props.section?.logoWallShuffle !== false)

function getLogoSrc(logo) {
  return getSanityImageSrc(logo?.asset || logo)
}

function isVisible(el) {
  return window.getComputedStyle(el).display !== 'none'
}

function shuffleArray(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function initLogoWallCycle(root) {
  if (!import.meta.client || !root) return

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])

  gsap.registerPlugin(ScrollTrigger)

  const loopDelay = 1.5
  const duration = 0.9

  const list = root.querySelector('[data-logo-wall-list]')
  if (!list) return
  const items = Array.from(list.querySelectorAll('[data-logo-wall-item]'))
  if (!items.length) return

  const shuffleFront = root.getAttribute('data-logo-wall-shuffle') !== 'false'
  const originalTargets = items
    .map(item => item.querySelector('[data-logo-wall-target]'))
    .filter(Boolean)
    .map(node => node.cloneNode(true))

  if (!originalTargets.length) return

  let visibleItems = []
  let visibleCount = 0
  let pool = []
  let pattern = []
  let patternIndex = 0

  const cleanupExistingTargets = () => {
    items.forEach(item => {
      item.querySelectorAll('[data-logo-wall-target]').forEach(oldNode => oldNode.remove())
    })
  }

  const setup = () => {
    if (timelineRef.value) {
      timelineRef.value.kill()
      timelineRef.value = null
    }

    visibleItems = items.filter(isVisible)
    visibleCount = visibleItems.length
    if (!visibleCount) return

    pattern = shuffleArray(Array.from({ length: visibleCount }, (_, i) => i))
    patternIndex = 0

    cleanupExistingTargets()
    pool = originalTargets.map(node => node.cloneNode(true))

    let front
    let rest
    if (shuffleFront) {
      const shuffledAll = shuffleArray(pool)
      front = shuffledAll.slice(0, visibleCount)
      rest = shuffleArray(shuffledAll.slice(visibleCount))
    } else {
      front = pool.slice(0, visibleCount)
      rest = shuffleArray(pool.slice(visibleCount))
    }
    pool = front.concat(rest)

    for (let i = 0; i < visibleCount; i++) {
      const parent =
        visibleItems[i].querySelector('[data-logo-wall-target-parent]') ||
        visibleItems[i]
      const next = pool.shift()
      if (next) parent.appendChild(next)
    }

    timelineRef.value = gsap.timeline({ repeat: -1, repeatDelay: loopDelay })
    timelineRef.value.call(swapNext)
    timelineRef.value.play()
  }

  const swapNext = () => {
    const nowCount = items.filter(isVisible).length
    if (nowCount !== visibleCount) {
      setup()
      return
    }
    if (!pool.length || !visibleCount) return

    const idx = pattern[patternIndex % visibleCount]
    patternIndex++

    const container = visibleItems[idx]
    const parent =
      container.querySelector('[data-logo-wall-target-parent]') ||
      container
    const existing = parent.querySelectorAll('[data-logo-wall-target]')
    if (existing.length > 1) return

    const current = parent.querySelector('[data-logo-wall-target]')
    const incoming = pool.shift()
    if (!incoming) return

    gsap.set(incoming, { yPercent: 50 })
    parent.appendChild(incoming)

    if (current) {
      gsap.to(current, {
        yPercent: -50,
        duration,
        ease: 'expo.inOut',
        onComplete: () => {
          current.remove()
          pool.push(current)
        },
      })
    }

    gsap.to(incoming, {
      yPercent: 0,
      duration,
      delay: 0.1,
      ease: 'expo.inOut',
    })
  }

  setup()

  scrollTriggerRef.value = ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => timelineRef.value?.play(),
    onLeave: () => timelineRef.value?.pause(),
    onEnterBack: () => timelineRef.value?.play(),
    onLeaveBack: () => timelineRef.value?.pause(),
  })
}

function onVisibilityChange() {
  if (document.hidden) {
    timelineRef.value?.pause()
    return
  }
  timelineRef.value?.play()
}

onMounted(() => {
  initLogoWallCycle(rootRef.value)
  if (import.meta.client) {
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
})

onUnmounted(() => {
  timelineRef.value?.kill()
  scrollTriggerRef.value?.kill()
  if (import.meta.client) {
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
})
</script>

<style scoped>
.logo-wall {
  display: flex;
  justify-content: center;
  width: 100%;
}

.logo-wall__collection {
  width: 100%;
}

.logo-wall__list {
  display: flex;
  flex-flow: wrap;
}

.logo-wall__item {
  width: 50%;
  position: relative;
}

[data-logo-wall-list] [data-logo-wall-item]:nth-child(n + 7) {
  display: none;
}

.logo-wall__logo {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.logo-wall__logo-before {
  padding-top: 66.66%;
}

.logo-wall__logo-target {
  justify-content: center;
  align-items: center;
  width: 66.66%;
  height: 40%;
  display: flex;
  position: absolute;
}

.logo-wall__logo-img {
  width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
}

@media screen and (min-width: 601px) {
  .logo-wall__item {
    width: 33.333%;
  }
}

@media screen and (min-width: 992px) {
  .logo-wall__item {
    width: 25%;
  }

  [data-logo-wall-list] [data-logo-wall-item]:nth-child(n + 5) {
    display: none;
  }
}
</style>
