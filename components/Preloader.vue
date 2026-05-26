<template>
  <!-- Colored background layers - siblings to preloader -->
  <div v-if="!disablePreloader" class="preloader-bg">
    <div ref="bgPanel1" class="bg-panel first"></div>
    <div ref="bgPanel2" class="bg-panel second"></div>
    <div ref="bgPanel3" class="bg-panel third"></div>
  </div>
  
  <div 
    v-show="showPreloader" 
    class="preloader-container"
    data-loading-container
  >
    <div class="preloader-content" :class="{ 'has-images': preloaderImages.length > 0 }">
      <!-- Image sequence container -->
      <div 
        class="image-sequence"
        data-loading-words
      >
        <div class="image-container">
          <img 
            v-if="currentImageSource && currentImageIndex < preloaderImages.length"
            :src="getImageUrl(currentImageSource)"
            :alt="(preloaderImages[currentImageIndex]?.alt) || 'Preloader image'"
            class="preloader-image"
          />
          <img 
            v-if="currentImageSource && currentImageIndex < preloaderImages.length && preloaderImages[currentImageIndex]?.repeatLeftRight"
            :src="getImageUrl(currentImageSource)"
            :alt="(preloaderImages[currentImageIndex]?.alt) || 'Preloader image'"
            class="preloader-image"
          />
          <img 
            v-if="currentImageSource && currentImageIndex < preloaderImages.length && preloaderImages[currentImageIndex]?.repeatLeftRight"
            :src="getImageUrl(currentImageSource)"
            :alt="(preloaderImages[currentImageIndex]?.alt) || 'Preloader image'"
            class="preloader-image"
          />
        </div>
      </div>

      <div 
        class="preloader-text-container"
        :style="preloaderFontSizeStyle"
      >
        <!-- SVG code if provided -->
        <div 
          v-if="preloaderSvgCode"
          v-html="preloaderSvgCode"
          class="preloader-svg-code"
        />
        <!-- Rich text content -->
        <SanityBlocks 
          v-if="preloaderText && preloaderText.length > 0"
          :blocks="preloaderText"
          class="preloader-text"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useSanityImage } from '~/composables/useSanityImage'
import SanityBlocks from '~/components/SanityBlocks.vue'

const props = defineProps({
  autoHide: {
    type: Boolean,
    default: true
  },
  imageDuration: {
    type: Number,
    default: 0 // milliseconds per image (instant transitions)
  },
  titleDuration: {
    type: Number,
    default: 0 // milliseconds for title display (instant)
  }
})

const emit = defineEmits(['preloader-complete', 'preloader-ready'])

const { getImageSrc } = useSanityImage()
const { settings: siteSettings, disablePreloader, preloaderImages, preloaderText, preloaderSvgCode, mobileBreakpoint, title: websiteTitle } = useSiteSettings()

// Helper to get image URL from Sanity image object
const getImageUrl = (imageSource) => {
  if (!imageSource) return ''
  // If it's an asset object directly
  if (imageSource.asset) {
    return getImageSrc(imageSource.asset) || ''
  }
  // If it's already a URL string
  if (typeof imageSource === 'string') {
    return imageSource
  }
  // Try to get URL from asset property
  if (imageSource.url) {
    return imageSource.url
  }
  return ''
}

// Preloader state - respect disablePreloader flag
const showPreloader = ref(true)
const currentImageIndex = ref(0)
const animationInitialized = ref(false)

// Refs for background panels
const bgPanel1 = ref(null)
const bgPanel2 = ref(null)
const bgPanel3 = ref(null)

// Preloader headline scale (fixed; was Sanity — matches former defaults 20px / 40px)
const preloaderFontSizeStyle = computed(() => {
  const bp = mobileBreakpoint.value
  return {
    fontSize: `clamp(20px, calc(100vw / ${bp} * 40), 40px)`,
  }
})

