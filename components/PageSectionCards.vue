<template>
  <section
    v-if="useGridMode"
    class="cards-section grid gap-30"
  >

    
    <h2 v-if="cardsSectionTitle" class="subtitle subtitle--circle purple-dot">
      {{ cardsSectionTitle }}
    </h2>

    <div class="cards-section--grid-mode">
      <article
        v-for="(card, index) in section.cards || []"
        :key="card._key || index"
        class="cards-section__item pad-25 rounded-medium"
      >
        <div class="cards-section__grid pad-20 pad-md-60 pad-bottom">

          <div class="cards-section__media">
            <video
              v-if="card.mediaType === 'video' && card.video?.asset?.url"
              autoplay
              muted
              loop
              playsinline
              class="cards-section__video"
            >
              <source
                :src="card.video.asset.url"
                :type="videoMimeTypeFromUrl(card.video.asset.url)"
              >
            </video>

            <NuxtImg
              v-else-if="card.image?.asset?.url"
              :src="card.image.asset.url"
              :alt="card.title || ''"
              :width="card.image.asset.metadata?.dimensions?.width"
              :height="card.image.asset.metadata?.dimensions?.height"
              class="cards-section__image"
            />
          </div>
          
          <div class="cards-section__text">
            <h3 v-if="card.title" class="cards-section__title fluid-type pad-60 pad-right" style="--desktop: 58; --mobile: 24;">{{ card.title }}</h3>
            <div class="fluid-type" style="--desktop: 30; --mobile: 16;">
              <SanityBlocks
                v-if="card.description?.length"
                :blocks="card.description"
              />
            </div>
          </div>
        </div>
      </article>
    </div>

  </section>

  <section
    v-else
    class="cards-section cards-section--stack-mode grid gap-50 pad-30 pad-top"
  >
    <h2 v-if="cardsSectionTitle" class="subtitle subtitle--circle purple-dot">
      {{ cardsSectionTitle }}
    </h2>

    <div class="cards-section__container">
      <article
        v-for="(card, index) in section.cards || []"
        :key="card._key || index"
        class="cards-section__item rounded-medium pad-20 pad-sm-50"
      >
        <div class="cards-section__grid">
          <div class="cards-section__media">
            <video
              v-if="card.mediaType === 'video' && card.video?.asset?.url"
              autoplay
              muted
              loop
              playsinline
              class="cards-section__video"
            >
              <source
                :src="card.video.asset.url"
                :type="videoMimeTypeFromUrl(card.video.asset.url)"
              >
            </video>
            <NuxtImg
              v-else-if="card.image?.asset?.url"
              :src="card.image.asset.url"
              :alt="card.title || ''"
              :width="card.image.asset.metadata?.dimensions?.width"
              :height="card.image.asset.metadata?.dimensions?.height"
              class="cards-section__image"
            />
          </div>
          <div class="cards-section__text">
            <div class="grid gap-30 pad-md-50 pad-right">
              <h3 v-if="card.title" class="cards-section__title fluid-type line-height-1 pad-60 pad-right" style="--desktop: 56; --mobile: 24;">{{ card.title }}</h3>
              <div class="fluid-type" style="--desktop: 40; --mobile: 16;">
                <SanityBlocks
                  v-if="card.description?.length"
                  :blocks="card.description"
                />
              </div>
            </div>
          </div>
        </div>
      </article>
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

const useGridMode = computed(() => props.section?.cardsDisableScrollDemo === true)
const cardsSectionTitle = computed(() =>
  props.section?.cardsSectionTitle || props.section?.cardsTitle || props.section?.title || '',
)

function videoMimeTypeFromUrl(url) {
  if (!url || typeof url !== 'string') return 'video/mp4'
  const lower = url.toLowerCase()
  if (lower.endsWith('.webm')) return 'video/webm'
  if (lower.endsWith('.ogg') || lower.endsWith('.ogv')) return 'video/ogg'
  return 'video/mp4'
}
</script>

<style scoped>




@media all and (min-width: 1000px) {
  .cards-section__item {
    display: flex;
    flex-direction: row;
    gap: var(--gutter);
  }
}
.cards-section__item:nth-child(2) {
  background-color: var(--purple-tint-1);
}
.cards-section__item:nth-child(3) {
  background-color: var(--purple-tint-2);
}
.cards-section__item:nth-child(4) {
  background-color: var(--purple-tint-3);
}
.cards-section__item:nth-child(5) {
  background-color: var(--purple-tint-4);
}



