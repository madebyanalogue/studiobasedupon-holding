<template>
  <div class="portfolio-archive">
    <div
      v-for="project in projects"
      :key="project._id"
      class="portfolio-item"
    >
      <NuxtLink
        :to="`/portfolio/${project.slug.current}`"
        class="portfolio-item-link"
      >
        <div class="portfolio-item-image-container">
          <div class="portfolio-item-image-wrapper">
            <NuxtImg
              v-if="project.featuredImage?.asset"
              :src="project.featuredImage.asset.url || ''"
              :width="Math.min(project.featuredImage.asset.metadata?.dimensions?.width || 1800, 1800)"
              :height="project.featuredImage.asset.metadata?.dimensions?.height"
              :sizes="
                project.featuredImageMobile?.asset
                  ? '(min-width: 1000px) 33vw, 50vw'
                  : '(max-width: 799px) 100vw, (max-width: 999px) 50vw, 33vw'
              "
              alt=""
              :class="[
                'portfolio-item-image',
                project.featuredImageMobile?.asset ? 'is-desktop-archive-img' : '',
              ]"
            />
            <NuxtImg
              v-if="project.featuredImageMobile?.asset"
              :src="project.featuredImageMobile.asset.url || ''"
              :width="Math.min(project.featuredImageMobile.asset.metadata?.dimensions?.width || 1800, 1800)"
              :height="project.featuredImageMobile.asset.metadata?.dimensions?.height"
              :sizes="'(max-width: 999px) 100vw, (min-width: 1000px) 33vw'"
              alt=""
              class="portfolio-item-image is-mobile-archive-img"
            />
          </div>
          <h3 class="portfolio-item-title">{{ project.title }}</h3>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { injectPageLoading } from '~/composables/usePageLoading'

const { setLoading } = injectPageLoading()

const { data: projects, pending } = useAsyncData('portfolio', async () => {
  const query = `*[_type == "portfolio"] | order(orderRank) {
    _id,
    title,
    slug,
    featuredImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      }
    },
    featuredImageMobile {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      }
    }
  }`
  
  if (process.server) {
    const config = useRuntimeConfig()
    const projectId = config.public.sanity?.projectId || 'b6xol4su'
    const dataset = config.public.sanity?.dataset || 'production'
    
    return await $fetch(`https://${projectId}.apicdn.sanity.io/v2021-10-21/data/query/${dataset}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).then(result => result?.result || []).catch(() => [])
  }
  return await $fetch('/api/sanity/query', {
    method: 'POST',
    body: { query },
  }).then(result => result?.result || []).catch(() => [])
}, { watch: [] })

// Update global loading state
watch(pending, (isPending) => {
  setLoading(isPending)
}, { immediate: true })
</script>

<style scoped>
.portfolio-archive {
  display: grid;
  gap: var(--gutter);
  padding: var(--gutter);
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 800px) {
  .portfolio-archive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1000px) {
  .portfolio-archive {
    grid-template-columns: repeat(3, 1fr);
  }
  .portfolio-item-title {
    opacity:0;
  }
  .portfolio-item-link:hover .portfolio-item-title {
    opacity:1;
  }
}

.portfolio-item-image-container {
  aspect-ratio: var(--aspect-ratio-landscape);
  position: relative;
}

.portfolio-item-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.portfolio-item-image-wrapper {
  top: 0;
  left: 0;
  display: block;
  position: relative;
}

.portfolio-item-image-wrapper img {
  width: 100%;
  position: absolute;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

@media (max-width: 999px) {
  .portfolio-item-image.is-desktop-archive-img {
    display: none;
  }
}

@media (min-width: 1000px) {
  .portfolio-item-image.is-mobile-archive-img {
    display: none;
  }
}

.portfolio-item-title {
  margin-top: calc(var(--gutter) / 1.5);
  font-size: var(--font-size-body);
  font-weight: normal;
  transition:opacity 0.3s ease;
}


@media (min-width: 800px) {
  .portfolio-item-image-container {
    aspect-ratio: var(--aspect-ratio-square);
  }
}
</style>
