<template>
    <div>
        <BaseHeader />
        <section>
            <div class="movie-hero" :style="{ backgroundImage: `url(${movieBackgroundImage})` }">
                <div class="movie-hero-overlay">
                    <div class="container">
                        <div class="movie-header-grid">
                            <div class="movie-poster">
                                <div class="rating-number">8.1</div>
                                <img src="https://image.tmdb.org/t/p/w500/6CoRTJTmijhBLJTUNoVSUNxZMEI.jpg" alt="">
                            </div>
                            <div class="movie-header-content">
                                <h1>Godzilla vs. Kong</h1>
                                <div class="info-wrapper">
                                    <RatingStar :count="votingToRating(8.1, 5)" :max="5" />
                                    <div class="category">
                                        <tag />
                                        <div class="categories">
                                            <span>Action</span>
                                            <span>Adventure</span>
                                            <span>Science Fiction</span>
                                        </div>
                                    </div>
                                    <div class="date-created">
                                        <Clock />
                                        <span>July 24th, 2023</span>
                                    </div>
                                </div>
                                <p>
                                    In a time when monsters walk the Earth, humanity’s fight for its future sets Godzilla
                                    and
                                    Kong
                                    on a collision course that will see the two most powerful forces of nature on the planet
                                    collide in a spectacular battle for the ages.
                                </p>
                                <div class="info-item">
                                    <span><strong>Duration</strong>: 1h 53m</span>
                                    <span><strong>Director</strong>: Adam Wingard</span>
                                    <span><strong>Country</strong>: United States of America</span>
                                    <span><strong>Language</strong>: English</span>
                                    <span class="budget"><strong>Budget</strong>: $200,000,000</span>
                                    <span class="imdb"><strong>Visit on IMDB</strong>: <a
                                            href="https://www.imdb.com/title/tt5034838/" target="_blank">Godzilla vs.
                                            Kong</a></span>
                                </div>
                                <div class="watch-now-wrapper">
                                    <button @click="showTrailer"> Watch Trailer</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <CastWrapper :title="'Godzilla vs. Kong'" />
            </div>
            <div class="container">
                <MoviePicture />
            </div>
            <div class="container">
                <SimilarMovie />
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import RatingStar from '../containers/RatingStar.vue';
import MovieItem from '../components/layout/MovieItem.vue';
import votingToRating from '../calculation/vote-to-rating';
import tag from '../components/svg/outline/tag.vue';
import arrowLeft from '../components/svg/outline/arrow-left.vue';
import arrowRight from '../components/svg/outline/arrow-right.vue';
import Clock from '../components/svg/outline/clock.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { SwiperOptions } from '../utils/swiper-options';
import SimilarMovie from '../containers/SimilarMovie.vue';
import MoviePicture from '../containers/MoviePicture.vue';
import CastWrapper from '../containers/CastWrapper.vue';
import 'swiper/css';
export default defineComponent({
    name: 'Movie',
    components: {
    BaseHeader,
    BaseFooter,
    RatingStar,
    MovieItem,
    tag,
    arrowLeft,
    arrowRight,
    Clock,
    Swiper,
    SwiperSlide,
    SimilarMovie,
    MoviePicture,
    CastWrapper
},
    setup() {
        const movieBackgroundImage = ref('https://image.tmdb.org/t/p/w1280/9yBVqNruk6Ykrwc32qrK2TIE5xw.jpg');

        const showTrailer = () => {
            console.log('show provider');
        }
        const prevSlide = () => {
            console.log('prev slide');
        };

        const nextSlide = () => {
            console.log('next slide');
        };

        return {
            movieBackgroundImage,
            votingToRating,
            showTrailer,
            SwiperOptions,
            prevSlide,
            nextSlide,
        }
    }
});
</script>

<style lang="scss" scoped>
@import url('../assets/styles/_background_hero.scss');
</style>