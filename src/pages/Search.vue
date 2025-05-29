<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <Hero 
                    :title="'Search Results'"
                    :subtitle="'Discover movies, TV shows, and actors all in one place'" 
                    :search="true" 
                    :default-value="currentSearchParam as string"
                    :searchPlaceholder="'Search for movies, TV shows, or actors...'" 
                    @search="handleSearch"
                    @clear="handleClearSearch"
                />
            </div>

            <!-- Search Summary -->
            <div class="container" v-if="currentSearchParam">
                <div class="search-summary">
                    <div class="search-header">
                        <h2 class="search-title">
                            Results for "{{ currentSearchParam }}"
                        </h2>
                        <button @click="handleClearSearch" class="clear-search-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Clear Search
                        </button>
                    </div>
                    <div class="search-stats">
                        <div class="stat-item" v-if="discoveredMovies.length > 0">
                            <span class="stat-number">{{ discoveredMovies.length }}</span>
                            <span class="stat-label">Movies</span>
                        </div>
                        <div class="stat-item" v-if="discoveredTv.length > 0">
                            <span class="stat-number">{{ discoveredTv.length }}</span>
                            <span class="stat-label">TV Shows</span>
                        </div>
                        <div class="stat-item" v-if="discoveredPeople.length > 0">
                            <span class="stat-number">{{ discoveredPeople.length }}</span>
                            <span class="stat-label">Actors</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div class="container" v-if="isLoading">
                <LoadingState
                    message="Searching across movies, TV shows, and actors..."
                    size="large"
                />
            </div>

            <!-- Results Sections -->
            <template v-else-if="hasAnyResults">
                <!-- Movies Section -->
                <div class="container results-section" v-if="discoveredMovies.length > 0">
                    <div class="section-header">
                        <div class="section-title">
                            <h3>Movies</h3>
                            <span class="section-count">{{ discoveredMovies.length }} results</span>
                        </div>
                        <div class="section-icon">🎬</div>
                    </div>
                    <SearchResults :media-type="'movie'" :data="discoveredMovies" />
                </div>

                <!-- TV Shows Section -->
                <div class="container results-section" v-if="discoveredTv.length > 0">
                    <div class="section-header">
                        <div class="section-title">
                            <h3>TV Shows</h3>
                            <span class="section-count">{{ discoveredTv.length }} results</span>
                        </div>
                        <div class="section-icon">📺</div>
                    </div>
                    <SearchResults :media-type="'tv'" :data="discoveredTv" />
                </div>

                <!-- Actors Section -->
                <div class="container results-section" v-if="discoveredPeople.length > 0">
                    <div class="section-header">
                        <div class="section-title">
                            <h3>Actors</h3>
                            <span class="section-count">{{ discoveredPeople.length }} results</span>
                        </div>
                        <div class="section-icon">🎭</div>
                    </div>
                    <CastWrapper :title="''" :casts="discoveredPeople" />
                </div>

                <!-- Load More Button -->
                <div class="container">
                    <LoadMoreButton
                        v-if="reqMetaData.total_pages > reqMetaData.page"
                        :current-page="reqMetaData.page"
                        :total-pages="reqMetaData.total_pages"
                        :is-loading="isLoadingMore"
                        item-type="Results"
                        @load-more="handleLoadMoreMovies"
                    />
                </div>
            </template>

            <!-- Empty State -->
            <div class="container" v-else-if="currentSearchParam && !isLoading">
                <EmptyState
                    title="No results found"
                    :description="`We couldn't find any movies, TV shows, or actors matching '${currentSearchParam}'. Try a different search term.`"
                    icon="🔍"
                    :show-reset-button="true"
                    @reset="handleClearSearch"
                    :retry-text="'Clear Search'"
                />
                
                <!-- Search Suggestions -->
                <div class="search-suggestions">
                    <h4>Try searching for:</h4>
                    <div class="suggestion-chips">
                        <button 
                            v-for="suggestion in searchSuggestions"
                            :key="suggestion"
                            @click="handleSearch(suggestion)"
                            class="suggestion-chip"
                        >
                            {{ suggestion }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Initial State -->
            <div class="container" v-else-if="!currentSearchParam">
                <div class="initial-search-state">
                    <div class="search-welcome">
                        <div class="welcome-icon">🎯</div>
                        <h3>Ready to discover?</h3>
                        <p>Search for your favorite movies, TV shows, or actors to get started</p>
                    </div>
                    
                    <div class="popular-searches">
                        <h4>Popular searches:</h4>
                        <div class="popular-chips">
                            <button 
                                v-for="popular in popularSearches"
                                :key="popular"
                                @click="handleSearch(popular)"
                                class="popular-chip"
                            >
                                {{ popular }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import Hero from '../containers/Hero.vue';
import SearchResults from '../containers/SearchResults.vue';
import CastWrapper from '../containers/CastWrapper.vue';
import { useRoute, useRouter } from 'vue-router';
import { useSearch, discoveredMovies, discoveredTv, discoveredPeople, reqMetaData } from '../composables/useSearch';
import LoadMoreButton from '../components/layout/LoadMoreButton.vue';
import EmptyState from '../containers/EmptyState.vue';
import LoadingState from '../containers/LoadingState.vue';

const route = useRoute();
const router = useRouter();
const { fetchSearchResults, clearSearchResults } = useSearch();

const isLoading = ref(false);
const isLoadingMore = ref(false);

const searchSuggestions = [
    'Marvel', 'Christopher Nolan', 'Breaking Bad', 'Game of Thrones', 
    'Leonardo DiCaprio', 'The Office', 'Star Wars', 'Friends'
];

const popularSearches = [
    'Avengers', 'Stranger Things', 'Tom Hanks', 'The Dark Knight',
    'Friends', 'Ryan Gosling', 'Inception', 'The Crown'
];

const hasAnyResults = computed(() => {
    return discoveredMovies.value.length > 0 || 
           discoveredTv.value.length > 0 || 
           discoveredPeople.value.length > 0;
});

const handleSearch = (searchQuery: string) => {
    if (!searchQuery || !searchQuery.trim()) {
        handleClearSearch();
        return;
    }
    
    router.push({ query: { search: searchQuery.trim() } });
};

const handleClearSearch = () => {
    clearSearchResults();
    
    currentSearchParam.value = '';
    
    router.push({ query: {} });
    
    isLoading.value = false;
    isLoadingMore.value = false;
};

const currentSearchParam = ref(route.query.search);

const performSearch = async (query: string, page: number = 1) => {
    if (!query || !query.trim()) {
        handleClearSearch();
        return;
    }
    
    if (page === 1) {
        isLoading.value = true;
    } else {
        isLoadingMore.value = true;
    }
    
    try {
        await fetchSearchResults(query.trim(), page);
    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        isLoading.value = false;
        isLoadingMore.value = false;
    }
};

watch(() => route.query.search, (query) => {
    const queryStr = typeof query === 'string' ? query : Array.isArray(query) ? query[0] || '' : '';
    currentSearchParam.value = queryStr;
    if (queryStr && queryStr.trim()) {
        performSearch(queryStr);
    } else {
        clearSearchResults();
        currentSearchParam.value = '';
    }
});

onMounted(() => {
    window.scrollTo(0, 0);
    currentSearchParam.value = route.query.search as string;
    if (currentSearchParam.value && currentSearchParam.value.trim()) {
        performSearch(currentSearchParam.value as string);
    }
});

const handleLoadMoreMovies = async () => {
    if (reqMetaData.value.page < reqMetaData.value.total_pages && currentSearchParam.value) {
        await performSearch(currentSearchParam.value as string, reqMetaData.value.page + 1);
    }
};
</script>

<style lang="scss" scoped>
.search-summary {
    margin: 2rem 0;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(15, 20, 25, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    
    .search-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        
        @media (max-width: 768px) {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
        
        .search-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #ffffff;
            margin: 0;
            
            @media (max-width: 768px) {
                font-size: 1.5rem;
            }
        }
        
        .clear-search-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 25px;
            color: #ffffff;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
            
            svg {
                width: 14px;
                height: 14px;
            }
        }
    }
    
    .search-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        
        @media (max-width: 768px) {
            gap: 1rem;
        }
        
        @media (max-width: 480px) {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }
        
        .stat-item {
            text-align: center;
            
            .stat-number {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: #f1b722;
                
                @media (max-width: 768px) {
                    font-size: 1.2rem;
                }
            }
            
            .stat-label {
                display: block;
                font-size: 0.9rem;
                color: #8ea9bd;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 0.25rem;
            }
        }
    }
}

