<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="7 10 12 15 17 10" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="12" y1="15" x2="12" y2="3" :stroke="stroke" stroke-width="2" stroke-linecap="round"/>
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
