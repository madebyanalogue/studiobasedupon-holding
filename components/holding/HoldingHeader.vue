<template>
  <header data-holding-header>
    <div data-holding-header-start>
      <span data-holding-site-title>{{ siteTitle }}</span>
      <span data-holding-year>{{ year }}</span>
    </div>
    <div data-holding-header-end>
      <span data-holding-follow-label>Follow</span>
      <ul data-holding-social-links>
        <li v-for="link in socialLinks" :key="link._key || link.url">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            data-holding-social-link
          >
            {{ link.title }}
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup>
defineProps({
  siteTitle: {
    type: String,
    default: '',
  },
  year: {
    type: [String, Number],
    required: true,
  },
  socialLinks: {
    type: Array,
    default: () => [],
  },
})
</script>
