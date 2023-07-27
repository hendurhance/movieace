<template>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.641 16L11.719 13.064V6.73599" :stroke="stroke" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            <path
                d="M18.364 5.63604C21.8787 9.15076 21.8787 14.8492 18.364 18.3639C14.8493 21.8787 9.1508 21.8787 5.6361 18.3639C2.12138 14.8492 2.12138 9.15074 5.6361 5.63604C9.15082 2.12132 14.8493 2.12132 18.364 5.63604"
                :stroke="stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    props: {
        stroke: {
            type: String,
            default: '#f1b722'
        }
    }
})
</script>