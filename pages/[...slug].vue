<template>
  <div class="page">
    <div v-if="error">
      <p>Error loading page: {{ error.message }}</p>
    </div>
    <div class="page-content" v-else-if="page">
      <div v-if="sections.length === 0" style="padding: var(--gutter);">
        <p>No sections found for this page. Add sections in Sanity.</p>
      </div>
      <div v-for="section in sections" :key="section._id" class="page-section">
        <PageSectionFeaturedProjects
          v-if="section.sectionType === 'featuredProjects'"
          :section="section"
        />
        <PageSectionHeroCarousel
          v-else-if="section.sectionType === 'heroCarousel'"
          :section="section"
        />
        <PageSectionHomeScroll
          v-else-if="section.sectionType === 'homeScroll'"
          :section="section"
        />
        <PageSectionInfo
          v-else-if="section.sectionType === 'info'"
          :section="section"
        />
        <PageSectionServices
          v-else-if="section.sectionType === 'services'"
          :section="section"
        />
        <PageSectionText
          v-else-if="section.sectionType === 'text'"
          :section="section"
        />
        <PageSectionKineticTypography
          v-else-if="section.sectionType === 'kineticTypography'"
          :section="section"
        />
        <PageSectionCards
          v-else-if="section.sectionType === 'cards'"
          :section="section"
        />
        <PageSectionStackingCards
          v-else-if="section.sectionType === 'stackingCards'"
          :section="section"
        />
        <PageSectionAutoscrollGallery
          v-else-if="section.sectionType === 'autoscrollGallery'"
          :section="section"
        />
        <PageSectionNews
          v-else-if="section.sectionType === 'news' || section.sectionType === 'pressAwards'"
          :section="section"
        />
        <PageSectionPortfolio
          v-else-if="section.sectionType === 'portfolio'"
          :section="section"
          :projects="portfolioProjects"
        />
        <PageSectionTeam
          v-else-if="section.sectionType === 'team'"
          :section="section"
        />
        <PageSectionLogoWall
          v-else-if="section.sectionType === 'logoWall'"
          :section="section"
        />
        <PageSectionLogoMarquee
          v-else-if="section.sectionType === 'logoMarquee'"
          :section="section"
        />
        <PageSectionClients
          v-else-if="section.sectionType === 'clients'"
          :section="section"
        />
        <PageSectionContact
          v-else-if="section.sectionType === 'contact'"
          :section="section"
        />
        <PageSectionSpotifyPlayer
          v-else-if="section.sectionType === 'spotifyPlayer'"
          :section="section"
        />
      </div>
    </div>
    <div v-else>
     <p>Page not found</p>
    </div>
  </div>
</template>

<script setup>
import { injectPageLoading } from '~/composables/usePageLoading'

const route = useRoute()
const { setLoading } = injectPageLoading()

