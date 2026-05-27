<template>
  <footer class="footer orange white-text rounded-medium pad-50 grid grid-1 gap-65">
    <!-- <div class="pad-1 border-bottom">
      <button class="footer-back-to-top" @click="scrollToTop" aria-label="Back to top"><span><div class="arrow-up"></div></span></button>
    </div> -->
    <div>
      <Logo />
    </div>
    <div class="show-sm" />

    <div
      v-if="visibleFooterColumns.length > 0"
      class="flex footer-nav-container column row-md between-xs gap-50 gap-md-30 fluid-type bold line-height-1"
      style="--desktop:40;--tablet:26;--mobile:26;"
    >
      <div
        v-for="col in visibleFooterColumns"
        :key="col._key"
        class="footer-column underline-links"
      >
        <SanityBlocks :blocks="col.content" />
      </div>
    </div>


    <div class="flex between-xs bottom-xs reverse-md gap-60">

      <div
        v-if="footerCallToAction.length > 0"
        class="fluid-type underline-links footer-cta"
        style="--desktop:40;--mobile:26;"
      >
        <SanityBlocks :blocks="footerCallToAction" />
      </div>

      <div class="fluid-type" style="--desktop:40;--mobile:16;">
        {{ copyright }}
      </div>

    </div>

  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'
import SanityBlocks from '~/components/SanityBlocks.vue'

const { footerColumns, footerCallToAction, copyright } = useSiteSettings()

const visibleFooterColumns = computed(() =>
  footerColumns.value.filter((col) => col.content?.length > 0),
)

const scrollToTop = () => {
  if (process.client) {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  }
}
</script>

<style scoped>
.footer-cta :deep(.sanity-blocks p) {
  margin-bottom: 0;
}

.footer-column :deep(.sanity-blocks p:last-child) {
  margin-bottom: 0;
}

@media (min-width: 800px) and (max-width: 999px) {
  .footer-nav-container {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

