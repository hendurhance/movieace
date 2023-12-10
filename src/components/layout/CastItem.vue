<template>
    <router-link :to="`/actor/${cast.id}`" class="cast-item">
        <img :src="fullImagePath" :alt="`${cast.name} image`" loading="lazy">
        <span>{{ cast.name }}</span>
        <span>{{ cast.character }}</span>
    </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { SwiperSlide } from 'swiper/vue';
import { useWebImage } from '../../utils/useWebImage';
import empty_actor_state from '../../assets/img/empty-actor-state.png';
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
                profile_path: empty_actor_state
            })
        }
    },
    setup(props) {
        const fullImagePath = props.cast.profile_path === null ? empty_actor_state : useWebImage(props.cast.profile_path, "large")
        return {
            cast: props.cast,
            fullImagePath
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
    text-decoration: none;


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