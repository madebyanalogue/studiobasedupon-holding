<template>
  <div
    class="plyr-player-wrap"
    :class="{ 'plyr-player-wrap--ready': isReady }"
  >
    <video
      v-if="type === 'html5'"
      ref="mediaEl"
      class="plyr-player-video"
      :src="src"
      playsinline
    />
    <div
      v-else-if="type === 'vimeo' && vimeoId"
      ref="mediaEl"
      class="plyr-player-vimeo"
      data-plyr-provider="vimeo"
      :data-plyr-embed-id="vimeoId"
    />
  </div>
</template>

<script setup>
import 'plyr/css'

const props = defineProps({
  /** html5 = uploaded file / mp4 URL; vimeo = numeric embed id */
  type: {
    type: String,
    required: true,
    validator: (v) => v === 'html5' || v === 'vimeo',
  },
  src: {
    type: String,
    default: '',
  },
  vimeoId: {
    type: String,
    default: '',
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
  muted: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['ready'])

const mediaEl = ref(null)
const isReady = ref(false)
let player = null

const plyrControls = [
  'play-large',
  'play',
  'progress',
  'current-time',
  'duration',
  'mute',
  'volume',
  'fullscreen',
]

async function setupPlyr() {
  if (import.meta.server) return
  isReady.value = false
  await nextTick()
  const el = mediaEl.value
  if (!el) return

  if (props.type === 'html5' && !props.src) return
  if (props.type === 'vimeo' && !props.vimeoId) return

  const { default: Plyr } = await import('plyr')

  player?.destroy()
  player = null

  player = new Plyr(el, {
    controls: plyrControls,
    ratio: '16:9',
    autoplay: props.autoplay,
    muted: props.muted,
    fullscreen: { enabled: true, iosNative: true },
    vimeo: {
      byline: false,
      portrait: false,
      title: false,
      speed: true,
      transparent: false,
    },
  })

  player.on('ready', () => {
    isReady.value = true
    if (props.autoplay) {
      player.muted = props.muted
      if (!props.muted) {
        player.volume = 1
      }
      player.play().catch(() => {})
    }
    emit('ready')
  })
}

function teardown() {
  player?.destroy()
  player = null
  isReady.value = false
}

watch(
  () => [props.type, props.src, props.vimeoId, props.autoplay, props.muted],
  () => {
    setupPlyr()
  },
  { flush: 'post' },
)

onMounted(() => {
  setupPlyr()
})

onBeforeUnmount(() => {
  teardown()
})
</script>

<style scoped>
.plyr-player-wrap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.4s ease-in;
}

.plyr-player-wrap--ready {
  opacity: 1;
}

.plyr-player-wrap :deep(.plyr) {
  width: 100%;
  height: 100%;
}

.plyr-player-wrap :deep(.plyr__video-wrapper) {
  height: 100%;
}

.plyr-player-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plyr-player-vimeo {
  width: 100%;
  height: 100%;
  min-height: 180px;
}
</style>
