<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" :stroke="stroke" stroke-width="2" />
    <path d="M21 21l-4.35-4.35" :stroke="stroke" stroke-width="2" />
    <line x1="11" y1="8" x2="11" y2="14" :stroke="stroke" stroke-width="2" />
    <line x1="8" y1="11" x2="14" y2="11" :stroke="stroke" stroke-width="2" />
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
