<template>
    <div class="cast-item">
        <img :src="useWebImage(cast.profile_path)" :alt="`${cast.name} image`">
        <span>{{ cast.name }}</span>
        <span>{{ cast.character }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { SwiperSlide } from 'swiper/vue';
import { useWebImage } from '../../utils/useWebImage';
interface Cast {
    id: number;
    name: string;
    character: string;
    profile_path: string;
}

export default defineComponent({
    name: 'CastItem',
    components: {
        SwiperSlide
    },
    props: {
        cast: {
            type: Object as () => Cast,
            default: () => ({
                id: 0,
                name: 'John Cena',
                character: 'Chris Van Horne',
                profile_path: 'https://image.tmdb.org/t/p/w185/6EZaBiQHx3Xlz3j0D6ttDxHXaxr.jpg'
            })
        }
    },
    setup(props) {
        return {
            cast: props.cast,
            useWebImage
        }
    }
})
</script>

<style scoped lang="scss">
.cast-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #fff;

    img {
        width: 135px;
        height: 135px;
        object-fit: cover;
        object-position: center;
        border-radius: 100%;
        margin-bottom: 1rem;
    }

    span {
        font-size: .875rem;
        font-weight: 700;
        margin-bottom: .5rem;

        &:last-child {
            font-size: .75rem;
            font-weight: 400;
        }
    }
}
</style>