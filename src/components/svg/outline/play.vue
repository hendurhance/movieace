<template>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 5v14l11-7z" :fill="fill" />
    </svg>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    props: {
        fill: {
            type: String,
            default: 'currentColor'
        }
    }
})
</script>