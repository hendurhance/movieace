<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 19l-7-7 7-7" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
