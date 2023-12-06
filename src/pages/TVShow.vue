<template>
    <div>
        <BaseHeader />
        <section>
            <div class="movie-hero" :style="{ backgroundImage: `url(${computedTvShowImages.backdrop})` }">
                <div class="movie-hero-overlay">
                    <div class="container">
                        <div class="movie-header-grid">
                            <div class="movie-poster">
                                <div class="rating-number">7.4</div>
                                <img :src="computedTvShowImages.poster" :alt="tvShow?.name">
                            </div>
                            <div class="movie-header-content">
                                <h1>{{ tvShow?.name }}</h1>
                                <div class="info-wrapper">
                                    <RatingStar :count="votingToRating(7.4, 5)" :max="5" />
                                    <div class="category">
                                        <Tag />
                                        <div class="categories">
                                            <span v-for="i in tvShow?.genres" :key="i.id">{{ i.name }}</span>
                                        </div>
                                    </div>
                                    <div class="date-created">
                                        <Clock />
                                        <span>July 24th, 2023</span>
                                    </div>
                                </div>
                                <p>
                                    {{ tvShow?.overview }}

                                </p>
                                <div class="info-item">
                                    <span><strong>Duration</strong>: 1h 53m</span>
                                    <span><strong>Director</strong>: Adam Wingard</span>
                                    <span><strong>Country</strong>: {{ computedCountry }}</span>
                                    <span><strong>Language</strong>: English</span>
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
                            <span><strong>Seasons</strong>: 1</span> <!-- No. of Seasons-->
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
                <CastWrapper :title="tvShow?.name" :casts="tvShowCredit?.cast" />
            </div>
            <div class="container" v-if="tvShowImages?.posters">
                <MoviePicture :pictures="tvShowImages?.posters" />
            </div>
            <div class="container" v-if="similarTvShow.length > 0">
                <SimilarMovie :movie-item="similarTvShow" type="tv" />
            </div>
        </section>
        <BaseFooter />
        <teleport to="body">
            <EpisodeDialog :episodes="episodes" :showDialog="showDialog" @update:showDialog="showDialog = $event"
                v-if="showDialog" />
        </teleport>
    </div>
</template>

