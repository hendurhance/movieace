<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" :stroke="stroke" stroke-width="2" fill="none"/>
    <line x1="8" y1="21" x2="16" y2="21" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="12" y1="17" x2="12" y2="21" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="2" y1="9" x2="22" y2="9" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="2" y1="11" x2="22" y2="11" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="6" cy="6" r="1" :fill="stroke"/>
    <circle cx="10" cy="6" r="1" :fill="stroke"/>
    <circle cx="14" cy="6" r="1" :fill="stroke"/>
    <circle cx="18" cy="6" r="1" :fill="stroke"/>
    <circle cx="6" cy="14" r="1" :fill="stroke"/>
    <circle cx="10" cy="14" r="1" :fill="stroke"/>
    <circle cx="14" cy="14" r="1" :fill="stroke"/>
    <circle cx="18" cy="14" r="1" :fill="stroke"/>
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