<template>
  <section ref="sectionRef" class="kinetic-typography">
    <div
      v-if="section.kineticTypographyText?.length"
      class="kinetic-typography__text kinetic-typography__text--static hide-md"
    >
      <SanityBlocks :blocks="section.kineticTypographyText" />
    </div>

    <div
      v-else-if="hasStructuredContent"
      class="kinetic-typography__text kinetic-typography__text--static hide-md"
    >
      <p v-if="line1" class="kinetic-typography__line1">{{ line1 }}</p>
      <p v-if="hasLine2" class="kinetic-typography__line2">
        <span class="kinetic-typography__highlight">{{ highlightStart }}</span><span>{{ connector }}</span><span class="kinetic-typography__highlight">{{ highlightEnd }}</span>
      </p>
    </div>

    <div
      v-if="hasStructuredContent"
      class="kinetic-typography__stage show-md"
    >
      <div
        class="kinetic-typography__text kinetic-typography__text--animated fluid-type"
        style="--desktop: 108; --mobile: 40;"
      >
        <p
          v-if="line1"
          ref="line1Ref"
          class="kinetic-typography__line1 kinetic-typography__line1--animated"
          data-kinetic-fade
        >
          {{ line1 }}
        </p>
        <p v-if="hasLine2" class="kinetic-typography__line2">
          <span class="kinetic-typography__highlight">{{ highlightStart }}</span><span
            ref="connectorRef"
            class="kinetic-typography__connector"
            data-kinetic-fade
          >{{ connector }}</span><span class="kinetic-typography__highlight">{{ highlightEnd }}</span>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const DESKTOP_MQ = '(min-width: 1000px)'

const sectionRef = ref(null)
const line1Ref = ref(null)
const connectorRef = ref(null)

let mmContext = null

const line1 = computed(() => props.section.kineticTypographyLine1 ?? '')
const highlightStart = computed(() => props.section.kineticTypographyHighlightStart ?? '')
const highlightEnd = computed(() => props.section.kineticTypographyHighlightEnd ?? '')
const connector = computed(() => {
  const value = props.section.kineticTypographyHighlightConnector
  if (value == null || value === '') return ' and '
  return value
})

const hasLine2 = computed(
  () =>
    Boolean(props.section.kineticTypographyHighlightStart?.trim()) ||
    Boolean(props.section.kineticTypographyHighlightEnd?.trim()),
)
const hasStructuredContent = computed(
  () => Boolean(props.section.kineticTypographyLine1?.trim()) || hasLine2.value,
)

