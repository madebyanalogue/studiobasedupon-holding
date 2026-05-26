import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initLogoMarquee(root = document) {
  const marquees = root.querySelectorAll('[data-marquee-scroll-direction-target]:not([data-marquee-initialized])')
  if (!marquees.length) return

  marquees.forEach((marquee) => {
    const marqueeContent = marquee.querySelector('[data-marquee-collection-target]')
    const marqueeScroll = marquee.querySelector('[data-marquee-scroll-target]')
    if (!marqueeContent || !marqueeScroll) return

    const { marqueeSpeed: speed, marqueeDirection: direction, marqueeDuplicate: duplicate, marqueeScrollSpeed: scrollSpeed } = marquee.dataset

    const marqueeSpeedAttr = parseFloat(speed) || 15
    const marqueeDirectionAttr = direction === 'right' ? 1 : -1
    const duplicateAmount = parseInt(duplicate || 0)
    const scrollSpeedAttr = parseFloat(scrollSpeed) || 10
    const speedMultiplier = window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1

    const contentWidth = marqueeContent.offsetWidth
    if (contentWidth === 0) return

    marquee.setAttribute('data-marquee-initialized', 'true')

    const marqueeSpeed = marqueeSpeedAttr * (contentWidth / window.innerWidth) * speedMultiplier

    marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`
    marqueeScroll.style.width = `${(scrollSpeedAttr * 2) + 100}%`

    if (duplicateAmount > 0) {
      const fragment = document.createDocumentFragment()
      for (let i = 0; i < duplicateAmount; i++) {
        fragment.appendChild(marqueeContent.cloneNode(true))
      }
      marqueeScroll.appendChild(fragment)
    }

    const marqueeItems = marquee.querySelectorAll('[data-marquee-collection-target]')
    const animation = gsap.to(marqueeItems, {
      xPercent: -100,
      repeat: -1,
      duration: marqueeSpeed,
      ease: 'linear',
    }).totalProgress(0.5)

    gsap.set(marqueeItems, { xPercent: marqueeDirectionAttr === 1 ? 100 : -100 })
    animation.timeScale(marqueeDirectionAttr)
    animation.play()

    marquee.setAttribute('data-marquee-status', 'normal')

    ScrollTrigger.create({
      trigger: marquee,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const isInverted = self.direction === 1
        const currentDirection = isInverted ? -marqueeDirectionAttr : marqueeDirectionAttr
        animation.timeScale(currentDirection)
        marquee.setAttribute('data-marquee-status', isInverted ? 'normal' : 'inverted')
      },
    })

    const scrollStart = marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr
    const scrollEnd = -scrollStart

    gsap.timeline({
      scrollTrigger: {
        trigger: marquee,
        start: '0% 100%',
        end: '100% 0%',
        scrub: 0,
      },
    }).fromTo(marqueeScroll, { x: `${scrollStart}vw` }, { x: `${scrollEnd}vw`, ease: 'none' })
  })
}
