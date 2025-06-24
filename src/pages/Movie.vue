<template>
    <div>
        <BaseHeader />

        <!-- Loading State -->
        <LoadingState v-if="isLoading" message="Loading movie details..." size="large" />

        <!-- Error State -->
        <ErrorState v-else-if="hasError" title="Failed to load movie" :message="errorMessage" @retry="retryFetch" />

        <!-- Movie Content -->
        <section v-else-if="movie" class="remove-padding">
            <!-- Hero Section -->
            <div class="movie-hero" :style="{ backgroundImage: `url(${computedMovieImages.backdrop})` }">
                <div class="movie-hero-overlay">
                    <div class="container">
                        <div class="movie-header-grid">
                            <div class="movie-poster">
                                <div class="poster-wrapper">
                                    <img :src="computedMovieImages.poster" :alt="movie.title" loading="lazy" />
                                    <div class="rating-badge">
                                        <div class="rating-content">
                                            <span class="rating-number">{{ movie.vote_average.toFixed(1) }}</span>
                                            <div class="rating-stars">
                                                <RatingStar :count="votingToRating(movie.vote_average, 5)" :max="5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="poster-overlay">
                                        <button @click="showTrailer" class="trailer-btn">
                                            <Play class="icon" />
                                            <span>Trailer</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="movie-header-content">
                                <div class="movie-title-section">
                                    <h1>{{ movie.title }}</h1>
                                    <div class="movie-tagline" v-if="movie.tagline">
                                        "{{ movie.tagline }}"
                                    </div>
                                </div>

                                <div class="info-wrapper">
                                    <div class="info-row">
                                        <div class="genre-tags">
                                            <span v-for="genre in movie.genres?.slice(0, 3)" :key="genre.id"
                                                class="genre-tag">
                                                {{ genre.name }}
                                            </span>
                                        </div>
                                        <div class="release-date">
                                            <Clock stroke="currentColor" />
                                            {{ fullDate }}
                                        </div>
                                    </div>
                                </div>

                                <p class="movie-overview">{{ movie.overview }}</p>

                                <div class="movie-details-grid">
                                    <div class="detail-item">
                                        <span class="detail-label">Duration</span>
                                        <span class="detail-value">{{ computedMovieDuration }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Director</span>
                                        <span class="detail-value">{{movieCredit?.crew?.find(i => i.job ===
                                            'Director')?.name || 'N/A' }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Country</span>
                                        <span class="detail-value">{{ computedCountry }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Language</span>
                                        <span class="detail-value">{{ computedLanguage }}</span>
                                    </div>
                                    <div class="detail-item" v-if="computedBudget">
                                        <span class="detail-label">Budget</span>
                                        <span class="detail-value">{{ computedBudget }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">IMDB</span>
                                        <a :href="`https://imdb.com/title/${movie.imdb_id}`" target="_blank"
                                            class="imdb-link">
                                            View on IMDB
                                            <OpenExternal stroke="currentColor" />
                                        </a>
                                    </div>
                                </div>

                                <div class="action-buttons">
                                    <button @click="streamNow" class="stream-btn primary">
                                        <Play class="icon" />
                                        {{ lastWatchedData ? 'Continue Watching' : 'Stream Now' }}
                                    </button>
                                    <button @click="showTrailer" class="trailer-btn secondary">
                                        <Video stroke="currentColor" />
                                        Watch Trailer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Sections -->
            <div class="movie-content">
                <!-- Cast Section -->
                <div class="container section" v-if="movieCredit?.cast">
                    <CastWrapper :title="''" :casts="movieCredit.cast" />
                </div>

                <!-- Images Section -->
                <div class="container section" v-if="movieImages?.posters?.length">
                    <MoviePicture :pictures="movieImages.posters" />
                </div>

                <!-- Similar Movies Section -->
                <div class="container section" v-if="similarMovies.length > 0">
                    <SimilarMovie :movie-item="similarMovies" />
                </div>
            </div>
        </section>

        <ErrorState v-else title="Movie Not Found"
            message="The movie you are looking for does not exist or has been removed." @retry="toHome"
            retryText="Go to Home" backgroundColor="#081b27" />

        <BaseFooter />
    </div>
</template>


<script lang="ts">
import TrailerModal from '../components/TrailerModal.vue'
import { Ref, computed, defineComponent, onMounted, ref } from "vue";
import BaseHeader from "../components/base/BaseHeader.vue";
import BaseFooter from "../components/base/BaseFooter.vue";

import RatingStar from "../containers/RatingStar.vue";
import votingToRating from "../calculation/vote-to-rating";
import SimilarMovie from "../containers/SimilarMovie.vue";
import MoviePicture from "../containers/MoviePicture.vue";
import CastWrapper from "../containers/CastWrapper.vue";
import { Movie } from "../composables/useHighlights";
import { useMovies, MovieDetails, MovieCredit, MovieImages, MovieVideo } from "../composables/useMovies";
import { useModal } from "../composables/useModal";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import empty_movie_state from '../assets/img/empty-movie-state.png';
import { getLastWatchedMetaData } from '../composables/useStream';
import LoadingState from '../containers/LoadingState.vue';
import ErrorState from '../containers/ErrorState.vue';
import Play from '../components/svg/solid/play.vue';
import Video from '../components/svg/outline/video.vue';
import Clock from '../components/svg/outline/clock.vue';
import OpenExternal from '../components/svg/outline/open-external.vue';
import { addViewedItem } from '../composables/useHistory';

export default defineComponent({
    name: "Movie",
    components: {
        BaseHeader,
        BaseFooter,
        LoadingState,
        ErrorState,
        RatingStar,
        SimilarMovie,
        MoviePicture,
        CastWrapper,
        TrailerModal,
        Play,
        Video,
        Clock,
        OpenExternal
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const movieId = ref(route.params.id) as Ref<string>;
        const { fetchMovie, fetchMovieCredits, fetchMovieImages, fetchSimilarMovies, fetchMovieVideos } = useMovies();

        const movie = ref<MovieDetails>();
        const movieCredit = ref<MovieCredit>();
        const movieImages = ref<MovieImages>();
        const similarMovies = ref<Movie[]>([]);
        const isLoading = ref(true);
        const hasError = ref(false);
        const errorMessage = ref('');

        const handleFetchMovie = async () => {
            try {
                const { data } = await fetchMovie(movieId.value);
                movie.value = data.value;
            } catch (error: any) {
                throw new Error('Failed to fetch movie details');
            }
        };

        const handleFetchMovieCredits = async () => {
            try {
                const { data } = await fetchMovieCredits(movieId.value);
                movieCredit.value = data.value;
            } catch (error: any) {
                console.error('Failed to fetch movie credits:', error);
            }
        };

        const handleFetchMovieImages = async () => {
            try {
                const { data } = await fetchMovieImages(movieId.value);
                movieImages.value = data.value;
            } catch (error: any) {
                console.error('Failed to fetch movie images:', error);
            }
        };

        const handleFetchSimilarMovies = async () => {
            try {
                const { data } = await fetchSimilarMovies(movieId.value);
                if (data.value) {
                    similarMovies.value = data.value.results;
                }
            } catch (error: any) {
                console.error('Failed to fetch similar movies:', error);
            }
        };

        const fetchAllData = async () => {
            isLoading.value = true;
            hasError.value = false;
            errorMessage.value = '';

            try {
                await handleFetchMovie();
                await Promise.all([
                    handleFetchMovieCredits(),
                    handleFetchMovieImages(),
                    handleFetchSimilarMovies()
                ]);
                if (movie.value) {
                    addViewedItem({
                        id: movie.value.id,
                        title: movie.value.title,
                        image: movie.value.poster_path,
                        rating: movie.value.vote_average,
                        categories: movie.value.genres?.map(g => g.id) || [],
                        adult: movie.value.adult,
                        type: 'movie'
                    });
                }
            } catch (error: any) {
                hasError.value = true;
                errorMessage.value = error.message || 'Failed to load movie details';
            } finally {
                isLoading.value = false;
            }
        };

        const retryFetch = () => {
            fetchAllData();
        };

        const IMAGE_BASEURL = import.meta.env.VITE_IMAGE_BASE_URL;

        const computedMovieImages = computed(() => {
            return {
                backdrop: movie.value?.backdrop_path === null ? empty_movie_state : `${IMAGE_BASEURL}w1280${movie.value?.backdrop_path}`,
                poster: movie.value?.poster_path === null ? empty_movie_state : `${IMAGE_BASEURL}w780${movie.value?.poster_path}`
            };
        });

        const computedMovieDuration = computed(() => {
            if (!movie.value?.runtime) return "N/A";
            return `${Math.floor(movie.value?.runtime / 60)}hr ${movie.value?.runtime % 60}m`;
        });

        const computedCountry = computed(() => {
            if (!movie.value?.production_countries) return "N/A";
            return movie.value?.production_countries.slice(0, 2).map((i) => i.name).join(", ");
        });

        const computedLanguage = computed(() => {
            if (!movie.value?.spoken_languages) return "N/A";
            return movie.value?.spoken_languages.map((i) => i.name).join(", ");
        });

        const lastWatchedData = computed(() => {
            return getLastWatchedMetaData(movieId.value);
        });

        const fullDate = computed(() => {
            if (!movie.value?.release_date) return "N/A";
            return new Date(movie.value?.release_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        });

        const computedBudget = computed(() => {
            if (!movie.value?.budget) return "";
            return `$${movie.value?.budget.toLocaleString()}`;
        });

        const streamNow = () => {
            router.push(`/stream/movie/${movieId.value}`);
        };

        const movieTrailer = ref<MovieVideo>();
        const showTrailer = async () => {
            try {
                const { data } = await fetchMovieVideos(movieId.value);
                data.value?.results.forEach((i: MovieVideo) => {
                    if (i.type === "Trailer") {
                        movieTrailer.value = i;
                    }
                });
                useModal(TrailerModal, {
                    props: {
                        video: movieTrailer.value
                    }
                });
            } catch (error) {
                console.error('Failed to fetch trailer:', error);
            }
        };

        const toHome = () => {
            router.push('/');
        };

        onMounted(() => {
            window.scrollTo(0, 0);
            fetchAllData();
        });

        onBeforeRouteUpdate(async (to, from) => {
            if (to.params.id !== from.params.id) {
                movieId.value = to.params.id as string;
                window.scrollTo(0, 0);
                await fetchAllData();
            }
        });

        return {
            votingToRating,
            showTrailer,
            computedMovieImages,
            movie,
            computedMovieDuration,
            computedCountry,
            computedLanguage,
            movieCredit,
            movieImages,
            similarMovies,
            fullDate,
            computedBudget,
            streamNow,
            lastWatchedData,
            isLoading,
            hasError,
            errorMessage,
            retryFetch,
            toHome,
        };
    },
});
</script>

<style scoped lang="scss">
.movie-hero {
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
        background: linear-gradient(
            135deg, 
            rgba(8, 27, 39, 0.85) 0%, 
            rgba(15, 20, 25, 0.8) 50%, 
            rgba(8, 27, 39, 0.85) 100%
        );
    }
}

.movie-hero-overlay {
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

.movie-header-grid {
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

.movie-poster {
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

.movie-header-content {
    color: #fff;
    padding-top: 1rem;
    
    .movie-title-section {
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
        
        .movie-tagline {
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

.release-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #8ea9bd;
    font-size: 1rem;
    font-weight: 500;
}

.movie-overview {
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

.movie-details-grid {
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
</style>