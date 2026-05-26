<template>
  <footer data-holding-footer>
    <span data-holding-footer-title>{{ siteTitle }}</span>

    <div v-if="contactItems.length" data-holding-footer-contact>
      <div
        v-for="row in contactItems"
        :key="row._key || row.title"
        data-holding-footer-contact-item
      >
        <span data-holding-footer-contact-label>{{ row.title }}</span>
        <a
          v-if="contactLinkUsesNative(getContactLinkUrl(row))"
          :href="getContactLinkUrl(row)"
          :target="isExternalHttp(getContactLinkUrl(row)) ? '_blank' : undefined"
          :rel="isExternalHttp(getContactLinkUrl(row)) ? 'noopener noreferrer' : undefined"
          data-holding-footer-contact-link
        >
          {{ row.linkText }}
        </a>
        <NuxtLink
          v-else
          :to="getContactLinkUrl(row)"
          data-holding-footer-contact-link
        >
          {{ row.linkText }}
        </NuxtLink>
      </div>
    </div>

    <div
      v-if="description?.length"
      data-holding-footer-description
      class="underline-links"
    >
      <SanityBlocks :blocks="description" />
    </div>

    <div
      v-if="legal?.length"
      data-holding-footer-legal
      class="underline-links"
    >
      <SanityBlocks :blocks="legal" />
    </div>

    <div data-holding-footer-social>
      <span data-holding-follow-label>Follow</span>
      <HoldingSocialLinks :social-links="socialLinks" />
    </div>
  </footer>
</template>

<script setup>
import { useContactLink } from '~/composables/useContactLink'

defineProps({
  siteTitle: {
    type: String,
    default: '',
  },
  description: {
    type: Array,
    default: () => [],
  },
  legal: {
    type: Array,
    default: () => [],
  },
  contactItems: {
    type: Array,
    default: () => [],
  },
  socialLinks: {
    type: Array,
    default: () => [],
  },
})

const { getContactLinkUrl, contactLinkUsesNative, isExternalHttp } = useContactLink()
</script>
