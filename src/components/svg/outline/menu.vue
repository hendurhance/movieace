<template>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_1313_433)">
            <path
                d="M22.5 21H1.50001C0.671548 21 0 20.3284 0 19.5C0 18.6716 0.671548 18 1.50001 18H22.5C23.3285 18 24.0001 18.6716 24.0001 19.5C24 20.3284 23.3285 21 22.5 21Z"
                :fill="fill" />
            <path
                d="M22.5 13.5H1.50001C0.671548 13.5 0 12.8284 0 12C0 11.1716 0.671548 10.5 1.50001 10.5H22.5C23.3285 10.5 24.0001 11.1715 24.0001 12C24.0001 12.8285 23.3285 13.5 22.5 13.5Z"
                :fill="fill" />
            <path
                d="M22.5 6.00002H1.50001C0.671548 6.00002 0 5.32847 0 4.50001C0 3.67155 0.671548 3 1.50001 3H22.5C23.3285 3 24.0001 3.67155 24.0001 4.50001C24.0001 5.32847 23.3285 6.00002 22.5 6.00002Z"
                :fill="fill" />
        </g>
        <defs>
            <clipPath id="clip0_1313_433">
                <rect width="24" height="24" :fill="fill" />
            </clipPath>
        </defs>
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    props: {
        fill: {
            type: String,
            default: '#000'
        }
    }
})
</script>