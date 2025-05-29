<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <Hero :title="'Discover TV Shows'" :subtitle="'Find your favorite TV shows and explore new ones'"
                    :search="true" :searchPlaceholder="'Search for a TV show'" @search="handleSearchTvShows" />
                <GenreLists :genres="genres" :activeGenres="filteredGenres" @genre-click="handleAddGenre"
                    @clear-all="handleClearAllGenres" />
            </div>

            <!-- Results Section -->
            <div class="container">
                <ResultsHeader :title="getResultsTitle()" :count="discoveredShows.length" item-type="TV shows"
                    :filter-text="filteredGenres.length > 0 ? `in ${getActiveGenreNames()}` : ''" :sort-value="sortBy"
                    :sort-options="tvSortOptions" @sort-change="handleSortChange" />

                <!-- Loading State -->
                <LoadingState v-if="isLoading" message="Loading amazing TV shows..." size="large" />

                <!-- Empty State -->
                <EmptyState v-else-if="discoveredShows.length === 0" title="No TV shows found"
                    description="Try adjusting your search or genre filters" icon="📺" @reset="handleResetFilters" />

                <!-- TV Shows Grid -->
                <div v-else class="movie-meta-grid">
                    <div class="movie-item-grid">
                        <MovieItem v-for="item in discoveredShows" :key="item.id" :size="'large'" :title="item.name"
                            :movie-id="item.id" type="tv" :image="item.poster_path" :rating="item.vote_average"
                            :categories="item.genre_ids" />
                    </div>

                    <!-- Load More Button -->
                    <LoadMoreButton :current-page="pageNumber" :total-pages="totalPage" :is-loading="isLoadingMore"
                        item-type="TV Shows" @load-more="handleLoadMoreTvShows" />
                </div>
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import MovieItem from '../components/layout/MovieItem.vue';
import Hero from '../containers/Hero.vue';
import GenreLists from '../components/layout/GenreLists.vue';
import { useGenres, Genre } from '../composables/useGenre';
import { TVShowType, useTvShows } from '../composables/useTvShows';
import debounce from 'lodash.debounce';
import ResultsHeader from '../components/layout/ResultsHeader.vue';
import LoadingState from '../containers/LoadingState.vue';
import LoadMoreButton from '../components/layout/LoadMoreButton.vue';
import EmptyState from '../containers/EmptyState.vue';

