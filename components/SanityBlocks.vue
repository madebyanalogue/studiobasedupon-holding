<template>
  <div class="sanity-blocks">
    <template v-for="(block, index) in blocks" :key="block._key || index">
      <SanityBlock v-if="block._type === 'block'" :block="block" />
      <NuxtImg
        v-else-if="block._type === 'image' && block.asset"
        :src="block.asset.url || block.asset._id || block.asset._ref || ''"
        :alt="block.alt || ''"
        class="sanity-image"
      />
    </template>
  </div>
</template>

<script setup>
defineProps({
  blocks: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.sanity-blocks {
}

/* Soft line breaks (e.g. Shift+Enter in Sanity) are stored as \n in span text */
.sanity-blocks :deep(.sanity-block) {
  white-space: pre-line;
}

.sanity-blocks p {
  margin-bottom: calc(var(--gutter) / 2);
}

.sanity-blocks p:last-child {
  margin-bottom: 0;
}

.sanity-image {
  width: 100%;
  height: auto;
  margin: var(--gutter) 0;
}
</style>

