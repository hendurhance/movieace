<template>
    <div class="cast-wrapper">
        <div class="cast-wrapper-header">
            <h2>{{title}}</h2>
            <div class="cast-wrapper-header-right">
                <button class="cast-button" @click="prevSlide">
                    <arrowLeft />
                </button>
                <button class="cast-button" @click="nextSlide">
                    <arrowRight />
                </button>
            </div>
        </div>
        <swiper :slides-per-view="SwiperOptions.cast.slidesPerView" :space-between="SwiperOptions.cast.spaceBetween"
            :breakpoints="SwiperOptions.cast.breakpoints">
            <swiper-slide v-for="i in 10" :key="i">
                <CastItem />
            </swiper-slide>
        </swiper>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import arrowLeft from '../components/svg/outline/arrow-left.vue';
import arrowRight from '../components/svg/outline/arrow-right.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import { SwiperOptions } from '../utils/swiper-options';
import CastItem from '../components/layout/CastItem.vue';

export default defineComponent({
    name: 'CastWrapper',
    components: {
        arrowLeft,
        arrowRight,
        Swiper,
        SwiperSlide,
        CastItem
    },
    props: {
        title: {
            type: String,
            required: true
        }
    },
    setup() {
        const prevSlide = () => {
            console.log('prev slide');
        };
        const nextSlide = () => {
            console.log('next slide');
        };
        return {
            nextSlide,
            prevSlide,
            SwiperOptions
        };
    }
});
</script>

<style lang="scss" scoped>
.cast-wrapper {
    padding: 4rem 0;
    background-color: #081b27;

    @media screen and (max-width: 750px) {
        margin-top: 35rem;
    }

    .cast-wrapper-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;

        h2 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #fff;

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

        .cast-wrapper-header-right {
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

        .swiper-button-prev {
            margin-right: 1rem;
        }
    }

}
</style>