<template>
  <PageSectionCards
    v-if="hasCards"
    :section="mobileSection"
    class="stacking-cards-section__mobile"
  />

  <section
    v-if="hasCards"
    ref="sectionRef"
    class="sticky-cards stacking-cards-section__desktop grid gap-30"
  >
    <h2
      v-if="cardsSectionTitle"
      class="sticky-cards__heading subtitle subtitle--circle purple-dot"
    >
      {{ cardsSectionTitle }}
    </h2>

    <div class="sticky-cards__container">
        <article
          v-for="(card, index) in section.cards"
          :key="card._key || `card-${index}`"
          class="sticky-cards__card rounded-medium pad-20 pad-sm-50"
          :style="{ zIndex: section.cards.length - index }"
        >
        <div class="sticky-cards__grid">
          <div class="sticky-cards__media">
            <video
              v-if="card.mediaType === 'video' && card.video?.asset?.url"
              autoplay
              muted
              loop
              playsinline
              class="sticky-cards__video"
            >
              <source
                :src="card.video.asset.url"
                :type="videoMimeTypeFromUrl(card.video.asset.url)"
              >
            </video>

            <NuxtImg
              v-else-if="card.image?.asset?.url"
              :src="card.image.asset.url"
              :alt="card.title || ''"
              :width="card.image.asset.metadata?.dimensions?.width"
              :height="card.image.asset.metadata?.dimensions?.height"
              class="sticky-cards__image"
            />
          </div>

          <div class="sticky-cards__text">
            <div class="grid gap-30 pad-md-50 pad-right">
              <h3
                v-if="card.title"
                class="sticky-cards__title fluid-type line-height-1 pad-60 pad-right"
                style="--desktop: 56; --mobile: 24;"
              >
                {{ card.title }}
              </h3>
              <div class="fluid-type" style="--desktop: 40; --mobile: 16;">
                <SanityBlocks
                  v-if="card.description?.length"
                  :blocks="card.description"
                />
              </div>
            </div>
          </div>
        </div>
        </article>
      </div>
    </section>
</template>

<script setup>
const DESKTOP_MQ = '(min-width: 1000px)'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const sectionRef = ref(null)
let mmContext = null

const hasCards = computed(() => (props.section?.cards || []).length > 0)

const cardsSectionTitle = computed(
  () =>
    props.section?.cardsSectionTitle ||
    props.section?.cardsTitle ||
    props.section?.title ||
    '',
)

const mobileSection = computed(() => ({
  ...props.section,
  cardsDisableScrollDemo: true,
}))

function videoMimeTypeFromUrl(url) {
  if (!url || typeof url !== 'string') return 'video/mp4'
  const lower = url.toLowerCase()
  if (lower.endsWith('.webm')) return 'video/webm'
  if (lower.endsWith('.ogg') || lower.endsWith('.ogv')) return 'video/ogg'
  return 'video/mp4'
}

async function waitForMedia(root) {
  const images = root.querySelectorAll('img')
  await Promise.all(
    Array.from(images).map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve()
            return
          }

          image.addEventListener('load', resolve, { once: true })
          image.addEventListener('error', resolve, { once: true })
        }),
    ),
  )
}

