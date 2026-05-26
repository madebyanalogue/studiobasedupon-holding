<template>
  <ClientOnly>
    <Preloader 
      v-if="!isHoldingPage"
      @preloader-complete="onPreloaderComplete" 
      @preloader-ready="onPreloaderReady" 
    />
  </ClientOnly>
  
  <div v-if="preloaderReady || disablePreloader || isHoldingPage" id="app" :style="appStyles">
    <Header v-if="!isHoldingPage" />
    <main class="page-wrapper">
      <NuxtPage />
    </main>
    <Footer v-if="!isHoldingPage" :class="{ 'footer-fade-out': isNavigating }" />
  </div>
  <!-- Body teleport: avoids transformed/layout ancestors breaking fixed centering + GSAP FLIP -->
  <Teleport to="body">
    <div
      data-click-zoom-lightbox
      class="click-zoom__lightbox"
      aria-hidden="true"
    />
  </Teleport>
</template>

<script setup>
import Preloader from '~/components/Preloader.vue'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { providePageLoading } from '~/composables/usePageLoading'

const { 
  maxWidth, 
  seoTitle, 
  seoDescription, 
  facebookShareImage,
  mobileBreakpoint,
  headerType,
  disablePreloader,
} = useSiteSettings()

// Preloader state - hide content until preloader is ready
const preloaderReady = ref(false)

// Page loading state - track when pages are loading
const { isLoading: isPageLoading } = providePageLoading()

// Preloader handlers
const onPreloaderReady = () => {
  // Preloader is ready to start, show content
  preloaderReady.value = true
  if (process.client) {
    document.body.classList.add('preloader-ready')
  }
}

const onPreloaderComplete = () => {
  // Preloader animation finished, site is ready
  if (process.client) {
    document.body.classList.add('preloader-complete')
  }
}

// If preloader is disabled, show content immediately
watch(disablePreloader, (disabled) => {
  if (disabled) {
    preloaderReady.value = true
    if (process.client) {
      document.body.classList.add('preloader-ready')
      document.body.classList.add('preloader-complete')
    }
  }
}, { immediate: true })

// Inject layout variables (breakpoint, header height). Gutters: see main.css :root.
useHead(() => ({
  htmlAttrs: {
    lang: 'en',
    class: headerType.value === 'static' ? 'header-static' : '',
    style: `
      --mobile-breakpoint: ${mobileBreakpoint.value};
    `,
  },
}))

const appStyles = computed(() => {
  return {
    '--max-width': maxWidth.value || '1800px',
    '--mobile-breakpoint': `${mobileBreakpoint.value}`,
  }
})

const route = useRoute()
const isHoldingPage = computed(() => route.path === '/')

watch(isHoldingPage, (holding) => {
  if (holding && process.client) {
    preloaderReady.value = true
    document.body.classList.add('preloader-ready')
    document.body.classList.add('preloader-complete')
  }
}, { immediate: true })

// Track if this is the initial page load
const isInitialLoad = ref(true)
// Footer / shell coordination during page transition
const isNavigating = ref(false)
let previousPath = route.path

const updateLayoutCssVars = () => {
  if (process.client) {
    document.documentElement.style.setProperty('--mobile-breakpoint', `${mobileBreakpoint.value}`)
  }
}

onMounted(async () => {
  updateLayoutCssVars()
  
  // Update header type class on html element
  const updateHeaderTypeClass = () => {
    if (process.client) {
      const html = document.documentElement
      if (headerType.value === 'static') {
        html.classList.add('header-static')
      } else {
        html.classList.remove('header-static')
      }
    }
  }
  updateHeaderTypeClass()
  
  isInitialLoad.value = false
  previousPath = route.path
})

// Watch for route changes to detect navigation (not initial load)
watch(() => route.path, (newPath) => {
  if (!isInitialLoad.value && newPath !== previousPath) {
    isNavigating.value = true
    // Match page transition duration, then scroll and clear navigating state
    setTimeout(() => {
      if (process.client) {
        window.scrollTo(0, 0)
      }
      setTimeout(() => {
        isNavigating.value = false
      }, 50)
    }, 600)
  }
  previousPath = newPath
})

watch(mobileBreakpoint, () => {
  if (process.client) {
    updateLayoutCssVars()
  }
}, { immediate: false })

// Watch header type and update class
watch(headerType, () => {
  if (process.client) {
    const html = document.documentElement
    if (headerType.value === 'static') {
      html.classList.add('header-static')
    } else {
      html.classList.remove('header-static')
    }
  }
}, { immediate: false })

useHead(() => {
  const meta = []
  const siteTitle = seoTitle.value || 'Based Upon'
  const siteUrl = process.client ? window.location.origin : 'https://basedupon.example.com'
  const currentUrl = process.client ? window.location.href : siteUrl
  
  // Meta description
  if (seoDescription.value) {
    meta.push({
      name: 'description',
      content: seoDescription.value,
    })
  }
  
  // Open Graph / Facebook
  meta.push(
    {
      property: 'og:title',
      content: siteTitle,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:site_name',
      content: siteTitle,
    },
    {
      property: 'og:url',
      content: currentUrl,
    }
  )
  
  if (seoDescription.value) {
    meta.push({
      property: 'og:description',
      content: seoDescription.value,
    })
  }
  
  // OG Image with dimensions
  if (facebookShareImage.value) {
    meta.push(
      {
        property: 'og:image',
        content: facebookShareImage.value,
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '630',
      }
    )
  }
  
  // Twitter Card
  meta.push(
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: siteTitle,
    }
  )
  
  if (seoDescription.value) {
    meta.push({
      name: 'twitter:description',
      content: seoDescription.value,
    })
  }
  
  if (facebookShareImage.value) {
    meta.push({
      name: 'twitter:image',
      content: facebookShareImage.value,
    })
  }
  
  return {
    title: siteTitle,
    meta,
  }
})
</script>

<style>
/* Hide content until preloader is ready */
body:not(.preloader-ready) #app {
  visibility: hidden;
  opacity: 0;
}

body.preloader-ready #app {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.2s ease-in;
}

/* Page wrapper to ensure stable DOM structure during transitions */

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.6s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Footer fades with page transition */
.footer-fade-out {
  opacity: 0;
  transition: opacity 0.6s ease;
}

/* Footer fade-in transition */
.fade-enter-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from {
  opacity: 0;
}

/* Footer hidden state - use opacity to prevent layout shifts */
.footer-hidden {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
</style>

