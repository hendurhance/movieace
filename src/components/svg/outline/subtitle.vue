<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="16 3 21 3 21 8 16 8 16 3" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="8 3 3 3 3 8 8 8 8 3" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="3 21 3 16 8 16 8 21 3 21" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="21 16 16 16 16 21 21 21 21 16" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="12" y1="8" x2="12" y2="16" :stroke="stroke" stroke-width="2" stroke-linecap="round"/>
    <line x1="8" y1="12" x2="16" y2="12" :stroke="stroke" stroke-width="2" stroke-linecap="round"/>
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
