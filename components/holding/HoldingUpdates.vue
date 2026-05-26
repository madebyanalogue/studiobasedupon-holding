<template>
  <section data-holding-updates>
    <h2 v-if="title" data-holding-updates-title>{{ title }}</h2>

    <form
      v-if="!submitted"
      data-holding-newsletter-form
      @submit.prevent="submitNewsletter"
    >
      <label data-holding-newsletter-field>
        <span>Name</span>
        <input v-model="name" type="text" name="name" autocomplete="name" required />
      </label>
      <label data-holding-newsletter-field>
        <span>Email</span>
        <input v-model="email" type="email" name="email" autocomplete="email" required />
      </label>
      <button type="submit" data-holding-newsletter-submit>Submit</button>
    </form>

    <p v-else data-holding-newsletter-thank-you>{{ thankYouMessage }}</p>

    <ul v-if="visibleItems.length" data-holding-news-list>
      <li
        v-for="(item, index) in visibleItems"
        :key="item._id"
        data-holding-news-item
        :data-holding-news-type="item.featuredImage?.asset?.url ? 'image' : 'text'"
        :data-holding-news-index="index"
      >
        <NuxtImg
          v-if="item.featuredImage?.asset?.url"
          :src="item.featuredImage.asset.url"
          :width="item.featuredImage.asset.metadata?.dimensions?.width"
          :height="item.featuredImage.asset.metadata?.dimensions?.height"
          alt=""
          data-holding-news-image
        />
        <div v-else data-holding-news-text>
          <p v-if="item.title" data-holding-news-title>{{ item.title }}</p>
          <p v-if="item.excerpt && item.excerpt !== item.title" data-holding-news-excerpt>
            {{ item.excerpt }}
          </p>
        </div>
        <time
          v-if="item.timestamp"
          :datetime="item.timestamp"
          data-holding-news-timestamp
        >
          {{ item.timestampLabel }}
        </time>
      </li>
    </ul>

    <button
      v-if="hasMore"
      type="button"
      data-holding-news-load-more
      @click="loadMore"
    >
      Click to Load more
    </button>
  </section>
</template>

<script setup>
const props = defineProps({
  title: {
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
    default: 3,
  },
})

const name = ref('')
const email = ref('')
const submitted = ref(false)
const visibleCount = ref(props.batchSize)

const visibleItems = computed(() => props.newsItems.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < props.newsItems.length)

function loadMore() {
  visibleCount.value = Math.min(
    visibleCount.value + props.batchSize,
    props.newsItems.length,
  )
}

function submitNewsletter() {
  submitted.value = true
}
</script>