// Support two data shapes: [{ image, alt }] or directly [image]
const currentImageSource = computed(() => {
  const item = preloaderImages.value?.[currentImageIndex.value]
  if (!item) return null
  // API returns objects with normalized image field
  if (item?.image) return item.image
  // If array of images was returned
  return item
})

// Animation timeline
let animationTimeline = null

// Initialize preloader animation
const initPreloaderAnimation = () => {
  if (typeof window === 'undefined' || animationInitialized.value) return
  // gsap is provided by plugin
  // @ts-ignore
  const gsap = window.gsap

  // Prevent page scrolling during intro
  const htmlEl = document.documentElement
  const bodyEl = document.body
  if (htmlEl && bodyEl) {
    htmlEl.style.overflow = 'hidden'
    bodyEl.style.overflow = 'hidden'
  }
  
  // Create timeline
  animationTimeline = gsap.timeline({
    onComplete: () => {
      if (props.autoHide) {
        hidePreloader()
      }
      emit('preloader-complete')
    }
  })
  
  if (preloaderImages.value.length > 0) {
    // New logic: Single randomized preloader image + logotype overlay
    // Select random image
    const randomIndex = Math.floor(Math.random() * preloaderImages.value.length)
    currentImageIndex.value = randomIndex
    
    // Stage 1: Random preloader image fades in
    animationTimeline.set('.image-sequence', { opacity: 0 })
    animationTimeline.to('.image-sequence', { 
      opacity: 1, 
      duration: 0.8, 
      ease: "power2.in" 
    })
    
    // Stage 2: Preloader text fades in overlaid (after image)
    const textStart = 0.5 // Start after image fade in
    animationTimeline.set('.preloader-text-container', { opacity: 0, visibility: 'visible' }, textStart)
    animationTimeline.to('.preloader-text-container', { 
      opacity: 1, 
      duration: 0.8, 
      ease: "power2.in" 
    }, textStart)
    
    // Stage 3: Transform up and out (after text)
    const holdTime = textStart + 0.8 // Hold for 0.8 seconds after text appears
    const exitTime = 0.9 // Exit animation duration
    
    // Animate preloader container and background panels together at the same time
    animationTimeline.to('.preloader-container', {
      y: '-100%',
      duration: exitTime,
      ease: "power2.inOut",
      onComplete: () => {
        // Hide preloader but keep in DOM
        showPreloader.value = false
        // Emit preloader complete event for section triggers
        document.dispatchEvent(new CustomEvent('preloader-complete'))
        // Add class to body so plugins can detect completion
        document.body.classList.add('preloader-complete')
      }
    }, holdTime)
    
    // Animate background panels at the same time as preloader container
    animationTimeline.to([bgPanel1.value, bgPanel2.value, bgPanel3.value], {
      y: '-100%',
      duration: exitTime,
      ease: "power2.inOut",
      stagger: 0.05 // Very slight stagger between panels
    }, holdTime) // Start at the same time as preloader container
  } else {
    // No preloader images - just show text
    // Hide image sequence immediately
    animationTimeline.set('.image-sequence', { opacity: 0 })
    
    // Show preloader text with fade in
    animationTimeline.set('.preloader-text-container', { opacity: 0, visibility: 'visible' })
    animationTimeline.to('.preloader-text-container', { 
      opacity: 1, 
      duration: 0.8, 
      ease: "power2.out" 
    })
    
    // Hold for a moment then translate up and out
    const holdTime = 0.8 // Hold for 0.8 seconds after fade in
    const exitTime = 0.9 // Exit animation duration
    
     // Animate preloader container up and out
     animationTimeline.to('.preloader-container', {
      y: '-100%',
      duration: exitTime,
      ease: "power2.inOut",
      onComplete: () => {
        // Hide preloader but keep in DOM
        showPreloader.value = false
        // Emit preloader complete event for section triggers
        document.dispatchEvent(new CustomEvent('preloader-complete'))
        // Add class to body so plugins can detect completion
        document.body.classList.add('preloader-complete')
      }
     }, holdTime)
    
    // Animate background panels at the same time as preloader container
    animationTimeline.to([bgPanel1.value, bgPanel2.value, bgPanel3.value], {
      y: '-100%',
      duration: exitTime,
      ease: "power2.inOut",
      stagger: 0.05 // Very slight stagger between panels
    }, holdTime) // Start at the same time as preloader container
  }
}

