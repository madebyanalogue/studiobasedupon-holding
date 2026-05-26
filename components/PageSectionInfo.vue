<template>
  <div class="info-section">
    <div v-if="section.infoImage?.asset" class="info-section-image">
      <div 
        class="info-image-container"
        :style="getImageAspectRatio(section.infoImage.asset)"
      >
        <NuxtImg
          :src="section.infoImage.asset.url || ''"
          :width="section.infoImage.asset.metadata?.dimensions?.width"
          :height="section.infoImage.asset.metadata?.dimensions?.height"
          alt=""
          class="info-image"
          @load="onImageLoad"
        />
      </div>
    </div>
    
    <div class="info-section-content">
      <div
        v-for="(block, index) in section.infoContent"
        :key="block._key || index"
        class="info-block"
        :class="[
          block._type === 'infoImageBlock' && block.showOnDesktop === false ? 'info-block-hide-desktop' : '',
          block._type === 'infoImageBlock' && block.showOnMobile === false ? 'info-block-hide-mobile' : '',
        ]"
      >
        <!-- Image Block -->
        <div
          v-if="block._type === 'infoImageBlock' && block.image?.asset"
          class="info-image-block"
          :class="[
           block._type === 'infoImageBlock' && block.spanTwoColumns ? 'info-image-block-span-2' : '',
          ]"
        >
          <NuxtImg
            :src="block.image.asset.url || ''"
            alt=""
            class="info-image-inline"
          />
        </div>
        
        <!-- Text Block -->
        <div
          v-else-if="block._type === 'infoTextBlock'"
          class="info-text-block"
          :class="{ 'info-text-block-large': block.largeText }"
        >
          <h2 v-if="block.title" class="info-block-title">{{ block.title }}</h2>
          <SanityBlocks v-if="block.text" :blocks="block.text" />
        </div>
        
        <!-- Links Block -->
        <div
          v-else-if="block._type === 'infoLinksBlock'"
          class="info-links-block"
          :class="{ 'info-links-block-large': block.largeText }"
        >
          <h2 v-if="block.title" class="info-block-title">{{ block.title }}</h2>
          <SanityBlocks v-if="block.text" :blocks="block.text" />
          <div v-if="block.links && block.links.length > 0" class="info-links-list">
            <div
              v-for="(linkItem, linkIndex) in block.links"
              :key="linkIndex"
              class="info-link-item"
            >
              <span v-if="linkItem.subtitle" class="info-link-subtitle">{{ linkItem.subtitle }}</span>
              <a
                :href="linkItem.link"
                :target="shouldOpenInNewTab(linkItem.link, linkItem.openInNewTab) ? '_blank' : undefined"
                :rel="shouldOpenInNewTab(linkItem.link, linkItem.openInNewTab) ? 'noopener' : undefined"
                class="info-link"
              >
                <span class="info-link-title">{{ linkItem.linkTitle || linkItem.link }}&nbsp;<span class="info-link-arrow">&nbsp;&nbsp;&nbsp;<svg id="a" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><polygon points="16.5 0 7 0 7 1.5 15.44 1.5 .05 16.89 1.11 17.95 16.5 2.56 16.5 11 18 11 18 1.5 18 0 16.5 0"/></svg></span></span>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Services Block -->
        <div v-else-if="block._type === 'infoServicesBlock'" class="info-services-block">
          <h2 v-if="block.title" class="info-block-title">{{ block.title }}</h2>
          <div class="info-services-content">
            <SanityBlocks :blocks="block.content" />
          </div>
        </div>
        
        <!-- News block (legacy type infoPressAwardsBlock until dataset migrated) -->
        <div
          v-else-if="block._type === 'infoNewsBlock' || block._type === 'infoPressAwardsBlock'"
          class="info-news-block"
        >
          <h2 v-if="block.title" class="info-block-title">{{ block.title }}</h2>
          <div v-if="newsItems && newsItems.length > 0" class="info-news-list">
            <div
              v-for="(item, index) in newsItems"
              :key="item._id || index"
              class="info-news-item"
            >
              <NuxtImg
                v-if="item.featuredImage?.asset?.url"
                :src="item.featuredImage.asset.url"
                :width="item.featuredImage.asset.metadata?.dimensions?.width"
                :height="item.featuredImage.asset.metadata?.dimensions?.height"
                alt=""
                class="info-news-image"
              />
              <SanityBlocks v-if="item.content" :blocks="item.content" class="info-news-content" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick, ref } from 'vue'

defineProps({
  section: {
    type: Object,
    required: true,
  },
})

// Calculate aspect ratio for image asset
const getImageAspectRatio = (asset) => {
  if (asset?.metadata?.dimensions) {
    const { width, height, aspectRatio } = asset.metadata.dimensions
    if (aspectRatio) {
      return { aspectRatio: `${aspectRatio}` }
    } else if (width && height) {
      return { aspectRatio: `${width / height}` }
    }
  }
  // Fallback to a reasonable aspect ratio (4:3)
  return { aspectRatio: '4 / 3' }
}

// Handle image load to fade in
const infoImageRef = ref(null)
const onImageLoad = (event) => {
  if (process.client && event?.target) {
    event.target.classList.add('loaded')
  }
}

// Check if image is already loaded (cached)
onMounted(() => {
  if (process.client) {
    nextTick(() => {
      const img = document.querySelector('.info-image')
      if (img && img.complete && img.naturalHeight > 0) {
        img.classList.add('loaded')
      }
    })
  }
})

