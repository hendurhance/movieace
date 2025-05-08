<template>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_x_icon)">
            <path
                d="M19.7071 6.70711C20.0976 6.31658 20.0976 5.68342 19.7071 5.29289C19.3166 4.90237 18.6834 4.90237 18.2929 5.29289L12 11.5858L5.70711 5.29289C5.31658 4.90237 4.68342 4.90237 4.29289 5.29289C3.90237 5.68342 3.90237 6.31658 4.29289 6.70711L10.5858 13L4.29289 19.2929C3.90237 19.6834 3.90237 20.3166 4.29289 20.7071C4.68342 21.0976 5.31658 21.0976 5.70711 20.7071L12 14.4142L18.2929 20.7071C18.6834 21.0976 19.3166 21.0976 19.7071 20.7071C20.0976 20.3166 20.0976 19.6834 19.7071 19.2929L13.4142 13L19.7071 6.70711Z"
                :fill="fill" />
        </g>
        <defs>
            <clipPath id="clip0_x_icon">
                <rect width="24" height="24" :fill="fill" />
            </clipPath>
        </defs>
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'XIcon',
    props: {
        fill: {
            type: String,
            default: '#000'
        }
    }
})
</script>