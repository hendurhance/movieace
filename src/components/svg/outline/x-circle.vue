<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" :stroke="stroke" stroke-width="2"/>
    <line x1="15" y1="9" x2="9" y2="15" :stroke="stroke" stroke-width="2" stroke-linecap="round"/>
    <line x1="9" y1="9" x2="15" y2="15" :stroke="stroke" stroke-width="2" stroke-linecap="round"/>
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
