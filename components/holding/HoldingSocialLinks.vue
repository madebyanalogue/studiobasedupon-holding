<template>
  <div class="holding-social-links mono" data-holding-social>
    <span data-holding-follow-label>Follow</span>
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
  </div>
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

<style scoped>
.holding-social-links {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
}
@media all and (min-width: 1000px) {
  .holding-social-links {
   justify-content: flex-end;
  }
}

.holding-social-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
}

.holding-social-links li {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}

.holding-social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  background: red;
  border-radius: 50%;
}

.holding-social-links img {
  display: block;
}
</style>