const slug = computed(() => {
  if (route.path === '/') return 'home'
  if (route.params.slug) {
    return Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
  }
  // Params can be unset for one tick during client hydration; derive from path so GROQ + useAsyncData key stay in sync with SSR.
  const fromPath = route.path.replace(/^\//, '')
  return fromPath || null
})

const { data: page, pending, error } = useAsyncData(
  () => `page-${route.path}`,
  async () => {
    if (!slug.value) {
      return null
    }

    const query = `*[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      devBackgroundImage {
        asset-> {
          url
        }
      },
      sections[]-> {
        _id,
        _type,
        title,
        featuredProjectsTitle,
        newsTitle,
        sectionType,
        newsItems[] {
          _key,
          newsPost-> {
            _id,
            content,
            featuredImage {
              asset-> {
                url,
                metadata {
                  dimensions {
                    width,
                    height
                  }
                }
              }
            }
          }
        },
        featuredProjects[] {
          project-> {
            _id,
            title,
            slug,
            thumbnailDescription,
            thumbnailStats[] {
              _key,
              label,
              value,
              icon
            },
            featuredImage {
              asset->
            },
            featuredImageMobile {
              asset->
            }
          }
        },
        infoImage {
          asset-> {
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          }
        },
        infoContent[] {
          _type,
          _key,
          title,
          text,
          largeText,
          links[] {
            linkTitle,
            subtitle,
            link,
            openInNewTab
          },
          content,
          image {
            asset->
          },
          spanTwoColumns,
          showOnDesktop,
          showOnMobile
        },
        servicesTitle,
        spotifyTitle,
        spotifyEmbedUrl,
        servicesTextarea,
        cardsSectionTitle,
        heroCarouselLeftTiming,
        heroCarouselEnableRight,
        heroCarouselLoopAtSameTime,
        heroCarouselRightTiming,
        heroCarouselLeft[] {
          _key,
          mediaType,
          image {
            asset-> {
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height,
                  aspectRatio
                }
              }
            }
          },
          video {
            asset-> {
              _id,
              url
            }
          }
        },
        heroCarouselRight[] {
          _key,
          mediaType,
          image {
            asset-> {
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height,
                  aspectRatio
                }
              }
            }
          },
          video {
            asset-> {
              _id,
              url
            }
          }
        },
        heroCarouselMobile[] {
          _key,
          mediaType,
          image {
            asset-> {
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height,
                  aspectRatio
                }
              }
            }
          },
          video {
            asset-> {
              _id,
              url
            }
          }
        },
        homeScrollContent {
          items[] {
            _key,
            title,
            image {
              asset-> {
                _id,
                url,
                metadata {
                  dimensions {
                    width,
                    height,
                    aspectRatio
                  }
                }
              }
            },
            link {
              page-> {
                slug {
                  current
                }
              },
              url
            }
          }
        },
        textContent,
        kineticTypographyLine1,
        kineticTypographyHighlightStart,
        kineticTypographyHighlightConnector,
        kineticTypographyHighlightEnd,
        kineticTypographyText,
        cardsDisableScrollDemo,
        cards[] {
          _key,
          title,
          description,
          mediaType,
          image {
            asset-> {
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height,
                  aspectRatio
                }
              }
            }
          },
          video {
            asset->
          }
        },
        autoscrollGalleryAspectRatio,
        autoscrollGallerySpeed,
        autoscrollGalleryDirection,
        autoscrollGalleryItems[] {
          _key,
          mediaType,
          link,
          image {
            asset-> {
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height,
                  aspectRatio
                }
              }
            }
          },
          video {
            asset-> {
              _id,
              url
            }
          }
        },
        thumbnailAspectRatio,
        teamMembers[] {
          _key,
          name,
          role,
          image {
            asset-> {
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height,
                  aspectRatio
                }
              }
            }
          }
        },
        logoWallShuffle,
        logoWallLogos[] {
          _key,
          alt,
          "asset": asset.asset-> {
            _id,
            url
          }
        },
        logoMarqueeLogos[] {
          _key,
          alt,
          "asset": asset.asset-> {
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          }
        },
        logoMarqueeTitle,
        clientsTitle,
        clientsImages[] {
          _key,
          alt,
          image {
            asset-> {
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height,
                  aspectRatio
                }
              }
            }
          }
        },
        contactTitle,
        contactVideoSubtitle,
        contactVideo {
          asset-> {
            _id,
            url
          }
        },
        contactVideoAspectRatio,
        contactRightTitle,
        contactInformation[] {
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
        },
        contactLeftBackgroundColour,
        contactRightBackgroundColour,
        contactDotColour
      },
      "portfolioProjects": *[_type == "portfolio"] | order(orderRank) {
        _id,
        title,
        slug,
        thumbnailDescription,
        thumbnailStats[] {
          _key,
          label,
          value,
          icon
        },
        featuredImage {
          asset->
        },
        featuredImageMobile {
          asset->
        }
      }
    }`

    try {
      const result = await $fetch('/api/sanity/query', {
        method: 'POST',
        body: { query, params: { slug: slug.value } },
      })
      const pageData = result?.result
      if (pageData && pageData._id) {
        return pageData
      }
      return null
    } catch (err) {
      throw err
    }
  },
  { watch: [slug] }
)

const sections = computed(() => page.value?.sections || [])

const portfolioProjects = computed(() => page.value?.portfolioProjects || [])

// TODO(dev): remove with Sanity field devBackgroundImage before launch — body bg via useHead + main.css
useHead(() => {
  const url = page.value?.devBackgroundImage?.asset?.url
  if (!url) {
    return {
      bodyAttrs: {
        'data-page-dev-bg': undefined,
        style: undefined,
      },
    }
  }
  return {
    bodyAttrs: {
      'data-page-dev-bg': 'true',
      style: [
        `background-image:url("${url}")`,
        'background-size: 100%',
        'background-position: left top',
        'background-repeat:no-repeat',
      ].join(';'),
    },
  }
})

// Update global loading state
watch(pending, (isPending) => {
  setLoading(isPending)
}, { immediate: true })
</script>

<style scoped>
/* .page {
  padding: var(--gutter) 0;
}

.page-section:not(:last-child) {
  margin-bottom: var(--gutter);
} */

.page-content {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) * 1.5);
}
@media (min-width: 800px) {
  .page-content {
    gap: calc(var(--gutter) * 3.5);
  }
}

</style>

