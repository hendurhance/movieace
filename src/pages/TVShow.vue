<template>
    <div>
        <BaseHeader />

        <!-- Loading State -->
        <LoadingState v-if="isLoading" message="Loading TV show details..." size="large" />

        <!-- Error State -->
        <ErrorState v-else-if="hasError" title="Failed to load TV show" :message="errorMessage" @retry="retryFetch" />

        <!-- TV Show Content -->
        <section v-else-if="tvShow" class="remove-padding">
            <!-- Hero Section -->
            <div class="tv-show-hero" :style="{ backgroundImage: `url(${computedTvShowImages.backdrop})` }">
                <div class="tv-show-hero-overlay">
                    <div class="container">
                        <div class="tv-show-header-grid">
                            <div class="tv-show-poster">
                                <div class="poster-wrapper">
                                    <img :src="computedTvShowImages.poster" :alt="tvShow.name" loading="lazy">
                                    <div class="rating-badge">
                                        <div class="rating-content">
                                            <span class="rating-number">{{ tvShow.vote_average?.toFixed(1) || '7.4'
                                                }}</span>
                                            <div class="rating-stars">
                                                <RatingStar :count="votingToRating(tvShow.vote_average || 7.4, 5)"
                                                    :max="5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="poster-overlay">
                                        <button @click="showTrailer" class="trailer-btn">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M8 5v14l11-7z" fill="currentColor" />
                                            </svg>
                                            <span>Trailer</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="tv-show-header-content">
                                <div class="tv-show-title-section">
                                    <h1>{{ tvShow.name }}</h1>
                                    <div class="tv-show-tagline" v-if="tvShow.tagline">
                                        "{{ tvShow.tagline }}"
                                    </div>
                                </div>

                                <div class="info-wrapper">
                                    <div class="info-row">
                                        <div class="genre-tags">
                                            <span v-for="genre in tvShow.genres?.slice(0, 3)" :key="genre.id"
                                                class="genre-tag">
                                                {{ genre.name }}
                                            </span>
                                        </div>
                                        <div class="air-date">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                                                <path d="m12 6 0 6 4 2" stroke="currentColor" stroke-width="2"
                                                    stroke-linecap="round" />
                                            </svg>
                                            {{ fullDate }}
                                        </div>
                                    </div>
                                </div>

                                <p class="tv-show-overview">{{ tvShow.overview }}</p>

                                <div class="tv-show-stats">
                                    <div class="stat-item">
                                        <span class="stat-number">{{ tvShow.number_of_seasons }}</span>
                                        <span class="stat-label">Seasons</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number">{{ tvShow.number_of_episodes }}</span>
                                        <span class="stat-label">Episodes</span>
                                    </div>
                                    <div class="stat-item" v-if="tvShow.episode_run_time?.length">
                                        <span class="stat-number">{{ tvShow.episode_run_time[0] }}m</span>
                                        <span class="stat-label">Runtime</span>
                                    </div>
                                </div>

                                <div class="tv-show-details-grid">
                                    <div class="detail-item">
                                        <span class="detail-label">Country</span>
                                        <span class="detail-value">{{ computedCountry }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Language</span>
                                        <span class="detail-value">{{ computedLanguage }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Status</span>
                                        <span class="detail-value"
                                            :class="{ 'status-ended': tvShow.status === 'Ended' }">
                                            {{ tvShow.status }}
                                        </span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">IMDB</span>
                                        <a :href="IMDBLink" target="_blank" class="imdb-link">
                                            View on IMDB
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div class="action-buttons">
                                    <button @click="watchFirstEpisode" class="stream-btn primary">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M8 5v14l11-7z" fill="currentColor" />
                                        </svg>
                                        {{ lastWatchedData ? 'Continue Watching' : 'Start Watching' }}
                                    </button>
                                    <button @click="showTrailer" class="trailer-btn secondary">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"
                                                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                        Watch Trailer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Seasons Section -->
            <div class="container">
                <div class="seasons-wrapper">
                    <div class="section-header">
                        <h2>Seasons & Episodes</h2>
                        <div class="season-summary">
                            <span class="summary-item">{{ tvShow.number_of_seasons }} Seasons</span>
                            <span class="summary-item">{{ tvShow.number_of_episodes }} Episodes</span>
                        </div>
                    </div>

                    <div class="seasons-grid">
                        <div class="season-card" v-for="season in computedTvShowSeasons" :key="season.id"
                            @click="openDialog(season.season_number)">
                            <div class="season-poster" v-if="season.poster_path">
                                <img :src="`${IMAGE_BASEURL}w300${season.poster_path}`"
                                    :alt="`Season ${season.season_number}`" />
                            </div>
                            <div class="season-content">
                                <div class="season-header">
                                    <h3>Season {{ season.season_number }}</h3>
                                    <span class="episode-count">{{ season.episode_count }} Episodes</span>
                                </div>
                                <div class="season-meta">
                                    <span class="air-date" v-if="season.air_date">
                                        {{ formatAirDate(season.air_date) }}
                                    </span>
                                </div>
                                <p class="season-overview" v-if="season.overview">
                                    {{ season.overview.substring(0, 120) }}{{ season.overview.length > 120 ? '...' : ''
                                    }}
                                </p>
                                <div class="season-action">
                                    <span>View Episodes</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Sections -->
            <div class="tv-show-content">
                <!-- Cast Section -->
                <div class="container section" v-if="tvShowCredit?.cast">
                    <CastWrapper :title="''" :casts="tvShowCredit.cast" />
                </div>

                <!-- Images Section -->
                <div class="container section" v-if="tvShowImages?.posters">
                    <MoviePicture :pictures="tvShowImages.posters" />
                </div>

                <!-- Similar Shows Section -->
                <div class="container section" v-if="similarTvShow.length > 0">
                    <SimilarMovie :movie-item="similarTvShow" type="tv" />
                </div>
            </div>
        </section>

        <ErrorState v-else title="TV Show Not Found"
            message="The TV show you are looking for does not exist or has been removed." @retry="goToHome"
            :retry-text="'Go to Home'" background-color="#081b27" />
        <BaseFooter />

        <!-- Episode Dialog -->
        <teleport to="body">
            <EpisodeDialog :episodes="episodes?.episodes || []" :showDialog="showDialog"
                @update:showDialog="showDialog = $event" :season-number="currentSeasonNumber"
                :poster="episodes?.poster_path" :showId="tvShowId" @watch-episode="handleWatchEpisode"
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
import CastWrapper from '../containers/CastWrapper.vue';
import MoviePicture from '../containers/MoviePicture.vue';
import SimilarMovie from '../containers/SimilarMovie.vue';
import RatingStar from '../containers/RatingStar.vue';
import empty_movie_state from '../assets/img/empty-movie-state.png';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { TVShowDetails, useTvShows, TVShowSeasonDetails } from '../composables/useTvShows';
import { MovieCredit, MovieImages, MovieVideo } from '../composables/useMovies';
import { TVShowType } from '../composables/useTvShows';
import { useModal } from '../composables/useModal';
import { getLastWatchedMetaData } from '../composables/useStream';
import LoadingState from '../containers/LoadingState.vue';
import ErrorState from '../containers/ErrorState.vue';

export default defineComponent({
    name: 'TVShow',
    components: {
        BaseHeader,
        BaseFooter,
        LoadingState,
        ErrorState,
        EpisodeDialog,
        CastWrapper,
        MoviePicture,
        SimilarMovie,
        RatingStar,
        TrailerModal
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const tvShowId = ref(route.params.id) as Ref<string>;

        // State
        const tvShow = ref<TVShowDetails>();
        const tvShowCredit = ref<MovieCredit>();
        const tvShowImages = ref<MovieImages>();
        const similarTvShow = ref<TVShowType[]>([]);
        const showDialog = ref(false);
        const episodes = ref<TVShowSeasonDetails>();
        const currentSeasonNumber = ref(1);
        const isLoading = ref(true);
        const hasError = ref(false);
        const errorMessage = ref('');

        const {
            fetchTvShow,
            fetchTvShowImages,
            fetchSimilarTvShows,
            fetchTvShowCredit,
            fetchTvShowBySeason,
            fetchTvShowVideos
        } = useTvShows();

        const handleFetchTvShow = async () => {
            try {
                const { data } = await fetchTvShow(tvShowId.value);
                tvShow.value = data.value;
            } catch (error: any) {

                throw new Error('Failed to fetch TV show details');
            }
        };

        const handleFetchTvShowCredits = async () => {
            try {
                const { data } = await fetchTvShowCredit(tvShowId.value);
                tvShowCredit.value = data.value;
            } catch (error: any) {
                console.error('Failed to fetch TV show credits:', error);
            }
        };

        const handleFetchTvShowImages = async () => {
            try {
                const { data } = await fetchTvShowImages(tvShowId.value);
                tvShowImages.value = data.value;
            } catch (error: any) {
                console.error('Failed to fetch TV show images:', error);
            }
        };

        const handleFetchSimilarTvShows = async () => {
            try {
                const { data } = await fetchSimilarTvShows(tvShowId.value);
                if (data.value) {
                    similarTvShow.value = data.value.results;
                }
            } catch (error: any) {
                console.error('Failed to fetch similar TV shows:', error);
            }
        };

        const fetchAllData = async () => {
            isLoading.value = true;
            hasError.value = false;
            errorMessage.value = '';

            try {
                await handleFetchTvShow();
                await Promise.all([
                    handleFetchTvShowCredits(),
                    handleFetchTvShowImages(),
                    handleFetchSimilarTvShows(),
                ]);
            } catch (error: any) {
                hasError.value = true;
                errorMessage.value = error.message || 'Failed to load TV show details';
            } finally {
                isLoading.value = false;
            }
        };

        const retryFetch = () => {
            fetchAllData();
        };

        const tvShowTrailer = ref<MovieVideo>();
        const showTrailer = async () => {
            try {
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
            } catch (error) {
                console.error('Failed to fetch trailer:', error);
            }
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

        const openDialog = (seasonNumber: number) => {
            showDialog.value = true;
            currentSeasonNumber.value = seasonNumber;
            handleFetchEpisodes(seasonNumber);
        };

        const handleFetchEpisodes = async (season: number) => {
            try {
                const { data } = await fetchTvShowBySeason(tvShowId.value, season);
                episodes.value = data.value;
            } catch (error) {
                console.error('Failed to fetch episodes:', error);
            }
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

        const goToHome = () => {
            router.push('/');
        };

        const IMDBLink = computed(() => {
            return `https://www.imdb.com/title/${tvShow.value?.id}`;
        });

        onBeforeRouteUpdate(async (to, from) => {
            if (to.params.id !== from.params.id) {
                tvShowId.value = to.params.id as string;
                window.scrollTo(0, 0);
                await fetchAllData();
            }
        });

        onMounted(() => {
            window.scrollTo(0, 0);
            fetchAllData();

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
            lastWatchedData,
            IMAGE_BASEURL,
            isLoading,
            hasError,
            errorMessage,
            retryFetch,
            goToHome,
        };
    }
});
</script>

<style lang="scss" scoped>
.tv-show-hero {
    position: relative;
    min-height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    @media (max-width: 768px) {
        min-height: auto;
        padding: 2rem 0;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg,
                rgba(8, 27, 39, 0.85) 0%,
                rgba(15, 20, 25, 0.8) 50%,
                rgba(8, 27, 39, 0.85) 100%);
    }
}

.tv-show-hero-overlay {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 6rem 0 4rem;

    @media (max-width: 768px) {
        min-height: auto;
        padding: 4rem 0 2rem;
    }
}

.tv-show-header-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 4rem;
    align-items: start;

    @media (max-width: 1200px) {
        grid-template-columns: 300px 1fr;
        gap: 3rem;
    }

    @media (max-width: 968px) {
        grid-template-columns: 250px 1fr;
        gap: 2rem;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
    }
}

.tv-show-poster {
    position: relative;

    .poster-wrapper {
        position: relative;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
        transition: all 0.4s ease;

        &:hover {
            transform: translateY(-10px);
            box-shadow: 0 35px 80px rgba(0, 0, 0, 0.6);

            .poster-overlay {
                opacity: 1;
            }
        }

        img {
            width: 100%;
            height: auto;
            display: block;
            aspect-ratio: 2/3;
            object-fit: cover;
        }

        .rating-badge {
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(15px);
            border-radius: 16px;
            padding: 1rem;
            border: 1px solid rgba(241, 183, 34, 0.3);

            .rating-content {
                text-align: center;

                .rating-number {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #f1b722;
                    margin-bottom: 0.5rem;
                    line-height: 1;
                }

                .rating-stars {
                    transform: scale(0.85);
                    transform-origin: center;
                }
            }
        }

        .poster-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.4s ease;

            .trailer-btn {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem 2rem;
                background: linear-gradient(135deg, #f1b722 0%, #e6a71a 100%);
                border: none;
                border-radius: 50px;
                color: #000;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 8px 25px rgba(241, 183, 34, 0.4);

                &:hover {
                    transform: scale(1.05);
                    box-shadow: 0 12px 35px rgba(241, 183, 34, 0.6);
                }

                svg {
                    width: 20px;
                    height: 20px;
                }
            }
        }
    }
}

.tv-show-header-content {
    color: #fff;
    padding-top: 1rem;

    .tv-show-title-section {
        margin-bottom: 2rem;

        h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin: 0 0 1rem 0;
            line-height: 1.1;
            background: linear-gradient(135deg, #fff 0%, #f1b722 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;

            @media (max-width: 1200px) {
                font-size: 3rem;
            }

            @media (max-width: 968px) {
                font-size: 2.5rem;
            }

            @media (max-width: 768px) {
                font-size: 2rem;
            }
        }

        .tv-show-tagline {
            font-size: 1.3rem;
            font-style: italic;
            color: #f1b722;
            opacity: 0.9;
            font-weight: 300;

            @media (max-width: 768px) {
                font-size: 1.1rem;
            }
        }
    }
}

.info-wrapper {
    margin-bottom: 2rem;

    .info-row {
        display: flex;
        align-items: center;
        gap: 2rem;
        flex-wrap: wrap;

        @media (max-width: 768px) {
            justify-content: center;
            gap: 1rem;
        }
    }
}

.genre-tags {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;

    .genre-tag {
        padding: 0.6rem 1.2rem;
        background: rgba(241, 183, 34, 0.15);
        border: 2px solid rgba(241, 183, 34, 0.4);
        border-radius: 25px;
        color: #f1b722;
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(241, 183, 34, 0.25);
            border-color: rgba(241, 183, 34, 0.6);
            transform: translateY(-2px);
        }
    }
}

.air-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #8ea9bd;
    font-size: 1rem;
    font-weight: 500;
}

.tv-show-overview {
    font-size: 1.2rem;
    line-height: 1.8;
    margin-bottom: 2.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 300;
    
    @media (max-width: 768px) {
        font-size: 1.1rem;
        text-align: left;
    }
}

.tv-show-stats {
    display: flex;
    gap: 3rem;
    margin-bottom: 2.5rem;
    
    @media (max-width: 768px) {
        justify-content: center;
        gap: 2rem;
    }
    
    @media (max-width: 480px) {
        gap: 1.5rem;
    }
    
    .stat-item {
        text-align: center;
        
        .stat-number {
            display: block;
            font-size: 2.5rem;
            font-weight: 800;
            color: #f1b722;
            line-height: 1;
            
            @media (max-width: 768px) {
                font-size: 2rem;
            }
        }
        
        .stat-label {
            display: block;
            font-size: 0.9rem;
            color: #8ea9bd;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 0.5rem;
            font-weight: 600;
        }
    }
}

.tv-show-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem 3rem;
    margin-bottom: 3rem;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        text-align: left;
    }
    
    .detail-item {
        .detail-label {
            display: block;
            font-size: 0.85rem;
            color: #8ea9bd;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .detail-value {
            display: block;
            font-size: 1.1rem;
            color: #fff;
            font-weight: 500;
            
            &.status-ended {
                color: #ef4444;
            }
        }
        
        .imdb-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #f1b722;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            
            &:hover {
                color: #fff;
                transform: translateX(4px);
            }
        }
    }
}