/*================= STACK MODE =================*/

.cards-section--stack-mode .cards-section__container {
  display: flex;
  flex-direction: column;
  gap: var(--gutter);
  align-items: center;
  width: 100%;
}



.cards-section__image,
.cards-section__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cards-section--stack-mode .cards-section__item {
  width: 100%;
}
.cards-section--stack-mode .cards-section__grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-areas: "media text";
}

.cards-section--stack-mode .cards-section__text {
  grid-area: text;
}
.cards-section--stack-mode .cards-section__media {
  grid-area: media;
}

.cards-section--stack-mode .cards-section__item:nth-child(4n - 1) {
  background-color: var(--purple);
}
.cards-section--stack-mode .cards-section__item:nth-child(4n - 2) {
  background-color: var(--purple-tint-2);
}
.cards-section--stack-mode .cards-section__item:nth-child(4n - 3) {
  background-color: var(--purple-tint-3);
}
.cards-section--stack-mode .cards-section__item:nth-child(4n - 4) {
  background-color: var(--purple-tint-4);
}

.cards-section--stack-mode .cards-section__media {
  aspect-ratio: .95;
  border-radius: calc(var(--unit) * 80) calc(var(--unit) * 20) calc(var(--unit) * 20) calc(var(--unit) * 80);
  overflow: hidden;
}

@media all and (min-width: 1000px) {
  .cards-section--stack-mode .cards-section__container {
    padding: var(--gutter);
    margin-top: calc(var(--unit) * 220);
    position: relative;
    z-index: 0;
  }

  .cards-section--stack-mode .cards-section__media {
    aspect-ratio: 1.4;
  }

  .cards-section--stack-mode .cards-section__grid {
    grid-template-areas: "text media";
  }

  .cards-section--stack-mode .cards-section__item:not(:first-child) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .cards-section--stack-mode .cards-section__item:nth-child(2) {
    top: calc(var(--unit) * -90);
    z-index: -1;
    transform: scale(.875);
    transform-origin: center top;
  }

  .cards-section--stack-mode .cards-section__item:nth-child(3) {
    top: calc(var(--unit) * -220);
    z-index: -2;
    transform: scale(.8);
    transform-origin: center top;
  }
}

.cards-section__title {
  line-height: 1.15;
}


/*================= GRID MODE =================*/

.cards-section--grid-mode .cards-section__item {
  width: 100%;
  background-color: var(--purple);
}

.cards-section--grid-mode .cards-section__text,
.cards-section--grid-mode .cards-section__media {
  grid-column: 1 / -1;
}

.cards-section--grid-mode {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--gutter);
}

.cards-section--grid-mode .cards-section__grid {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) * 1.4);
  align-items: start;
}

.cards-section--grid-mode .cards-section__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gutter);
}

.cards-section--grid-mode .cards-section__title {
  margin-top: 0;
}

.cards-section--grid-mode .cards-section__media {
  width: 100%;
  aspect-ratio: var(--aspect-ratio);
  overflow: hidden;
}
.cards-section--grid-mode .cards-section__media {
  aspect-ratio: 1.4;
}
.cards-section--grid-mode .cards-section__item:nth-child(3n - 2) .cards-section__media {
  border-radius: calc(var(--unit) * 50) calc(var(--unit) * 20) calc(var(--unit) * 20) calc(var(--unit) * 50);
}
.cards-section--grid-mode .cards-section__item:nth-child(3n - 1) .cards-section__media {
  border-radius: calc(var(--unit) * 20) calc(var(--unit) * 20) calc(var(--unit) * 20) calc(var(--unit) * 20);
}
.cards-section--grid-mode .cards-section__item:nth-child(3n - 0) .cards-section__media {
  border-radius: calc(var(--unit) * 20) calc(var(--unit) * 50) calc(var(--unit) * 50) calc(var(--unit) * 20);
}

@media all and (min-width: 1000px) {
  .cards-section--grid-mode .cards-section__media {
    aspect-ratio: .95;
  }
}

@media (max-width: 999px) {
  .cards-section--grid-mode {
    grid-template-columns: 1fr;
   gap: var(--gutter);
  }

  .cards-section--grid-mode .cards-section__grid {
    grid-template-columns: 1fr;
  }

  .cards-section--grid-mode .cards-section__text,
  .cards-section--grid-mode .cards-section__media {
    grid-column: 1 / -1;
  }
}

</style>
