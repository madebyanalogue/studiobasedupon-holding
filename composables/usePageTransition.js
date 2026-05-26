import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)
CustomEase.create('parallax', '0.7, 0.05, 0.13, 1')

const DURATION = 1
const Z_LEAVING = 1
const Z_OVERLAY = 2
const Z_ENTERING = 3

export function usePageTransition() {
  const route = useRoute()
  const isTransitioning = useState('pageTransitioning', () => false)

  function getReducedMotion() {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }


  function getOverlay(withinEl) {
    if (typeof document === 'undefined') return null
    const root = withinEl || document
    return root.querySelector?.('[data-transition-dark]') ?? null
  }

  function getOverlayWrap(withinEl) {
    if (typeof document === 'undefined') return null
    const root = withinEl || document
    return root.querySelector?.('[data-transition-wrap]') ?? null
  }

  function getPageEl(el) {
    const inner = el?.querySelector?.('.page-transition-inner')
    return inner || el
  }

  function resetPage(el) {
    if (typeof window === 'undefined') return
    window.scrollTo(0, 0)
    const pageEl = getPageEl(el)
    if (pageEl) gsap.set(pageEl, { clearProps: 'position,top,left,right,bottom,zIndex,overflowY,y' })
    if (el) gsap.set(el, { clearProps: 'all' })
    document.querySelectorAll('[data-transition-dark]').forEach((overlay) => {
      gsap.set(overlay, { autoAlpha: 0 })
    })
    document.querySelectorAll('[data-transition-wrap]').forEach((wrap) => {
      gsap.set(wrap, { clearProps: 'position,top,left,right,bottom,zIndex' })
    })
  }

  return {
    route,
    isTransitioning,
    transitionHandlers: {
      beforeEnter(el) {
        if (typeof window === 'undefined') return
        const pageEl = getPageEl(el)
        gsap.set(el, { position: 'relative' })
        gsap.set(pageEl, {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: Z_ENTERING,
          overflowY: 'auto',
          y: '100vh',
        })
        const oldEl = el.previousElementSibling
        if (!oldEl || getReducedMotion()) return
        const oldPageEl = getPageEl(oldEl)
        const oldWrap = getOverlayWrap(oldEl)
        const oldOverlay = getOverlay(oldEl)
        gsap.set(oldEl, { position: 'relative' })
        gsap.set(oldPageEl, {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: Z_LEAVING,
        })
        if (oldWrap) {
          gsap.set(oldWrap, {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: Z_OVERLAY,
            visibility: 'visible',
          })
        }
        if (oldOverlay) gsap.set(oldOverlay, { autoAlpha: 0 })
      },

      enter(el, done) {
        const finish = () => {
          isTransitioning.value = false
          done()
        }
        if (typeof window === 'undefined') {
          finish()
          return
        }
        if (getReducedMotion()) {
          gsap.set(getPageEl(el), { y: '0vh' })
          resetPage(el)
          finish()
          return
        }
        const oldEl = el.previousElementSibling
        const oldPageEl = oldEl ? getPageEl(oldEl) : null
        const oldWrap = oldEl ? getOverlayWrap(oldEl) : null
        const oldOverlay = oldEl ? getOverlay(oldEl) : null
        const newPageEl = getPageEl(el)

        const tl = gsap.timeline({
          onComplete: () => {
            if (oldOverlay) gsap.set(oldOverlay, { autoAlpha: 0 })
            resetPage(el)
            finish()
          },
          onInterrupt: finish,
        })

        tl.add('startEnter', 0)

        if (oldOverlay && oldWrap) {
          // Ensure wrapper is visible and positioned
          gsap.set(oldWrap, {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: Z_OVERLAY,
            visibility: 'visible',
          })
          // Ensure overlay starts at 0
          gsap.set(oldOverlay, { autoAlpha: 0 })
          // Animate to 0.8
          tl.to(
            oldOverlay,
            { autoAlpha: 0.8, duration: DURATION, ease: 'parallax' },
            'startEnter'
          )
        }
        if (oldPageEl) {
          tl.fromTo(
            oldPageEl,
            { y: '0vh' },
            { y: '-25vh', duration: DURATION, ease: 'parallax' },
            'startEnter'
          )
        }
        tl.fromTo(
          newPageEl,
          { y: '100vh' },
          {
            y: '0vh',
            duration: DURATION,
            ease: 'parallax',
          },
          'startEnter'
        )
        if (oldPageEl) {
          tl.fromTo(
            oldPageEl,
            { y: '0vh' },
            { y: '-25vh', duration: DURATION, ease: 'parallax' },
            'startEnter'
          )
        }
        tl.fromTo(
          newPageEl,
          { y: '100vh' },
          {
            y: '0vh',
            duration: DURATION,
            ease: 'parallax',
          },
          'startEnter'
        )
      },

      beforeLeave(el) {
        if (typeof window === 'undefined') return
        isTransitioning.value = true
        const pageEl = getPageEl(el)
        gsap.set(el, { position: 'relative' })
        gsap.set(pageEl, { zIndex: Z_LEAVING })
      },

      leave(el, done) {
        done()
      },

      afterLeave() {
        if (typeof document === 'undefined') return
        document.querySelectorAll('[data-transition-wrap]').forEach((wrap) => {
          gsap.set(wrap, { zIndex: '' })
        })
      },
    },
  }
}
