<template>
    <div class="discover">
        <SiteHeader />

        <main id="main" class="discover__main" role="main">
            <section class="discover__masthead container-lm">
                <p class="eyebrow discover__eyebrow">The Library · Series</p>
                <h1 class="discover__title display">Discover shows</h1>
                <p class="discover__subtitle">
                    Long-form stories, arranged by taste. Filter by era, tempo, and the mood you're in.
                </p>

                <form class="discover__search" role="search" @submit.prevent>
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="m20 20-3.5-3.5"/>
                    </svg>
                    <input
                        type="search"
                        class="discover__input"
                        placeholder="Search shows by title"
                        :value="searchTerm"
                        aria-label="Search TV shows"
                        @input="onSearchInput"
                    />
                    <button
                        v-if="searchTerm"
                        type="button"
                        class="discover__clear"
                        aria-label="Clear search"
                        @click="clearSearch"
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/>
                        </svg>
                    </button>
                </form>
            </section>

            <section class="discover__body container-lm">
                <FilterPanel
                    class="discover__filters"
                    kind="tv"
                    :genres="genres"
                    :genres-loading="!genres.length"
                    :filters="filters"
                    :year-bounds="yearBounds"
                    @update:filters="onFiltersChange"
                    @reset="resetFilters"
                />

                <div class="discover__results">
                    <header class="discover__results-head">
                        <div>
                            <p class="eyebrow discover__results-eyebrow">{{ resultsEyebrow }}</p>
                            <h2 class="discover__results-title">{{ resultsTitle }}</h2>
                        </div>
                        <p v-if="totalResults" class="meta discover__count">
                            {{ totalResults.toLocaleString() }} results
                        </p>
                    </header>

                    <div v-if="activeChips.length" class="discover__active" role="list">
                        <button
                            v-for="chip in activeChips"
                            :key="chip.key"
                            type="button"
                            class="discover__active-chip"
                            @click="chip.clear"
                        >
                            {{ chip.label }}
                            <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>

                    <div v-if="isLoading && !results.length" class="discover__loading" role="status">
                        <div class="discover__spinner" aria-hidden="true" />
                        <span class="meta">Pulling the tape…</span>
                    </div>

                    <div v-else-if="!results.length" class="discover__empty">
                        <div class="discover__empty-icon" aria-hidden="true">
                            <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.4">
                                <circle cx="32" cy="32" r="22"/>
                                <circle cx="32" cy="32" r="7"/>
                                <circle cx="32" cy="14" r="3"/>
                                <circle cx="32" cy="50" r="3"/>
                                <circle cx="14" cy="32" r="3"/>
                                <circle cx="50" cy="32" r="3"/>
                            </svg>
                        </div>
                        <h3 class="discover__empty-title display">Nothing in rotation.</h3>
                        <p class="discover__empty-desc">
                            No series match the current filter set. Try widening the year range
                            or clearing a genre.
                        </p>
                        <button type="button" class="discover__empty-reset" @click="resetFilters">
                            Reset filters
                        </button>
                    </div>

                    <div v-else class="discover__grid">
                        <PosterCard
                            v-for="item in results"
                            :key="item.id"
                            :id="item.id"
                            type="tv"
                            :title="item.name"
                            :poster-path="item.poster_path"
                            :rating="item.vote_average"
                            :release-date="item.first_air_date"
                            :genre-ids="item.genre_ids"
                            :adult="item.adult"
                        />
                    </div>

                    <div v-if="hasMore" class="discover__more">
                        <button
                            type="button"
                            class="discover__more-btn"
                            :disabled="isLoadingMore"
                            @click="loadMore"
                        >
                            <span v-if="isLoadingMore">Loading…</span>
                            <span v-else>Load more · page {{ page }}/{{ totalPages }}</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>

        <SiteFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter, LocationQueryRaw } from 'vue-router';
