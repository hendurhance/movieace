<template>
    <div>
        <BaseHeader />
        <section>
            <div class="movie-hero" :style="{ backgroundImage: `url(${computedTvShowImages.backdrop})` }">
                <div class="movie-hero-overlay">
                    <div class="container">
                        <div class="movie-header-grid">
                            <div class="movie-poster">
                                <div class="rating-number">{{ tvShow?.vote_average?.toFixed(1) || '7.4' }}</div>
                                <img :src="computedTvShowImages.poster" :alt="tvShow?.name" loading="lazy">
                            </div>
                            <div class="movie-header-content">
                                <h1>{{ tvShow?.name }}</h1>
                                <div class="info-wrapper">
                                    <RatingStar :count="votingToRating(tvShow?.vote_average || 7.4, 5)" :max="5" />
                                    <div class="category">
                                        <Tag />
                                        <div class="categories">
                                            <span v-for="i in tvShow?.genres" :key="i.id">{{ i.name }}</span>
                                        </div>
                                    </div>
                                    <div class="date-created">
                                        <Clock />
                                        <span>{{ fullDate }}</span>
                                    </div>
                                </div>
                                <p>
                                    {{ tvShow?.overview }}
                                </p>
                                <div class="info-item">
                                    <span v-if="tvShow?.episode_run_time?.length"><strong>Duration</strong>: {{ tvShow?.episode_run_time[0] }}m</span>
                                    <span><strong>Country</strong>: {{ computedCountry }}</span>
                                    <span><strong>Language</strong>: {{ computedLanguage }}</span>
                                    <span class="imdb"><strong>Visit on IMDB</strong>: <a
                                            :href="IMDBLink" target="_blank">{{ tvShow?.name }}</a></span>
                                </div>
                                <div class="watch-now-wrapper">
                                    <button @click="showTrailer"> Watch Trailer</button>
                                    <button @click="watchFirstEpisode" v-if="!lastWatchedData"> Stream Now</button>
                                    <button @click="watchFirstEpisode" v-else> Continue Watching </button>
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
                            <span><strong>Seasons</strong>: {{ tvShow?.number_of_seasons }}</span>
                            <span><strong>Episodes</strong>: {{ tvShow?.number_of_episodes }}</span>
                        </div>
                    </div>
                    <div class="seasons-list">
                        <div class="season-item" v-for="item in computedTvShowSeasons" :key="item.id" @click="openDialog(item.season_number)">
                            <div class="season-info-container">
                                <span class="season-title">Season {{ item.season_number }}</span>
                                <span class="season-air-date" v-if="item.air_date">{{ formatAirDate(item.air_date) }}</span>
                            </div>
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
            <EpisodeDialog 
                :episodes="episodes?.episodes || []" 
                :showDialog="showDialog" 
                @update:showDialog="showDialog = $event" 
                :season-number="currentSeasonNumber" 
                :poster="episodes?.poster_path" 
                :showId="tvShowId"
                @watch-episode="handleWatchEpisode"
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
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { TVShowDetails, useTvShows, TVShowSeasonDetails } from '../composables/useTvShows';
import { MovieCredit, MovieImages, MovieVideo } from '../composables/useMovies';
import { TVShowType } from '../composables/useTvShows';
import { useModal } from '../composables/useModal';
import { getLastWatchedMetaData } from '../composables/useStream';

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
        Clock, 
        TrailerModal
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const tvShowId = ref(route.params.id) as Ref<string>;
        const tvShow = ref<TVShowDetails>();
        const tvShowCredit = ref<MovieCredit>();
        const tvShowImages = ref<MovieImages>();
        const similarTvShow = ref<TVShowType[]>([]);
        const { fetchTvShow, fetchTvShowImages, fetchSimilarTvShows, fetchTvShowCredit, fetchTvShowBySeason, fetchTvShowVideos } = useTvShows();
        
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
                Promise.all([
                    handleFetchTvShow(),
                    handleFetchTvShowCredits(),
                    handleFetchTvShowImages(),
                    handleFetchSimilarTvShows(),
                ]);
                window.scrollTo(0, 0);
            }
        });
        
        const tvShowTrailer = ref<MovieVideo>();
        
        const showTrailer = async () => {
            const { data } = await fetchTvShowVideos(tvShowId.value);
            data.value?.results.forEach((i: MovieVideo) => {
                if (i.type === "Trailer") {
                    tvShowTrailer.value = i;
                }
            });
            useModal(TrailerModal, {
                props: {
                    video: tvShowTrailer.value
                }
            });
        };
        const lastWatchedData = computed(() => {
            return getLastWatchedMetaData(tvShowId.value);
        });
        const watchFirstEpisode = () => {
            if (lastWatchedData.value) {
                router.push({
                    name: 'StreamTVShow',
                    params: {
                        id: tvShowId.value,
                        season: lastWatchedData.value.season.toString(),
                        episode: lastWatchedData.value.episode.toString()
                    }
                });
                return;
            }
            router.push({
                name: 'StreamTVShow',
                params: {
                    id: tvShowId.value,
                    season: '1',
                    episode: '1'
                }
            });
        };
        
        const currentSeasonNumber = ref(1);
        
        const openDialog = (seasonNumber: number) => {
            showDialog.value = true;
            currentSeasonNumber.value = seasonNumber;
            handleFetchEpisodes(seasonNumber);
        };
        
        const handleFetchEpisodes = async (season: number) => {
            const { data } = await fetchTvShowBySeason(tvShowId.value, season);
            episodes.value = data.value;
        };

        const handleWatchEpisode = (episodeData: { showId: string | number, seasonNumber: number, episodeNumber: number }) => {
            router.push({
                name: 'StreamTVShow',
                params: {
                    id: episodeData.showId,
                    season: episodeData.seasonNumber.toString(),
                    episode: episodeData.episodeNumber.toString()
                }
            });
        };
        
        const formatAirDate = (dateString: string) => {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };
        
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
            if (!tvShow.value?.production_countries || tvShow.value.production_countries.length === 0) return "N/A";
            return tvShow.value?.production_countries.slice(0, 2).map((i) => i.name).join(", ");
        });
        
        const computedLanguage = computed(() => {
            if (!tvShow.value?.spoken_languages || tvShow.value.spoken_languages.length === 0) return "N/A";
            return tvShow.value?.spoken_languages.map((i) => i.name).join(", ");
        });
        
        const fullDate = computed(() => {
            if (!tvShow.value?.first_air_date) return "N/A";

            return new Date(tvShow.value?.first_air_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        });
        
        const IMDBLink = computed(() => {
            return `https://www.imdb.com/title/${tvShow.value?.id}`;
        });
        
        handleFetchTvShow();
        
        onMounted(() => {
            window.scrollTo(0, 0);
            Promise.all([
                handleFetchTvShowCredits(),
                handleFetchTvShowImages(),
                handleFetchSimilarTvShows(),
            ]);

            const seasonParam = route.query.season;
            if (seasonParam) {
                const seasonNumber = Number(seasonParam);
                currentSeasonNumber.value = seasonNumber;
                openDialog(seasonNumber);
            }
        });
        
        return {
            showTrailer,
            votingToRating,
            watchFirstEpisode,
            openDialog,
            showDialog,
            episodes,
            tvShow,
            tvShowId,
            computedTvShowImages,
            computedCountry,
            computedLanguage,
            fullDate,
            tvShowCredit,
            tvShowImages,
            similarTvShow,
            computedTvShowSeasons,
            currentSeasonNumber,
            IMDBLink,
            formatAirDate,
            handleWatchEpisode,
            lastWatchedData
        };
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
            position: relative;
            padding-left: 1rem;
            
            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                height: 70%;
                width: 4px;
                background-color: #f1b722;
                border-radius: 2px;
            }
        }

        .season-wrapper-count {
            display: flex;
            align-items: center;
            font-size: 1.2rem;
            background-color: #f1b722;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

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
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        padding: 1rem;

        @media screen and (max-width: 640px) {
            grid-template-columns: 1fr;
        }

        .season-item {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 1.75rem;
            background-color: #040d13;
            cursor: pointer;
            border-radius: .725rem;
            border: .125rem solid #081c28;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            height: 100%;
            
            &:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
                border-color: rgba(241, 183, 34, 0.5);
            }

            .season-info-container {
                display: flex;
                flex-direction: column;
                margin-bottom: 1rem;
                
                .season-title {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 0.5rem;
                }
                
                .season-air-date {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.6);
                }
            }

            .season-detail {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-top: 1rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);

                span {
                    font-weight: 500;
                    font-size: 1rem;
                    color: #f1b722;
                    background-color: rgba(241, 183, 34, 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 2rem;
                }

                svg {
                    color: #f1b722;
                    transition: transform 0.3s ease;
                }
                
                &:hover svg {
                    transform: translateX(4px);
                }
            }
        }
    }
}

.cast-wrapper {
    margin-top: 0;
}

.watch-now-wrapper {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    
    button {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        
        &:first-child {
            background-color: rgba(255, 255, 255, 0.2);
            color: #fff;
            border: 2px solid rgba(255, 255, 255, 0.4);
            
            &:hover {
                background-color: rgba(255, 255, 255, 0.3);
            }
        }
        
        &:last-child {
            background-color: #f1b722;
            color: #040d13;
            
            &:hover {
                background-color: #fff;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
        }
    }
}
</style>