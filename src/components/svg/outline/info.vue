<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" :stroke="stroke" stroke-width="2"/>
    <line x1="12" y1="8" x2="12" y2="12" :stroke="stroke" stroke-width="2" stroke-linecap="round"/>
    <line x1="12" y1="16" x2="12.01" y2="16" :stroke="stroke" stroke-width="2" stroke-linecap="round"/>
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
