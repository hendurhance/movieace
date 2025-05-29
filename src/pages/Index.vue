<template>
    <div>
        <BaseHeader />
        <section class="remove-padding">
            <!-- Search Section -->
            <HeroSearchWrapper @search="handleSearchGlobal" />
            
            <!-- Highlights Section -->
            <div class="container">
                <div class="highlights">
                    <div class="title-wrapper">
                        <h1>Highlights today</h1>
                        <p>Be sure not to miss today's highlights.</p>
                    </div>
                    <div class="button-tabs">
                        <button 
                            v-for="(button, idx) in highlightOptions" 
                            :key="idx" 
                            @click="handleUpdateHighlight(button)"
                            :class="{ 'active': button.toLowerCase() === currentHighlightTitle }"
                        >
                            {{ highLightOptions[button].title }}
                        </button>
                    </div>
                </div>
                
                <div class="movie-grid">
                    <div class="movie-grid-panel">
                        <!-- Loading State -->
                        <LoadingState 
                            v-if="loading" 
                            message="Loading movies..."
                            size="medium"
                        />
                        
                        <!-- Error State -->
                        <ErrorState 
                            v-else-if="error" 
                            :message="error"
                            @retry="retryFetch"
                        />
                        
                        <!-- Movies Grid -->
                        <template v-else>
                            <MovieItem 
                                v-for="item in currentHighLightDetails.data" 
                                :key="`${currentHighlightTitle}-${item.id}`"
                                :title="item.title"
                                :image="item.poster_path" 
                                :movie-id="item.id" 
                                :rating="item.vote_average"
                                :categories="item.genre_ids" 
                                :adult="item.adult"
                            />
                        </template>
                    </div>
                </div>
            </div>
            
            <!-- Featured Movie Section -->
            <div class="full-width">
                <FeaturedMovie 
                    v-if="topHighlight"
                    :key="topHighlight.id"
                    :movie-id="topHighlight.id" 
                    :name="topHighlight.title" 
                    :details="topHighlight.overview"
                    :image="topHighlight.poster_path" 
                    :categories="topHighlight.genre_ids"
                    :rating="topHighlight.vote_average" 
                    :date="topHighlight.release_date" 
                />
            </div>
            
            <!-- New Releases Section -->
            <div class="container push-up">
                <div class="new-releases-title-wrapper">
                    <h1>New Shows</h1>
                    <p>Our most recently released TV shows for you to enjoy.</p>
                </div>
                <div class="new-releases-row">
                    <div class="column">
                        <MovieItem 
                            v-for="item in newShows" 
                            :key="item.id" 
                            :size="'small'" 
                            :title="item.name"
                            :image="item.poster_path" 
                            :movie-id="item.id" 
                            :rating="item.vote_average"
                            :categories="item.genre_ids" 
                            type="tv" 
                            :adult="item.adult"
                        />
                    </div>
                </div>
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue'
import MovieItem from '../components/layout/MovieItem.vue'
import FeaturedMovie from '../components/layout/FeaturedMovie.vue';
import HeroSearchWrapper from '../containers/SearchWrapper.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import { useHighlights, highLightOptions, currentHighlightTitle, currentHighLightDetails } from "../composables/useHighlights"
import { useTvShows, newShows } from '../composables/useTvShows';
import { handleMovieClick } from '../composables/useMovies';
import { useRouter } from 'vue-router';
import LoadingState from '../containers/LoadingState.vue';
import ErrorState from '../containers/ErrorState.vue';

