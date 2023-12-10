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
                                <img :src="computedTvShowImages.poster" :alt="tvShow?.name" loading="lazy">
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
                                    <!-- <span><strong>Director</strong>: Adam Wingard</span> -->
                                    <span><strong>Country</strong>: {{ computedCountry }}</span>
                                    <!-- <span><strong>Language</strong>: English</span> -->
                                    <span class="imdb"><strong>Visit on IMDB</strong>: <a
                                            :href="IMDBLink" target="_blank">{{ tvShow?.name }}</a></span>
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
                            <span><strong>Seasons</strong>: {{ tvShow?.number_of_seasons }}</span> <!-- No. of Seasons-->
                            <span><strong>Episodes</strong>: {{ tvShow?.number_of_episodes }}</span> <!-- No. of Episodes-->
                        </div>
                    </div>
                    <div class="seasons-list">
                        <div class="season-item"  v-for="item in computedTvShowSeasons" @click="openDialog(item.season_number)">
                            <span>Season {{ item.season_number }}</span>
                            <div class="season-detail">
                                <span>{{item.episode_count}} Episodes</span>
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
            <EpisodeDialog :episodes="episodes?.episodes || []" :showDialog="showDialog" @update:showDialog="showDialog = $event" :season-number="currentSeasonNumber" :poster="episodes.poster_path"
                v-if="showDialog && episodes" />
        </teleport>
    </div>
</template>

<script lang="ts">
import TrailerModal from '../components/TrailerModal.vue'
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
import { TVShowDetails, useTvShows, TVShowSeasonDetails } from '../composables/useTvShows';
import { MovieCredit, MovieImages, MovieVideo } from '../composables/useMovies';
import { TVShowType } from '../composables/useTvShows';
import { useModal } from '../composables/useModal';
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
        Clock, TrailerModal
    },
    setup() {
        const route = useRoute();
        const tvShowId = ref(route.params.id) as Ref<string>;
        const tvShow = ref<TVShowDetails>();
        const tvShowCredit = ref<MovieCredit>()
        const tvShowImages = ref<MovieImages>()
        const similarTvShow = ref<TVShowType[]>([])
        const { fetchTvShow, fetchTvShowImages, fetchSimilarTvShows, fetchTvShowCredit,fetchTvShowBySeason, fetchTvShowVideos } = useTvShows()
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
        const episodes = ref<TVShowSeasonDetails>();
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
        const tvShowTrailer = ref<MovieVideo>();
        const showTrailer = async () => {
            const { data } = await fetchTvShowVideos(tvShowId.value);
            data.value?.results.forEach((i: MovieVideo) => {
                if (i.type === "Trailer") {
                    tvShowTrailer.value = i;
                }
            })
            useModal(TrailerModal, {
                props: {
                    video: tvShowTrailer.value
                }
            })
        };

        const streamNow = () => {
            const formattedName = tvShow.value?.name?.replace(/ /g, "+").toLowerCase();
            window.open(`https://movies7.to/filter?keyword=${formattedName}`);
        }
        const currentSeasonNumber = ref(1)
        const openDialog = (seasonNumber: number) => {
            showDialog.value = true;
            currentSeasonNumber.value = seasonNumber;
            handleFetchEpisodes(seasonNumber);
        }
        const handleFetchEpisodes = async (season: number) => {
            const { data } = await fetchTvShowBySeason(tvShowId.value, season);
            episodes.value = data.value;
        }
        const computedTvShowSeasons = computed(() => {
            if (!tvShow.value?.seasons) return [];
            return tvShow.value?.seasons.filter((i) => i.season_number !== 0);
        });
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
        const IMDBLink = computed(() => {
            return `https://www.imdb.com/title/${tvShow.value?.id}`
        })
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
            computedTvShowSeasons,
            currentSeasonNumber,
            IMDBLink
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