<template>
  <header data-holding-header class="mono">
    <div data-holding-header-start class="header-title">
      <div data-holding-site-title class="red-text">{{ siteTitle }}</div>
      
      <div v-if="copyright" class="header-copyright">
        {{ copyright }}
      </div>
    </div>
    <div data-holding-header-end class="header-social-links">
      <span data-holding-follow-label>Follow</span>
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
  padding: var(--gutter);
  padding-left: calc(var(--gutter) * 1.5);
}
.header-title, .header-social-links {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
}
.header-social-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
}
.header-social-links ul li {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}
.header-social-links:deep(a) {
  display: block;
  width: var(--icon-size);
  height: var(--icon-size);
  background: red;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-social-links:deep(img) {
  display: block;
}
</style>