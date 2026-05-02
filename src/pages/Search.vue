<template>
    <div class="search-page">
        <SiteHeader />

        <main id="main" class="search-page__main" role="main">
            <section class="search-page__masthead container-lm">
                <p class="eyebrow search-page__eyebrow">The Index</p>
                <h1 class="search-page__title display">Search the archive</h1>
                <p class="search-page__subtitle">
                    Every film, every series, every face on record — cross-referenced in one query.
                </p>

                <form class="search-page__search" role="search" @submit.prevent>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="m20 20-3.5-3.5"/>
                    </svg>
                    <input
                        ref="inputEl"
                        type="search"
                        class="search-page__input"
                        placeholder="Search movies, shows, and people"
                        :value="searchTerm"
                        aria-label="Search"
                        autocomplete="off"
                        @input="onSearchInput"
                    />
                    <button
                        v-if="searchTerm"
                        type="button"
                        class="search-page__clear"
                        aria-label="Clear search"
                        @click="handleClearSearch"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/>
                        </svg>
                    </button>
                </form>
            </section>

            <template v-if="searchTerm">
                <section class="search-page__tabs-wrap container-lm">
                    <LmTabs
                        v-model="activeTab"
                        :tabs="tabs"
                        variant="underline"
                        aria-label="Search result categories"
                    />
                </section>

                <section class="search-page__results container-lm">
                    <div v-if="isLoading && !currentCount" class="search-page__loading" role="status">
                        <div class="search-page__spinner" aria-hidden="true" />
                        <span class="meta">Searching the archive…</span>
                    </div>

                    <template v-else-if="activeTab === 'movies' && movies.length">
                        <div class="search-page__grid">
                            <PosterCard
                                v-for="item in movies"
                                :key="`m-${item.id}`"
                                :id="item.id"
                                type="movie"
                                :title="item.title || item.original_title || ''"
                                :poster-path="item.poster_path"
                                :rating="item.vote_average || 0"
                                :release-date="item.release_date || ''"
                                :genre-ids="item.genre_ids || []"
                                :adult="item.adult || false"
                            />
                        </div>
                    </template>

                    <template v-else-if="activeTab === 'shows' && shows.length">
                        <div class="search-page__grid">
                            <PosterCard
                                v-for="item in shows"
                                :key="`t-${item.id}`"
                                :id="item.id"
                                type="tv"
                                :title="item.name || item.original_name || ''"
                                :poster-path="item.poster_path"
                                :rating="item.vote_average || 0"
                                :release-date="item.first_air_date || ''"
                                :genre-ids="item.genre_ids || []"
                                :adult="false"
                            />
                        </div>
                    </template>

                    <template v-else-if="activeTab === 'people' && people.length">
                        <div class="search-page__people-grid">
                            <PersonCard
                                v-for="item in people"
                                :key="`p-${item.id}`"
                                :id="item.id"
                                :name="item.name"
                                :profile-path="item.profile_path"
                                :department="item.known_for_department || ''"
                            />
                        </div>
                    </template>

                    <div v-else class="search-page__empty">
                        <div class="search-page__empty-icon" aria-hidden="true">
                            <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.4">
                                <circle cx="32" cy="32" r="22"/>
                                <circle cx="32" cy="32" r="7"/>
                                <circle cx="32" cy="14" r="3"/>
                                <circle cx="32" cy="50" r="3"/>
                                <circle cx="14" cy="32" r="3"/>
                                <circle cx="50" cy="32" r="3"/>
                            </svg>
                        </div>
                        <h3 class="search-page__empty-title display">Not in the archive.</h3>
                        <p class="search-page__empty-desc">
                            No {{ emptyLabel }} matched "{{ searchTerm }}". Try a different spelling, or
                            browse a related category.
                        </p>
                    </div>

                    <div v-if="hasMore && currentCount" class="search-page__more">
                        <button
                            type="button"
                            class="search-page__more-btn"
                            :disabled="isLoadingMore"
                            @click="loadMore"
                        >
                            <span v-if="isLoadingMore">Loading…</span>
                            <span v-else>Load more · page {{ reqMetaData.page }}/{{ reqMetaData.total_pages }}</span>
                        </button>
                    </div>
                </section>
            </template>

            <section v-else class="search-page__idle container-lm">
                <div class="search-page__idle-head">
                    <p class="eyebrow">Start somewhere</p>
                    <h2 class="search-page__idle-title display">A few places to begin.</h2>
                </div>

                <div v-if="recentSearches.length" class="search-page__idle-block">
                    <p class="eyebrow search-page__idle-label">Your recent searches</p>
                    <div class="search-page__suggestions">
                        <button
                            v-for="term in recentSearches"
                            :key="`r-${term}`"
                            type="button"
                            class="search-page__suggestion"
                            @click="runSearch(term)"
                        >
                            {{ term }}
                        </button>
                    </div>
                </div>

                <div class="search-page__idle-block">
                    <p class="eyebrow search-page__idle-label">Popular right now</p>
                    <div class="search-page__suggestions">
                        <button
                            v-for="term in popularSearches"
                            :key="`p-${term}`"
                            type="button"
                            class="search-page__suggestion search-page__suggestion--ember"
                            @click="runSearch(term)"
                        >
                            {{ term }}
                        </button>
                    </div>
                </div>
            </section>
        </main>

        <SiteFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import debounce from 'lodash.debounce';