async function initStickyCards() {
  mmContext?.revert()
  mmContext = null

  if (!import.meta.client || !hasCards.value) return

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])

  gsap.registerPlugin(ScrollTrigger)

  mmContext = gsap.matchMedia()

  mmContext.add(DESKTOP_MQ, () => {
    let scrollTrigger = null
    let cancelled = false

    const setup = async () => {
      const section = sectionRef.value
      if (cancelled || !section) return

      const cardEls = section.querySelectorAll('.sticky-cards__card')
      const totalCards = cardEls.length
      if (totalCards < 1) return

      await waitForMedia(section)
      if (cancelled) return

      await new Promise((resolve) => requestAnimationFrame(resolve))
      if (cancelled) return

      const segmentSize = 1 / totalCards
      const cardYOffset = 5
      const cardScaleStep = 0.075
      const maxAnimProgress =
        totalCards <= 1 ? 0 : (totalCards - 1) / totalCards

      cardEls.forEach((card, index) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50 + index * cardYOffset,
          scale: 1 - index * cardScaleStep,
        })
      })

      function updateCards(rawProgress) {
        const animProgress =
          totalCards <= 1 ? 0 : Math.min(rawProgress, 1) * maxAnimProgress
        const activeIndex = Math.min(
          Math.floor(animProgress / segmentSize),
          totalCards - 1,
        )
        const segProgress =
          (animProgress - activeIndex * segmentSize) / segmentSize

        cardEls.forEach((card, index) => {
          if (index < activeIndex) {
            gsap.set(card, {
              yPercent: -250,
              rotationX: 35,
              scale: 1,
            })
          } else if (index === activeIndex) {
            gsap.set(card, {
              yPercent: gsap.utils.interpolate(-50, -200, segProgress),
              rotationX: gsap.utils.interpolate(0, 35, segProgress),
              scale: 1,
            })
          } else {
            const behindIndex = index - activeIndex
            const currentYOffset = (behindIndex - segProgress) * cardYOffset
            const currentScale =
              1 - (behindIndex - segProgress) * cardScaleStep

            gsap.set(card, {
              yPercent: -50 + currentYOffset,
              rotationX: 0,
              scale: currentScale,
            })
          }
        })
      }

      scrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () =>
          `+=${window.innerHeight * Math.max((totalCards - 1) * 2, 1)}`,
        pin: section,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          updateCards(self.progress)
        },
        onLeave() {
          updateCards(1)
        },
      })

      ScrollTrigger.refresh()
    }

    setup()

    return () => {
      cancelled = true
      scrollTrigger?.kill()
      scrollTrigger = null
      gsap.set(sectionRef.value?.querySelectorAll('.sticky-cards__card') || [], {
        clearProps: 'all',
      })
    }
  })
}

watch(
  () =>
    (props.section?.cards || [])
      .map((card) =>
        [
          card._key,
          card.title,
          card.mediaType,
          card.image?.asset?.url,
          card.video?.asset?.url,
        ].join(':'),
      )
      .join('|'),
  async () => {
    await nextTick()
    initStickyCards()
  },
)

onMounted(async () => {
  await nextTick()
  initStickyCards()
})

onUnmounted(() => {
  mmContext?.revert()
  mmContext = null
})
</script>

<style scoped>
.stacking-cards-section__mobile {
  display: block;
}

.stacking-cards-section__desktop {
  display: none;
}

@media (min-width: 1000px) {
  .stacking-cards-section__mobile {
    display: none;
  }

  .stacking-cards-section__desktop {
    display: block;
  }
}

.sticky-cards {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  perspective: 1000px;
  grid-template-rows: auto 1fr;
  align-content: start;
}

.sticky-cards__heading {
  position: relative;
  z-index: 10;
  pointer-events: none;
  width: 100%;
  padding-top: calc(var(--gutter) * 1.5);
}

.sticky-cards__container {
  position: relative;
  width: 100%;
  min-height: 100dvh;
}

.sticky-cards__card {
  position: absolute;
  top: calc(50% - calc(var(--gutter) * 3));
  left: 50%;
  width: calc(100% - calc(var(--gutter) * 2));
  height: calc(100vh - calc(var(--gutter) * 10) - var(--header-height));
  aspect-ratio: 1.6;
  color: var(--black);
  transform-origin: center bottom;
  will-change: transform;
}

.sticky-cards__card:nth-child(4n - 1) {
  background-color: var(--purple);
}

.sticky-cards__card:nth-child(4n - 2) {
  background-color: var(--purple-tint-2);
}

.sticky-cards__card:nth-child(4n - 3) {
  background-color: var(--purple-tint-3);
}

.sticky-cards__card:nth-child(4n - 4) {
  background-color: var(--purple-tint-4);
}

.sticky-cards__grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-areas: 'text media';
  height: 100%;
}

.sticky-cards__text {
  grid-area: text;
}

.sticky-cards__media {
  grid-area: media;
  aspect-ratio: 1.4;
  border-radius: calc(var(--unit) * 80) calc(var(--unit) * 20)
    calc(var(--unit) * 20) calc(var(--unit) * 80);
  overflow: hidden;
  height: 100%;
  width: 100%;
}

.sticky-cards__title {
  line-height: 1.15;
  margin: 0;
}

.sticky-cards__image,
.sticky-cards__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
