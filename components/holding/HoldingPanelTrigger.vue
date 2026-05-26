<template>
  <div class="home--updates-trigger-container">
    <button
      type="button"
      class="home--updates-trigger"
      :data-holding-panel-trigger="trigger"
      @click="$emit('click')"
    >
      {{ label }}
    </button>

    <div class="progressive-blur">
      <div class="progressive-blur__layer is--1" />
      <div class="progressive-blur__layer is--2" />
      <div class="progressive-blur__layer is--3" />
      <div class="progressive-blur__layer is--4" />
      <div class="progressive-blur__layer is--5" />
      <div class="progressive-blur__backdrop" />
    </div>

    <div class="progressive-blur top">
      <div class="progressive-blur__layer is--1" />
      <div class="progressive-blur__layer is--2" />
      <div class="progressive-blur__layer is--3" />
      <div class="progressive-blur__layer is--4" />
      <div class="progressive-blur__layer is--5" />
      <div class="progressive-blur__backdrop" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  trigger: {
    type: String,
    default: 'updates',
  },
})

defineEmits(['click'])
</script>