import debounce from 'lodash.debounce';
import SiteHeader from '../components/navigation/SiteHeader.vue';
import SiteFooter from '../components/navigation/SiteFooter.vue';
import FilterPanel, { DiscoverFilters, RuntimeBand } from '../components/discover/FilterPanel.vue';
import PosterCard from '../components/cards/PosterCard.vue';
import { useTvShows, TVShowType } from '../composables/useTvShows';
import useAxios from '../composables/useAxios';
import { addSearchTerm } from '../composables/useHistory';
import { primeGenres, getGenres, Genre } from '../composables/useGenreLookup';

interface TvShowResponse {
    page: number;
    total_pages: number;
    total_results: number;
    results: TVShowType[];
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_BOUNDS: [number, number] = [1950, CURRENT_YEAR + 2];

const TV_RUNTIME_BANDS: RuntimeBand[] = [
    { value: 'any', label: 'Any length' },
    { value: 'short', label: '< 30m', lte: 29 },
    { value: 'standard', label: '30–59m', gte: 30, lte: 59 },
    { value: 'long', label: '60m+', gte: 60 }
];

const DEFAULT_SORT = 'popularity.desc';

const makeDefaultFilters = (): DiscoverFilters => ({
    genres: [],
    yearRange: [...YEAR_BOUNDS] as [number, number],
    minRating: 0,
    runtimeBand: 'any',
    language: '',
    sortBy: DEFAULT_SORT
});

export default defineComponent({
    name: 'TVShows',
    components: { SiteHeader, SiteFooter, FilterPanel, PosterCard },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const { fetchDiscoverShows } = useTvShows();

        const genres = ref<Genre[]>([]);
        const results = ref<TVShowType[]>([]);
        const page = ref(1);
        const totalPages = ref(1);
        const totalResults = ref(0);
        const isLoading = ref(false);
        const isLoadingMore = ref(false);

        const filters = ref<DiscoverFilters>(makeDefaultFilters());
        const searchTerm = ref<string>('');

        const hydrateFromRoute = () => {
            const q = route.query;
            const next = makeDefaultFilters();

            if (typeof q.genre === 'string' && q.genre) {
                next.genres = q.genre.split(',').map(Number).filter(n => !Number.isNaN(n));
            }
            if (typeof q.year === 'string' && q.year.includes('-')) {
                const [lo, hi] = q.year.split('-').map(Number);
                if (!Number.isNaN(lo) && !Number.isNaN(hi)) {
                    next.yearRange = [lo, hi];
                }
            }
            if (typeof q.min_rating === 'string') {
                const v = Number(q.min_rating);
                if (!Number.isNaN(v)) next.minRating = v;
            }
            if (typeof q.runtime === 'string') next.runtimeBand = q.runtime;
            if (typeof q.lang === 'string') next.language = q.lang;
            if (typeof q.sort === 'string') next.sortBy = q.sort;

            filters.value = next;
            searchTerm.value = typeof q.q === 'string' ? q.q : '';
        };

        const syncRoute = () => {
            const f = filters.value;
            const q: LocationQueryRaw = {};
            if (f.genres.length) q.genre = f.genres.join(',');
            if (f.yearRange[0] !== YEAR_BOUNDS[0] || f.yearRange[1] !== YEAR_BOUNDS[1]) {
                q.year = `${f.yearRange[0]}-${f.yearRange[1]}`;
            }
            if (f.minRating > 0) q.min_rating = String(f.minRating);
            if (f.runtimeBand && f.runtimeBand !== 'any') q.runtime = f.runtimeBand;
            if (f.language) q.lang = f.language;
            if (f.sortBy !== DEFAULT_SORT) q.sort = f.sortBy;
            if (searchTerm.value) q.q = searchTerm.value;

            if (JSON.stringify(q) !== JSON.stringify(route.query)) {
                router.replace({ query: q });
            }
        };

        const buildDiscoverUrl = (pageNum: number): string => {
            const f = filters.value;
            const params = new URLSearchParams({
                language: 'en-US',
                sort_by: f.sortBy,
                page: String(pageNum),
                include_adult: 'false'
            });
            if (f.genres.length) params.set('with_genres', f.genres.join(','));
            if (f.yearRange[0] !== YEAR_BOUNDS[0]) {
                params.set('first_air_date.gte', `${f.yearRange[0]}-01-01`);
            }
            if (f.yearRange[1] !== YEAR_BOUNDS[1]) {
                params.set('first_air_date.lte', `${f.yearRange[1]}-12-31`);
            }
            if (f.minRating > 0) {
                params.set('vote_average.gte', String(f.minRating));
                params.set('vote_count.gte', '50');
            }
            const band = TV_RUNTIME_BANDS.find(b => b.value === f.runtimeBand);
            if (band?.gte !== undefined) params.set('with_runtime.gte', String(band.gte));
            if (band?.lte !== undefined) params.set('with_runtime.lte', String(band.lte));
            if (f.language) params.set('with_original_language', f.language);

            return `https://api.themoviedb.org/3/discover/tv?${params.toString()}`;
        };

        const buildSearchUrl = (pageNum: number): string => {
            const params = new URLSearchParams({
                query: searchTerm.value,
                language: 'en-US',
                page: String(pageNum),
                include_adult: 'false'
            });
            return `https://api.themoviedb.org/3/search/tv?${params.toString()}`;
        };

        const fetchSearchPage = async (pageNum: number): Promise<TvShowResponse | null> => {
            try {
                const res = await useAxios().get(buildSearchUrl(pageNum));
                return res.data as TvShowResponse;
            } catch {
                return null;
            }
        };

        const fetchPage = async (pageNum: number, append: boolean) => {
            if (append) isLoadingMore.value = true;
            else isLoading.value = true;

            try {
                if (searchTerm.value) {
                    const data = await fetchSearchPage(pageNum);
                    const fresh = data?.results ?? [];
                    totalPages.value = data?.total_pages ?? 0;
                    totalResults.value = data?.total_results ?? 0;
                    page.value = pageNum;
                    results.value = append ? [...results.value, ...fresh] : fresh;
                } else {
                    const url = buildDiscoverUrl(pageNum);
                    const { data } = await fetchDiscoverShows(url);
                    const fresh = (data.value?.results ?? []) as TVShowType[];
                    totalPages.value = data.value?.total_pages ?? 0;
                    totalResults.value = data.value?.total_results ?? 0;
                    page.value = pageNum;
                    results.value = append ? [...results.value, ...fresh] : fresh;
                }
            } finally {
                isLoading.value = false;
                isLoadingMore.value = false;
            }
        };

        const reload = () => {
            page.value = 1;
            fetchPage(1, false);
        };

        const loadMore = () => {
            if (isLoadingMore.value) return;
            if (page.value >= totalPages.value) return;
            fetchPage(page.value + 1, true);
        };

        const hasMore = computed(() => page.value < totalPages.value);

        const onFiltersChange = (next: DiscoverFilters) => {
            filters.value = next;
            syncRoute();
            reload();
        };

        const resetFilters = () => {
            filters.value = makeDefaultFilters();
            searchTerm.value = '';
            syncRoute();
            reload();
        };

        const debouncedSearch = debounce(() => {
            if (searchTerm.value) addSearchTerm(searchTerm.value);
            syncRoute();
            reload();
        }, 400);

        const onSearchInput = (e: Event) => {
            searchTerm.value = (e.target as HTMLInputElement).value;
            debouncedSearch();
        };

        const clearSearch = () => {
            searchTerm.value = '';
            syncRoute();
            reload();
        };

        const resultsEyebrow = computed(() => {
            if (searchTerm.value) return 'Searching';
            return 'The lineup';
        });

        const resultsTitle = computed(() => {
            if (searchTerm.value) return `"${searchTerm.value}"`;
            const g = filters.value.genres
                .map(id => genres.value.find(x => x.id === id)?.name)
                .filter(Boolean)
                .join(' · ');
            return g || 'On the air';
        });

        const activeChips = computed(() => {
            const chips: Array<{ key: string; label: string; clear: () => void }> = [];
            const f = filters.value;

            for (const id of f.genres) {
                const name = genres.value.find(g => g.id === id)?.name;
                if (!name) continue;
                chips.push({
                    key: `g-${id}`,
                    label: name,
                    clear: () => onFiltersChange({ ...f, genres: f.genres.filter(x => x !== id) })
                });
            }
            if (f.yearRange[0] !== YEAR_BOUNDS[0] || f.yearRange[1] !== YEAR_BOUNDS[1]) {
                chips.push({
                    key: 'year',
                    label: `${f.yearRange[0]}–${f.yearRange[1]}`,
                    clear: () => onFiltersChange({ ...f, yearRange: [...YEAR_BOUNDS] as [number, number] })
                });
            }
            if (f.minRating > 0) {
                chips.push({
                    key: 'rating',
                    label: `★ ${f.minRating.toFixed(0)}+`,
                    clear: () => onFiltersChange({ ...f, minRating: 0 })
                });
            }
            if (f.runtimeBand && f.runtimeBand !== 'any') {
                const band = TV_RUNTIME_BANDS.find(b => b.value === f.runtimeBand);
                if (band) chips.push({
                    key: 'runtime',
                    label: band.label,
                    clear: () => onFiltersChange({ ...f, runtimeBand: 'any' })
                });
            }
            if (f.language) {
                chips.push({
                    key: 'lang',
                    label: f.language.toUpperCase(),
                    clear: () => onFiltersChange({ ...f, language: '' })
                });
            }
            return chips;
        });

        onMounted(async () => {
            document.title = 'Discover TV Shows — Movieace';
            primeGenres();
            hydrateFromRoute();

            genres.value = await getGenres('tv');
            await fetchPage(1, false);
        });

        watch(
            () => route.query,
            () => {
                hydrateFromRoute();
            }
        );

        return {
            genres,
            results,
            page,
            totalPages,
            totalResults,
            isLoading,
            isLoadingMore,
            filters,
            searchTerm,
            yearBounds: YEAR_BOUNDS,
            hasMore,
            resultsEyebrow,
            resultsTitle,
            activeChips,
            onFiltersChange,
            resetFilters,
            onSearchInput,
            clearSearch,
            loadMore
        };
    }
});
</script>

