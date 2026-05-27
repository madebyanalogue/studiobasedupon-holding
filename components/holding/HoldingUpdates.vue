<template>
  <section class="updates-section-header">
    <div class="wrapper">
      <div class="grid grid-updates">
        <div class="grid-updates-intro">
          <div class="grid gap-30">
            <div><h2 v-if="title" class="red-text" data-holding-updates-title>{{ title }}</h2></div>
            <div><p v-if="signupText" data-holding-updates-description>{{ signupText }}</p></div>
          </div>
        </div>
        <div data-holding-signup class="home-newsletter-container grid gap-30">
          <div class="hr"></div>
          <div data-holding-signup-message>
            <p
              v-if="submitted"
              class="mono"
              data-holding-newsletter-thank-you
            >
              {{ thankYouMessage }}
            </p>
            <p
              v-else-if="submitError"
              class="mono red-text"
              data-holding-newsletter-error
            >
              {{ submitError }}
            </p>
            <h3
              v-else-if="signupTitle"
              class="mono"
              data-holding-signup-title
            >
              {{ signupTitle }}
            </h3>
          </div>

          <form
            v-if="!submitted"
            data-holding-newsletter-form
            class="holding-newsletter-form"
            @submit.prevent="submitNewsletter"
          >
              <label data-holding-newsletter-field>
                <input
                  v-model="name"
                  type="text"
                  name="name"
                  placeholder="Name"
                  autocomplete="name"
                  aria-label="Name"
                  required
                  :disabled="isSubmitting"
                >
              </label>
              <label data-holding-newsletter-field>
                <input
                  v-model="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  autocomplete="email"
                  aria-label="Email"
                  required
                  :disabled="isSubmitting"
                >
              </label>
              <button
                type="submit"
                data-holding-newsletter-submit
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Submitting…' : 'Submit' }}
              </button>
          </form>
          <div class=""></div>
          <div class="hr"></div>
        </div>

      </div>
    </div>
  </section>
  <section data-holding-updates class="updates-section-content">
    <div class="wrapper">
      

      <div v-if="visibleItems.length" ref="newsListRef" data-holding-news-list class="updates-grid">
        <div
          v-for="(row, rowIndex) in newsRows"
          :key="`updates-row-${rowIndex}`"
          class="updates-row"
          :class="[
            `updates-row--${row.size}`,
            `row--${row.position}`,
          ]"
          :data-holding-news-row="row.size"
          :data-holding-news-row-position="row.position"
        >
          <div
            v-for="{ item, index } in row.items"
            :key="item._id"
            data-holding-news-item
            :data-holding-news-type="item.featuredImage?.asset?.url ? 'image' : 'text'"
            :data-holding-news-index="index"
            class="update-item"
            :class="item.featuredImage?.asset?.url ? 'update-item--image' : 'update-item--text'"
          >
            <div
              v-if="item.featuredImage?.asset?.url"
              class="update-item-media"
              :class="{ 'is-active': activeOverlayId === item._id }"
              tabindex="0"
              role="button"
              :aria-expanded="activeOverlayId === item._id ? 'true' : 'false'"
              :aria-label="item.title || 'View update description'"
              @click="toggleImageOverlay(item._id)"
              @keydown.enter.prevent="toggleImageOverlay(item._id)"
              @keydown.space.prevent="toggleImageOverlay(item._id)"
            >
              <div class="update-item-media-container">
                <NuxtImg
                  :src="item.featuredImage.asset.url"
                  :alt="item.title || ''"
                  data-holding-news-image
                />
                <div
                  v-if="item.content?.length"
                  class="update-item-overlay"
                  data-holding-news-overlay
                >
                  <SanityBlocks :blocks="item.content" />
                </div>
              </div>
            </div>
            <div v-else data-holding-news-text class="update-item-text">
              <div class="update-item-text-container">
                <SanityBlocks
                  v-if="item.content?.length"
                  :blocks="item.content"
                  data-holding-news-content
                />
              </div>
            </div>
            <div class="update-item-timestamp-container">
              <time
                v-if="item.timestamp"
                :datetime="item.timestamp"
                data-holding-news-timestamp
                class="update-item-timestamp"
              >
                {{ item.timestampLabel }}
              </time>
            </div>
          </div>
        </div>
      </div>

      <div class="updates-load-more-container" v-if="hasMore">
        <button
          
          type="button"
          class="button"
          data-holding-news-load-more
          @click="loadMore"
        >
          Load more
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'

const emit = defineEmits(['content-hidden'])

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  signupText: {
    type: String,
    default: '',
  },
  signupTitle: {
    type: String,
    default: '',
  },
  thankYouMessage: {
    type: String,
    default: 'Thank you for signing up.',
  },
  newsItems: {
    type: Array,
    default: () => [],
  },
  batchSize: {
    type: Number,
    default: 10,
  },
  panelActive: {
    type: Boolean,
    default: false,
  },
  panelTransitionDuration: {
    type: Number,
    default: 0.6,
  },
})