// Header height is now managed centrally in app.vue and only updates on window resize
// No need to update it here - it's stored in sessionStorage and persists across navigations

const { data: newsItems } = useAsyncData('news-items', async () => {
  const query = `*[_type in ["news", "pressAward"]] | order(orderRank) {
    _id,
    content,
    featuredImage{
      asset->{
        url,
        metadata{
          dimensions{
            width,
            height
          }
        }
      }
    }
  }`

  if (process.server) {
    const config = useRuntimeConfig()
    const projectId = config.public.sanity?.projectId || 'b6xol4su'
    const dataset = config.public.sanity?.dataset || 'production'

    try {
      const result = await $fetch(`https://${projectId}.apicdn.sanity.io/v2021-10-21/data/query/${dataset}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      return result?.result || []
    } catch (err) {
      console.error('[News] Error fetching:', err)
      return []
    }
  }

  try {
    const result = await $fetch('/api/sanity/query', {
      method: 'POST',
      body: { query },
    })
    return result?.result || []
  } catch (err) {
    console.error('[News] Error fetching:', err)
    return []
  }
}, { server: true })

const shouldOpenInNewTab = (link, openInNewTab) => {
  if (!link) return false
  // Don't open mailto: or tel: in new tab
  if (link.startsWith('mailto:') || link.startsWith('tel:')) return false
  // If explicitly set to open in new tab, do it
  if (openInNewTab) return true
  // For external URLs (http/https), open in new tab
  if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('//')) return true
  return false
}
</script>

<style scoped>
.info-section {
  margin: 0 auto;
  display: grid;
  padding: 0px var(--gutter);
  gap: var(--gutter);
  grid-template-columns: 1fr;
}

@media all and (min-width:1000px) {
  .info-section {
    grid-template-columns: 2fr 1fr;
    grid-template-areas: "content image";
  }
}
.info-section-image {
  position: relative;
}

.info-image-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--background-color, #ffffff);
  position: sticky;
  /* Default: account for header height */
  top: calc(var(--header-height) + var(--gutter));
}

/* When header is static, don't account for header height */
:global(.header-static) .info-image-container {
  top: var(--gutter);
}

.info-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.4s ease-in;
  position: absolute;
  top: 0;
  left: 0;
}

.info-image.loaded {
  opacity: 1;
}

.info-section-content {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) * 3);
}

@media (max-width:999px) {
  .info-section-image {
    display: none;
  }
}

.info-block, .info-text-block {
  display: flex;
  flex-direction: column;
  gap: var(--gutter);
}
.info-block {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gutter);
}

@media all and (min-width:1000px) {
  .info-block {
    grid-template-columns: 1fr 1fr;
  } 
  .info-section-image {
    grid-area: image;
  }
}

.info-block-title {
  font-weight: normal;
}

.info-text-block-large :deep(p) {
  font-size: var(--font-size-large);
}

.info-links-block-large :deep(p) {
  font-size: var(--font-size-large);
}

.info-image-inline {
  width: 100%;
  height: auto;
  display: block;
}

@media all and (min-width:1000px) {
  .info-image-block-span-2 {
    grid-column: span 2;
  }
}

@media (min-width:1000px) {
  .info-block-hide-desktop {
    display: none;
  }
}

@media (max-width:999px) {
  .info-block-hide-mobile {
    display: none;
  }
}

.info-link-item {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) / 4);
}

.info-link {
  color: inherit;
}

.info-link-title {
  font-size: var(--font-size-large);
  position: relative;
  display: inline-block;
}

.info-link-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  transform-origin: left;
  transform: scaleX(0);
  transition: transform 0.3s ease;
  background: currentColor;
}

.info-link:hover .info-link-title:after {
  transform: scaleX(1);
}

.info-link-subtitle {
  font-size: var(--font-size-body);
}

.info-links-block {
  display: flex;
  flex-direction: column;
  gap: var(--gutter);
}

@media all and (min-width:1000px) {
  .info-links-block,
  .info-text-block {
    grid-column: span 2;
    max-width: 560px;
  }
}

.info-links-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) * 1);
}

.info-link-arrow svg {
 fill: currentColor;
 position: absolute;
 bottom: 0;
 left: 0;
 width: 100%;
 height: 100%;
 object-fit: contain;
}
.info-link-arrow > span {
  position: relative;
}

.info-link-arrow:before {
  content: ' ';
}
.info-link-arrow {
  transform-origin: bottom left;
  transition: transform 0.3s ease;
  display: inline-block;
  transform: scale(1);
}
.info-link:hover .info-link-arrow {
  transform: scale(1);
}

@media all and (min-width:1000px) {
  .info-link-arrow {
    transform: scale(0);
}
}

.info-services-block {
  display: flex;
  flex-direction: column;
  gap: var(--gutter);
}

.info-services-content {
  font-size: var(--font-size-large);
}

.info-services-content :deep(.sanity-block) {
  white-space: pre-line;
}

.info-services-content :deep(p) {
  margin-bottom: 0;
}

.info-news-block {
  display: flex;
  flex-direction: column;
  gap: var(--gutter);
}

.info-news-list {
  display: grid;
  gap: var(--gutter);
}
@media (min-width:800px) {
  .info-news-block {
    grid-column: span 2;
  }
  .info-news-list {
    grid-template-columns: 1fr 1fr;
  }
}

.info-news-item {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) / 2);
}

.info-news-image {
  width: 100%;
  height: auto;
  display: block;
}

.info-news-content {
  font-size: var(--font-size-body);
}
</style>