<style lang="scss" scoped>
.discover {
    position: relative;
    min-height: 100dvh;
    background: var(--ink-900);
    color: var(--bone-50);

    &__main {
        padding-block: clamp(var(--s-6), 6vw, var(--s-8));
    }

    &__masthead {
        padding-block: clamp(var(--s-5), 5vw, var(--s-7));
        border-bottom: 1px solid var(--rule);
        margin-bottom: clamp(var(--s-6), 6vw, var(--s-8));
    }

    &__eyebrow {
        color: var(--ember);
        margin: 0 0 var(--s-2);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(2.4rem, 6vw, 4.5rem);
        line-height: 1;
        letter-spacing: -0.02em;
        color: var(--bone-50);
        margin: 0;
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
    }

    &__subtitle {
        margin: var(--s-4) 0 0;
        color: var(--bone-300);
        font-family: var(--font-ui);
        line-height: 1.55;
        max-width: 58ch;
    }

    &__search {
        margin-top: var(--s-6);
        display: flex;
        align-items: center;
        gap: var(--s-3);
        padding: 0.75rem var(--s-4);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        max-width: 520px;
        color: var(--bone-400);
        transition: border-color var(--dur-fast) var(--ease-out);

        &:focus-within {
            border-color: var(--ember);
            color: var(--bone-200);
        }
    }

    &__input {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: 0;
        color: var(--bone-50);
        font-family: var(--font-ui);
        font-size: var(--fs-base);
        padding: 0;

        &::placeholder { color: var(--bone-400); }
        &:focus { outline: none; }
    }

    &__clear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        color: var(--bone-400);
        transition: color var(--dur-fast) var(--ease-out);
        &:hover { color: var(--bone-50); }
    }

    &__body {
        display: grid;
        gap: clamp(var(--s-6), 4vw, var(--s-8));
        grid-template-columns: minmax(0, 1fr);

        @media (min-width: 1080px) {
            grid-template-columns: 280px minmax(0, 1fr);
        }
    }

    &__filters {
        min-width: 0;

        @media (max-width: 1079px) {
            position: static;
            max-height: none;
        }
    }

    &__results {
        min-width: 0;
    }

    &__results-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--s-4);
        margin-bottom: var(--s-5);
        padding-bottom: var(--s-4);
        border-bottom: 1px solid var(--rule);
    }

    &__results-eyebrow {
        color: var(--ember);
        margin: 0 0 var(--s-1);
    }

    &__results-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.4rem, 2.5vw, 2rem);
        color: var(--bone-50);
        margin: 0;
        line-height: 1.1;
        letter-spacing: -0.01em;
    }

    &__count {
        font-family: var(--font-mono);
        color: var(--bone-400);
    }

    &__active {
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-2);
        margin-bottom: var(--s-5);
    }

    &__active-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.75rem;
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--ember);
        background: rgba(255, 90, 31, 0.1);
        border: 1px solid rgba(255, 90, 31, 0.3);
        border-radius: var(--r-pill);
        transition: background-color var(--dur-fast) var(--ease-out);

        &:hover, &:focus-visible {
            background: rgba(255, 90, 31, 0.2);
        }
    }

    &__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--s-3);
        padding: var(--s-9) 0;
        color: var(--bone-300);
    }

    &__spinner {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid var(--rule-strong);
        border-top-color: var(--ember);
        animation: disc-spin-tv 0.8s linear infinite;
    }

    &__empty {
        text-align: center;
        padding: var(--s-9) var(--s-4);
        max-width: 52ch;
        margin: 0 auto;
    }

    &__empty-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bone-500);
        margin-bottom: var(--s-5);
    }

    &__empty-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.6rem, 3vw, 2.2rem);
        color: var(--bone-50);
        margin: 0 0 var(--s-3);
        letter-spacing: -0.01em;
    }

    &__empty-desc {
        color: var(--bone-300);
        margin: 0 0 var(--s-5);
        line-height: 1.55;
    }

    &__empty-reset {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--ember);
        padding: 0.6rem 1.2rem;
        border: 1px solid var(--ember);
        border-radius: var(--r-pill);
        transition: background-color var(--dur-fast) var(--ease-out);

        &:hover, &:focus-visible {
            background: var(--ember);
            color: var(--ink-900);
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--s-5) var(--s-4);

        @media (min-width: 720px) {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: var(--s-6) var(--s-5);
        }

        @media (min-width: 1200px) {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
    }

    &__more {
        display: flex;
        justify-content: center;
        padding: var(--s-7) 0 var(--s-4);
    }

    &__more-btn {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--bone-100);
        padding: 0.8rem 1.8rem;
        border: 1px solid var(--rule-strong);
        border-radius: var(--r-pill);
        background: var(--surface-tint);
        transition:
            color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            background-color var(--dur-fast) var(--ease-out);

        &:hover:not(:disabled), &:focus-visible:not(:disabled) {
            color: var(--ember);
            border-color: var(--ember);
            background: rgba(255, 90, 31, 0.08);
        }

        &:disabled {
            opacity: 0.5;
            cursor: wait;
        }
    }
}

@keyframes disc-spin-tv {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .discover__spinner { animation: none; }
}
</style>
