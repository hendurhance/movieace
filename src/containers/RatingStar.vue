<template>
    <div class="star">
        <Star v-for="star in max" :key="star" :fill="star <= count ? '#ffc107' : '#848d93'" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Star from '../components/svg/solid/star.vue'
export default defineComponent({
    components: {
        Star
    },
    props: {
        count: {
            type: Number,
            default: 5,
            required: true,
        },
        max: {
            type: Number,
            default: 5,
            required: true,
        }
    },
})

</script>

<style lang="scss" scoped>
.star {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 0.3rem;
    align-items: center;
    justify-items: center;

    div {
        width: 15px;
        height: 15px;
    }
}
</style>