import SiteHeader from '../components/navigation/SiteHeader.vue';
import SiteFooter from '../components/navigation/SiteFooter.vue';
import LmTabs, { TabDef } from '../components/primitives/Tabs.vue';
import PosterCard from '../components/cards/PosterCard.vue';
import PersonCard from '../components/cards/PersonCard.vue';
import {
    useSearch,
    discoveredMovies,
    discoveredTv,
    discoveredPeople,
    reqMetaData
} from '../composables/useSearch';
import { addSearchTerm, searchHistory } from '../composables/useHistory';

type TabKey = 'movies' | 'shows' | 'people';

export default defineComponent({
    name: 'Search',
    components: { SiteHeader, SiteFooter, LmTabs, PosterCard, PersonCard },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const { fetchSearchResults, clearSearchResults } = useSearch();

        const inputEl = ref<HTMLInputElement | null>(null);
        const searchTerm = ref<string>(typeof route.query.search === 'string' ? route.query.search : '');
        const activeTab = ref<TabKey>(
            (typeof route.query.tab === 'string' && ['movies', 'shows', 'people'].includes(route.query.tab))
                ? route.query.tab as TabKey
                : 'movies'
        );
        const isLoading = ref(false);
        const isLoadingMore = ref(false);

        const popularSearches = [
            'Dune', 'The Bear', 'Christopher Nolan', 'Succession',
            'Florence Pugh', 'Studio Ghibli', 'Oppenheimer', 'Severance'
        ];

        const movies = computed(() => discoveredMovies.value);
        const shows = computed(() => discoveredTv.value);
        const people = computed(() => discoveredPeople.value);

        const recentSearches = computed(() =>
            (searchHistory.value || []).filter(Boolean).slice(0, 6)
        );

        const tabs = computed<TabDef[]>(() => [
            { label: 'Movies', value: 'movies', count: movies.value.length },
            { label: 'Shows', value: 'shows', count: shows.value.length },
            { label: 'People', value: 'people', count: people.value.length }
        ]);

        const currentCount = computed(() => {
            if (activeTab.value === 'movies') return movies.value.length;
            if (activeTab.value === 'shows') return shows.value.length;
            return people.value.length;
        });

        const emptyLabel = computed(() => {
            if (activeTab.value === 'movies') return 'films';
            if (activeTab.value === 'shows') return 'series';
            return 'people';
        });

        const hasMore = computed(() =>
            reqMetaData.value.page > 0 && reqMetaData.value.page < reqMetaData.value.total_pages
        );

        const chooseDefaultTab = () => {
            if (!movies.value.length && shows.value.length) activeTab.value = 'shows';
            else if (!movies.value.length && !shows.value.length && people.value.length) {
                activeTab.value = 'people';
            } else {
                activeTab.value = 'movies';
            }
            syncRoute();
        };

        const performSearch = async (query: string, page: number = 1) => {
            const q = query.trim();
            if (!q) return;

            if (page === 1) isLoading.value = true;
            else isLoadingMore.value = true;

            try {
                await fetchSearchResults(q, page);
                if (page === 1) chooseDefaultTab();
            } finally {
                isLoading.value = false;
                isLoadingMore.value = false;
            }
        };

        const syncRoute = () => {
            const q: Record<string, string> = {};
            if (searchTerm.value) q.search = searchTerm.value;
            if (searchTerm.value && activeTab.value !== 'movies') q.tab = activeTab.value;
            const current = route.query;
            if (JSON.stringify(q) !== JSON.stringify(current)) {
                router.replace({ query: q });
            }
        };

        const handleClearSearch = () => {
            clearSearchResults();
            searchTerm.value = '';
            activeTab.value = 'movies';
            syncRoute();
            nextTick(() => inputEl.value?.focus());
        };

        const runSearch = (term: string) => {
            searchTerm.value = term;
            syncRoute();
            addSearchTerm(term);
            performSearch(term);
        };

        const debouncedSearch = debounce((term: string) => {
            const q = term.trim();
            if (!q) {
                clearSearchResults();
                syncRoute();
                return;
            }
            addSearchTerm(q);
            syncRoute();
            performSearch(q);
        }, 350);

        const onSearchInput = (e: Event) => {
            searchTerm.value = (e.target as HTMLInputElement).value;
            if (!searchTerm.value.trim()) {
                clearSearchResults();
                syncRoute();
            } else {
                debouncedSearch(searchTerm.value);
            }
        };

        const loadMore = async () => {
            if (!hasMore.value || !searchTerm.value) return;
            await performSearch(searchTerm.value, reqMetaData.value.page + 1);
        };

        watch(activeTab, () => syncRoute());

        watch(
            () => route.query.search,
            query => {
                const q = typeof query === 'string' ? query : '';
                if (q === searchTerm.value) return;
                searchTerm.value = q;
                if (q) performSearch(q);
                else clearSearchResults();
            }
        );

        onMounted(() => {
            document.title = 'Search — Movieace';
            window.scrollTo(0, 0);
            if (searchTerm.value.trim()) {
                performSearch(searchTerm.value);
            } else {
                clearSearchResults();
            }
        });

        return {
            inputEl,
            searchTerm,
            activeTab,
            isLoading,
            isLoadingMore,
            movies,
            shows,
            people,
            recentSearches,
            popularSearches,
            tabs,
            currentCount,
            emptyLabel,
            hasMore,
            reqMetaData,
            onSearchInput,
            handleClearSearch,
            runSearch,
            loadMore
        };
    }
});
</script>

