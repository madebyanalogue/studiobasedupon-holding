<template>
  <header data-holding-header class="mono">
    <div data-holding-header-start class="header-title">
      <div data-holding-site-title class="red-text">{{ siteTitle }}</div>
      
      <div v-if="copyright" class="header-copyright">
        {{ copyright }}
      </div>
    </div>
    <div data-holding-header-end class="show-sm">
      <HoldingSocialLinks :social-links="socialLinks" />
    </div>
  </header>
</template>

<script setup>
import { useSiteSettings } from '~/composables/useSiteSettings'

defineProps({
  siteTitle: {
    type: String,
    default: '',
  },
  socialLinks: {
    type: Array,
    default: () => [],
  },
})

const { copyright } = useSiteSettings()
</script>
<style scoped>
header {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  padding-right: calc(var(--gutter) * .5);
}
@media all and (max-width: 699px) {
.header-title {
  width:100%;
  justify-content: space-between;
}
}
@media all and (min-width: 700px) {
  header {
    padding: calc(var(--gutter) * .5) var(--gutter);
  }
}

.header-title {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
}
</style>