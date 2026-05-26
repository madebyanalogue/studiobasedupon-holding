// Page transitions are handled by app.vue + usePageTransition.js (Vue Transition).
// This plugin only sets scroll restoration so we don't double-animate .page-wrapper.
if (typeof history !== 'undefined') {
  history.scrollRestoration = 'manual'
}

const FALLBACK_MS = 1100 // Fallback if enter's onComplete never fires (animation is 1s, add buffer)

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  const router = useRouter()
  const isTransitioning = useState('pageTransitioning', () => false)

  router.beforeEach((to, from) => {
    if (from.matched.length > 0) {
      isTransitioning.value = true
    }
  })

  router.afterEach((_to, _from, failure) => {
    if (failure) {
      isTransitioning.value = false
      return
    }
    setTimeout(() => {
      isTransitioning.value = false
    }, FALLBACK_MS)
  })

  nuxtApp.hook('page:finish', () => {
    isTransitioning.value = false
  })
})
