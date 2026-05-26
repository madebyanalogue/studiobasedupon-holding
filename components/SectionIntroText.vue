<template>
  <section
    v-if="blocks?.length"
    class="section-intro-text h3"
    :class="`section-intro-text--${animation}`"
  >
    <div
      ref="innerRef"
      class="section-intro-text__inner"
      :data-line-reveal="animation === 'line-reveal-scroll' ? '' : undefined"
      :data-line-reveal-start="animation === 'line-reveal-scroll' ? scrollStart : undefined"
      :data-line-reveal-end="animation === 'line-reveal-scroll' ? scrollEnd : undefined"
      :data-line-reveal-duration="animation === 'line-reveal-scroll' ? String(duration) : undefined"
      :data-line-reveal-stagger="animation === 'line-reveal-scroll' ? String(stagger) : undefined"
    >
      <SanityBlocks :blocks="blocks" />
    </div>
  </section>
</template>

<script setup>
import { useLineRevealAnimation } from '~/composables/useLineRevealAnimation'

const props = defineProps({
  blocks: {
    type: Array,
    default: () => [],
  },
  /** Animation type: none, line-reveal (on mount), line-reveal-scroll (scroll-triggered) */
  animation: {
    type: String,
    default: 'none',
    validator: (v) => ['none', 'line-reveal', 'line-reveal-scroll'].includes(v),
  },
  /** ScrollTrigger start (e.g. "top 85%") - for line-reveal-scroll */
  scrollStart: {
    type: String,
    default: 'top 85%',
  },
  /** ScrollTrigger end (e.g. "center 50%") - for line-reveal-scroll */
  scrollEnd: {
    type: String,
    default: 'center 50%',
  },
  /** Duration for line reveal - for line-reveal-scroll */
  duration: {
    type: Number,
    default: 0.75,
  },
  /** Stagger between lines - for line-reveal-scroll */
  stagger: {
    type: Number,
    default: 0.1,
  },
})

const { animateLineReveal } = useLineRevealAnimation()
const innerRef = ref(null)

onMounted(() => {
  if (props.animation === 'line-reveal' && innerRef.value) {
    nextTick(() => {
      if (document.body.classList.contains('preloader-complete')) {
        animateLineReveal(innerRef.value)
      } else {
        document.addEventListener('preloader-complete', () => {
          animateLineReveal(innerRef.value)
        }, { once: true })
      }
    })
  }
})
</script>

<style scoped>
.section-intro-text {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--unit-grid);
}

.section-intro-text__inner {
  max-width: 55%;
  margin: 0 auto;
  text-align: center;
}

@media (max-width: 1000px) {
  .section-intro-text__inner {
    max-width: 100%;
  }
}
</style>