.results-section {
    margin-bottom: 3rem;
    
    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: rgba(15, 20, 25, 0.3);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        
        .section-title {
            display: flex;
            align-items: baseline;
            gap: 1rem;
            
            h3 {
                font-size: 1.5rem;
                font-weight: 700;
                color: #ffffff;
                margin: 0;
                
                @media (max-width: 768px) {
                    font-size: 1.3rem;
                }
            }
            
            .section-count {
                font-size: 0.9rem;
                color: #8ea9bd;
                font-weight: 500;
                background: rgba(241, 183, 34, 0.1);
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                border: 1px solid rgba(241, 183, 34, 0.3);
            }
        }
        
        .section-icon {
            font-size: 1.5rem;
            opacity: 0.7;
        }
    }
}

.search-suggestions, .popular-searches {
    margin-top: 3rem;
    text-align: center;
    
    h4 {
        font-size: 1.2rem;
        color: #ffffff;
        margin-bottom: 1rem;
        font-weight: 600;
    }
    
    .suggestion-chips, .popular-chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.75rem;
    }
    
    .suggestion-chip, .popular-chip {
        padding: 0.75rem 1.5rem;
        background: rgba(241, 183, 34, 0.1);
        border: 1px solid rgba(241, 183, 34, 0.3);
        border-radius: 25px;
        color: #f1b722;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
            background: rgba(241, 183, 34, 0.2);
            border-color: rgba(241, 183, 34, 0.5);
            transform: translateY(-2px);
        }
    }
    
    .popular-chip {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        
        &:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
        }
    }
}

.initial-search-state {
    text-align: center;
    padding: 4rem 2rem;
    
    .search-welcome {
        margin-bottom: 3rem;
        
        .welcome-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.8;
        }
        
        h3 {
            font-size: 2rem;
            color: #ffffff;
            margin: 0 0 1rem 0;
            font-weight: 700;
            
            @media (max-width: 768px) {
                font-size: 1.7rem;
            }
        }
        
        p {
            font-size: 1.1rem;
            color: #8ea9bd;
            margin: 0;
            max-width: 500px;
            margin: 0 auto;
            line-height: 1.6;
        }
    }
}

@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }
    
    .results-section {
        .section-header {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
    }
    
    .search-summary {
        margin: 1.5rem 0;
        padding: 1.5rem;
    }
}

@media (max-width: 480px) {
    .search-suggestions, .popular-searches {
        .suggestion-chips, .popular-chips {
            flex-direction: column;
            align-items: center;
            
            .suggestion-chip, .popular-chip {
                width: 100%;
                max-width: 250px;
            }
        }
    }
}
</style>