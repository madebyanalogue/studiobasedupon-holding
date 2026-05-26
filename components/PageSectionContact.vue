<template>
  <section class="contact-section grid gap-30">

    <div class="contact-section__panels">
      <div
        class="contact-section__panel  contact-section__panel--left rounded-medium pad-50 pad-md-50 grid gap-120 gap-md-80"
        :style="{ backgroundColor: leftBackgroundColour }"
      >
          <h2
            v-if="displayTitle"
            class="contact-section__title fluid-type line-height-1"
            style="--desktop: 72; --mobile: 40;"
          >
            {{ displayTitle }}
          </h2>

          <div class="grid gap-30" v-if="videoUrl">
            <p
              v-if="section.contactVideoSubtitle"
              class="contact-section__video-subtitle subtitle subtitle--circle"
              :style="{ '--subtitle-dot-color': dotColour }"
            >
              {{ section.contactVideoSubtitle }}
            </p>

            <div
              v-if="videoUrl"
              class="contact-section__video rounded-medium"
              :class="videoAspectClass"
            >
              <PlyrPlayer
                type="html5"
                :src="videoUrl"
              />
            </div>
          </div>
      </div>

      <div
        class="contact-section__panel contact-section__panel--right rounded-medium pad-50 pad-md-50 grid gap-120 gap-md-80"
        :style="{ backgroundColor: rightBackgroundColour }"
      >
        <h3
          v-if="section.contactRightTitle"
          class="contact-section__right-title fluid-type line-height-1"
          style="--desktop: 72; --mobile: 40;"
        >
          {{ section.contactRightTitle }}
        </h3>

        <div v-if="contacts.length" class="contact-information-list grid gap-50">
          <div
            v-for="row in contacts"
            :key="row._key"
            class="contact-information-item gap-20"
          >
            <div
              class="contact-information-item-title subtitle subtitle--circle"
              :style="dotColour ? { '--subtitle-dot-color': dotColour } : undefined"
            >
              {{ row.title }}
            </div>
            <div class="contact-information-link-wrap">
              <a
                v-if="contactLinkUsesNative(getContactLinkUrl(row))"
                :href="getContactLinkUrl(row)"
                :target="isExternalHttp(getContactLinkUrl(row)) ? '_blank' : undefined"
                :rel="isExternalHttp(getContactLinkUrl(row)) ? 'noopener' : undefined"
                class="contact-information-link fluid-type line-height-1"
                style="--desktop: 54; --mobile: 24;"
              >{{ row.linkText }}</a>
              <NuxtLink
                v-else
                :to="getContactLinkUrl(row)"
                class="contact-information-link fluid-type line-height-1"
                style="--desktop: 54; --mobile: 24;"
              >
                {{ row.linkText }}
              </NuxtLink>
            </div>
          </div>
        </div>
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

const displayTitle = computed(
  () => props.section.contactTitle || props.section.title || '',
)

const contacts = computed(() => props.section.contactInformation || [])

const leftBackgroundColour = computed(
  () => props.section.contactLeftBackgroundColour || 'var(--pink)',
)

const rightBackgroundColour = computed(
  () => props.section.contactRightBackgroundColour || 'var(--pink-tint-4)',
)

const dotColour = computed(
  () => props.section.contactDotColour || 'var(--orange)',
)

const videoUrl = computed(() => props.section.contactVideo?.asset?.url || '')

const videoAspectClass = computed(() => {
  const ratio = props.section.contactVideoAspectRatio
  return ratio === 'portrait' ? 'portrait' : ratio === 'landscape' ? 'landscape' : ''
})

const { contactLinkUsesNative, isExternalHttp, getContactLinkUrl } = useContactLink()
</script>

<style scoped>
.contact-section__panels {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gutter);
  min-height:calc(100dvh - var(--header-height) - calc(var(--gutter) * 3));
}
@media (min-width: 800px) {
  .contact-section__panels {
    grid-template-columns: 1fr 1fr;
  }
}
.contact-information-list {
  padding-bottom: calc(var(--unit) * 15);
}

.contact-section__panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  justify-content: space-between;
}

.contact-section__video {
  position: relative;
  width: 100%;
  aspect-ratio:auto;
  overflow: hidden;
  background-color: var(--black);
max-height: 100cqw;
}
.contact-section__video.landscape {
  aspect-ratio: 16 / 9;
}
.contact-section__video.portrait {
  aspect-ratio: 9 / 16;
  width: clamp(300px, 44%, 600px);
}

.contact-section__title,
.contact-section__right-title,
.contact-section__video-subtitle {
  margin: 0;
}

.contact-section__title,
.contact-section__right-title {
  white-space: pre-line;
}


.contact-information-item {
  display: flex;
  flex-direction: column;
}

.contact-information-link {
  position: relative;
  display: inline-block;
  color: inherit;
  text-decoration: none;
}

.contact-information-link::before,
.contact-information-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: var(--underline-offset);
  width: 100%;
  height: var(--underline-width);
  background-color: currentColor;
  transform-origin: left center;
  pointer-events: none;
}

.contact-information-link::before {
  opacity: 0.2;
  transform: scaleX(1);
}

.contact-information-link::after {
  opacity: 1;
  transform: scaleX(0);
  transition: transform 0.32s ease;
}

.contact-information-link:hover::after,
.contact-information-link:focus-visible::after {
  transform: scaleX(1);
}

.subtitle {
 padding-left: 0;
}
</style>
