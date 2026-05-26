<template>
  <ul data-holding-social-links>
    <li v-for="link in socialLinks" :key="link._key || link.url">
      <a
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        data-holding-social-link
      >
        <NuxtImg
          v-if="getImageUrl(link.image)"
          :src="getImageUrl(link.image)"
          :alt="getImageAlt(link)"
          data-holding-social-icon
        />
        <span v-else>{{ link.title }}</span>
      </a>
    </li>
  </ul>
</template>

<script setup>
import { useSanityImage } from '~/composables/useSanityImage'

defineProps({
  socialLinks: {
    type: Array,
    default: () => [],
  },
})

const { getImageSrc } = useSanityImage()

function getImageUrl(image) {
  if (!image?.asset) return ''
  return getImageSrc(image.asset) || ''
}

function getImageAlt(link) {
  return link.image?.alt || link.title || ''
}
</script>
