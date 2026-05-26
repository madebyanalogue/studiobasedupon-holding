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

    <p v-if="description" data-holding-footer-description>{{ description }}</p>

    <div data-holding-footer-social>
      <span data-holding-follow-label>Follow</span>
      <ul data-holding-social-links>
        <li v-for="link in socialLinks" :key="link._key || link.url">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            data-holding-social-link
          >
            {{ link.title }}
          </a>
        </li>
      </ul>
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
    type: String,
    default: '',
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
