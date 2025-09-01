<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 12l2 2 4-4"></path>
    <path d="M21 12c-1.4 0-4-1.8-4-6 0-1.5.7-4 2-4s2 2.5 2 4c0 4.2-2.6 6-4 6"></path>
    <path d="M15 12H3a1 1 0 0 0-1 1v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a1 1 0 0 0-1-1H9"></path>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    stroke: {
      type: String,
      default: 'currentColor'
    }
  }
})
</script>
