<template>
  <section class="featured-projects grid gap-30">
    <h2 v-if="props.section.featuredProjectsTitle || props.section.title" class="subtitle subtitle--circle orange-dot">
      {{ props.section.featuredProjectsTitle || props.section.title }}
    </h2>

    <div ref="carouselRef" class="featured-projects__carousel">
      <article
        v-for="item in props.section.featuredProjects || []"
        :key="item.project?._id || item._key"
        class="featured-project"
      >
        <NuxtLink
          v-if="item.project?.slug?.current"
          :to="`/portfolio/${item.project.slug.current}`"
          class="featured-project-link"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
          @click="onProjectClick"
        >
          <div class="featured-project-image-container rounded-medium">
            <div class="featured-project-image-wrapper">
              <NuxtImg
                v-if="item.project?.featuredImage?.asset"
                :src="item.project.featuredImage.asset.url || ''"
                alt=""
                :class="[
                  'featured-project-image',
                  item.project.featuredImageMobile?.asset ? 'is-desktop-archive-img' : '',
                ]"
                :width="item.project.featuredImage.asset.metadata?.dimensions?.width || 3200"
                :height="item.project.featuredImage.asset.metadata?.dimensions?.height"
              />
              <NuxtImg
                v-if="item.project?.featuredImageMobile?.asset"
                :src="item.project.featuredImageMobile.asset.url || ''"
                alt=""
                class="featured-project-image is-mobile-archive-img"
                :width="item.project.featuredImageMobile.asset.metadata?.dimensions?.width || 3200"
                :height="item.project.featuredImageMobile.asset.metadata?.dimensions?.height"
              />
              <div class="portfolio-item-overlay pad-40">
                <div
                  class="portfolio-item-overlay-bg"
                  aria-hidden="true"
                />
                <div class="portfolio-item-overlay-inner gap-40">
                  <h3 class="portfolio-item-overlay-title fluid-type line-height-1" style="--desktop:72;">
                    {{ item.project?.title }}
                  </h3>
                  <div class="portfolio-item-overlay-content gap-50">
                    <div
                      v-if="item.project?.thumbnailDescription"
                      class="portfolio-item-overlay-desc fluid-type pad-20 pad-bottom"
                      style="--desktop:36;"
                    >
                      {{ item.project.thumbnailDescription }}
                    </div>
                    <!-- <PortfolioStats
                      v-if="item.project?.thumbnailStats?.length"
                      :stats="item.project.thumbnailStats"
                      root-class="portfolio-item-overlay-stats gap-20"
                    /> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </article>
    </div>
  </section>
</template>

<script setup>
import 'flickity/css/flickity.css'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const carouselRef = ref(null)
const flickityRef = ref(null)
const nuxtApp = useNuxtApp()
let removePageFinishHook = () => {}
let resizeObserver = null
let resizeObserverRaf = null
const DRAG_CLICK_THRESHOLD = 14
const DRAG_CLICK_SUPPRESS_MS = 250
const pointerStartX = ref(0)
const pointerStartY = ref(0)
const pointerDown = ref(false)
const suppressNextClick = ref(false)
const suppressClickUntil = ref(0)
const route = useRoute()
const { isLoading: isPageLoading } = injectPageLoading()

const projects = computed(() => props.section?.featuredProjects || [])

function onPointerDown(event) {
  pointerDown.value = true
  suppressNextClick.value = false
  suppressClickUntil.value = 0
  pointerStartX.value = event.clientX
  pointerStartY.value = event.clientY
}

function onPointerMove(event) {
  if (!pointerDown.value || suppressNextClick.value) return
  const dx = event.clientX - pointerStartX.value
  const dy = event.clientY - pointerStartY.value
  if ((dx * dx + dy * dy) > (DRAG_CLICK_THRESHOLD * DRAG_CLICK_THRESHOLD)) {
    suppressNextClick.value = true
    suppressClickUntil.value = Date.now() + DRAG_CLICK_SUPPRESS_MS
  }
}

function onPointerUp() {
  pointerDown.value = false
}

function onPointerCancel() {
  pointerDown.value = false
}

function onProjectClick(event) {
  const shouldSuppress = suppressNextClick.value || Date.now() < suppressClickUntil.value
  if (!shouldSuppress) return
  event.preventDefault()
  event.stopPropagation()
  suppressNextClick.value = false
}

function onWindowPointerMove(event) {
  onPointerMove(event)
}

function onWindowPointerUp() {
  onPointerUp()
}

function refreshCarouselLayout() {
  if (!flickityRef.value) return
  flickityRef.value.reloadCells()
  flickityRef.value.resize()
  flickityRef.value.reposition()
}

function scheduleLayoutRefresh() {
  if (!import.meta.client) return
  requestAnimationFrame(() => {
    refreshCarouselLayout()
    setTimeout(() => {
      refreshCarouselLayout()
    }, 120)
  })
}

