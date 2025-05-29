<template>
    <div class="search-result-wrapper">
        <div class="search-result-header">
            <h2>{{  mediaType === 'movie' ? 'Movies' : 'TV Shows' }} Results</h2> 
            <div class="search-result-header-right">
                <button class="cast-button" @click="prevSlide">
                    <arrowLeft />
                </button>
                <button class="cast-button" @click="nextSlide">
                    <arrowRight />
                </button>
            </div>
        </div>
        <Swiper :slidesPerView="SwiperOptions.similar.slidesPerView" :spaceBetween="SwiperOptions.similar.spaceBetween"
        :breakpoints="SwiperOptions.similar.breakpoints" class="similar-movie">
        <Swiper-Slide v-for="item in data" :key="item.id" ref="similar-slide">
            <MovieItem :title="getMovieOrTVTitle(item)" :image="item.poster_path" :movie-id="item.id"
                :rating="item.vote_average" :categories="item.genre_ids" :type="mediaType" :adult="item.adult" />
        </Swiper-Slide>
    </Swiper>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType} from 'vue';
import MovieItem from '../components/layout/MovieItem.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { SwiperOptions } from '../utils/swiper-options';
import arrowLeft from '../components/svg/outline/arrow-left.vue';
import arrowRight from '../components/svg/outline/arrow-right.vue';
import { TVShowType } from '../composables/useTvShows';
import { Movie } from '../composables/useHighlights';
export default defineComponent({
    name: 'SearchResults',
    components: {
        MovieItem,
        Swiper,
        SwiperSlide,
        arrowLeft,
        arrowRight
    },
    props: {
        mediaType: {
            type: String as PropType<'movie' | 'tv'>,
            default: 'movie'
        },
        data: {
            type: Array as PropType<Movie[] | TVShowType[]>,
            default: () => []
        }
    },
    setup(props) {
        const prevSlide = () => {
            console.log('prev slide');
        };

        const nextSlide = () => {
            console.log('next slide');
        };
        const getMovieOrTVTitle = (item: any) => {
            return props.mediaType === 'movie' ? item.original_title : item.name;
        };

        return {
            prevSlide,
            nextSlide,
            SwiperOptions,
            getMovieOrTVTitle
        }
    }
});
</script>

<style scoped lang="scss">
.search-result-wrapper {
    padding: 4rem 0;

    .search-result-header {
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        h2 {
            font-size: 2.5rem;
            font-weight: 700;

            @media screen and (max-width: 1185px) {
                font-size: 2rem;
            }

            @media screen and (max-width: 768px) {
                font-size: 1.5rem;
            }

            @media screen and (max-width: 576px) {
                font-size: 1.25rem;
            }
        }

        .search-result-header-right {
            display: flex;
            align-items: center;
            justify-content: center;
            column-gap: .5rem;

            button {
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 100%;
                background-color: #f1b722;
                color: #fff;
                font-size: 1rem;
                transition: all .3s ease-in-out;
                border: 0;
                outline: none;
                line-height: 1.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }

    .search-result-grid {
        @media (min-width: 1185px) {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 2rem;
        }
    }
}
</style>