// Hide preloader manually
const hidePreloader = () => {
  showPreloader.value = false
  // Re-enable scrolling
  const htmlEl = document.documentElement
  const bodyEl = document.body
  if (htmlEl && bodyEl) {
    htmlEl.style.overflow = ''
    bodyEl.style.overflow = ''
  }
}

// Watch for site settings to be loaded
watch(siteSettings, async (newSettings) => {
  if (disablePreloader.value) {
    // Immediately hide and mark complete, skip animations
    showPreloader.value = false
    document.body.classList.add('preloader-complete')
    emit('preloader-ready')
    emit('preloader-complete')
    return
  }
  if (newSettings && !animationInitialized.value) {
    // Preloader is ready
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      // Emit ready event before starting animation
      emit('preloader-ready')
      initPreloaderAnimation()
      animationInitialized.value = true
    }, 100)
  }
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  if (animationTimeline) {
    animationTimeline.kill()
    animationTimeline = null
  }
  animationInitialized.value = false
})
</script>

<style scoped>
.preloader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  background: var(--background-color, #ffffff); /* Use body background color */
  color: var(--text-color, #000000); /* Use body text color */
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preloader-bg {
  z-index: 99998; /* Just below preloader */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  pointer-events: none; /* Don't interfere with interactions */
}

.bg-panel {
  z-index: 1;
  background-color: var(--background-color, #ffffff); /* Use body background color */
  position: absolute;
  inset: 0%;
  height: 100%;
  width: 100%;
}

.bg-panel.first {
  background-color: var(--background-color, #ffffff);
  z-index: 3;
  opacity: 1;
}

.bg-panel.second {
  background-color: var(--background-color, #ffffff);
  z-index: 2;
  opacity: 0;
}

.bg-panel.third {
  background-color: var(--background-color, #ffffff);
  z-index: 1;
  opacity: 0;
}

.preloader-content {
  z-index: 10;
  text-align: center;
  position: relative;
  width:100%;
}
.has-images.preloader-content,
.has-images.preloader-content .image-sequence {
  height:100%;
  width:100%;
  position: absolute;
  top:0;
  left:0;
}

.image-sequence {
  display: flex;
  align-items: center;
  justify-content: center;
}

.has-images .image-sequence {
  opacity: 0; /* Start hidden when there are preloader images */
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  max-width: 133vh;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
}

.preloader-text-container {
  opacity: 0;
  visibility: hidden;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 90%;
  text-align: center;
  color: var(--text-color, #000000); /* Use body text color */
  font-family: var(--logo-font-family); /* Use logo font */
  line-height: 1;
  z-index: 10;
}

.has-images .preloader-text-container {
  top: 50%;
  transform: translate(-50%, -50%);
}

.preloader-svg-code {
  display: inline-block;
  margin-bottom: 1em;
  color: inherit;
}

.preloader-svg-code svg {
  display: block;
  margin: 0 auto;
  color: inherit;
  fill: currentColor;
  stroke: currentColor;
}

.preloader-svg-code svg * {
  fill: currentColor !important;
  stroke: currentColor !important;
}

.preloader-text {
  text-align: center;
  color: inherit;
  white-space: pre-line; /* Preserve line breaks */
}

.preloader-text :deep(p) {
  text-align: center;
  margin: 0;
  color: inherit;
  white-space: pre-line; /* Preserve line breaks */
  line-height: 1;
}

.preloader-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0px;
  max-width: unset;
}

.preloader-image.repeat-right {
  position: absolute;
  top: 0;
  left: 0;
  transform: scaleX(-1); /* Flip horizontally for left-right repeat */
}

/* Hide preloader in design mode */
:is(.wf-design-mode, .w-editor) .preloader-container {
  display: none;
}
</style>
