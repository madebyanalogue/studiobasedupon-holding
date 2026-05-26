<template>
  <div class="logo">
    <div
      v-if="logoSvgHtml && svgMounted"
      class="logo-svg"
      v-html="logoSvgHtml"
    />
    <span v-else>Based Upon</span>
  </div>
</template>

<script setup>
import { useSiteSettings } from '~/composables/useSiteSettings'

const { logo } = useSiteSettings()

const SVG_TAG_RE = /<\s*svg[\s>]/i

const logoSvgHtml = computed(() => {
  const raw = logo.value
  if (typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  return SVG_TAG_RE.test(trimmed) ? trimmed : ''
})

/** Defer v-html SVG until after mount so SSR and first client paint match (text fallback). */
const svgMounted = ref(false)
onMounted(() => {
  if (logoSvgHtml.value) svgMounted.value = true
})
</script>

