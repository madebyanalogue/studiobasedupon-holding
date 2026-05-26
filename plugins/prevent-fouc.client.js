export default defineNuxtPlugin(() => {
  let isReady = false

  // Check if specific fonts are loaded
  function areFontsLoaded() {
    if (!document.fonts) return true // No Font Loading API, assume loaded
    
    // Check for the specific fonts we're using (see assets/styles/typography.css)
    const fontsToCheck = [
      '12px "Season Sans"',
      '12px "DM Mono"',
    ]
    
    return fontsToCheck.every(font => document.fonts.check(font))
  }

  function showContent() {
    if (isReady) return
    isReady = true
    
    // Wait for fonts to load if Font Loading API is available
    if (document.fonts && document.fonts.ready) {
      // Set a maximum timeout to prevent content staying hidden forever
      const maxTimeout = setTimeout(() => {
        if (!document.documentElement.classList.contains('css-loaded')) {
          console.warn('[FOUC] Font loading timeout, showing content anyway')
          document.documentElement.classList.add('css-loaded')
        }
      }, 3000) // 3 second max wait
      
      // First wait for fonts.ready, then verify specific fonts are loaded
      document.fonts.ready.then(() => {
        // Check if our specific fonts are loaded
        let attempts = 0
        const maxAttempts = 20 // 20 * 50ms = 1 second max
        
        const checkFonts = () => {
          attempts++
          if (areFontsLoaded() || attempts >= maxAttempts) {
            clearTimeout(maxTimeout)
            // Double RAF to ensure everything is painted
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                document.documentElement.classList.add('css-loaded')
              })
            })
          } else {
            // Fonts not ready yet, check again
            setTimeout(checkFonts, 50)
          }
        }
        checkFonts()
      }).catch(() => {
        clearTimeout(maxTimeout)
        // Font loading failed, show anyway after delay
        setTimeout(() => {
          document.documentElement.classList.add('css-loaded')
        }, 200)
      })
    } else {
      // No Font Loading API, wait a bit for fonts then show
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.documentElement.classList.add('css-loaded')
          })
        })
      }, 300)
    }
  }

  // Check if CSS is loaded
  function checkCSS() {
    const stylesheets = document.styleSheets
    let hasStyles = false

    for (let i = 0; i < stylesheets.length; i++) {
      try {
        const rules = stylesheets[i].cssRules || stylesheets[i].rules
        if (rules && rules.length > 0) {
          hasStyles = true
          break
        }
      } catch (e) {
        // Cross-origin stylesheet, assume loaded
        hasStyles = true
        break
      }
    }
    return hasStyles
  }

  // Wait for everything to load
  function waitForLoad() {
    // Check if CSS is loaded
    if (!checkCSS()) {
      // CSS not loaded yet, check again soon
      setTimeout(waitForLoad, 10)
      return
    }

    // CSS is loaded, now wait for window load (all resources)
    if (document.readyState === 'complete') {
      showContent()
    } else {
      window.addEventListener('load', showContent, { once: true })
      
      // Fallback timeout to prevent content staying hidden forever
      setTimeout(() => {
        if (!isReady) {
          showContent()
        }
      }, 500)
    }
  }

  // Start checking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForLoad)
  } else {
    waitForLoad()
  }
})

