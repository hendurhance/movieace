<template>
    <router-link :to="`/actor/${cast.id}`" class="cast-item">
        <img :src="fullImagePath" :alt="`${cast.name} image`" loading="lazy">
        <span>{{ cast.name }}</span>
        <div class="cast-meta">
            <span class="character-name" v-if="cast.character">
                {{ cast.character }}
            </span>
            <span class="popularity-badge" v-if="cast.popularity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {{ Math.round(cast.popularity) }}
            </span>
        </div>
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
    popularity?: number;
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


    .cast-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-flow: wrap;
        margin-top: 1rem;
        padding: 0 0.5rem;

        .character-name {
            color: #8ea9bd;
            font-size: 0.85rem;
            font-weight: 500;
            font-style: italic;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 0.5rem;
        }

        .popularity-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(241, 183, 34, 0.2);
            color: #f1b722;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;

            svg {
                width: 12px;
                height: 12px;
                fill: currentColor;
                stroke: none;
            }
        }
    }
}
</style>