export default defineComponent({
    name: 'Index',
    components: {
        BaseHeader,
        MovieItem,
        FeaturedMovie,
        HeroSearchWrapper,
        BaseFooter,
        LoadingState,
        ErrorState
    },
    setup() {
        const { fetchAllHighlights, handleUpdateHighlight, loading, error } = useHighlights()
        const { fetchNewShows } = useTvShows()
        
        type highlightButtonType = "featured" | "popular" | "new"
        const highlightOptions = Object.keys(highLightOptions) as highlightButtonType[]
        
        const topHighlight = computed(() => {
            return currentHighLightDetails.value.data[0]
        })

        onMounted(async () => {
            await Promise.all([
                fetchAllHighlights(),
                fetchNewShows()
            ])
        })
        
        const router = useRouter()
        const handleSearchGlobal = (searchTerm: string) => {
            router.push({ name: 'Search', query: { search: searchTerm } })
        }

        const retryFetch = async () => {
            await fetchAllHighlights()
        }

        return {
            highlightOptions,
            currentHighlightTitle,
            handleUpdateHighlight,
            currentHighLightDetails,
            highLightOptions,
            topHighlight,
            newShows,
            handleMovieClick,
            handleSearchGlobal,
            loading,
            error,
            retryFetch
        }
    }
});
</script>

<style lang="scss" scoped>
.highlights {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        flex-direction: column;
        margin-bottom: 3rem;
    }

    .title-wrapper {
        text-align: left;

        @media (max-width: 768px) {
            text-align: center;
            margin-bottom: 2rem;
        }

        h1 {
            font-size: 3rem;
            color: #fff;
            font-weight: 700;
            margin-bottom: 1rem;

            @media (max-width: 768px) {
                font-size: 2.5rem;
            }

            @media (max-width: 480px) {
                font-size: 2rem;
            }
        }

        p {
            font-size: 1.2rem;
            font-weight: 400;
            color: #8ea9bd;
            margin-top: 1rem;

            @media (max-width: 768px) {
                font-size: 1rem;
            }
        }
    }

    .button-tabs {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;

        @media (max-width: 480px) {
            flex-wrap: wrap;
            gap: 0.25rem;
        }

        button {
            padding: 0.875rem 1.75rem;
            border-radius: 50px;
            border: 2px solid transparent;
            font-size: 1rem;
            font-weight: 500;
            color: #8ea9bd;
            background-color: rgba(12, 39, 56, 0.5);
            cursor: pointer;
            text-transform: capitalize;
            transition: all 0.3s ease;

            &:hover {
                border-color: #f1b722;
                color: #f1b722;
                transform: translateY(-2px);
            }

            @media (max-width: 768px) {
                padding: 0.75rem 1.5rem;
                font-size: 0.9rem;
            }

            @media (max-width: 480px) {
                padding: 0.625rem 1.25rem;
                font-size: 0.8rem;
            }

            &.active {
                background: linear-gradient(135deg, #f1b722 0%, #e6a71a 100%);
                color: #fff;
                border-color: #f1b722;
                box-shadow: 0 5px 15px rgba(241, 183, 34, 0.3);
            }
        }
    }
}

.movie-grid {
    margin-top: 2rem;

    .movie-grid-panel {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        grid-gap: 2rem;
        align-items: start;
        min-height: 300px;

        @media (max-width: 768px) {
            grid-gap: 1.5rem;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        @media (max-width: 480px) {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            grid-gap: 1rem;
        }

        // Loading and Error states span full width
        .loading-section,
        .error-state {
            grid-column: 1 / -1;
        }
    }
}

.full-width {
    width: 100%;
    height: 100%;
    margin-top: 3rem;
    padding-top: 0px;
    padding-bottom: 0px;
}

.push-up {
    padding-bottom: 2rem;
    .new-releases-title-wrapper {
        text-align: center;
        margin-bottom: 3rem;

        h1 {
            font-size: 4rem;
            line-height: 1.2;
            color: #fff;
            font-weight: 700;
            margin-bottom: 1rem;

            @media (max-width: 768px) {
                font-size: 3rem;
            }

            @media (max-width: 480px) {
                font-size: 2.5rem;
            }

            @media (max-width: 320px) {
                font-size: 2rem;
            }
        }

        p {
            font-size: 1.2rem;
            font-weight: 400;
            color: #8ea9bd;

            @media (max-width: 768px) {
                font-size: 1rem;
            }
        }
    }

    .new-releases-row {
        margin-top: 2rem;

        .column {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            grid-gap: 2rem;

            @media (max-width: 768px) {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                grid-gap: 1.5rem;
            }

            @media (max-width: 480px) {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                grid-gap: 1rem;
            }
        }
    }
}
</style>