<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="8" y1="6" x2="21" y2="6" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="8" y1="12" x2="21" y2="12" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="8" y1="18" x2="21" y2="18" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="3" y1="6" x2="3.01" y2="6" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="3" y1="12" x2="3.01" y2="12" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="3" y1="18" x2="3.01" y2="18" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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