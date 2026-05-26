import { ref, provide, inject } from 'vue'

const pageLoadingKey = Symbol('pageLoading')

export const usePageLoading = () => {
  const isLoading = ref(false)
  
  const setLoading = (loading) => {
    isLoading.value = loading
  }
  
  return {
    isLoading,
    setLoading,
  }
}

export const providePageLoading = () => {
  const { isLoading, setLoading } = usePageLoading()
  provide(pageLoadingKey, { isLoading, setLoading })
  return { isLoading, setLoading }
}

export const injectPageLoading = () => {
  const pageLoading = inject(pageLoadingKey)
  if (!pageLoading) {
    // Fallback if not provided
    return usePageLoading()
  }
  return pageLoading
}
