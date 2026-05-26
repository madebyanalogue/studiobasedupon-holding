<template>
  <div data-holding-page :data-holding-active-panel="activePanel">
    <HoldingHeader
      :site-title="siteTitle"
      :year="year"
      :social-links="socialLinks"
    />

    <button
      type="button"
      data-holding-updates-trigger
      @click="openUpdates"
    >
      Updates
    </button>

    <div data-holding-panels>
      <section
        ref="homePanelRef"
        data-holding-panel="home"
        :aria-hidden="activePanel !== 'home'"
      >
        <HoldingHomeScroll
          :items="homeScrollItems"
          :logo="holding?.homeScrollLogo"
        />
      </section>

      <section
        ref="updatesPanelRef"
        data-holding-panel="updates"
        :aria-hidden="activePanel !== 'updates'"
      >
        <HoldingUpdates
          :title="holding?.updatesTitle"
          :thank-you-message="holding?.newsletterThankYouMessage"
          :news-items="newsItems"
        />

        <HoldingFooter
          :site-title="siteTitle"
          :description="holding?.footerDescription"
          :contact-items="holding?.footerContact || []"
          :social-links="socialLinks"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { injectPageLoading } from '~/composables/usePageLoading'

const { setLoading } = injectPageLoading()

const activePanel = ref('home')
const homePanelRef = ref(null)
const updatesPanelRef = ref(null)

const year = new Date().getFullYear()

const HOLDING_QUERY = `{
  "holding": *[_type == "holdingPage"][0] {
    updatesTitle,
    newsletterThankYouMessage,
    footerDescription,
    footerContact[] {
      _key,
      title,
      linkText,
      link {
        type,
        url,
        page-> {
          slug {
            current
          }
        }
      }
    },
    socialLinks[] {
      _key,
      title,
      url
    },
    homeScrollLogo {
      alt,
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
    homeScrollItems[] {
      _key,
      title,
      image {
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
    }
  },
  "settings": *[_type == "siteSettings"][0] {
    title,
    seoTitle
  },
  "news": *[_type == "news"] | order(orderRank) {
    _id,
    title,
    content,
    _createdAt,
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
    }
  }
}`

const { data, pending } = await useAsyncData('holding-page', async () => {
  const result = await $fetch('/api/sanity/query', {
    method: 'POST',
    body: { query: HOLDING_QUERY },
  })
  return result?.result || null
})

watch(pending, (isPending) => {
  setLoading(isPending)
}, { immediate: true })

const holding = computed(() => data.value?.holding || null)
const settings = computed(() => data.value?.settings || null)

const siteTitle = computed(() => settings.value?.title || settings.value?.seoTitle || 'Based Upon')
const socialLinks = computed(() => holding.value?.socialLinks || [])
const homeScrollItems = computed(() => holding.value?.homeScrollItems || [])

function blocksToPlainText(blocks) {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter((block) => block?._type === 'block')
    .map((block) =>
      (block.children || [])
        .filter((child) => child?._type === 'span' && child.text)
        .map((child) => child.text)
        .join(''),
    )
    .join('\n')
    .trim()
}

function formatTimestamp(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const newsItems = computed(() =>
  (data.value?.news || []).map((item) => {
    const excerpt = item.title || blocksToPlainText(item.content)
    return {
      ...item,
      excerpt,
      timestamp: item._createdAt || '',
      timestampLabel: formatTimestamp(item._createdAt),
    }
  }),
)

function openUpdates() {
  activePanel.value = 'updates'
}

defineExpose({
  activePanel,
  homePanelRef,
  updatesPanelRef,
  openUpdates,
})
</script>
