<template>
    <div>
        <BaseHeader />
        <section>
            <div class="movie-hero" :style="{ backgroundImage: `url(${movieBackgroundImage})` }">
                <div class="movie-hero-overlay">
                    <div class="container">
                        <div class="movie-header-grid">
                            <div class="movie-poster">
                                <div class="rating-number">7.4</div>
                                <img src="https://image.tmdb.org/t/p/w500/f5ZMzzCvt2IzVDxr54gHPv9jlC9.jpg" alt="">
                            </div>
                            <div class="movie-header-content">
                                <h1>Secret Invasion</h1>
                                <div class="info-wrapper">
                                    <RatingStar :count="votingToRating(7.4, 5)" :max="5" />
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
                                    and Kong on a collision
                                    course that will see the two most powerful forces of nature on the planet collide in a
                                    spectacular battle for the ages.

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
                                    <button @click="streamNow"> Stream Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <div class="seasons-wrapper">
                    <div class="header-wrapper-header">
                        <h2>Seasons</h2>
                        <div class="season-wrapper-count">
                            <span><strong>Season</strong>: 1</span> <!-- No. of Seasons-->
                            <span><strong>Episodes</strong>: 6</span> <!-- No. of Episodes-->
                        </div>
                    </div>
                    <div class="seasons-list">
                        <div class="season-item" @click="openDialog">
                            <span>Season 1</span>
                            <div class="season-detail">
                                <span>6 Episodes</span>
                                <ArrowRight />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <CastWrapper :title="'Secret Invasion'"/>
            </div>
            <div class="container">
                <MoviePicture />
            </div>
            <div class="container">
                <SimilarMovie />
            </div>
        </section>
        <BaseFooter />
        <teleport to="body">
         <EpisodeDialog :episodes="episodes" :showDialog="showDialog" @update:showDialog="showDialog = $event" v-if="showDialog" />
        </teleport>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import EpisodeDialog from '../components/layout/EpisodeDialog.vue';
import votingToRating from '../calculation/vote-to-rating';
import ArrowRight from '../components/svg/outline/arrow-right.vue';
import CastWrapper from '../containers/CastWrapper.vue';
import MoviePicture from '../containers/MoviePicture.vue';
import SimilarMovie from '../containers/SimilarMovie.vue';
export default defineComponent({
    name: 'TVShow',
    components: {
    BaseHeader,
    BaseFooter,
    EpisodeDialog,
    ArrowRight,
    CastWrapper,
    MoviePicture,
    SimilarMovie
},
    setup() {
        const movieBackgroundImage = ref('https://image.tmdb.org/t/p/w1280/f5ZMzzCvt2IzVDxr54gHPv9jlC9.jpg');

        const showDialog = ref(false);
        const episodes = [
            { id: 1, name: 'Episode 1' },
            { id: 2, name: 'Episode 2' },
            { id: 3, name: 'Episode 3' },
            { id: 4, name: 'Episode 4' },
            { id: 5, name: 'Episode 5' },
            { id: 6, name: 'Episode 6' },
            { id: 7, name: 'Episode 7'},
            { id: 8, name: 'Episode 8'},
            { id: 9, name: 'Episode 9'},
            { id: 10, name: 'Episode 10'},
            { id: 11, name: 'Episode 11'},
            { id: 12, name: 'Episode 12'},
            { id: 13, name: 'Episode 13'},
            { id: 14, name: 'Episode 14'},
            { id: 15, name: 'Episode 15'},
            { id: 16, name: 'Episode 16'},
            { id: 17, name: 'Episode 17'},
            { id: 18, name: 'Episode 18'},
            { id: 19, name: 'Episode 19'},
            { id: 20, name: 'Episode 20'},
            { id: 21, name: 'Episode 21'},
            { id: 22, name: 'Episode 22'},
            { id: 23, name: 'Episode 23'},
            { id: 24, name: 'Episode 24'},
            { id: 25, name: 'Episode 25'},
            { id: 26, name: 'Episode 26'},
            { id: 27, name: 'Episode 27'},
            { id: 28, name: 'Episode 28'},
            { id: 29, name: 'Episode 29'},
            { id: 30, name: 'Episode 30'},
            { id: 31, name: 'Episode 31'},
            { id: 32, name: 'Episode 32'},
            { id: 33, name: 'Episode 33'},
            { id: 34, name: 'Episode 34'},
            { id: 35, name: 'Episode 35'},
            { id: 36, name: 'Episode 36'},
            { id: 37, name: 'Episode 37'},
            { id: 38, name: 'Episode 38'},
            { id: 39, name: 'Episode 39'},
            { id: 40, name: 'Episode 40'},
            { id: 41, name: 'Episode 41'},
            { id: 42, name: 'Episode 42'},
        ];

        const showTrailer = () => {
            console.log('show provider');
        }

        const streamNow = () => {
            console.log('stream now');
        }

        const openDialog = () => {
            showDialog.value = true;
        }

        return {
            movieBackgroundImage,
            showTrailer,
            votingToRating,
            streamNow,
            openDialog,
            showDialog,
            episodes
        }
    }
});
</script>

<style lang="scss" scoped>
@import url('../assets/styles/_background_hero.scss');

.seasons-wrapper {
    padding: 4rem 0;
    background-color: #081b27;

    @media screen and (max-width: 750px) {
        margin-top: 35rem;
    }

    .header-wrapper-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;

        @media screen and (max-width: 750px) {
            flex-direction: column;
            align-items: flex-start;
        }

        h2 {
            font-size: 2rem;
            color: #fff;
        }

        .season-wrapper-count {
            display: flex;
            align-items: center;
            font-size: 1.2rem;
            background-color: #f1b722;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;

            span {
                font-weight: 400;

                strong {
                    font-weight: 500;
                }

                &:last-child::before {
                    content: '•';
                    margin: 0 0.5rem;
                }
            }
        }
    }

    .seasons-list {
        padding: 1rem 2rem;

        @media screen and (max-width: 750px) {
            padding: 1rem 0;
        }

        .season-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 3rem;
            background-color: #040d13;
            cursor: pointer;
            border-radius: .725rem;
            border: .125rem solid #081c28;
            box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);

            .season-detail {
                display: flex;
                align-items: center;
                column-gap: 1rem;

                span {
                    font-weight: 400;
                    font-size: .875rem;
                    color: #f1b722;

                    @media screen and (max-width: 750px) {
                        font-size: .75rem;
                    }
                }

            }

            span {
                font-size: 1.2rem;
                font-weight: 500;
                color: #fff;

                @media screen and (max-width: 750px) {
                    font-size: 1rem;
                }
            }
        }
    }
}

// Overwrite the bug on the <CastWrapper /> component
.cast-wrapper{
    margin-top: 0;
}
</style>