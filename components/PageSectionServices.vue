<template>
  <section class="services-section grid gap-30">

    <div class="show-md">
      <h2 v-if="section.servicesTitle || section.title" class="subtitle subtitle--square twisted orange-dot">
        {{ section.servicesTitle || section.title }}
      </h2>
    </div>

    <div class="rounded-medium beige pad-50 pad-md-50 grid gap-30">

      <div class="hide-md">
        <h2 v-if="section.servicesTitle || section.title" class="subtitle small subtitle--square twisted white-dot">
          {{ section.servicesTitle || section.title }}
        </h2>
      </div>

      <div class="services-section__desktop-grid fluid-type pad-70 pad-top-bottom" style="--desktop: 54; --mobile: 28;">
        <div
          v-for="(line, index) in serviceLines"
          :key="`service-desktop-${index}`"
          class="services-section__item"
        >
          {{ line }}
        </div>
      </div>

      <div ref="carouselRef" class="services-section__mobile-carousel fluid-type" style="--desktop: 54; --mobile: 28;">
        <div
          v-for="(group, groupIndex) in mobileGroups"
          :key="`service-group-${groupIndex}`"
          class="services-section__slide"
        >
          <div
            v-for="(line, index) in group"
            :key="`service-mobile-${groupIndex}-${index}`"
            class="services-section__item"
          >
            {{ line }}
          </div>
        </div>
      </div>
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

const MOBILE_MAX = 999
const carouselRef = ref(null)
const flickityRef = ref(null)
let removeResizeListener = () => {}

const serviceLines = computed(() => {
  return (props.section?.servicesTextarea || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
})

const mobileGroups = computed(() => {
  const out = []
  for (let i = 0; i < serviceLines.value.length; i += 7) {
    out.push(serviceLines.value.slice(i, i + 7))
  }
  return out
})

async function initMobileCarousel() {
  if (!import.meta.client) return
  if (!carouselRef.value) return
  if (window.innerWidth > MOBILE_MAX) return
  if (flickityRef.value) return
  if (mobileGroups.value.length <= 1) return

  const Flickity = (await import('flickity')).default
  flickityRef.value = new Flickity(carouselRef.value, {
    prevNextButtons: false,
    pageDots: true,
    wrapAround: true,
    adaptiveHeight: false,
    cellAlign: 'left',
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
    initMobileCarousel()
    return
  }
  destroyMobileCarousel()
}

watch(
  () => mobileGroups.value.length,
  async () => {
    await nextTick()
    destroyMobileCarousel()
    initMobileCarousel()
  },
)

onMounted(async () => {
  await nextTick()
  await initMobileCarousel()
  window.addEventListener('resize', handleViewportChange)
  removeResizeListener = () => window.removeEventListener('resize', handleViewportChange)
})

onUnmounted(() => {
  removeResizeListener()
  destroyMobileCarousel()
})
</script>

<style scoped>
.services-section {
  display: flex;
  flex-direction: column;
  gap: var(--gutter);
  overflow: hidden;
}

.services-section__desktop-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.services-section__item {
  line-height: 1.15;
}

.services-section__mobile-carousel {
  display: none;
}

@media (max-width: 699px) {
  .services-section__desktop-grid {
    display: none;
  }

  .services-section__mobile-carousel {
    display: block;
  }

  .services-section__slide {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.1em;
  }
}

.services-section__mobile-carousel {
  width: calc(100% + calc(var(--unit) * 50));
}

.services-section__mobile-carousel :deep(.flickity-viewport),
.services-section__mobile-carousel :deep(.flickity-slider) {
  overflow: visible;
}
.services-section__mobile-carousel :deep(.flickity-page-dots) {
  position: static;
  margin-top: 35px;
  display: flex;
  justify-content: center;
  gap: 10px;
  color: var(--white);
}

.services-section__mobile-carousel :deep(.flickity-page-dots .dot) {
  margin: 0;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.35;
}

.services-section__mobile-carousel :deep(.flickity-page-dots .dot.is-selected) {
  opacity: 1;
}


.services-section__mobile-carousel :deep(.flickity-page-dot) {
  margin: 0 0px;
  background-color: var(--white);
  opacity: 0.4;
}

.services-section__mobile-carousel :deep(.flickity-page-dot.is-selected) {
  opacity: 1;
}
</style>

