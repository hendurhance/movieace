<template>
    <svg data-v-8fe8a053="" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line data-v-8fe8a053="" x1="18" y1="6" x2="6" y2="18"></line>
        <line data-v-8fe8a053="" x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'XIcon',
    props: {
        stroke: {
            type: String,
            default: 'currentColor'
        }
    }
})
</script>