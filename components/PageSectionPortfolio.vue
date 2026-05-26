<template>
  <div
    class="portfolio-section"
    :style="sectionStyle"
  >
    <div
      v-for="(project, index) in projectList"
      :key="project._id"
      class="portfolio-item"
      :class="{ 'portfolio-item--orphan': isOrphanSlot(index, listLength) }"
      :style="gridStyleForIndex(index, listLength)"
    >
      <NuxtLink
        v-if="project.slug?.current"
        :to="`/portfolio/${project.slug.current}`"
        class="portfolio-item-link"
      >
        <div class="portfolio-item-media rounded-medium">
          <NuxtImg
            v-if="project.featuredImage?.asset"
            :src="project.featuredImage.asset.url || ''"
            alt=""
            fit="cover"
            :class="[
              'portfolio-item-image rounded-medium',
              project.featuredImageMobile?.asset ? 'is-desktop-archive-img' : '',
            ]"
          />
          <NuxtImg
            v-if="project.featuredImageMobile?.asset"
            :src="project.featuredImageMobile.asset.url || ''"
            alt=""
            fit="cover"
            class="portfolio-item-image rounded-medium is-mobile-archive-img"
          />
          <div class="portfolio-item-overlay pad-40">
            <div
              class="portfolio-item-overlay-bg"
              aria-hidden="true"
            />
            <div class="portfolio-item-overlay-inner gap-40">
              <h3 class="portfolio-item-overlay-title fluid-type" style="--desktop:72;">{{ project.title }}</h3>
              <div class="portfolio-item-overlay-content gap-50">
                <div  v-if="project.thumbnailDescription" class="portfolio-item-overlay-desc fluid-type" style="--desktop:36;" >
                  {{ project.thumbnailDescription }}
                </div>
                <PortfolioStats
                  v-if="project.thumbnailStats?.length"
                  :stats="project.thumbnailStats"
                  root-class="portfolio-item-overlay-stats gap-20"
                />
              </div>
            </div>
          </div>
        </div>
        <h3 class="portfolio-item-title">{{ project.title }}</h3>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  /** Loaded with the page query so SSR and client share one payload (avoids hydration mismatches). */
  projects: {
    type: Array,
    default: () => [],
  },
})

/** Desktop mosaic: [4,8], [7,5], [5,7] repeating every 6 items */
const SPAN_CYCLE = [4, 8, 7, 5, 5, 7]

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

const projectList = computed(() => props.projects || [])

const listLength = computed(() => projectList.value.length)

/** Used only under 1000px — desktop thumbnails follow grid width + natural image height. */
const sectionStyle = computed(() => ({
  '--portfolio-aspect-ratio': parseAspectRatio(props.section?.thumbnailAspectRatio),
}))

function columnSpanForIndex(index, total) {
  if (total <= 0) return 12
  const last = total - 1
  if (index === last && total % 2 === 1) {
    return 12
  }
  return SPAN_CYCLE[index % SPAN_CYCLE.length]
}

function isOrphanSlot(index, total) {
  return index === total - 1 && total % 2 === 1
}

function gridStyleForIndex(index, total) {
  return {
    gridColumn: `span ${columnSpanForIndex(index, total)}`,
  }
}
</script>

<style scoped>
.portfolio-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gutter);
  --portfolio-thumb-height: auto;
}

@media (min-width: 1000px) {
  .portfolio-section {
    --portfolio-thumb-height: calc(100vw * 700 / 1920);
  }
}

.portfolio-item-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.portfolio-item-media {
  max-width: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.portfolio-item-image {
  display: block;
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



.portfolio-item-overlay-bg {
  opacity: 0;
  transition: opacity 0.6s ease .0s;
}
.portfolio-item-overlay-inner {
  opacity: 0;
  transition: opacity 0.2s ease 0s;
}

.portfolio-item-link:hover .portfolio-item-overlay-bg,
.portfolio-item-link:focus-visible .portfolio-item-overlay-bg {
  opacity: 0.9;
  transition: opacity 0.5s ease 0s;
}
.portfolio-item-link:hover .portfolio-item-overlay-inner,
.portfolio-item-link:focus-visible .portfolio-item-overlay-inner {
  opacity: 1;
  transition: opacity 0.4s ease .15s;
}

.portfolio-item {
  position: relative;
}

.portfolio-item-media {
  height: var(--portfolio-thumb-height);
}




@media (max-width: 999px) {

  .portfolio-item-media {
    aspect-ratio: var(--portfolio-aspect-ratio);
  }
  .portfolio-item-overlay {
    display: none;
  }

  .portfolio-item--orphan .portfolio-item-media {
    width: 100%;
    max-width: none;
    aspect-ratio: unset;
  }
  /* Full-width rows on single-column grid; do not use span 12 — that creates implicit columns. */
  .portfolio-item {
    grid-column: 1 / -1 !important;
  }

  .portfolio-item-image.is-desktop-archive-img {
    display: none;
  }
}

@media (min-width: 1000px) {
  .portfolio-section {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  .portfolio-item-title {
    display: none;
  }


  .portfolio-item-media img  {
    height: 100%;
    position: absolute;
    aspect-ratio: unset;
  }


  .portfolio-item-image.is-mobile-archive-img {
    display: none;
  }
}

.portfolio-item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    position: absolute;
  }

.portfolio-item-title {
  margin-top: calc(var(--gutter) / 1.5);
  margin-bottom: calc(var(--gutter) / 2);
  font-size:28px;
  font-weight: normal;
}
</style>
