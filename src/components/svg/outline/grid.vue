<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" :stroke="stroke" stroke-width="2" fill="none" />
    <rect x="14" y="3" width="7" height="7" :stroke="stroke" stroke-width="2" fill="none" />
    <rect x="3" y="14" width="7" height="7" :stroke="stroke" stroke-width="2" fill="none" />
    <rect x="14" y="14" width="7" height="7" :stroke="stroke" stroke-width="2" fill="none" />
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
