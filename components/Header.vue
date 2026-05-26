<template>
  <header :class="['header', { 
    'header-static': headerType === 'static',
    'header-fixed': headerType === 'fixed',
    'header-sticky': headerType === 'responsive' && isPastHeader, 
    'header-hidden': headerType === 'responsive' && isScrollingDown, 
    'header-transition': headerType === 'responsive' && shouldAddTransition 
  }]">

    <div class="header-bar header--styling">
      <div class="header-logo">
        <NuxtLink to="/">
          <Logo />
        </NuxtLink>
      </div>

      <nav class="header-nav" aria-label="Main">
        <NuxtLink
          v-for="item in headerMenuItems"
          :key="item._key || item.text"
          :to="getMenuItemUrl(item)"
          :target="isExternalUrl(item.link?.url) ? '_blank' : undefined"
          :rel="isExternalUrl(item.link?.url) ? 'noopener' : undefined"
          :class="['header-link', { 'header-link-active': isActive(item) }]"
        >
          <span class="header-link-text">{{ item.text }}</span>
        </NuxtLink>
      </nav>
    </div>

    <div
      v-if="showContactButton && contactMounted"
      ref="contactRoot"
      class="header-contact show-md"
    >
      <NuxtLink
        v-if="contactButtonUrl"
        :to="contactButtonUrl"
        class="header-contact-toggle header-contact-link-button header--styling"
      >
        <div>{{ navigationContact.buttonTitle }}</div>
      </NuxtLink>
      <template v-else>
        <button
          type="button"
          class="header-contact-toggle header--styling"
          :class="{ 'header-contact-toggle-open': contactOpen }"
          :aria-expanded="contactOpen"
          aria-haspopup="true"
          @click="toggleContact"
        >
          <div>{{ navigationContact.buttonTitle }}</div>
        </button>
        <div
          v-show="contactOpen"
          class="header-contact-panel white-text rounded-medium"
          role="region"
          :aria-label="navigationContact.buttonTitle"
        >
          <div
            v-for="row in navigationContact.contacts"
            :key="row._key"
            class="header-contact-item pad-20"
          >
            <div class="header-contact-item-title subtitle subtitle--circle white-dot">
              {{ row.title }}
            </div>
            <a
              v-if="contactLinkUsesNative(getContactLinkUrl(row))"
              :href="getContactLinkUrl(row)"
              :target="isExternalHttp(getContactLinkUrl(row)) ? '_blank' : undefined"
              :rel="isExternalHttp(getContactLinkUrl(row)) ? 'noopener' : undefined"
              class="header-contact-link"
            >{{ row.linkText }}</a>
            <NuxtLink
              v-else
              :to="getContactLinkUrl(row)"
              class="header-contact-link"
            >
              {{ row.linkText }}
            </NuxtLink>
          </div>
        </div>
      </template>
    </div>


    <div
      ref="mobileMenuRoot"
      class="header-mobile header--styling"
    >
      <button
        type="button"
        class="header-menu-toggle"
        :class="{ 'header-menu-toggle-open': mobileMenuOpen }"
        :aria-expanded="mobileMenuOpen"
        aria-controls="header-mobile-nav"
        @click="toggleMobileMenu"
      >
        Menu
      </button>
      <div
        v-show="mobileMenuOpen"
        id="header-mobile-nav"
        class="header-mobile-panel header-mobile-panel--fullscreen underline-links"
        role="navigation"
        aria-label="Main"
      >
        <div class="header-mobile-panel-main">
          <NuxtLink
            v-for="item in mobileMenuItems"
            :key="item._key || item.text"
            :to="getMenuItemUrl(item)"
            :target="isExternalUrl(item.link?.url) ? '_blank' : undefined"
            :rel="isExternalUrl(item.link?.url) ? 'noopener' : undefined"
            :class="['header-mobile-link', 'header-link', { 'header-link-active': isActive(item) }]"
            @click="mobileMenuOpen = false"
          >
            <span class="header-link-text">{{ item.text }}</span>
          </NuxtLink>
        </div>
        <div
          v-if="showMobileMenuSocialLinks"
          class="header-mobile-social"
        >
          <p
            v-if="mobileMenuSocialLinksTitle.trim()"
            class="header-mobile-social-title"
          >
            {{ mobileMenuSocialLinksTitle }}
          </p>
          <div class="header-mobile-social-links">
            <template
              v-for="row in mobileMenuSocialLinks"
              :key="row._key"
            >
              <a
                v-if="contactLinkUsesNative(row.url)"
                :href="row.url"
                :target="isExternalHttp(row.url) ? '_blank' : undefined"
                :rel="isExternalHttp(row.url) ? 'noopener' : undefined"
                class="header-mobile-social-link"
                @click="mobileMenuOpen = false"
              >{{ row.title }}</a>
              <NuxtLink
                v-else
                :to="row.url"
                class="header-mobile-social-link"
                @click="mobileMenuOpen = false"
              >
                {{ row.title }}
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useSiteSettings } from '~/composables/useSiteSettings'

