<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="7" width="20" height="10" rx="2" ry="2" :stroke="stroke" stroke-width="2" fill="none"/>
    <line x1="12" y1="17" x2="12" y2="20" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="8" y1="21" x2="16" y2="21" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="m7" y1="7" x2="10" y2="4" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="m17" y1="7" x2="14" y2="4" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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