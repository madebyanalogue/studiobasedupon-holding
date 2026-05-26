<template>
  <section class="spotify-player-section grid gap-30 pad-60 pad-top-bottom">
    <h2
      v-if="section.spotifyTitle || section.title"
      class="subtitle subtitle--circle red-dot"
    >
      {{ section.spotifyTitle || section.title }}
    </h2>

    <div class="spotify-player-wrapper rounded-medium">
      <iframe
        v-if="spotifyEmbedSrc"
        :src="spotifyEmbedSrc"
        title="Spotify player"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        class="spotify-player-embed"
      />
      <div v-else class="spotify-player-placeholder">
        Spotify player is ready. Add a Spotify embed URL or connect API data.
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const spotifyEmbedSrc = computed(() => {
  const raw = props.section?.spotifyEmbedUrl?.trim()
  if (!raw)
    return ''

  const iframeSrcMatch = raw.match(/src=["']([^"']+)["']/i)
  const parsed = (iframeSrcMatch?.[1] || raw).trim()

  // Only allow trusted Spotify embed URLs from pasted iframe or direct URL input.
  if (!parsed.startsWith('https://open.spotify.com/embed/'))
    return ''

  return parsed
})
</script>

<style scoped>
.spotify-player-section {
  width: 100%;
}

.spotify-player-wrapper {
  width: 100%;
  overflow: hidden;
}

.spotify-player-embed {
  display: block;
  width: 100%;
  min-height: 352px;
  border: 0;
}

.spotify-player-placeholder {
  width: 100%;
  min-height: 352px;
  padding: calc(var(--gutter) * 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--white);
}
</style>
