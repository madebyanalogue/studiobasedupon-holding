export function useContactLink() {
  const getContactLinkUrl = (row) => {
    if (!row) return ''
    if (row.url && !row.link) return row.url

    const link = row.link
    if (!link) return ''

    if (link.type === 'page' && link.page?.slug?.current) {
      const slug = link.page.slug.current
      return slug === 'home' ? '/' : `/${slug}`
    }

    return link.url || ''
  }

  const contactLinkUsesNative = (url) => {
    if (!url) return true
    if (url.startsWith('mailto:') || url.startsWith('tel:')) return true
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return true
    return false
  }

  const isExternalHttp = (url) => {
    if (!url) return false
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')
  }

  return {
    getContactLinkUrl,
    contactLinkUsesNative,
    isExternalHttp,
  }
}
