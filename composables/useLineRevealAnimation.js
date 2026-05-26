/**
 * Line reveal animation – reusable text animation style.
 * Animates text line-by-line: lines slide up from below with opacity fade-in.
 *
 * Use cases:
 * - After slide or tab change
 * - When scrolling to a section (via data-line-reveal attribute)
 * - Programmatically when content appears
 *
 * @example Programmatic (e.g. after tab change):
 *   const { animateLineReveal } = useLineRevealAnimation()
 *   animateLineReveal(elRef.value)
 *
 * @example Scroll-triggered (add to template):
 *   <h2 data-line-reveal>Your heading</h2>
 *
 * @example With options:
 *   animateLineReveal(el, { duration: 0.4, stagger: 0.05 })
 */
export const useLineRevealAnimation = () => {
  const getDefaults = () => ({
    duration: 0.75,
    stagger: 0.1,
    ease: 'power3.out',
  })

  const animateLineReveal = async (element, options = {}) => {
    if (!import.meta.client || !element) return null

    const { duration, stagger, ease } = { ...getDefaults(), ...options }

    try {
      const gsap = (await import('gsap')).default
      const SplitType = (await import('split-type')).default

      let target
      if (typeof element === 'string') {
        target = document.querySelector(element)
      } else if (element?.$el) {
        target = element.$el
      } else if (element?.nodeType === 1) {
        target = element
      } else if (element?.value?.nodeType === 1) {
        target = element.value
      } else {
        target = element
      }

      if (!target) return null

      target.classList.add('line-reveal-animated')
      const split = new SplitType(target, { types: 'lines' })
      if (!split.lines?.length) return null

      gsap.set(split.lines, { yPercent: 100, opacity: 0 })

      const tl = gsap.timeline()
      tl.to(split.lines, {
        yPercent: 0,
        opacity: 1,
        duration,
        stagger,
        ease,
      })

      return tl
    } catch (e) {
      // SplitType/GSAP may fail on empty or simple content
      return null
    }
  }

  return {
    animateLineReveal,
    getDefaults,
  }
}
