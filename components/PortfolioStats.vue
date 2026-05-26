<template>
  <div
    v-if="hasRows"
    class="portfolio-stats"
    :class="rootClass"
  >
    <template
      v-for="(row, si) in stats"
      :key="row._key || si"
    >
      <div
        v-if="row.label || row.value"
        class="portfolio-stats__row gap-20"
      >
        <div
          v-if="row.value"
          class="portfolio-stats__dd"
        >
          <span
            class="portfolio-stats__lozenge white orange-text rounded-small fluid-type mono"
            style="--desktop: 24"
          >
            <svg
              v-if="row.icon === 'arrowUp'"
              class="portfolio-stats__arrow"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M0 8.98305L1.52649 10.5663L7.57831 4.30064V17.9661H9.74354V4.30064L15.7845 10.5775L17.3218 8.98305L8.66092 0L0 8.98305Z"
                fill="currentColor"
              />
            </svg>
            <span class="portfolio-stats__value-text">{{ row.value }}</span>
          </span>
        </div>
        <div
          v-if="row.label"
          class="fluid-type portfolio-stats__label"
          style="--desktop: 28"
        >
          {{ row.label }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Array,
    default: () => [],
  },
  /** Extra classes on the wrapper (e.g. overlay layout + gap utilities) */
  rootClass: {
    type: String,
    default: '',
  },
})

const hasRows = computed(() =>
  (props.stats || []).some((row) => row?.label || row?.value),
)
</script>

<style scoped>
.portfolio-stats {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  margin: 0;
}

.portfolio-stats__row {
  display: flex;
  flex-direction: column;
}

.portfolio-stats__dd {
  margin: 0;
  display: flex;
}

.portfolio-stats__lozenge {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--gutter) * 0.25);
  padding: 0.3em 0.65em;
  border-radius: 0.5em;
}

.portfolio-stats__arrow {
  flex-shrink: 0;
  display: block;
  width: 0.7em;
  height: 0.7em;
  color: inherit;
}

.portfolio-stats__value-text {
  line-height: 1.1;
}

.portfolio-stats__label {
  line-height: 1.1;
}
</style>
