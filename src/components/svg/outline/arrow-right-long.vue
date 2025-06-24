<template>
    <svg data-v-34d7560c="" class="submit-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path data-v-34d7560c="" d="M5 12h14m-7-7 7 7-7 7" :stroke="stroke" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round"></path>
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