<style lang="scss" scoped>
.search-page {
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
        margin-bottom: clamp(var(--s-5), 5vw, var(--s-7));
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
        padding: 0.9rem var(--s-5);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
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
        font-size: var(--fs-lg);
        padding: 0;

        &::placeholder { color: var(--bone-400); }
        &:focus { outline: none; }
    }

    &__clear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        color: var(--bone-400);
        transition: color var(--dur-fast) var(--ease-out);
        &:hover { color: var(--bone-50); }
    }

    &__tabs-wrap {
        margin-bottom: var(--s-6);
        overflow-x: auto;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }
    }

    &__results {
        min-height: 40vh;
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
        animation: search-spin 0.8s linear infinite;
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

    &__people-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
        gap: var(--s-6) var(--s-5);

        @media (min-width: 720px) {
            grid-template-columns: repeat(auto-fill, minmax(144px, 1fr));
        }
    }

    &__empty {
        text-align: center;
        padding: var(--s-9) var(--s-4);
        max-width: 54ch;
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
        margin: 0;
        line-height: 1.55;
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

    &__idle {
        padding-block: clamp(var(--s-6), 6vw, var(--s-8));
        display: grid;
        gap: var(--s-7);
    }

    &__idle-head {
        max-width: 54ch;
    }

    &__idle-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.8rem, 3.5vw, 2.6rem);
        color: var(--bone-50);
        margin: var(--s-1) 0 0;
        letter-spacing: -0.01em;
    }

    &__idle-block {
        display: grid;
        gap: var(--s-3);
    }

    &__idle-label {
        color: var(--bone-400);
        margin: 0;
    }

    &__suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-2);
    }

    &__suggestion {
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        color: var(--bone-200);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        padding: 0.5rem 1rem;
        transition:
            color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            background-color var(--dur-fast) var(--ease-out);

        &:hover, &:focus-visible {
            color: var(--bone-50);
            background: var(--surface-tint-hover);
            border-color: var(--rule-strong);
        }

        &--ember {
            color: var(--ember);
            border-color: rgba(255, 90, 31, 0.25);
            background: rgba(255, 90, 31, 0.06);

            &:hover, &:focus-visible {
                color: var(--ember);
                background: rgba(255, 90, 31, 0.14);
                border-color: rgba(255, 90, 31, 0.5);
            }
        }
    }
}

@keyframes search-spin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .search-page__spinner { animation: none; }
}
</style>