function setupResizeObserver() {
  if (!import.meta.client || typeof ResizeObserver === 'undefined') return
  resizeObserver?.disconnect()
  const el = carouselRef.value
  if (!el) return
  resizeObserver = new ResizeObserver(() => {
    if (resizeObserverRaf) cancelAnimationFrame(resizeObserverRaf)
    resizeObserverRaf = requestAnimationFrame(() => {
      resizeObserverRaf = null
      scheduleLayoutRefresh()
    })
  })
  resizeObserver.observe(el)
}

async function initCarousel() {
  if (!import.meta.client) return
  if (!carouselRef.value) return
  if (flickityRef.value) return
  if (projects.value.length <= 1) return

  const Flickity = (await import('flickity')).default
  flickityRef.value = new Flickity(carouselRef.value, {
    prevNextButtons: false,
    pageDots: false,
    freeScroll: true,
    wrapAround: true,
    adaptiveHeight: false,
    cellAlign: 'left',
    contain: true,
    draggable: true,
    dragThreshold: 18,
    imagesLoaded: true,
  })
  scheduleLayoutRefresh()
}

function destroyCarousel() {
  if (!flickityRef.value) return
  flickityRef.value.destroy()
  flickityRef.value = null
}

watch(
  () => projects.value.length,
  async () => {
    await nextTick()
    destroyCarousel()
    await initCarousel()
    scheduleLayoutRefresh()
  },
)

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    scheduleLayoutRefresh()
    setTimeout(() => scheduleLayoutRefresh(), 500)
  },
)

watch(isPageLoading, (loading) => {
  if (loading) return
  scheduleLayoutRefresh()
})

onMounted(async () => {
  window.addEventListener('pointermove', onWindowPointerMove, { passive: true })
  window.addEventListener('pointerup', onWindowPointerUp, { passive: true })
  window.addEventListener('pointercancel', onWindowPointerUp, { passive: true })
  removePageFinishHook = nuxtApp.hook('page:finish', () => {
    scheduleLayoutRefresh()
  })
  await nextTick()
  await initCarousel()
  scheduleLayoutRefresh()
  setupResizeObserver()
})

onActivated(() => {
  scheduleLayoutRefresh()
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onWindowPointerUp)
  removePageFinishHook()
  if (resizeObserverRaf) cancelAnimationFrame(resizeObserverRaf)
  resizeObserverRaf = null
  resizeObserver?.disconnect()
  resizeObserver = null
  destroyCarousel()
})
</script>

<style scoped>
.featured-projects {
  --screen-width: calc(100vw - calc(var(--gutter) * 2));
  --thumbnail-width: min(var(--screen-width) / 3.33);
}

.featured-projects__carousel {
  width: calc(100% + calc(var(--unit) * 50));
}

.featured-projects__carousel :deep(.flickity-viewport),
.featured-projects__carousel :deep(.flickity-slider) {
  overflow: visible;
}

.featured-project {
  width: var(--thumbnail-width);
  margin-right: var(--gutter);
}


.featured-project-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.featured-project-image-container {
  aspect-ratio: 0.605;
  position: relative;
  overflow: hidden;
}
.featured-project-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.featured-project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  position: absolute;
}

.portfolio-item-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  color: var(--white, #fff);
  opacity: 1;
  transition: opacity 0.28s ease;
  pointer-events: none;
  flex-direction: column;
}

.portfolio-item-overlay-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--orange);
  opacity: 0;
  transition: opacity 0.6s ease 0s;
}

.portfolio-item-overlay-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-height: 100%;
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: opacity 0.2s ease 0s;
}

.portfolio-item-overlay-title {
  font-weight: normal;
  flex: 1;
}

.portfolio-item-overlay-content {
  display: flex;
  flex-direction: column;
  max-width: 28vw;
  line-height: 1.1;
}

.featured-project-link:hover .portfolio-item-overlay-bg,
.featured-project-link:focus-visible .portfolio-item-overlay-bg {
  opacity: 0.9;
  transition: opacity 0.5s ease 0s;
}

.featured-project-link:hover .portfolio-item-overlay-inner,
.featured-project-link:focus-visible .portfolio-item-overlay-inner {
  opacity: 1;
  transition: opacity 0.4s ease 0.15s;
}

@media (max-width: 999px) {
  .portfolio-item-overlay {
    display: none;
  }

  .featured-project-image.is-desktop-archive-img {
    display: none;
  }
}

@media (min-width: 1000px) {
  .featured-project-image.is-mobile-archive-img {
    display: none;
  }
}

.featured-project-title {
  margin-top: calc(var(--gutter) / 1.5);
  margin-bottom: calc(var(--gutter) / 2);
  font-size: var(--font-size-body);
  font-weight: normal;
}

.featured-project-title span {
  display: inline-block;
  position: relative;
}
.featured-project-title span:after {
  content: '';
  position: absolute;
  bottom: var(--underline-offset);
  left: 0;
  width: 100%;
  height: 1px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.32s ease;
  background: currentColor;
}
.featured-project-link:hover .featured-project-title span:after {
  transform: scaleX(1);
}
</style>

