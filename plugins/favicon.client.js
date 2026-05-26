export default defineNuxtPlugin(async () => {
  try {
    const query = `*[_type == "siteSettings"][0] {
      favicon {
        asset->
      }
    }`
    
    const result = await $fetch('/api/sanity/query', {
      method: 'POST',
      body: { query },
    })
    
    const settings = result?.result
    
    const favicon = settings?.favicon
    if (!favicon?.asset?.url) {
      return
    }
    
    // Remove existing favicon links (including default Nuxt favicon)
    const existingLinks = document.querySelectorAll('link[rel*="icon"]')
    existingLinks.forEach(link => {
      link.remove()
    })
    
    // Use the asset URL directly
    const faviconUrl = favicon.asset.url
    
    // Determine MIME type based on extension
    const extension = favicon.asset.extension?.toLowerCase() || 'png'
    const mimeTypes = {
      'png': 'image/png',
      'ico': 'image/x-icon',
      'svg': 'image/svg+xml',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
    }
    const mimeType = mimeTypes[extension] || 'image/png'
    
    // Add favicon link
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = mimeType
    link.href = faviconUrl
    
    document.head.appendChild(link)
    
  } catch (error) {
    console.error('[Favicon] Error loading favicon:', error)
  }
})

