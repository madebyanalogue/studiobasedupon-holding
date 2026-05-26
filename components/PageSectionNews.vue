<template>
  <section class="news-section grid gap-30">
    <h2 v-if="section.newsTitle || section.title" class="subtitle subtitle--circle yellow-dot">
      {{ section.newsTitle || section.title }}
    </h2>

    <div v-if="newsItems.length > 0" class="news-list">
      <article
        v-for="(item, index) in newsItems"
        :key="item._id || item._key || index"
        class="news-item flex gap-md-100 yellow pad-25 rounded-medium underline-links"
        :class="{ 'news-item--text': !item.featuredImage?.asset?.url }"
      >
        <div v-if="item.featuredImage?.asset?.url" class="news-thumbnail">
          <NuxtImg
            :src="item.featuredImage.asset.url"
            :width="item.featuredImage.asset.metadata?.dimensions?.width"
            :height="item.featuredImage.asset.metadata?.dimensions?.height"
            alt=""
            class="news-image rounded-medium"
          />
        </div>
        <SanityBlocks v-if="item.content" :blocks="item.content" class="news-content fluid-type" style="--desktop: 60; --mobile: 16;" />
      </article>
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

const newsItems = computed(() =>
  (props.section?.newsItems || [])
    .map((item) => item?.newsPost)
    .filter(Boolean),
)
</script>

<style scoped>
.news-section {
 --media-width: clamp(52px, 9vw, 200px);
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: var(--gutter);
}

.news-item {
  align-items: center;
}

.news-item--text {
  align-items: flex-start;
}

.news-item--text .news-content {
  flex: 1;
}

.news-thumbnail {
  flex: 0 0 auto;
  border-radius: var(--rounded-small);
}

.news-image {
  width: var(--media-width);
  height: var(--media-width);
  min-width: 52px;
  min-height: 52px;
  object-fit: cover;
  display: block;
}

.news-content {
  flex: 1;
  min-width: 0;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.news-content :deep(.sanity-block) {
  margin-bottom: 0;
}

@media (max-width: 799px) {
  .news-item {
    gap: var(--gutter);
  }

  .news-image {
    width: 64px;
    height: 64px;
  }
}


/* Keep compatibility with legacy markup classes if referenced elsewhere */
.news-item {
  display: flex;
}
</style>
