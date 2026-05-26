export default defineNuxtPlugin(async () => {
  try {
    const query = `*[_type == "siteSettings"][0] {
      googleAnalyticsId
    }`
    
    const result = await $fetch('/api/sanity/query', {
      method: 'POST',
      body: { query },
    })
    
    const settings = result?.result
    
    const gaId = settings?.googleAnalyticsId
    
    if (!gaId) return
    
    // Load Google Analytics
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag
    
    gtag('js', new Date())
    gtag('config', gaId)
  } catch (error) {
    console.error('Error loading Google Analytics:', error)
  }
})