.action-buttons {
    display: flex;
    gap: 1.5rem;
    
    @media (max-width: 768px) {
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }
    
    @media (max-width: 480px) {
        gap: 1rem;
    }
    
    button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1.2rem 2.5rem;
        border: none;
        border-radius: 15px;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
        justify-content: center;
        
        @media (max-width: 768px) {
            width: 100%;
            max-width: 300px;
        }
        
        &.primary {
            background: linear-gradient(135deg, #f1b722 0%, #e6a71a 100%);
            color: #000;
            box-shadow: 0 8px 25px rgba(241, 183, 34, 0.3);
            
            &:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 35px rgba(241, 183, 34, 0.5);
            }
        }
        
        &.secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            
            &:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.4);
                transform: translateY(-3px);
            }
        }
    }
}

// Seasons Section
.seasons-wrapper {
    margin: 4rem 0;
    padding: 3rem 0;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3rem;

        @media (max-width: 768px) {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        h2 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #fff;
            margin: 0;
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
                background: linear-gradient(135deg, #f1b722 0%, #e6a71a 100%);
                border-radius: 2px;
            }
        }

        .season-summary {
            display: flex;
            gap: 2rem;

            @media (max-width: 768px) {
                gap: 1rem;
            }

            .summary-item {
                padding: 0.75rem 1.5rem;
                background: rgba(241, 183, 34, 0.1);
                border: 1px solid rgba(241, 183, 34, 0.3);
                border-radius: 25px;
                color: #f1b722;
                font-weight: 600;
                font-size: 0.9rem;
            }
        }
    }
}

.seasons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
}

.season-card {
    display: flex;
    background: linear-gradient(135deg, rgba(15, 20, 25, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(241, 183, 34, 0.4);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .season-poster {
        width: 120px;
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .season-content {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;

        .season-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;

            h3 {
                font-size: 1.3rem;
                font-weight: 600;
                color: #fff;
                margin: 0;
            }

            .episode-count {
                background: rgba(241, 183, 34, 0.2);
                color: #f1b722;
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 500;
            }
        }

        .season-meta {
            margin-bottom: 1rem;

            .air-date {
                color: #8ea9bd;
                font-size: 0.9rem;
            }
        }

        .season-overview {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            line-height: 1.5;
            margin-bottom: 1rem;
            flex: 1;
        }

        .season-action {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #f1b722;
            font-weight: 500;
            font-size: 0.9rem;

            svg {
                transition: transform 0.3s ease;
            }
        }
    }

    &:hover .season-action svg {
        transform: translateX(4px);
    }
}
</style>