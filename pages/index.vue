<template>
  <div data-holding-page :data-holding-active-panel="activePanel">
    <HoldingHeader
      :site-title="siteTitle"
      :social-links="socialLinks"
    />

    <div data-holding-panels>


      <HoldingPanelTrigger
        :label="panelTriggerLabel"
        :is-open="activePanel === 'updates'"
        trigger="updates"
        @click="togglePanel"
      />
      
      <section
        ref="homePanelRef"
        data-holding-panel="home"
        class="home-scroll-section"
        :aria-hidden="activePanel !== 'home'"
      >
        <HoldingHomeScroll
          :items="homeScrollItems"
          :logo="holding?.homeScrollLogo"
          :logo-text="holding?.homeScrollLogoText"
        />
      </section>

      <section
        ref="updatesPanelRef"
        data-holding-panel="updates"
        class="home-updates-section off-white"
        :aria-hidden="activePanel !== 'updates'"
      >
        <HoldingUpdates
          :title="holding?.updatesTitle"
          :signup-text="holding?.signupText"
          :signup-title="holding?.signupTitle"
          :thank-you-message="holding?.newsletterThankYouMessage"
          :news-items="newsItems"
          :panel-active="activePanel === 'updates'"
          :panel-transition-duration="PANEL_TRANSITION.duration"
          @content-hidden="resetUpdatesPanelScroll"
        />

        <HoldingFooter
          :site-title="siteTitle"
          :description="holding?.footerDescription"
          :legal="holding?.footerLegal"
          :subfooter-content="holding?.subfooterContent"
          :contact-items="holding?.footerContact || []"
          :social-links="socialLinks"
        />

      </section>

    </div>
  </div>
</template>

<script setup>
import gsap from 'gsap'
import { injectPageLoading } from '~/composables/usePageLoading'

definePageMeta({
  pageTransition: false,
})

const { setLoading } = injectPageLoading()

const activePanel = ref('home')
const homePanelRef = ref(null)
const updatesPanelRef = ref(null)

const PANEL_TRANSITION = {
  duration: 0.6,
  ease: 'power2.inOut',
}

function animatePanels(y) {
  const panels = [homePanelRef.value, updatesPanelRef.value].filter(Boolean)
  if (!panels.length) return

  gsap.to(panels, {
    y,
    ...PANEL_TRANSITION,
  })
}

function openUpdates() {
  if (!process.client || activePanel.value === 'updates') return

  activePanel.value = 'updates'
  document.body.classList.add('holding-updates-open')
  animatePanels('-100%')
}

function resetUpdatesPanelScroll() {
  const panel = updatesPanelRef.value
  if (!panel) return

  panel.scrollTop = 0
  panel.scrollLeft = 0
}

function openHome() {
  if (!process.client || activePanel.value === 'home') return

  activePanel.value = 'home'
  document.body.classList.remove('holding-updates-open')
  animatePanels('0%')
}

const panelTriggerLabel = computed(() => {
  const updatesLabel = holding.value?.panelSwitchUpdatesLabel?.trim() || 'Updates'
  const homeLabel = holding.value?.panelSwitchHomeLabel?.trim() || 'Home'

  return activePanel.value === 'updates' ? homeLabel : updatesLabel
})

function togglePanel() {
  if (!process.client) return

  if (activePanel.value === 'updates') {
    openHome()
  } else {
    openUpdates()
  }
}


const HOLDING_QUERY = `{
  "holding": *[_type == "holdingPage"][0] {
    panelSwitchUpdatesLabel,
    panelSwitchHomeLabel,
    updatesTitle,
    signupText,
    signupTitle,
    newsletterThankYouMessage,
    footerDescription,
    footerLegal,
    subfooterContent,
    footerContact[] {
      _key,
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
      url,
      image {
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
      }
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
    homeScrollLogoText,
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
  "news": *[_type == "news"] | order(orderRank asc) {
    _id,
    title,
    content,
    orderRank,
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
    body: { query: HOLDING_QUERY, useCdn: false },
  })
  return result?.result || null
})

watch(pending, (isPending) => {
  setLoading(isPending)
}, { immediate: true })

const holding = computed(() => data.value?.holding || null)
const settings = computed(() => data.value?.settings || null)

const siteTitle = computed(() => settings.value?.title || settings.value?.seoTitle || 'Studio Based Upon')
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

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour12: false,
    }).formatToParts(date).map(({ type, value }) => [type, value]),
  )

  return `${parts.hour}:${parts.minute} - ${parts.day} / ${parts.month} / ${parts.year}`
}

function compareOrderRank(a, b) {
  const rankA = a?.orderRank || ''
  const rankB = b?.orderRank || ''
  if (!rankA && !rankB) return 0
  if (!rankA) return 1
  if (!rankB) return -1
  return rankA.localeCompare(rankB)
}

const newsItems = computed(() =>
  [...(data.value?.news || [])]
    .sort(compareOrderRank)
    .map((item) => {
      const excerpt = item.title || blocksToPlainText(item.content)
      return {
        ...item,
        excerpt,
        timestamp: item._createdAt || '',
        timestampLabel: formatTimestamp(item._createdAt),
      }
    }),
)

defineExpose({
  activePanel,
  homePanelRef,
  updatesPanelRef,
  openUpdates,
  openHome,
  togglePanel,
})
</script>
