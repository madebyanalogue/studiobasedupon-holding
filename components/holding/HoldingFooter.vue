<template>
  <footer data-holding-footer class="footer">
    <div class="wrapper">
      <div class="footer-content">
        <div data-holding-footer-title class="mono red-text">{{ siteTitle }}</div>
      

       

        <div v-if="contactItems.length || description?.length" data-holding-footer-contact class="grid gap-20 mono">

          <div
              v-if="description?.length"
              data-holding-footer-description
              class="red-link footer-description"
            >
            <svg id="a" data-name="Layer 1" class="footer-description-icon" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 230.18 292.82">
              <g id="b" data-name="0qtApq">
                <path d="M115.11,292.82L30.76,194.16C-12.35,146.03-10.25,73.38,37.7,29.84c43.81-39.78,110.96-39.78,154.78,0,47.96,43.54,50.05,116.2,6.94,164.33l-84.31,98.66ZM110.54,64.08c-26.59,2.56-44.98,26.03-42.55,51.61,2.49,26.21,25.75,45.22,51.9,42.6,25.76-2.58,44.6-25.49,42.33-51.31-2.27-25.81-25.02-45.47-51.69-42.9Z"/>
              </g>
            </svg>
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
      class="subfooter mono pad-30 pad-top-bottom"
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
  gap: 60px;
}
.subfooter {
    opacity: 0;
    pointer-events: none;
  }
@media all and (min-width: 700px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
@media all and (min-width: 1000px) {
  .footer-content {
    grid-template-columns: 2fr 4fr 4fr 2fr;
    gap: 40px;
  }
  .subfooter {
    text-align: right;
    opacity: 1;
    pointer-events: auto;
  }
}

.footer-description {
  display: grid;
  gap: 20px;
  grid-template-columns: auto 1fr;
}

.footer-description-icon {
  width: calc(var(--icon-size) * .8);
  height: calc(var(--icon-size) * .8);
}
.footer-description-icon > * {
  fill: rgb(var(--red));
}



</style>