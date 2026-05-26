import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // If navigating back/forward (browser history), restore saved position
    if (savedPosition) {
      return savedPosition
    }
    
    // For new navigations, don't force scroll position
    // Let the page transition handle it naturally
    // This prevents unwanted scroll-to-top when clicking portfolio items
    return false
  },
}
