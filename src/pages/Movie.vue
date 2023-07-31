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
                                    <button @click="showTrailer"> Watch now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <CastWrapper />
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
import 'swiper/css';
import { SwiperOptions } from '../utils/swiper-options';
import SimilarMovie from '../containers/SimilarMovie.vue';
import MoviePicture from '../containers/MoviePicture.vue';
import CastWrapper from '../containers/CastWrapper.vue';
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
section {
    padding-top: 0;

    .movie-hero {
        height: 95vh;
        background-size: cover;
        background-position: center;
        position: relative;

        .movie-hero-overlay {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(7, 24, 34, 0.8);
            background-image: linear-gradient(180deg, rgba(12, 39, 56, 0) 14%, #081b27);

            @media screen and (max-width: 750px) {
                align-items: start;
                justify-items: center;
            }

            .container {
                @media screen and (max-width: 750px) {
                    margin: 5rem 0;
                }
                .movie-header-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 4rem;
                    align-items: center;

                    @media screen and (max-width: 750px) {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                        margin: 2rem 0;
                    }

                    .movie-poster {
                        position: relative;
                        
                        @media screen and (max-width: 750px) {
                            max-width: 50%;
                        }

                        img {
                            width: 100%;
                            height: auto;
                            border-radius: 0.5rem;

                            @media screen and (max-width: 750px) {
                                width: 100%;
                            }
                        }

                        .rating-number {
                            position: absolute;
                            top: 1rem;
                            right: 1rem;
                            width: 2.5rem;
                            height: 2.5rem;
                            border-radius: 50%;
                            background-color: #fff;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1rem;
                            font-weight: 700;
                            color: #000;

                            &:after {
                                content: '';
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                border-radius: 50%;
                                border: 2px solid #081b27;
                                animation: rating-ring 1s linear infinite;
                            }

                            @keyframes rating-ring {
                                0% {
                                    transform: scale(1);
                                    opacity: 1;
                                }

                                100% {
                                    transform: scale(1.5);
                                    opacity: 0;
                                }
                            }
                        }
                    }

                    .movie-header-content {
                        color: #fff;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;

                        h1 {
                            font-size: 3rem;
                            font-weight: 700;
                            margin-bottom: 1rem;
                        }

                        .info-wrapper {
                            display: flex;
                            align-items: center;
                            margin-bottom: 1rem;
                            font-size: .875rem;

                            @media screen and (max-width: 768px) {
                                flex-direction: column;
                                align-items: flex-start;

                                >div:not(:first-child) {
                                    margin-top: .5rem;
                                    margin-right: 0;
                                }
                            }

                            >div:not(:last-child) {
                                margin-right: 1rem;
                            }

                            .category {
                                display: flex;
                                align-items: center;

                                .categories {
                                    display: flex;
                                    align-items: center;
                                    margin-left: .5rem;

                                    span:not(:last-child) {
                                        &:after {
                                            content: ',';
                                            margin-right: .5rem;
                                        }
                                    }

                                }
                            }

                            .date-created {
                                display: flex;
                                align-items: center;

                                span {
                                    margin-left: .5rem;
                                }
                            }
                        }

                        p {
                            margin-bottom: 1rem;
                            font-size: 1rem;
                            line-height: 1.5;
                        }

                        .info-item {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: .25rem 1rem;
                            font-size: .875rem;

                            span {
                                &.budget {
                                    color: #f1b722;
                                }

                                &.imdb {
                                    a {
                                        color: #fff;
                                        text-decoration: underline;
                                    }
                                }
                            }

                            span:not(:last-child) {
                                margin-bottom: .5rem;
                            }

                            strong {
                                font-weight: 700;
                            }
                        }

                        .watch-now-wrapper {
                            margin-top: 2rem;

                            button {
                                padding: .75rem 1.5rem;
                                border-radius: 0.5rem;
                                background-color: #f44336;
                                color: #fff;
                                font-size: 1rem;
                                font-weight: 700;
                                transition: all .3s ease-in-out;
                                border: 0;
                                outline: none;

                                &:hover {
                                    background-color: #e53935;
                                }
                            }
                        }
                    }

                }
            }
        }
    }
}
</style>