const name = ref('')
const email = ref('')
const submitted = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const visibleCount = ref(props.batchSize)
const activeOverlayId = ref(null)
const useTouchOverlay = ref(false)
const newsListRef = ref(null)

const ROW_PATTERN = [3, 2]

const ITEM_REVEAL = {
  duration: 0.9,
  stagger: 0.18,
  ease: 'power2.out',
  y: 24,
  batchDelay: 0.3,
}

let itemRevealTween = null
let hideDelayTimer = null

const visibleItems = computed(() => props.newsItems.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < props.newsItems.length)

const newsRows = computed(() => {
  const rows = []
  let index = 0
  let patternIndex = 0

  while (index < visibleItems.value.length) {
    const size = ROW_PATTERN[patternIndex % ROW_PATTERN.length]
    const slice = visibleItems.value.slice(index, index + size)

    if (!slice.length) break

    rows.push({
      size,
      position: (patternIndex % 4) + 1,
      items: slice.map((item, offset) => ({
        item,
        index: index + offset,
      })),
    })

    index += slice.length
    patternIndex += 1
  }

  return rows
})

function getNewsItemElements(startIndex = 0) {
  if (!newsListRef.value) return []

  const items = [...newsListRef.value.querySelectorAll('[data-holding-news-item]')]
  return startIndex > 0 ? items.slice(startIndex) : items
}

function cancelScheduledHide() {
  if (hideDelayTimer) {
    clearTimeout(hideDelayTimer)
    hideDelayTimer = null
  }
}

function scheduleHideNewsItems() {
  cancelScheduledHide()

  hideDelayTimer = setTimeout(() => {
    hideDelayTimer = null
    if (!props.panelActive) {
      hideNewsItems(true)
    }
  }, props.panelTransitionDuration * 1000)
}

function hideNewsItems(emitHidden = false) {
  itemRevealTween?.kill()

  const items = getNewsItemElements()
  if (items.length) {
    gsap.set(items, { autoAlpha: 0, y: ITEM_REVEAL.y })
  }

  if (emitHidden) {
    emit('content-hidden')
  }
}

function revealNewsItems(startIndex = 0, delay = 0) {
  if (!process.client || !props.panelActive) return

  nextTick(() => {
    const items = getNewsItemElements(startIndex)
    if (!items.length) return

    itemRevealTween?.kill()
    gsap.set(items, { autoAlpha: 0, y: ITEM_REVEAL.y })

    itemRevealTween = gsap.to(items, {
      autoAlpha: 1,
      y: 0,
      duration: ITEM_REVEAL.duration,
      stagger: ITEM_REVEAL.stagger,
      ease: ITEM_REVEAL.ease,
      delay,
    })
  })
}

watch(
  () => props.panelActive,
  (isActive) => {
    if (!process.client) return

    if (isActive) {
      cancelScheduledHide()
      revealNewsItems(0, props.panelTransitionDuration)
      return
    }

    scheduleHideNewsItems()
  },
)

onMounted(() => {
  if (!process.client) return

  useTouchOverlay.value = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  hideNewsItems()

  if (props.panelActive) {
    revealNewsItems(0, props.panelTransitionDuration)
  }
})

onBeforeUnmount(() => {
  cancelScheduledHide()
  itemRevealTween?.kill()
})

function toggleImageOverlay(id) {
  if (!useTouchOverlay.value) return
  activeOverlayId.value = activeOverlayId.value === id ? null : id
}

function loadMore() {
  const startIndex = visibleCount.value

  visibleCount.value = Math.min(
    visibleCount.value + props.batchSize,
    props.newsItems.length,
  )

  if (visibleCount.value > startIndex) {
    revealNewsItems(startIndex, ITEM_REVEAL.batchDelay)
  }
}

async function submitNewsletter() {
  if (isSubmitting.value || submitted.value) return

  submitError.value = ''
  isSubmitting.value = true

  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        email: email.value.trim(),
      },
    })
    submitted.value = true
  } catch (error) {
    const fetchError = error
    submitError.value =
      fetchError?.data?.message ||
      fetchError?.message ||
      'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
[data-holding-updates-description] {
  white-space: pre-line;
}

[data-holding-signup-message] :is(h3, p) {
  margin: 0;
}

.holding-newsletter-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media all and (max-width: 699px) {
  .holding-newsletter-form {
    grid-template-columns: 1fr;
  }
}

[data-holding-newsletter-field] {
  flex: 1 1 140px;
  min-width: 0;
}

[data-holding-newsletter-field] input {
  width: 100%;
}

[data-holding-newsletter-submit] {
  flex: 0 0 auto;
}

:deep([data-holding-news-item]) {
  opacity: 0;
  visibility: hidden;
  will-change: opacity, transform;
}
</style>
