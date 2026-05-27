<template>
  <footer data-holding-footer class="footer">
    <div class="wrapper">
      <div class="footer-content">
        <div data-holding-footer-title class="mono red-text">{{ siteTitle }}</div>
      

       

        <div v-if="contactItems.length || description?.length" data-holding-footer-contact class="grid gap-20 mono">

          <div
              v-if="description?.length"
              data-holding-footer-description
              class="red-link"
            >
              <SanityBlocks :blocks="description" />
          </div>
          <div v-if="contactItems.length" class="flex gap-20">
            <div
              v-for="row in contactItems"
              :key="row._key || row.linkText"
              data-holding-footer-contact-item
              class="underline-links"
            >
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
        </div>

        <div
          v-if="legal?.length"
          data-holding-footer-legal
          class="underline-links grid gap-20 mono"
        >
          <div class="hr"></div>
          <SanityBlocks :blocks="legal" />
          <div class="hr"></div>
        </div>

        <div class="">
             <HoldingSocialLinks :social-links="socialLinks" />
        </div>
        
      </div>
    </div>
    <div
      v-if="subfooterContent?.length"
      class="subfooter mono black white-text pad-10 pad-top-bottom"
      data-holding-subfooter
    >
      <div class="wrapper underline-links">
        <SanityBlocks :blocks="subfooterContent" />
      </div>
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
  subfooterContent: {
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

<style scoped>
.footer {
  display: grid;
  gap:40px;
}
.footer-content {
  padding: 100px 0px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}
@media all and (min-width: 700px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
@media all and (min-width: 1000px) {
  .footer-content {
    grid-template-columns: 2fr 4fr 4fr 2fr;
  }
}

</style>