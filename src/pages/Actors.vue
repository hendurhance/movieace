<template>
    <div class="actors">
        <SiteHeader />

        <main id="main" class="actors__main" role="main">
            <section class="actors__masthead container-lm">
                <p class="eyebrow actors__eyebrow">The Roster · Talent</p>
                <h1 class="actors__title display" data-reveal>Faces in the frame.</h1>
                <p class="actors__subtitle">
                    The people who carry the picture — leads, character actors, voices,
                    and the next reel of names worth watching.
                </p>

                <form class="actors__search" role="search" @submit.prevent>
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="m20 20-3.5-3.5"/>
                    </svg>
                    <input
                        type="search"
                        class="actors__input"
                        placeholder="Search for a person — name, role, anything"
                        :value="searchTerm"
                        aria-label="Search actors"
                        @input="onSearchInput"
                    />
                    <button
                        v-if="searchTerm"
                        type="button"
                        class="actors__clear"
                        aria-label="Clear search"
                        @click="clearSearch"
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/>
                        </svg>
                    </button>
                </form>
            </section>

            <section class="actors__body container-lm">
                <header class="actors__results-head">
                    <div class="actors__results-meta">
                        <p class="eyebrow actors__results-eyebrow">{{ resultsEyebrow }}</p>
                        <h2 class="actors__results-title">{{ resultsTitle }}</h2>
                    </div>

                    <div class="actors__controls">
                        <p v-if="totalResults" class="meta actors__count">
                            {{ totalResults.toLocaleString() }} people
                        </p>

                        <label class="actors__sort" :class="{ 'is-disabled': !!searchTerm }">
                            <span class="eyebrow">Sort</span>
                            <select
                                v-model="sortMode"
                                :disabled="!!searchTerm"
                                @change="onSortChange"
                            >
                                <option value="popular">Most popular</option>
                                <option value="trending">Trending today</option>
                            </select>
                            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </label>
                    </div>
                </header>

                <div v-if="isLoading && !results.length" class="actors__loading" role="status">
                    <div
                        v-for="n in 12"
                        :key="`s-${n}`"
                        class="actors__skeleton"
                        aria-hidden="true"
                    >
                        <div class="actors__skeleton-circle" />
                        <div class="actors__skeleton-line" />
                        <div class="actors__skeleton-line actors__skeleton-line--short" />
                    </div>
                </div>

                <div v-else-if="!results.length" class="actors__empty">
                    <div class="actors__empty-icon" aria-hidden="true">
                        <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.4">
                            <circle cx="32" cy="22" r="10"/>
                            <path d="M14 54c4-10 12-14 18-14s14 4 18 14"/>
                        </svg>
                    </div>
                    <h3 class="actors__empty-title display">No one by that name.</h3>
                    <p class="actors__empty-desc">
                        Spelling, perhaps — or try the popular roster while we wait for the
                        casting call.
                    </p>
                    <button type="button" class="actors__empty-reset" @click="clearSearch">
                        Show popular people
                    </button>
                </div>

                <div v-else class="actors__grid">
                    <PersonCard
                        v-for="person in results"
                        :key="person.id"
                        :id="person.id"
                        :name="person.name"
                        :profile-path="person.profile_path"
                        :department="person.known_for_department || ''"
                    />
                </div>

                <div v-if="hasMore" class="actors__more">
                    <button
                        type="button"
                        class="actors__more-btn"
                        :disabled="isLoadingMore"
                        @click="loadMore"
                    >
                        <span v-if="isLoadingMore">Loading…</span>
                        <span v-else>Load more · page {{ page }}/{{ totalPages }}</span>
                    </button>
                </div>
            </section>
        </main>

        <SiteFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import debounce from 'lodash.debounce';
import SiteHeader from '../components/navigation/SiteHeader.vue';
import SiteFooter from '../components/navigation/SiteFooter.vue';
import PersonCard from '../components/cards/PersonCard.vue';
import { useActor, Actor } from '../composables/useActor';
import { addSearchTerm } from '../composables/useHistory';

type SortMode = 'popular' | 'trending';