async function initScrollEffect() {
  mmContext?.revert()
  mmContext = null

  if (!import.meta.client || !hasStructuredContent.value) return

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])

  gsap.registerPlugin(ScrollTrigger)

  mmContext = gsap.matchMedia()
  mmContext.add(DESKTOP_MQ, () => {
    let scrollTrigger = null
    let cancelled = false

    const getElements = () => ({
      section: sectionRef.value,
      line1El: line1Ref.value,
      connectorEl: connectorRef.value,
    })

    const isDesktopLayoutReady = ({ section, connectorEl, line1El }) => {
      if (!section || !connectorEl) return false

      const stage = section.querySelector('.kinetic-typography__stage')
      if (!stage || getComputedStyle(stage).display === 'none') return false
      if (connectorEl.offsetWidth === 0) return false
      if (line1El && line1El.offsetHeight === 0) return false

      return true
    }

    const setup = () => {
      const { section, line1El, connectorEl } = getElements()
      if (cancelled || !isDesktopLayoutReady({ section, connectorEl, line1El })) {
        requestAnimationFrame(setup)
        return
      }

      const fadeEls = [
        ...(line1El ? [line1El] : []),
        connectorEl,
      ]

      connectorEl.style.display = 'inline-block'
      connectorEl.style.overflow = 'hidden'
      connectorEl.style.verticalAlign = 'bottom'
      connectorEl.style.whiteSpace = 'pre'

      if (line1El) {
        line1El.style.overflow = 'hidden'
      }

      let line1Height = 0
      let line1Margin = 0
      let connectorWidth = 0

      const measure = () => {
        connectorEl.style.width = ''
        connectorWidth = connectorEl.offsetWidth

        if (line1El) {
          line1El.style.height = ''
          line1El.style.marginBottom = ''
          line1Height = line1El.offsetHeight
          line1Margin = parseFloat(getComputedStyle(line1El).marginBottom) || 0
        }
      }

      const FADE_END = 0.5
      const COLLAPSE_START = 0.5
      const COLLAPSE_END = 0.5 + 0.5 * 0.75

      const applyProgress = (progress) => {
        if (progress <= FADE_END) {
          const opacity = 1 - progress / FADE_END
          fadeEls.forEach((el) => {
            el.style.opacity = String(opacity)
          })
          if (line1El) {
            line1El.style.height = ''
            line1El.style.marginBottom = ''
          }
          connectorEl.style.width = ''
          return
        }

        measure()

        fadeEls.forEach((el) => {
          el.style.opacity = '0'
        })

        const collapse = Math.min(
          1,
          (progress - COLLAPSE_START) / (COLLAPSE_END - COLLAPSE_START),
        )
        if (line1El) {
          line1El.style.height = `${line1Height * (1 - collapse)}px`
          line1El.style.marginBottom = `${line1Margin * (1 - collapse)}px`
        }
        connectorEl.style.width = `${connectorWidth * (1 - collapse)}px`
      }

      const animationScrollDistance = section.offsetHeight

      scrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${animationScrollDistance}`,
        pin: section,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          applyProgress(self.progress)
        },
        onRefresh(self) {
          applyProgress(self.progress)
        },
      })

      applyProgress(scrollTrigger.progress)

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          if (!cancelled) ScrollTrigger.refresh()
        })
      }
    }

    requestAnimationFrame(setup)

    return () => {
      cancelled = true
      scrollTrigger?.kill()
      scrollTrigger = null

      const { line1El, connectorEl } = getElements()
      if (line1El) {
        line1El.style.opacity = ''
        line1El.style.height = ''
        line1El.style.marginBottom = ''
        line1El.style.overflow = ''
      }
      if (connectorEl) {
        connectorEl.style.opacity = ''
        connectorEl.style.width = ''
        connectorEl.style.display = ''
        connectorEl.style.overflow = ''
        connectorEl.style.verticalAlign = ''
        connectorEl.style.whiteSpace = ''
      }
    }
  })
}

onMounted(async () => {
  await nextTick()
  await initScrollEffect()
})

onBeforeUnmount(() => {
  mmContext?.revert()
  mmContext = null
})
</script>

<style scoped>
.kinetic-typography {
  background: transparent;
  color: #555;
}

.kinetic-typography__text {
  text-align: center;
  line-height: 1.1;
}

@media (max-width: 999px) {
  .kinetic-typography__text {
    letter-spacing: -0.015em;
  }
}

@media (min-width: 1000px) {
  .kinetic-typography {
    letter-spacing: -0.15em;
  }
}



.kinetic-typography__highlight,
.kinetic-typography :deep(strong),
.kinetic-typography :deep(b) {
  color: var(--orange);
  font-weight: normal;
}

.kinetic-typography__line1,
.kinetic-typography__line2 {
  white-space: pre-wrap;
}

.kinetic-typography__line1 {
  margin: 0 0 calc(var(--unit) * 12);
}

.kinetic-typography__line1--animated {
  overflow: hidden;
}

.kinetic-typography__connector {
  white-space: pre;
}

.kinetic-typography__line2 {
  margin: 0;
}

.kinetic-typography__stage {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-sizing: border-box;
  padding: calc(var(--unit) * 310) calc(var(--unit) * 200) calc(var(--unit) * 200);
}

.kinetic-typography__text--animated {
  width: 100%;
}

.kinetic-typography__text--static {
  --unit: calc((100vw - calc(var(--gutter) * 2)) / 100);
  font-size: calc(var(--unit) * 9);
}
.kinetic-typography__text--static,
.kinetic-typography__text:not(.kinetic-typography__text--animated) {
  padding: 80px calc(var(--unit) * 6);
}
@media (min-width: 700px) {
  .kinetic-typography__text--static {
    font-size: 6vw;
  }
  .kinetic-typography__text--static,
  .kinetic-typography__text:not(.kinetic-typography__text--animated) {
    padding: 80px calc(10vw - calc(var(--gutter) * 2));
  }
}

</style>
