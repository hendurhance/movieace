<template>
    <div class="similar-movie-wrapper">
        <div class="similar-movie-header">
            <h2>Similar {{ type === 'movie' ? 'Movies' : 'TV Shows' }}</h2>
            <div class="similar-movie-header-right">
                <button class="cast-button" @click="moveSlide('prev')">
                    <arrowLeft />
                </button>
                <button class="cast-button" @click="moveSlide('next')">
                    <arrowRight />
                </button>
            </div>
        </div>
        <Swiper :slidesPerView="SwiperOptions.similar.slidesPerView" :spaceBetween="SwiperOptions.similar.spaceBetween"
            :breakpoints="SwiperOptions.similar.breakpoints" class="similar-movie">
            <Swiper-Slide v-for="item in movieItem" :key="item.id" ref="similar-slide">
                <MovieItem :title="getMovieOrTVTitle(item)" :image="item.poster_path" :movie-id="item.id"
                    :rating="item.vote_average" :categories="item.genre_ids" :type="type" />
            </Swiper-Slide>
        </Swiper>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import MovieItem from '../components/layout/MovieItem.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { SwiperOptions } from '../utils/swiper-options';
import arrowLeft from '../components/svg/outline/arrow-left.vue';
import arrowRight from '../components/svg/outline/arrow-right.vue';
import { Movie } from '../composables/useHighlights';
import { TVShowType } from '../composables/useTvShows';
export default defineComponent({
    name: 'SimilarMovie',
    components: {
        MovieItem,
        Swiper,
        SwiperSlide,
        arrowLeft,
        arrowRight
    },
    props: {
        type: {
            type: String as PropType<'movie' | 'tv'>,
            default: 'movie'
        },
        movieItem: {
            type: Array as PropType<Movie[] | TVShowType[]>,
            default: () => []
        }
    },
    setup(props) {
        const currentIndex = ref(0);
        const moveSlide = (direction: 'prev' | 'next') => {
            const similarMovie = document.querySelector('.similar-movie') as HTMLElement;
            const swiperWrapper = similarMovie.querySelector('.swiper-wrapper') as HTMLElement;
            if (swiperWrapper) {
                const slideWidth = swiperWrapper.clientWidth;
                currentIndex.value = direction === 'next' ? currentIndex.value + 1 : currentIndex.value - 1;
                currentIndex.value = Math.min(Math.max(currentIndex.value, 0), swiperWrapper.children.length - 1);

                const maxVisibleSlides = window.innerWidth <= 767 ? 1 : window.innerWidth <= 768 ? 1.5 : window.innerWidth <= 1185 ? 2 : 2.75;
                if (currentIndex.value > Math.floor(swiperWrapper.children.length / maxVisibleSlides)) {
                    return;
                } else {
                    const newPosition = (-currentIndex.value * slideWidth) / 2;
                    swiperWrapper.style.transform = `translate3d(${newPosition}px, 0, 0)`;
                    swiperWrapper.style.transition = 'transform 0.3s ease-in-out';
                }
            }
        };
        const getMovieOrTVTitle = (item: any) => {
            return props.type === 'movie' ? item.original_title : item.name;
        };
        return {
            moveSlide,
            SwiperOptions,
            getMovieOrTVTitle
        }
    }
});
</script>

<style scoped lang="scss">
.similar-movie-wrapper {
    padding: 4rem 0;

    .similar-movie-header {
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

        .similar-movie-header-right {
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

    .similar-movie-grid {
        @media (min-width: 1185px) {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 2rem;
        }
    }
}
</style>