const route = useRoute()
const {
  headerMenu,
  mobileMenu,
  headerType,
  navigationContact,
  showMobileMenuSocialLinks,
  mobileMenuSocialLinksTitle,
  mobileMenuSocialLinks,
} = useSiteSettings()

const { contactLinkUsesNative, isExternalHttp, getContactLinkUrl } = useContactLink()

const headerMenuItems = computed(() => headerMenu.value?.items || [])
const mobileMenuItems = computed(() => mobileMenu.value?.items || [])

const contactButtonUrl = computed(() => {
  const slug = navigationContact.value?.buttonPage?.slug?.current
  if (!slug) return null
  return slug === 'home' ? '/' : `/${slug}`
})

const showContactButton = computed(() => {
  const nc = navigationContact.value
  const title = nc?.buttonTitle?.trim()
  if (!title) return false
  if (contactButtonUrl.value) return true
  const contacts = nc?.contacts
  return Boolean(Array.isArray(contacts) && contacts.length > 0)
})

const contactOpen = ref(false)
const contactRoot = ref(null)
const mobileMenuOpen = ref(false)
const mobileMenuRoot = ref(null)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
/** Avoid SSR/client tree mismatch: omit contact block until after mount (matches SSR). */
const contactMounted = ref(false)

const toggleContact = () => {
  contactOpen.value = !contactOpen.value
}

const onDocumentPointerDown = (e) => {
  if (contactOpen.value && contactRoot.value && !contactRoot.value.contains(e.target)) {
    contactOpen.value = false
  }
  if (mobileMenuOpen.value && mobileMenuRoot.value && !mobileMenuRoot.value.contains(e.target)) {
    mobileMenuOpen.value = false
  }
}

const onDocumentKeydown = (e) => {
  if (e.key === 'Escape') {
    contactOpen.value = false
    mobileMenuOpen.value = false
  }
}

const isExternalUrl = (url) => {
  if (!url) return false
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return true
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return false
  return !url.startsWith('/') && !url.startsWith('#')
}

const getMenuItemUrl = (item) => {
  if (item.link?.type === 'page' && item.link?.page?.slug?.current) {
    return `/${item.link.page.slug.current}`
  }
  if (item.link?.url) {
    return item.link.url
  }
  return '#'
}

const isActive = (item) => {
  const itemUrl = getMenuItemUrl(item)
  if (!itemUrl || itemUrl === '#') return false
  if (isExternalUrl(itemUrl)) return false
  
  // Normalize paths for comparison
  const currentPath = route.path === '/' ? '/' : route.path.replace(/\/$/, '')
  const normalizedItemUrl = itemUrl === '/' ? '/' : itemUrl.replace(/\/$/, '')
  
  return currentPath === normalizedItemUrl
}

// Scroll detection for header hide/show
const isScrollingDown = ref(false)
const isPastHeader = ref(false)
const shouldAddTransition = ref(false)
const headerHeight = ref(0)
let lastScrollY = 0
let ticking = false

const handleScroll = () => {
  // Only run scroll logic for responsive header type
  if (!process.client || headerType.value !== 'responsive') {
    ticking = false
    return
  }
  
  const currentScrollY = window.scrollY
  
  // Only update if scroll position changed significantly (avoid jitter)
  if (Math.abs(currentScrollY - lastScrollY) < 5) {
    ticking = false
    return
  }
  
  const headerEl = document.querySelector('.header')
  if (!headerEl) {
    ticking = false
    return
  }
  
  // Get header height if not set
  if (headerHeight.value === 0) {
    headerHeight.value = headerEl.offsetHeight
  }
  
  // Check if we've scrolled past the full header height
  const hasScrolledPastHeader = currentScrollY >= headerHeight.value
  // Increased threshold for transition (e.g., 2x header height)
  const transitionThreshold = headerHeight.value * 2
  
  // At the very top - header goes back to relative
  if (currentScrollY <= 0) {
    isPastHeader.value = false
    shouldAddTransition.value = false
    isScrollingDown.value = false
  } 
  // Once we've scrolled past header, it becomes sticky and stays sticky
  else if (hasScrolledPastHeader || isPastHeader.value) {
    // Once past header, always stay sticky (even when scrolling back up into header zone)
    isPastHeader.value = true
    
    // Only add transition after scrolling past the increased threshold
    shouldAddTransition.value = currentScrollY >= transitionThreshold
    
    // Show header when scrolling up
    if (currentScrollY < lastScrollY) {
      isScrollingDown.value = false
    } 
    // Hide header when scrolling down
    else if (currentScrollY > lastScrollY) {
      isScrollingDown.value = true
    }
  } else {
    // Before scrolling past header for the first time, always show (relative positioning)
    isPastHeader.value = false
    shouldAddTransition.value = false
    isScrollingDown.value = false
  }
  
  lastScrollY = currentScrollY
  ticking = false
}

const onScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(handleScroll)
    ticking = true
  }
}

onMounted(() => {
  contactMounted.value = true
  if (process.client) {
    document.addEventListener('pointerdown', onDocumentPointerDown)
    document.addEventListener('keydown', onDocumentKeydown)
  }
  // Only add scroll listener for responsive header type
  if (process.client && headerType.value === 'responsive') {
    lastScrollY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('pointerdown', onDocumentPointerDown)
    document.removeEventListener('keydown', onDocumentKeydown)
  }
  // Only remove scroll listener if it was added (responsive header type)
  if (process.client && headerType.value === 'responsive') {
    window.removeEventListener('scroll', onScroll)
  }
})
</script>

<style scoped>
.header {
  gap: 10px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1000;
  font-size: 16px;
  /* transition: color 0.6s ease, background-color 0.6s ease; */
  transform: translateY(0);
}

.header--styling {
  border-radius: 10px;
  background-color: var(--white);
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}


@media (min-width: 800px) {
  .header--styling {
    padding: 12px 20px;
    
  }
}

.header-logo {
  display: flex;
  flex: 1;
  color: var(--orange);
}
.header-bar {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--gutter);
  padding: 12px 20px;
}

.header-nav {
  display: flex;
  gap: 40px;
  padding: 0 10px;
}

.header-mobile {
  display: none;
  position: relative;
}

@media (max-width: 799px) {
  .header-nav {
    display: none;
  }

  .header-mobile {
    display: flex;
  }
}

/* .header-link {
  position: relative;
  display: inline-block;
}
.header-link:after {
  content: '';
  position: absolute;
  bottom: var(--underline-offset);
  left: 0;
  width: 100%;
  height: 1px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.32s ease;
  background: currentColor;
}
.header-link:hover:after,
.header-link-active:after {
  transform: scaleX(1);
} */

.header-contact {
  position: relative;
  display: inline-block;
}

.header-contact-toggle {
  background: var(--orange);
  color: var(--white);
  border: none;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.header-contact-link-button {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.header-contact-panel {
  position: absolute;
  top: calc(100% + var(--gutter));
  right: 0;
  width: 355px;
  padding: calc(var(--gutter) * 0.75);
  background: var(--orange);
  color: var(--white);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) * 0.75);
  background:url('/images/_contact-pop.png') no-repeat center top;
  background-size: 100%;
}

.header-menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
  padding: 0;
}

.header-mobile-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: min(18rem, calc(100vw - var(--gutter) * 2));
  padding: calc(var(--gutter) * 0.75);
  background: var(--background-color);
  color: var(--text-color);
  border: 1px solid currentColor;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) * 0.5);
}

.header-mobile-panel--fullscreen {
  position: fixed;
  inset: 0;
  width: 100vw;
  min-height: 100dvh;
  max-width: none;
  min-width: 0;
  margin: 0;
  top: 0;
  right: 0;
  padding: calc(var(--gutter) * 1.25);
  padding-top: max(calc(var(--gutter) * 1.25), env(safe-area-inset-top));
  padding-bottom: max(calc(var(--gutter) * 1.25), env(safe-area-inset-bottom));
  z-index: 1200;
  justify-content: space-between;
  overflow: auto;
}

.header-mobile-panel-main {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) * 0.5);
}

.header-mobile-social {
  margin-top: auto;
  padding-top: calc(var(--gutter) * 1);
  border-top: 1px solid currentColor;
}

.header-mobile-social-title {
  margin: 0 0 calc(var(--gutter) * 0.5);
  font-weight: 600;
}

.header-mobile-social-links {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--gutter) * 0.5);
}

.header-mobile-social-link {
  color: inherit;
}

.header-mobile-link {
  display: block;
}
</style>

<style>


.header.header-static {
  position: relative;
}

.header.header-fixed {
  /* position: sticky;
  top: 0; */
}

.header.header-sticky {
  position: sticky;
  top: 0;
}

.header.header-transition {
  transition: transform 0.3s ease;
}

.header.header-hidden {
  transform: translateY(-100%);
}
</style>
