<template>
  <section v-if="items.length" class="clients-section grid gap-30">
    <div class="show-md">
      <h2 v-if="section.clientsTitle || section.title" class="subtitle subtitle--circle orange-dot">
        {{ section.clientsTitle || section.title }}
      </h2>
    </div>
    <div class="rounded-medium pad-50 pad-md-50 grid gap-30" style="background-color: var(--pink-tint-3);">


      <div class="hide-md">
        <h2 v-if="section.clientsTitle || section.title" class="subtitle small subtitle--circle white-dot">
          {{ section.clientsTitle || section.title }}
        </h2>
      </div>


      <div ref="gridRef" class="clients-section__grid pad-60 pad-top-bottom">
        <article
          v-for="(item, index) in items"
          :key="item._key || `client-grid-${index}`"
          class="clients-section__item"
        >
          <NuxtImg
            v-if="item.image?.asset?.url"
            :src="item.image.asset.url"
            :alt="item.alt || ''"
            :width="item.image.asset.metadata?.dimensions?.width"
            :height="item.image.asset.metadata?.dimensions?.height"
            class="clients-section__image"
            loading="lazy"
          />
        </article>
      </div>

      <div ref="carouselRef" class="clients-section__carousel">
        <div
          v-for="(group, groupIndex) in mobileSlides"
          :key="`client-slide-${groupIndex}`"
          class="clients-section__slide"
        >
          <article
            v-for="(item, index) in group"
            :key="item._key || `client-slide-item-${groupIndex}-${index}`"
            class="clients-section__item"
          >
            <NuxtImg
              v-if="item.image?.asset?.url"
              :src="item.image.asset.url"
              :alt="item.alt || ''"
              :width="item.image.asset.metadata?.dimensions?.width"
              :height="item.image.asset.metadata?.dimensions?.height"
              class="clients-section__image"
              loading="lazy"
            />
          </article>
        </div>
      </div>


    </div>
  </section>
</template>

<script setup>
import 'flickity/css/flickity.css'
import gsap from 'gsap'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const MOBILE_MAX = 799
const items = computed(() => props.section?.clientsImages || [])

const mobileSlides = computed(() => {
  const out = []
  for (let i = 0; i < items.value.length; i += 3) {
    out.push(items.value.slice(i, i + 3))
  }
  return out
})

const carouselRef = ref(null)
const gridRef = ref(null)
const flickityRef = ref(null)
let removeResizeListener = () => {}
let gridRevealCleanup = () => {}

async function initMobileCarousel() {
  if (!import.meta.client) return
  if (!carouselRef.value) return
  if (window.innerWidth > MOBILE_MAX) return
  if (flickityRef.value) return
  if (mobileSlides.value.length <= 1) return

  const Flickity = (await import('flickity')).default
  flickityRef.value = new Flickity(carouselRef.value, {
    prevNextButtons: false,
    pageDots: true,
    wrapAround: true,
    adaptiveHeight: false,
    cellAlign: 'center',
    contain: true,
    draggable: true,
  })
}

function destroyMobileCarousel() {
  if (!flickityRef.value) return
  flickityRef.value.destroy()
  flickityRef.value = null
}

function handleViewportChange() {
  if (!import.meta.client) return
  if (window.innerWidth <= MOBILE_MAX) {
    gridRevealCleanup()
    initMobileCarousel()
    return
  }
  destroyMobileCarousel()
  initDesktopGridReveal()
}

function initDesktopGridReveal() {
  if (!import.meta.client) return
  if (window.innerWidth < 800) return
  if (!gridRef.value) return

  gridRevealCleanup()

  const gridItems = gridRef.value.querySelectorAll('.clients-section__item')
  if (!gridItems.length) return

  gsap.set(gridItems, { autoAlpha: 0, y: 20 })

  const tween = gsap.to(gridItems, {
    autoAlpha: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.1,
    paused: true,
  })

  let observer = null
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry?.isIntersecting) return
      tween.play()
      observer?.disconnect()
      observer = null
    },
    {
      // Trigger only once the grid is comfortably on-screen.
      rootMargin: '0px 0px -35% 0px',
      threshold: 0.01,
    },
  )
  observer.observe(gridRef.value)

  gridRevealCleanup = () => {
    observer?.disconnect()
    tween.kill()
    gsap.set(gridItems, { clearProps: 'opacity,visibility,transform' })
  }
}

watch(
  () => mobileSlides.value.length,
  async () => {
    await nextTick()
    destroyMobileCarousel()
    gridRevealCleanup()
    initMobileCarousel()
    initDesktopGridReveal()
  },
)

onMounted(async () => {
  await nextTick()
  await initMobileCarousel()
  initDesktopGridReveal()
  window.addEventListener('resize', handleViewportChange)
  removeResizeListener = () => window.removeEventListener('resize', handleViewportChange)
})

onUnmounted(() => {
  removeResizeListener()
  destroyMobileCarousel()
  gridRevealCleanup()
})
</script>

<style scoped>

.clients-section__grid {
  display: none;
}


.clients-section__slide {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--gutter) * 0.75);
}

.clients-section__item {
  width: min(52vw, 240px);
  aspect-ratio: 16 / 8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clients-section__image {
  width: 70%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.clients-section__carousel :deep(.flickity-viewport) {
  overflow: hidden;
}

.clients-section__carousel :deep(.flickity-page-dots) {
  position: static;
  margin-top: calc(var(--gutter) * 0.8);
  display: flex;
  justify-content: center;
  gap: 0.55rem;
}

.clients-section__carousel :deep(.flickity-page-dots .dot) {
  margin: 0;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--white);
  opacity: 0.5;
}

.clients-section__carousel :deep(.flickity-page-dots .dot.is-selected) {
  opacity: 1;
}

@media (min-width: 800px) {
  .clients-section__carousel {
    display: none;
  }

  .clients-section__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: calc(var(--unit) * 130) calc(var(--unit) * 80);
  }

  .clients-section__item {
    width: 100%;
  }
}

@media (min-width: 1000px) {
  .clients-section__grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}


.clients-section__carousel {
  width: calc(100% + calc(var(--unit) * 50));
}

.clients-section__carousel :deep(.flickity-viewport),
.clients-section__carousel :deep(.flickity-slider) {
  overflow: visible;
}
.clients-section__carousel :deep(.flickity-page-dots) {
  position: static;
  margin-top: 35px;
  display: flex;
  justify-content: center;
  gap: 10px;
  color: var(--white);
}

.clients-section__carousel :deep(.flickity-page-dots .dot) {
  margin: 0;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.35;
}

.clients-section__carousel :deep(.flickity-page-dots .dot.is-selected) {
  opacity: 1;
}


.clients-section__carousel :deep(.flickity-page-dot) {
  margin: 0 0px;
  background-color: var(--white);
  opacity: 0.4;
}

.clients-section__carousel :deep(.flickity-page-dot.is-selected) {
  opacity: 1;
}
</style>
