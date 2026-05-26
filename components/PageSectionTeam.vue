<template>
  <section ref="wrapRef" data-follower-wrap class="preview-container grid gap-40 pad-md-30 pad-top">

    <h2 v-if="section.title" class="subtitle subtitle--circle orange-dot">
      {{ section.title }}
    </h2>

    <div data-follower-collection class="preview-collection pad-md-10">
      <div class="preview-collection__list">
        <div class="preview-list">
          <div v-for="(member, index) in members" :key="member._key || index" data-follower-item class="team-member">
            <div class="team-member__inner">
              <div class="team-member__row">
                <div class="team-member__col is--large">
                  <h2 class="team-member__heading fluid-type line-height-1" style="--desktop: 76; --mobile: 24;">{{ member.name }}</h2>
                </div>
                <div class="team-member__col is--medium">
                  <p class="team-member__role fluid-type line-height-1" style="--desktop: 52; --mobile: 24;">{{ member.role }}</p>
                </div>
              </div>
              <div data-follower-visual class="team-member__visual">
                <NuxtImg
                  v-if="member?.image?.asset"
                  :src="getImageSrc(member.image.asset)"
                  :alt="member.name || ''"
                  class="team-member__visual-img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div data-follower-cursor class="preview-follower rounded-medium">
        <div data-follower-cursor-inner class="preview-follower__inner">
          <!-- <div class="preview-follower__label">
            <div class="preview-follower__label-span">View team</div>
          </div> -->
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const wrapRef = ref(null)
const { getImageSrc } = useSanityImage()
const members = computed(() => props.section?.teamMembers || [])

let cleanupFn = null

function initPreviewFollower(wrap) {
  const collection = wrap?.querySelector('[data-follower-collection]')
  const items = wrap?.querySelectorAll('[data-follower-item]') || []
  const follower = wrap?.querySelector('[data-follower-cursor]')
  const followerInner = wrap?.querySelector('[data-follower-cursor-inner]')

  if (!collection || !items.length || !follower || !followerInner) return () => {}

  let prevIndex = null
  let firstEntry = true
  const offset = 100
  const duration = 0.5
  const ease = 'power2.inOut'

  const itemListeners = []

  items.forEach((item, index) => {
    const onEnter = () => {
      const forward = prevIndex === null || index > prevIndex
      prevIndex = index

      follower.querySelectorAll('[data-follower-visual]').forEach((el) => {
        gsap.killTweensOf(el)
        gsap.to(el, {
          yPercent: forward ? -offset : offset,
          duration,
          ease,
          overwrite: 'auto',
          onComplete: () => el.remove(),
        })
      })

      const visual = item.querySelector('[data-follower-visual]')
      if (!visual) return

      const clone = visual.cloneNode(true)
      followerInner.appendChild(clone)

      if (!firstEntry) {
        gsap.fromTo(
          clone,
          { yPercent: forward ? offset : -offset },
          { yPercent: 0, duration, ease, overwrite: 'auto' },
        )
      } else {
        firstEntry = false
      }
    }

    item.addEventListener('mouseenter', onEnter)
    itemListeners.push(() => {
      item.removeEventListener('mouseenter', onEnter)
    })
  })

  return () => {
    itemListeners.forEach((off) => off())
  }
}

onMounted(() => {
  cleanupFn = initPreviewFollower(wrapRef.value)
})

onBeforeUnmount(() => {
  if (cleanupFn) cleanupFn()
})
</script>

<style scoped>
.preview-container {
  width: 100%;
}

.preview-collection {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: var(--gutter);
}

.preview-collection__list {
  flex: 1;
  min-width: 0;
}

.team-member__row {
  flex-flow: wrap;
  justify-content: flex-start;
  align-items: end;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.team-member__col {
  flex: 1;
}


.preview-container__label {
  color: #0a0a0a80;
  text-transform: uppercase;
  font-size: 0.75em;
}

.preview-list {
  flex-flow: column;
  width: 100%;
  display: flex;
  position: relative;
}

.team-member {
  width: 100%;
  transition: opacity 0.2s;
  cursor: pointer;
}

.team-member__heading {
  margin-top: 0;
  margin-bottom: 0;
  font-weight: 400;
  line-height: 1;
}

.team-member__role {
  margin-bottom: 0;
  font-weight: 400;
  line-height: 1.1;
}

.team-member__visual {
  aspect-ratio: 3 / 4;
  height: 100%;
  width:auto;
  background-color: var(--purple-tint-4);
  display: none;
  position: absolute;
  overflow: hidden;
}

/* Cloned nodes must show inside follower; :deep ensures clones keep display despite scoped .team-member__visual */
.preview-follower :deep([data-follower-visual]) {
  display: block !important;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.team-member__inner {
  border-bottom: 1px solid currentColor;
  width: 100%;
  padding-top: 2.2em;
  padding-bottom: 2.2em;
}

.team-member__visual-img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.preview-follower {
  z-index: 1;
  flex: 0 0 auto;
  aspect-ratio: 3 / 4;
  width: auto;
  height: 100%;
  pointer-events: none;
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
  overflow: hidden;
  align-self: flex-start;
}

.preview-follower__label {
  z-index: 2;
  position: absolute;
  opacity: 0;
  transform: translate(0, 100%);
  transition: opacity 0.1s ease, transform 0.6s cubic-bezier(0.65, 0.1, 0, 1);
}

.preview-follower__label-span {
  background-color: #fff;
  border-radius: 0.25em;
  padding: 0.75em 1.25em;
  font-size: 1em;
}

.preview-follower__inner {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: inherit;
}



@media (hover: hover) and (min-width: 992px) {
  /* Hover dimming scoped to .preview-container only */
  .preview-container:has([data-follower-collection]:hover) .preview-follower__label {
    opacity: 1;
    transform: translate(0, 0);
  }

  .preview-container:has(.team-member:hover) .team-member:not(:hover) {
    opacity: 0.3;
  }
}

@media screen and (max-width: 991px) {
  .preview-collection {
    flex-direction: column;
    gap: 0;
  }

  .team-member__row {
    grid-row-gap: 0.5em;
  }

  .team-member__row.tablet--hide {
    display: none;
  }

  .team-member__col.is--large {
    flex: none;
    order: -1;
    width: 100%;
    max-width: none;
  }

  .team-member__col.is--medium {
    order: -1;
    max-width: 100%;
  }

  .preview-list {
    grid-column-gap: 1em;
    grid-row-gap: 4em;
    flex-flow: wrap;
  }

  .team-member {
    width: calc(50% - 0.5em);
  }

  .team-member__heading {
    font-size: 2em;
  }

  .team-member__visual {
    border-radius: 0.75em;
    order: -1;
    width: 100%;
    margin-bottom: 1em;
    display: block;
    position: relative;
  }

  .team-member__inner {
    border: 1px #000;
    flex-flow: column;
    padding-top: 0;
    padding-bottom: 0;
    display: flex;
  }

  .preview-follower {
    display: none;
  }
}

@media screen and (max-width: 767px) {
  .preview-list {
    grid-row-gap: 3em;
  }

  .team-member {
    width: 100%;
  }
}
</style>
