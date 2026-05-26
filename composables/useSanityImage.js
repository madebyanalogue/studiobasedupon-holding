export const useSanityImage = () => {
  const config = useRuntimeConfig()

  const getImageSrc = (asset) => {
    if (!asset) return ''

    if (typeof asset === 'string') {
      return String(asset)
    }

    try {
      const url = asset?.url
      if (url && typeof url === 'string' && url.length > 0) {
        return String(url)
      }
    } catch (e) {
      // Ignore errors accessing url
    }

    try {
      const id = asset?._id
      if (id && typeof id === 'string') {
        const match = String(id).match(/image-([^-]+)-(\d+)x(\d+)-(\w+)/)
        if (match) {
          const [, assetId, width, height, ext] = match
          const projectId = config.public.sanity?.projectId || 'b6xol4su'
          const dataset = config.public.sanity?.dataset || 'production'
          return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${width}x${height}.${ext}`
        }
      }
    } catch (e) {
      // Ignore errors accessing url
    }

    console.warn('[useSanityImage] Could not extract image URL from asset:', asset)
    return ''
  }

  return {
    getImageSrc,
  }
}

