<template>
  <div
    v-if="images && images.length > 0"
    class="portfolio-gallery"
    data-click-zoom-article
  >
    <div
      v-for="(image, index) in images"
      :key="index"
      class="portfolio-gallery-image"
      :class="{ 'portfolio-gallery-image-active': index === currentIndex }"
    >
      <NuxtImg
        v-if="image?.asset"
        :src="image.asset.url || ''"
        :alt="alt || 'Gallery image'"
        class="portfolio-gallery-img"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  timing: {
    type: Number,
    default: 1000,
  },
  alt: {
    type: String,
    default: '',
  },
})

const currentIndex = ref(0)
let intervalId = null

const startGallery = () => {
  if (props.images.length <= 1) {
    currentIndex.value = 0
    return
  }

  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % props.images.length
  }, props.timing)
}

const stopGallery = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

onMounted(() => {
  if (process.client) {
    startGallery()
  }
})

onUnmounted(() => {
  stopGallery()
})

watch(() => props.images, () => {
  stopGallery()
  currentIndex.value = 0
  if (process.client) {
    startGallery()
  }
}, { deep: true })

watch(() => props.timing, () => {
  stopGallery()
  if (process.client) {
    startGallery()
  }
})
</script>

<style scoped>
.portfolio-gallery {
  position: relative;
  width: 100%;
  overflow: hidden;
  opacity: 0;
  animation: fadeIn 0.6s ease-in forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.portfolio-gallery-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0s;
  pointer-events: none;
}

.portfolio-gallery-image-active {
  position: relative;
  opacity: 1;
  pointer-events: auto;
}

.portfolio-gallery-img {
  width: 100%;
  height: auto;
  display: block;
}
</style>
