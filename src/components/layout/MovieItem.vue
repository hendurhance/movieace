<template>
    <div class="movie-list-item">
        <router-link :to="type == 'movie'? `/movie/${movieId}`: `/tv-show/${movieId}`">
            <img :src="fullPathImage" alt="Movie poster" :class="size" />
            <h5>{{title}}</h5>
            <div class="rating-number">
                <span>{{ rating.toFixed(1) }}</span>
            </div>
        </router-link>
        <div class="info-block">
            <RatingStar :count="votingToRating(rating, 5)" :max="5" />
            <div class="category">
                <tag />
                <div class="categories">
                    <span v-for="(genre, idx) in genres" :key="idx">{{genre.name}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { PropType, defineComponent, onMounted, ref } from 'vue';
import RatingStar from '../../containers/RatingStar.vue'
import tag from '../svg/outline/tag.vue';
import empty_actor_state from '../../assets/img/empty-actor-state.png';
import empty_movie_state from '../../assets/img/empty-movie-state.png';
import votingToRating from '../../calculation/vote-to-rating';
import { useGenresList } from '../../composables/useGenresList';
import { Genre } from '../../composables/useGenre';
import { useRouter } from 'vue-router';
import { useWebImage } from '../../utils/useWebImage';
export default defineComponent({
    name: 'MovieItem',
    components: {
        RatingStar,
        tag,
    },
    props: {
        type: {
            type: String as PropType<'movie' | 'tv'>,
            default: 'movie'
        },
        movieId: {
            type: [Number, String],
            required: true
        },
        size: {
            type: String,
            default: 'large'
        },
        image: {
            type: String,
            default: empty_movie_state
        },
        title: {
            type: String,
            default: 'Title'
        },
        rating: {
            type: Number,
            default: 8.5
        },
        categories: {
            type: Array as PropType<number[]>,
            default: [12, 16]
        },
        imgSize: {
            type: String,
            default: 'w500'
        }
    },
    setup(props) {
        const router = useRouter()
        const fullPathImage = props.image === null ? empty_movie_state : useWebImage(props.image, "large")
        const genres = ref<Genre[]>([])

        onMounted( async () => {
            const { getGenresList } = useGenresList(props.categories.slice(0, 2))
            genres.value = await getGenresList()
        })
        const handleMovieRouting = () => {
            router.push(`/movie/${props.movieId}`)
        }

        return {
            fullPathImage,
            votingToRating,
            genres,
            handleMovieRouting
        }
    }
})
</script>

<style lang="scss" scoped>
.movie-list-item{
    display: flex;
    flex-direction: column;
    justify-content: center;

    a {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        text-decoration: none;
        color: #fff;

        .rating-number {
            position: absolute;
            top: 0;
            right: 0;
            padding: 0.5rem 1rem;
            border-radius: 0 0 0 0.5rem;
            background-color: #f1b722;
            font-size: 1.2rem;
            font-weight: 400;
            color: #323232;
        }

        img {
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            &.large {
                width: 100%;
                height: 100%;
            }

            &.small {
                width: 100%;
                height: 220px;
                object-fit: cover;
                object-position: top;
            }

            &:hover {
                transition: all 0.3s ease-in-out;
                transform: scale(1.05);
            }
        }

        h5 {
            font-size: 1.2rem;
            margin: .5rem 0;
            text-align: left;
            font-weight: 400;
            color: #fff;
            font-weight: 600;
        }
    }

    .info-block {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;

        .category {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            margin-top: .5rem;

            .categories {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;

                span {
                    font-size: 1rem;
                    font-weight: 400;
                    color: #8ea9bd;
                    margin-left: .2rem;

                    &:not(:last-child)::after {
                        content: ',';
                        margin-right: .2rem;
                    }
                }
            }
        }
    }
}
</style>