<template>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 16L14 12L10 8" :stroke="stroke" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    props: {
        stroke: {
            type: String,
            default: '#fff'
        }
    }
})
</script>