export default defineComponent({
    name: 'TVShows',
    components: {
        BaseHeader,
        BaseFooter,
        MovieItem,
        Hero,
        GenreLists,
        ResultsHeader,
        LoadingState,
        EmptyState,
        LoadMoreButton
    },
    setup() {
        const genres = ref<Genre[]>([]);
        const { getGenres } = useGenres('tv');
        const pageNumber = ref<number>(1);
        const sortBy = ref<string>('popularity.desc');
        const totalPage = ref<number>(1);
        const filteredGenres = ref<number[]>([]);
        const isLoading = ref<boolean>(false);
        const isLoadingMore = ref<boolean>(false);
        const currentSearchTerm = ref<string>('');

        const tvSortOptions = [
            { value: 'popularity.desc', label: 'Most Popular' },
            { value: 'first_air_date.desc', label: 'Newest First' },
            { value: 'first_air_date.asc', label: 'Oldest First' },
            { value: 'vote_average.desc', label: 'Highest Rated' },
            { value: 'name.asc', label: 'A-Z' },
            { value: 'name.desc', label: 'Z-A' }
        ];

        const mainUrl = computed(() =>
            `https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=${sortBy.value}`
        );

        const computedFetchUrl = computed(() => {
            let url = `${mainUrl.value}&page=${pageNumber.value}`;
            if (filteredGenres.value.length > 0) {
                url += `&with_genres=${filteredGenres.value.join(',')}`;
            }
            return url;
        });

        const fetchGenres = async () => {
            const { data } = await getGenres();
            genres.value = data.value;
        };

        const discoveredShows = ref<TVShowType[]>([]);
        const { fetchDiscoverShows } = useTvShows();

        const handleFetchDiscoverShows = async () => {
            isLoading.value = true;
            try {
                const { data } = await fetchDiscoverShows(mainUrl.value);
                totalPage.value = data.value?.total_pages ?? 0;
                discoveredShows.value = data.value?.results ?? [];
            } finally {
                isLoading.value = false;
            }
        };

        const handleLoadMoreTvShows = async () => {
            if (pageNumber.value < totalPage.value) {
                isLoadingMore.value = true;
                pageNumber.value += 1;
                try {
                    const url = currentSearchTerm.value ?
                        `https://api.themoviedb.org/3/search/tv?query=${currentSearchTerm.value}&language=en-US&page=${pageNumber.value}` :
                        computedFetchUrl.value;
                    const { data } = await fetchDiscoverShows(url);
                    discoveredShows.value = [...discoveredShows.value, ...data.value?.results ?? []];
                } finally {
                    isLoadingMore.value = false;
                }
            }
        };

        const handleAddGenre = async (genre: { id: number, name: string }) => {
            if (!filteredGenres.value.includes(genre.id)) {
                filteredGenres.value.push(genre.id);
            } else {
                filteredGenres.value = filteredGenres.value.filter((item) => item !== genre.id);
            }
            pageNumber.value = 1;
            currentSearchTerm.value = '';

            isLoading.value = true;
            try {
                const { data } = await fetchDiscoverShows(computedFetchUrl.value);
                totalPage.value = data.value?.total_pages ?? 0;
                discoveredShows.value = data.value?.results ?? [];
            } finally {
                isLoading.value = false;
            }
        };

        const handleClearAllGenres = async () => {
            filteredGenres.value = [];
            pageNumber.value = 1;
            currentSearchTerm.value = '';
            await handleFetchDiscoverShows();
        };

        const handleSortChange = async (newSortValue: string) => {
            sortBy.value = newSortValue;
            pageNumber.value = 1;
            if (currentSearchTerm.value) {
                currentSearchTerm.value = '';
            }
            await handleFetchDiscoverShows();
        };

        const handleResetFilters = async () => {
            filteredGenres.value = [];
            currentSearchTerm.value = '';
            sortBy.value = 'popularity.desc';
            pageNumber.value = 1;
            await handleFetchDiscoverShows();
        };

        const searchTvShows = async (searchUrl: string) => {
            isLoading.value = true;
            try {
                const { data } = await fetchDiscoverShows(searchUrl);
                totalPage.value = data.value?.total_pages ?? 0;
                discoveredShows.value = data.value?.results ?? [];
            } finally {
                isLoading.value = false;
            }
        };

        const handleSearchTvShows = debounce(async (searchValue: string) => {
            pageNumber.value = 1;

            if (searchValue === '') {
                currentSearchTerm.value = '';
                await handleFetchDiscoverShows();
                return;
            }

            currentSearchTerm.value = searchValue;
            filteredGenres.value = [];

            const searchUrl = `https://api.themoviedb.org/3/search/tv?query=${searchValue}&language=en-US&page=1`;
            await searchTvShows(searchUrl);
        }, 500);

        const getResultsTitle = (): string => {
            if (currentSearchTerm.value) {
                return `Search Results for "${currentSearchTerm.value}"`;
            }
            if (filteredGenres.value.length > 0) {
                return `${getActiveGenreNames()} TV Shows`;
            }
            return 'Popular TV Shows';
        };

        const getActiveGenreNames = (): string => {
            const names = filteredGenres.value
                .map(id => genres.value.find(g => g.id === id)?.name)
                .filter(Boolean);

            if (names.length === 1) return names[0]!;
            if (names.length === 2) return names.join(' & ');
            return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
        };

        onMounted(() => {
            fetchGenres();
            handleFetchDiscoverShows();
        });

        return {
            genres,
            discoveredShows,
            filteredGenres,
            totalPage,
            pageNumber,
            sortBy,
            isLoading,
            isLoadingMore,
            tvSortOptions,
            handleLoadMoreTvShows,
            handleAddGenre,
            handleClearAllGenres,
            handleSearchTvShows,
            handleSortChange,
            handleResetFilters,
            getResultsTitle,
            getActiveGenreNames
        };
    }
});
</script>

<style scoped lang="scss">
.movie-meta-grid {
    margin-top: 2rem;
}

.movie-item-grid {
    align-items: start;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }

    @media (max-width: 992px) {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.5rem;
    }

    @media (max-width: 576px) {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 0.75rem;
    }

    @media (max-width: 480px) {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }
}

@media (max-width: 576px) {
    .container {
        padding: 0 1rem;
    }
}
</style>