<template>
    <div class="known-for-wrapper">
        <div class="known-for-header">
            <h2>Known For</h2>
            <div class="known-for-header-right">
                <button class="cast-button" @click="prevSlide">
                    <arrowLeft />
                </button>
                <button class="cast-button" @click="nextSlide">
                    <arrowRight />
                </button>
            </div>
        </div>
        <Swiper :slides-per-view="SwiperOptions.knownFor.slidesPerView" :space-between="SwiperOptions.knownFor.spaceBetween"
            :breakpoints="SwiperOptions.knownFor.breakpoints">
            <swiper-slide v-for="i in 10" :key="i">
                <MovieItem />
            </swiper-slide>
        </Swiper>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MovieItem from '../components/layout/MovieItem.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { SwiperOptions } from '../utils/swiper-options';
import arrowLeft from '../components/svg/outline/arrow-left.vue';
import arrowRight from '../components/svg/outline/arrow-right.vue';
import 'swiper/css';
export default defineComponent({
    name: 'KnownFor',
    components: {
        MovieItem,
        Swiper,
        SwiperSlide,
        arrowLeft,
        arrowRight
    },
    setup() {
        const prevSlide = () => {
            console.log('prev slide');
        };

        const nextSlide = () => {
            console.log('next slide');
        };

        return {
            prevSlide,
            nextSlide,
            SwiperOptions
        }
    }
});
</script>

<style scoped lang="scss">
.known-for-wrapper {
    padding: 4rem 0;

    .known-for-header {
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

        .known-for-header-right {
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

    .known-for-grid {
        @media (min-width: 1185px) {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 2rem;
        }
    }
}
</style>