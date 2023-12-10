<template>
    <div class="container">
        <iframe :src="`https://www.youtube.com/embed/${data.video.key}`" frameborder="0" allowfullscreen
            class="video"></iframe>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

defineProps({
    data: {
        type: Object as PropType<any>,
        required: true
    }
})


</script>

<style scoped>
.container {
    position: relative;
    width: 100%;
    min-width: 700px;
    min-height: 400px;
    padding-bottom: 56.25%;
}

.video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

@media screen and (max-width: 840px) {
    .container {
        min-width: 100%;
        min-height: 400px;
    }
}
</style>