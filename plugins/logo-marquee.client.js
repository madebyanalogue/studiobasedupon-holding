import { nextTick } from 'vue'
import { initLogoMarquee } from '~/composables/useLogoMarquee'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    const init = () => {
      initLogoMarquee()
    }
    nuxtApp.hook('app:mounted', () => {
      nextTick(init)
    })
    nuxtApp.hook('page:finish', () => {
      nextTick(init)
    })
  }
})
