import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  if (process.server) return

  // Global utility function for preloader-gated animations
  window.handlePreloaderGatedAnimation = (animationFunction, options = {}) => {
    const {
      element = null,
      waitForScroll = true,
      immediateIfInView = false
    } = options

    // Function to check if element is in view
    const isElementInView = (el) => {
      if (!el) return false
      const rect = el.getBoundingClientRect()
      const windowHeight = window.innerHeight
      return rect.top < windowHeight * 0.8 && rect.bottom > 0
    }

    // Function to execute animation based on options
    const executeAnimation = () => {
      if (immediateIfInView && element && isElementInView(element)) {
        animationFunction()
      } else if (waitForScroll) {
        // Wait for scroll trigger using the section-triggers system
        if (window.gsap && window.gsap.ScrollTrigger) {
          // Check if element is already in view when page loads
          if (element && isElementInView(element)) {
            animationFunction()
          } else {
            // Create scroll trigger for when element comes into view
            const trigger = window.gsap.ScrollTrigger.create({
              trigger: element || document.body,
              start: 'top 80%',
              onEnter: () => {
                animationFunction()
                trigger.kill() // Remove trigger after use
              }
            })
          }
        } else {
          animationFunction()
        }
      } else {
        animationFunction()
      }
    }

    // Check if preloader is already complete
    if (!document.body.classList.contains('preloader-complete')) {
      document.addEventListener('preloader-complete', () => {
        executeAnimation()
      }, { once: true })
    } else {
      executeAnimation()
    }
  }
})
