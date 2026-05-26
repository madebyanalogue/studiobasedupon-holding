export const useSiteSettings = () => {
    const query = `*[_type == "siteSettings"][0] {
      maxWidth,
      logo,
    title,
      seoTitle,
      seoDescription,
    headerType,
    mobileBreakpoint,
    disablePreloader,
    preloaderImages[] {
      image {
        asset->
      },
      alt,
      repeatLeftRight
    },
    preloaderText,
    preloaderSvgCode,
      facebookShareImage {
        asset-> {
          _id,
          url,
          _ref
        }
      },
      headerMenu-> {
        title,
        items[] {
          text,
          link {
            type,
            page-> {
              slug {
                current
              }
            },
            url
          }
        }
      },
      mobileMenu-> {
        title,
        items[] {
          text,
          link {
            type,
            page-> {
              slug {
                current
              }
            },
            url
          }
        }
      },
      showMobileMenuSocialLinks,
      mobileMenuSocialLinksTitle,
      mobileMenuSocialLinks[] {
        _key,
        title,
        url
      },
      singlePortfolioNextProjectSettings {
        enabled,
        nextUpSubtitle,
        viewProjectButtonTitle,
        backLinkTitle,
        backLinkPage-> {
          slug {
            current
          }
        }
      },
      navigationContact {
        buttonTitle,
        buttonPage-> {
          slug {
            current
          }
        },
        contacts[] {
          _key,
          title,
          linkText,
          url,
          link {
            type,
            page-> {
              slug {
                current
              }
            },
            url
          }
        }
      },
      footerColumns[] {
        _key,
        content
      },
      footerCallToAction,
      copyright
    }`
    
  // Use the same Nitro API on server and client so SSR + hydration see identical data.
  const { data: settings } = useAsyncData('siteSettings', () =>
    $fetch('/api/sanity/query', {
      method: 'POST',
      body: { query },
    })
      .then((result) => result?.result ?? null)
      .catch(() => null),
    { server: true },
  )

  const maxWidth = computed(() => settings.value?.maxWidth || '1800px')
  const logo = computed(() => settings.value?.logo)
  const title = computed(() => settings.value?.title || 'Studio Based Upon')
  const seoTitle = computed(() => settings.value?.seoTitle || 'Studio Based Upon')
  const seoDescription = computed(() => settings.value?.seoDescription || '')
  const disablePreloader = computed(() => settings.value?.disablePreloader === true)
  const preloaderImages = computed(() => settings.value?.preloaderImages || [])
  const preloaderText = computed(() => settings.value?.preloaderText || [])
  const preloaderSvgCode = computed(() => settings.value?.preloaderSvgCode || null)
  const facebookShareImage = computed(() => {
    const asset = settings.value?.facebookShareImage?.asset
    if (!asset) return null
    
    // If we have a direct URL, use it
    if (asset.url) {
      return asset.url
    }
    
    // Fallback: construct URL from _id or _ref
    if (asset._id) {
      // Extract parts from "image-abc123-1920x1080-jpg"
      const match = String(asset._id).match(/image-([^-]+)-(\d+)x(\d+)-(\w+)/)
      if (match) {
        const [, assetId, width, height, ext] = match
        return `https://cdn.sanity.io/images/b6xol4su/production/${assetId}-${width}x${height}.${ext}`
      }
    }
    
    if (asset._ref) {
      const [file, id, extension] = asset._ref.replace('image-', '').split('-')
    return `https://cdn.sanity.io/images/b6xol4su/production/${id}.${extension}`
    }
    
    return null
  })
  const menuProjection = (menu) => menu && Array.isArray(menu.items) ? menu : null

  const headerMenu = computed(() => menuProjection(settings.value?.headerMenu))
  const mobileMenu = computed(() => {
    const explicit = menuProjection(settings.value?.mobileMenu)
    if (explicit?.items?.length) return explicit
    return menuProjection(settings.value?.headerMenu)
  })
  const showMobileMenuSocialLinks = computed(
    () => settings.value?.showMobileMenuSocialLinks === true,
  )
  const mobileMenuSocialLinksTitle = computed(
    () => settings.value?.mobileMenuSocialLinksTitle || '',
  )
  const mobileMenuSocialLinks = computed(
    () => settings.value?.mobileMenuSocialLinks || [],
  )
  const singlePortfolioNextProjectSettings = computed(() => {
    const section = settings.value?.singlePortfolioNextProjectSettings || {}
    const nextUpSubtitle = section?.nextUpSubtitle?.trim?.() || 'Next up:'
    const viewProjectButtonTitle = section?.viewProjectButtonTitle?.trim?.() || 'View project'
    const enabled = section?.enabled !== false

    const backTitle = section?.backLinkTitle?.trim?.() || ''
    const backSlug = section?.backLinkPage?.slug?.current
    const backLink = backTitle && backSlug
      ? { title: backTitle, path: backSlug === 'home' ? '/' : `/${backSlug}` }
      : null

    return {
      enabled,
      nextUpSubtitle,
      viewProjectButtonTitle,
      backLink,
    }
  })
  const navigationContact = computed(() => settings.value?.navigationContact || null)
  const footerColumns = computed(() => settings.value?.footerColumns || [])
  const footerCallToAction = computed(() => settings.value?.footerCallToAction || [])
  const headerType = computed(() => settings.value?.headerType || 'responsive')
  const mobileBreakpoint = computed(() => settings.value?.mobileBreakpoint ?? 800)
  const copyright = computed(() => {
    const siteTitle = settings.value?.title || 'Studio Based Upon'
    const text = settings.value?.copyright?.trim() || `© [year] ${siteTitle}`
    const currentYear = new Date().getFullYear()
    return text.replace(/\[year\]/gi, String(currentYear))
  })

  return {
    settings,
    maxWidth,
    logo,
    title,
    seoTitle,
    seoDescription,
    facebookShareImage,
    headerMenu,
    mobileMenu,
    showMobileMenuSocialLinks,
    mobileMenuSocialLinksTitle,
    mobileMenuSocialLinks,
    singlePortfolioNextProjectSettings,
    navigationContact,
    footerColumns,
    footerCallToAction,
    headerType,
    mobileBreakpoint,
    copyright,
    disablePreloader,
    preloaderImages,
    preloaderText,
    preloaderSvgCode,
  }
}

