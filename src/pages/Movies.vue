<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <Hero :title="'Discover Movies'" :subtitle="'Find your favorite movies and explore new ones'"
                    :search="true" :searchPlaceholder="'Search for a movie'" @search="handleSearchMovies" />
                <GenreLists :genres="genresFetched" :activeGenres="filteredGenres" @genre-click="handleAddGenre"
                    :type="'movies'" @clear-all="handleClearAllGenres" />
            </div>

            <!-- Results Section -->
            <div class="container">
                <ResultsHeader :title="getResultsTitle()" :count="discoveredMovies.length" item-type="movies"
                    :filter-text="filteredGenres.length > 0 ? `in ${getActiveGenreNames()}` : ''" :sort-value="sortBy"
                    :sort-options="movieSortOptions" @sort-change="handleSortChange" />

                <!-- Loading State -->
                <LoadingState v-if="isLoading" message="Loading amazing movies..." size="large" />

                <!-- Empty State -->
                <EmptyState v-else-if="discoveredMovies.length === 0" title="No movies found"
                    description="Try adjusting your search or genre filters" icon="🎬" @reset="handleResetFilters" />

                <!-- Movies Grid -->
                <div v-else class="movie-meta-grid">
                    <div class="movie-item-grid">
                        <MovieItem v-for="item in discoveredMovies" :key="item.id" :size="'large'" :title="item.title"
                            :movie-id="item.id" :image="item.poster_path" :rating="item.vote_average"
                            :categories="item.genre_ids" :adult="item.adult" />
                    </div>

                    <!-- Load More Button -->
                    <LoadMoreButton :current-page="pageNumber" :total-pages="totalPage" :is-loading="isLoadingMore"
                        item-type="Movies" @load-more="handleLoadMoreMovies" />
                </div>
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import MovieItem from '../components/layout/MovieItem.vue';
import Hero from '../containers/Hero.vue';
import GenreLists from '../components/layout/GenreLists.vue';
import { useGenres, Genre } from '../composables/useGenre';
import { Movie } from '../composables/useHighlights'
import { useMovies } from '../composables/useMovies';
import debounce from 'lodash.debounce';
import ResultsHeader from '../components/layout/ResultsHeader.vue';
import LoadingState from '../containers/LoadingState.vue';
import EmptyState from '../containers/EmptyState.vue';
import LoadMoreButton from '../components/layout/LoadMoreButton.vue';

export default defineComponent({
    name: 'Movies',
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
        const pageNumber = ref<number>(1);
        const sortBy = ref<string>('popularity.desc');
        const totalPage = ref<number>(1);
        const filteredGenres = ref<number[]>([]);
        const isLoading = ref<boolean>(false);
        const isLoadingMore = ref<boolean>(false);
        const currentSearchTerm = ref<string>('');

        const movieSortOptions = [
            { value: 'popularity.desc', label: 'Most Popular' },
            { value: 'release_date.desc', label: 'Newest First' },
            { value: 'release_date.asc', label: 'Oldest First' },
            { value: 'vote_average.desc', label: 'Highest Rated' },
            { value: 'title.asc', label: 'A-Z' },
            { value: 'title.desc', label: 'Z-A' }
        ];

        const mainUrl = computed(() =>
            `https://api.themoviedb.org/3/discover/movie?language=en-US&sort_by=${sortBy.value}`
        );

        const computedFetchUrl = computed(() => {
            let url = `${mainUrl.value}&page=${pageNumber.value}`;
            if (filteredGenres.value.length > 0) {
                url += `&with_genres=${filteredGenres.value.join(',')}`;
            }
            return url;
        });

        const genresFetched = ref<Genre[]>([]);
        const { getGenres } = useGenres('movie');

        const fetchGenres = async () => {
            const { data } = await getGenres();
            genresFetched.value = data.value;
        };

        const discoveredMovies = ref<Movie[]>([]);
        const { fetchDiscoverMovies } = useMovies();

        const handleFetchDiscoverMovies = async () => {
            isLoading.value = true;
            try {
                const { data } = await fetchDiscoverMovies(mainUrl.value);
                totalPage.value = data.value?.total_pages ?? 0;
                discoveredMovies.value = data.value?.results ?? [];
            } finally {
                isLoading.value = false;
            }
        };

        const handleLoadMoreMovies = async () => {
            if (pageNumber.value < totalPage.value) {
                isLoadingMore.value = true;
                pageNumber.value += 1;
                try {
                    const url = currentSearchTerm.value ?
                        `https://api.themoviedb.org/3/search/movie?query=${currentSearchTerm.value}&language=en-US&page=${pageNumber.value}` :
                        computedFetchUrl.value;
                    const { data } = await fetchDiscoverMovies(url);
                    discoveredMovies.value = [...discoveredMovies.value, ...data.value?.results ?? []];
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
                const { data } = await fetchDiscoverMovies(computedFetchUrl.value);
                totalPage.value = data.value?.total_pages ?? 0;
                discoveredMovies.value = data.value?.results ?? [];
            } finally {
                isLoading.value = false;
            }
        };

        const handleClearAllGenres = async () => {
            filteredGenres.value = [];
            pageNumber.value = 1;
            currentSearchTerm.value = '';
            await handleFetchDiscoverMovies();
        };

        const handleSortChange = async (newSortValue: string) => {
            sortBy.value = newSortValue;
            pageNumber.value = 1;
            if (currentSearchTerm.value) {
                currentSearchTerm.value = '';
            }
            await handleFetchDiscoverMovies();
        };

        const handleResetFilters = async () => {
            filteredGenres.value = [];
            currentSearchTerm.value = '';
            sortBy.value = 'popularity.desc';
            pageNumber.value = 1;
            await handleFetchDiscoverMovies();
        };

        const searchMovies = async (searchUrl: string) => {
            isLoading.value = true;
            try {
                const { data } = await fetchDiscoverMovies(searchUrl);
                totalPage.value = data.value?.total_pages ?? 0;
                discoveredMovies.value = data.value?.results ?? [];
            } finally {
                isLoading.value = false;
            }
        };

        const handleSearchMovies = debounce(async (searchValue: string) => {
            pageNumber.value = 1;

            if (searchValue === '') {
                currentSearchTerm.value = '';
                await handleFetchDiscoverMovies();
                return;
            }

            currentSearchTerm.value = searchValue;
            filteredGenres.value = [];

            const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${searchValue}&language=en-US&page=1`;
            await searchMovies(searchUrl);
        }, 500);

        const getResultsTitle = (): string => {
            if (currentSearchTerm.value) {
                return `Search Results for "${currentSearchTerm.value}"`;
            }
            if (filteredGenres.value.length > 0) {
                return `${getActiveGenreNames()} Movies`;
            }
            return 'Popular Movies';
        };

        const getActiveGenreNames = (): string => {
            const names = filteredGenres.value
                .map(id => genresFetched.value.find(g => g.id === id)?.name)
                .filter(Boolean);

            if (names.length === 1) return names[0]!;
            if (names.length === 2) return names.join(' & ');
            return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
        };

        onMounted(() => {
            fetchGenres();
            handleFetchDiscoverMovies();
        });

        return {
            genresFetched,
            discoveredMovies,
            filteredGenres,
            totalPage,
            pageNumber,
            sortBy,
            isLoading,
            isLoadingMore,
            movieSortOptions,
            handleLoadMoreMovies,
            handleAddGenre,
            handleClearAllGenres,
            handleSearchMovies,
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