<template>
  <div
    v-if="hasRows"
    class="portfolio-stats"
    :class="rootClass"
  >
    <table class="portfolio-stats__table">
      <tbody>
        <tr
          v-for="(row, si) in rows"
          :key="row._key || si"
          class="portfolio-stats__row"
        >
          <td class="portfolio-stats__dd">
            <span
              v-if="row.value"
              class="portfolio-stats__lozenge orange white-text rounded-small fluid-type mono"
              style="--desktop: 16;--mobile: 12;"
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
          </td>
          <td
            class="portfolio-stats__label fluid-type"
            style="--desktop: 28;--mobile: 18;"
          >
            {{ row.label }}
          </td>
        </tr>
      </tbody>
    </table>
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

const rows = computed(() =>
  (props.stats || []).filter((row) => row?.label || row?.value),
)
</script>

<style scoped>
.portfolio-stats {
  display: block;
}

.portfolio-stats__table {
  border-collapse: separate;
  border-spacing: 0 calc(var(--unit) * 15);
}

.portfolio-stats__dd {
  white-space: nowrap;
  vertical-align: middle;
  padding: 0;
  padding-right: calc(var(--unit) * 22);
}

.portfolio-stats__lozenge {
  display: flex;
  align-items: center;
  gap: calc(var(--gutter) * 0.25);
  padding: 0.4em 0.8em;
  border-radius: .6em;
  text-align: center;
  justify-content: center;
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
  vertical-align: middle;
  padding: 0;
}
</style>