export default defineComponent({
    name: 'Actors',
    components: { SiteHeader, SiteFooter, PersonCard },
    setup() {
        const { fetchTopActors } = useActor();

        const results = ref<Actor[]>([]);
        const page = ref(1);
        const totalPages = ref(1);
        const totalResults = ref(0);
        const isLoading = ref(false);
        const isLoadingMore = ref(false);
        const sortMode = ref<SortMode>('popular');
        const searchTerm = ref('');

        const buildUrl = (mode: SortMode, pageNum: number): string => {
            if (mode === 'trending') {
                return `https://api.themoviedb.org/3/trending/person/day?language=en-US&page=${pageNum}`;
            }
            return `https://api.themoviedb.org/3/person/popular?language=en-US&page=${pageNum}`;
        };

        const buildSearchUrl = (pageNum: number): string => {
            const params = new URLSearchParams({
                query: searchTerm.value,
                language: 'en-US',
                page: String(pageNum),
                include_adult: 'false'
            });
            return `https://api.themoviedb.org/3/search/person?${params.toString()}`;
        };

        const fetchPage = async (pageNum: number, append: boolean) => {
            if (append) isLoadingMore.value = true;
            else isLoading.value = true;

            try {
                const url = searchTerm.value
                    ? buildSearchUrl(pageNum)
                    : buildUrl(sortMode.value, pageNum);
                const { data } = await fetchTopActors(url);
                const fresh = (data.value?.results ?? []) as Actor[];
                totalPages.value = data.value?.total_pages ?? 0;
                totalResults.value = data.value?.total_results ?? 0;
                page.value = pageNum;
                results.value = append ? [...results.value, ...fresh] : fresh;
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

        const debouncedSearch = debounce(() => {
            if (searchTerm.value) addSearchTerm(searchTerm.value);
            reload();
        }, 400);

        const onSearchInput = (e: Event) => {
            searchTerm.value = (e.target as HTMLInputElement).value;
            debouncedSearch();
        };

        const clearSearch = () => {
            searchTerm.value = '';
            reload();
        };

        const onSortChange = () => {
            reload();
        };

        const resultsEyebrow = computed(() => {
            if (searchTerm.value) return 'Searching';
            return 'On call';
        });

        const resultsTitle = computed(() => {
            if (searchTerm.value) return `"${searchTerm.value}"`;
            return sortMode.value === 'trending' ? 'Trending today' : 'Popular roster';
        });

        onMounted(() => {
            document.title = 'People — Movieace';
            fetchPage(1, false);
        });

        return {
            results,
            page,
            totalPages,
            totalResults,
            isLoading,
            isLoadingMore,
            sortMode,
            searchTerm,
            hasMore,
            resultsEyebrow,
            resultsTitle,
            onSearchInput,
            clearSearch,
            onSortChange,
            loadMore
        };
    }
});
</script>

<style lang="scss" scoped>
.actors {
    position: relative;
    min-height: 100dvh;
    background: var(--ink-900);
    color: var(--bone-50);

    &__main {
        padding-block: clamp(var(--s-6), 6vw, var(--s-8));
    }

    // ── Masthead ───────────────────────────────────────────────────────────
    &__masthead {
        padding-block: clamp(var(--s-5), 5vw, var(--s-7));
        border-bottom: 1px solid var(--rule);
        margin-bottom: clamp(var(--s-6), 6vw, var(--s-8));
        position: relative;
        isolation: isolate;

        &::after {
            content: '';
            position: absolute;
            inset: -10% -20% auto auto;
            width: 70%;
            aspect-ratio: 1;
            background: radial-gradient(
                circle at center,
                rgba(255, 90, 31, 0.18),
                transparent 60%
            );
            filter: blur(60px);
            z-index: -1;
            pointer-events: none;
        }
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
        max-width: 60ch;
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
        outline: none;

        &::placeholder { color: var(--bone-500); }
    }

    &__clear {
        all: unset;
        cursor: pointer;
        color: var(--bone-400);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        transition: background-color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--surface-tint-hover);
            color: var(--bone-200);
        }
    }

    // ── Body ──────────────────────────────────────────────────────────────
    &__body {
        padding-bottom: clamp(var(--s-7), 8vw, var(--s-10));
    }

    &__results-head {
        display: flex;
        flex-wrap: wrap;
        align-items: end;
        justify-content: space-between;
        gap: var(--s-5);
        margin-bottom: var(--s-6);
    }

    &__results-eyebrow {
        color: var(--bone-400);
        margin: 0 0 var(--s-2);
    }

    &__results-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.5rem, 3vw, 2.2rem);
        color: var(--bone-50);
        margin: 0;
        letter-spacing: var(--ls-tight);
    }

    &__controls {
        display: inline-flex;
        align-items: center;
        gap: var(--s-5);
    }

    &__count {
        color: var(--bone-400);
    }

    &__sort {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        padding: 0.5rem var(--s-4) 0.5rem var(--s-3);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        color: var(--bone-200);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        cursor: pointer;
        transition: border-color var(--dur-fast) var(--ease-out);

        &:hover { border-color: var(--rule-strong); }
        &.is-disabled { opacity: 0.5; cursor: not-allowed; }

        span { color: var(--bone-400); }

        select {
            all: unset;
            background: transparent;
            color: inherit;
            font: inherit;
            cursor: inherit;
            padding-right: 0.75rem;

            option {
                background: var(--ink-800);
                color: var(--bone-50);
            }
        }

        svg {
            position: absolute;
            right: var(--s-3);
            color: var(--bone-400);
            pointer-events: none;
        }
    }

    // ── Grid ──────────────────────────────────────────────────────────────
    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--s-6) var(--s-5);

        @media (max-width: 720px) {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: var(--s-5) var(--s-4);
        }
    }

    // ── Loading skeleton ──────────────────────────────────────────────────
    &__loading {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--s-6) var(--s-5);

        @media (max-width: 720px) {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        }
    }

    &__skeleton {
        display: grid;
        gap: var(--s-3);
        text-align: center;
        justify-items: center;
    }

    &__skeleton-circle {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 50%;
        background: linear-gradient(
            90deg,
            var(--ink-700) 0%,
            var(--ink-600) 50%,
            var(--ink-700) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.6s linear infinite;
    }

    &__skeleton-line {
        width: 80%;
        height: 12px;
        border-radius: var(--r-sm);
        background: var(--ink-700);

        &--short { width: 50%; height: 10px; opacity: 0.7; }
    }

    @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    // ── Empty / error ─────────────────────────────────────────────────────
    &__empty {
        text-align: center;
        padding: clamp(var(--s-7), 8vw, var(--s-9)) var(--s-4);
        max-width: 520px;
        margin: 0 auto;
    }

    &__empty-icon {
        color: var(--bone-500);
        margin-bottom: var(--s-4);

        svg {
            width: 48px;
            height: 48px;
            opacity: 0.7;
        }
    }

    &__empty-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.6rem, 3vw, 2.2rem);
        color: var(--bone-50);
        margin: 0 0 var(--s-3);
        font-variation-settings: 'opsz' 96, 'SOFT' 40;
    }

    &__empty-desc {
        color: var(--bone-300);
        line-height: 1.55;
        max-width: 44ch;
        margin: 0 auto var(--s-5);
    }

    &__empty-reset {
        all: unset;
        cursor: pointer;
        padding: 0.6rem var(--s-5);
        background: var(--ember);
        color: var(--ink-900);
        border-radius: var(--r-pill);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 600;
        letter-spacing: var(--ls-snug);
        transition: transform var(--dur-fast) var(--ease-out);

        &:hover { transform: translateY(-1px); }
    }

    // ── Load more ─────────────────────────────────────────────────────────
    &__more {
        display: flex;
        justify-content: center;
        margin-top: var(--s-7);
    }

    &__more-btn {
        all: unset;
        cursor: pointer;
        padding: 0.85rem var(--s-6);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        color: var(--bone-100);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        letter-spacing: var(--ls-snug);
        transition:
            background-color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            color var(--dur-fast) var(--ease-out);

        &:hover:not(:disabled) {
            background: var(--surface-tint-hover);
            border-color: var(--rule-strong);
            color: var(--bone-50);
        }

        &:disabled { opacity: 0.6; cursor: wait; }
    }
}

@media (prefers-reduced-motion: reduce) {
    .actors__skeleton-circle { animation: none; }
}
</style>
