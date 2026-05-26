import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { nextTick } from 'vue'

gsap.registerPlugin(ScrollTrigger)

const TRANSITION_DURATION_MS = 1100

function killFooterParallax() {
  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger?.closest?.('[data-footer-parallax]')) {
      st.kill()
    }
  })
}

function initFooterParallax() {
  killFooterParallax()
  document.querySelectorAll('[data-footer-parallax]').forEach((el) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top bottom)',
        end: 'clamp(top top)',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })

    const inner = el.querySelector('[data-footer-parallax-inner]')
    const dark = el.querySelector('[data-footer-parallax-dark]')

    if (inner) {
      tl.from(inner, {
        yPercent: -25,
        ease: 'linear',
      })
    }

    if (dark) {
      tl.fromTo(
        dark,
        { opacity: 1 },
        { opacity: 0, ease: 'linear' },
        '<'
      )
    }
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    function runInit() {
      initFooterParallax()
      nextTick(() => {
        ScrollTrigger.refresh()
        requestAnimationFrame(() => ScrollTrigger.refresh())
      })
    }

    nuxtApp.hook('app:mounted', () => {
      // Wait for preloader to complete before init - otherwise ScrollTrigger measures
      // layout while #app is hidden and gets wrong values (parallax breaks on direct load)
      function doInit() {
        nextTick(runInit)
      }
      if (document.body.classList.contains('preloader-complete')) {
        doInit()
      } else {
        document.addEventListener('preloader-complete', doInit, { once: true })
      }
    })

    nuxtApp.hook('page:finish', () => {
      nextTick(() => {
        setTimeout(() => {
          runInit()
          setTimeout(() => ScrollTrigger.refresh(), 150)
        }, TRANSITION_DURATION_MS)
      })
    })
  }
})