<script lang="ts">
import { Ref, computed, defineComponent, onMounted, ref } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import EpisodeDialog from '../components/layout/EpisodeDialog.vue';
import votingToRating from '../calculation/vote-to-rating';
import ArrowRight from '../components/svg/outline/arrow-right.vue';
import CastWrapper from '../containers/CastWrapper.vue';
import MoviePicture from '../containers/MoviePicture.vue';
import SimilarMovie from '../containers/SimilarMovie.vue';
import RatingStar from '../containers/RatingStar.vue';
import Tag from '../components/svg/outline/tag.vue';
import Clock from '../components/svg/outline/clock.vue';
import empty_movie_state from '../assets/img/empty-movie-state.png';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { TVShowDetails, useTvShows } from '../composables/useTvShows';
import { MovieCredit, MovieImages } from '../composables/useMovies';
import { TVShowType } from '../composables/useTvShows';
export default defineComponent({
    name: 'TVShow',
    components: {
        BaseHeader,
        BaseFooter,
        EpisodeDialog,
        ArrowRight,
        CastWrapper,
        MoviePicture,
        SimilarMovie,
        RatingStar,
        Tag,
        Clock
    },
    setup() {
        const route = useRoute();
        const tvShowId = ref(route.params.id) as Ref<string>;
        const tvShow = ref<TVShowDetails>();
        const tvShowCredit = ref<MovieCredit>()
        const tvShowImages = ref<MovieImages>()
        const similarTvShow = ref<TVShowType[]>([])
        const { fetchTvShow, fetchTvShowImages, fetchSimilarTvShows, fetchTvShowCredit } = useTvShows()
        const handleFetchTvShow = async () => {
            const { data } = await fetchTvShow(tvShowId.value);
            tvShow.value = data.value;
        };
        const handleFetchTvShowCredits = async () => {
            const { data } = await fetchTvShowCredit(tvShowId.value);
            tvShowCredit.value = data.value;
        };
        const handleFetchTvShowImages = async () => {
            const { data } = await fetchTvShowImages(tvShowId.value);
            tvShowImages.value = data.value;
        };
        const handleFetchSimilarTvShows = async () => {
            const { data } = await fetchSimilarTvShows(tvShowId.value);
            if (!data.value) return;
            similarTvShow.value = data.value?.results;
        };

        const showDialog = ref(false);
        const episodes = [
            { id: 1, name: 'Episode 1' },
            { id: 2, name: 'Episode 2' },
            { id: 3, name: 'Episode 3' },
            { id: 4, name: 'Episode 4' },
            { id: 5, name: 'Episode 5' },
            { id: 6, name: 'Episode 6' },
            { id: 7, name: 'Episode 7' },
            { id: 8, name: 'Episode 8' },
            { id: 9, name: 'Episode 9' },
            { id: 10, name: 'Episode 10' },
            { id: 11, name: 'Episode 11' },
            { id: 12, name: 'Episode 12' },
            { id: 13, name: 'Episode 13' },
            { id: 14, name: 'Episode 14' },
            { id: 15, name: 'Episode 15' },
            { id: 16, name: 'Episode 16' },
            { id: 17, name: 'Episode 17' },
            { id: 18, name: 'Episode 18' },
            { id: 19, name: 'Episode 19' },
            { id: 20, name: 'Episode 20' },
            { id: 21, name: 'Episode 21' },
            { id: 22, name: 'Episode 22' },
            { id: 23, name: 'Episode 23' },
            { id: 24, name: 'Episode 24' },
            { id: 25, name: 'Episode 25' },
            { id: 26, name: 'Episode 26' },
            { id: 27, name: 'Episode 27' },
            { id: 28, name: 'Episode 28' },
            { id: 29, name: 'Episode 29' },
            { id: 30, name: 'Episode 30' },
            { id: 31, name: 'Episode 31' },
            { id: 32, name: 'Episode 32' },
            { id: 33, name: 'Episode 33' },
            { id: 34, name: 'Episode 34' },
            { id: 35, name: 'Episode 35' },
            { id: 36, name: 'Episode 36' },
            { id: 37, name: 'Episode 37' },
            { id: 38, name: 'Episode 38' },
            { id: 39, name: 'Episode 39' },
            { id: 40, name: 'Episode 40' },
            { id: 41, name: 'Episode 41' },
            { id: 42, name: 'Episode 42' },
        ];
        onBeforeRouteUpdate(async (to, from) => {

            if (to.params.id !== from.params.id) {
                tvShowId.value = to.params.id as string;
                // await handleFetchTvShow();
                // await handleFetchTvShowCredits();
                // await handleFetchTvShowImages();
                // await handleFetchSimilarTvShows();
                Promise.all([
                    handleFetchTvShow(),
                    handleFetchTvShowCredits(),
                    handleFetchTvShowImages(),
                    handleFetchSimilarTvShows(),
                ])
                window.scrollTo(0, 0);

            }

        })
        const showTrailer = () => {
            console.log("show trailer", tvShow.value);
        }

        const streamNow = () => {
            console.log('stream now');
        }

        const openDialog = () => {
            showDialog.value = true;
        }
        const IMAGE_BASEURL = import.meta.env.VITE_IMAGE_BASE_URL;

        const computedTvShowImages = computed(() => {
            return {
                backdrop: tvShow.value?.backdrop_path === null ? empty_movie_state : `${IMAGE_BASEURL}w1280${tvShow.value?.backdrop_path}`,
                poster: tvShow.value?.poster_path === null ? empty_movie_state : `${IMAGE_BASEURL}w780${tvShow.value?.poster_path}`
            };
        });
        const computedCountry = computed(() => {
            if (!tvShow.value?.production_countries) return "";
            return tvShow.value?.production_countries.splice(0, 2).map((i) => i.name).join(", ");
        });
        const computedLanguage = computed(() => {
            if (!tvShow.value?.spoken_languages) return "";
            return tvShow.value?.spoken_languages.map((i) => i.name).join(", ");
        });
        const fullDate = computed(() => {
            if (!tvShow.value?.first_air_date) return "";

            return new Date(tvShow.value?.first_air_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        });
        handleFetchTvShow();
        onMounted(() => {
            window.scrollTo(0, 0);
            Promise.all([
                handleFetchTvShowCredits(),
                handleFetchTvShowImages(),
                handleFetchSimilarTvShows(),
            ])
        })
        return {
            showTrailer,
            votingToRating,
            streamNow,
            openDialog,
            showDialog,
            episodes,
            tvShow,
            computedTvShowImages,
            computedCountry,
            computedLanguage,
            fullDate,
            tvShowCredit,
            tvShowImages,
            similarTvShow,
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
.cast-wrapper {
    margin-top: 0;
}
</style>