<template>
    <div class="watchlist">
        <SiteHeader />

        <main id="main" class="watchlist__main" role="main">
            <section class="watchlist__masthead container-lm">
                <p class="eyebrow watchlist__eyebrow">The Reel · Saved for you</p>
                <h1 class="watchlist__title display" data-reveal>Your watchlist.</h1>
                <p class="watchlist__subtitle" v-if="totalCount">
                    {{ totalCount }} title{{ totalCount === 1 ? '' : 's' }} on the queue —
                    {{ unwatchedCount }} still to watch.
                </p>
                <p class="watchlist__subtitle" v-else>
                    A private programme, picked by you. Add titles from any detail page or
                    poster card and they'll land here.
                </p>
            </section>

            <section v-if="totalCount" class="watchlist__body container-lm">
                <header class="watchlist__toolbar">
                    <div class="watchlist__filters" role="tablist" aria-label="Watchlist filters">
                        <button
                            v-for="opt in filters"
                            :key="opt.value"
                            type="button"
                            class="watchlist__filter"
                            :class="{ 'is-active': activeFilter === opt.value }"
                            role="tab"
                            :aria-selected="activeFilter === opt.value"
                            @click="activeFilter = opt.value"
                        >
                            <span class="watchlist__filter-label">{{ opt.label }}</span>
                            <span class="watchlist__filter-count">{{ opt.count }}</span>
                        </button>
                    </div>

                    <div class="watchlist__controls">
                        <label class="watchlist__sort">
                            <span class="eyebrow">Sort</span>
                            <select v-model="sortBy">
                                <option value="recent">Recently added</option>
                                <option value="title">Title · A–Z</option>
                                <option value="rating">Highest rated</option>
                                <option value="unwatched">Unwatched first</option>
                            </select>
                            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </label>

                        <div class="watchlist__io">
                            <button
                                type="button"
                                class="watchlist__icon-btn"
                                title="Export as JSON"
                                aria-label="Export watchlist as JSON"
                                @click="onExport"
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Export
                            </button>
                            <button
                                type="button"
                                class="watchlist__icon-btn"
                                title="Import from JSON"
                                aria-label="Import watchlist from JSON"
                                @click="triggerImport"
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path d="M12 20V8m0 0 4 4m-4-4-4 4M5 4h14" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Import
                            </button>
                            <input
                                ref="importInput"
                                type="file"
                                accept="application/json,.json"
                                class="watchlist__file-input"
                                @change="onImport"
                            />
                        </div>
                    </div>
                </header>

                <div v-if="filtered.length" class="watchlist__grid">
                    <article
                        v-for="item in filtered"
                        :key="`wl-${item.type}-${item.id}`"
                        class="wl-card"
                        :class="{ 'is-watched': item.watched }"
                    >
                        <router-link
                            :to="item.type === 'tv' ? `/tv-show/${item.id}` : `/movie/${item.id}`"
                            class="wl-card__poster"
                            :aria-label="item.title"
                        >
                            <img
                                v-if="item.image"
                                :src="useWebImage(item.image, 'medium')"
                                :alt="item.title"
                                loading="lazy"
                                decoding="async"
                            />
                            <div v-else class="wl-card__poster-empty">
                                <span class="display">{{ item.title[0]?.toUpperCase() ?? '·' }}</span>
                            </div>

                            <div class="wl-card__badges">
                                <span class="wl-card__type">{{ item.type === 'tv' ? 'Series' : 'Film' }}</span>
                                <span v-if="item.rating" class="wl-card__rating">
                                    <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true">
                                        <path d="m12 2 3 7 7 .6-5.3 4.7 1.6 7L12 17.7 5.7 21.3l1.6-7L2 9.6 9 9z"/>
                                    </svg>
                                    {{ item.rating.toFixed(1) }}
                                </span>
                            </div>

                            <span v-if="item.watched" class="wl-card__stamp" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4">
                                    <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Watched
                            </span>
                        </router-link>

                        <div class="wl-card__body">
                            <h3 class="wl-card__title">{{ item.title }}</h3>
                            <p v-if="item.addedAt" class="wl-card__added meta">
                                Added {{ formatRelative(item.addedAt) }}
                            </p>
                        </div>

                        <div class="wl-card__actions">
                            <button
                                type="button"
                                class="wl-card__btn"
                                :class="{ 'is-on': item.watched }"
                                :aria-label="item.watched ? 'Mark as unwatched' : 'Mark as watched'"
                                @click="toggleWatched(item)"
                            >
                                <svg v-if="item.watched" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                {{ item.watched ? 'Watched' : 'Mark watched' }}
                            </button>
                            <button
                                type="button"
                                class="wl-card__btn wl-card__btn--ghost"
                                :aria-label="`Remove ${item.title}`"
                                @click="onRemove(item)"
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12z" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Remove
                            </button>
                        </div>
                    </article>
                </div>

                <div v-else class="watchlist__empty-filter">
                    <p class="eyebrow">Nothing in this slice</p>
                    <h3 class="watchlist__empty-title display">No matches under "{{ activeFilterLabel }}".</h3>
                    <p class="watchlist__empty-desc">
                        Try a different filter, or clear back to the full queue.
                    </p>
                    <button
                        type="button"
                        class="watchlist__empty-reset"
                        @click="activeFilter = 'all'"
                    >
                        Show all titles
                    </button>
                </div>

                <footer v-if="filtered.length" class="watchlist__footer-row">
                    <p class="meta">
                        Showing {{ filtered.length }} of {{ totalCount }} titles
                    </p>
                    <button
                        type="button"
                        class="watchlist__danger"
                        @click="confirmClear"
                    >
                        Clear watchlist
                    </button>
                </footer>
            </section>

            <!-- Empty (no items at all) -->
            <section v-else class="watchlist__empty container-lm">
                <div class="watchlist__empty-card">
                    <div class="watchlist__empty-icon" aria-hidden="true">
                        <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.4">
                            <path d="M16 6h32a4 4 0 0 1 4 4v48l-20-12-20 12V10a4 4 0 0 1 4-4z" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h2 class="watchlist__empty-title display">An unwritten programme.</h2>
                    <p class="watchlist__empty-desc">
                        Save titles to come back to — they'll wait here, organized exactly the
                        way you left them.
                    </p>
                    <div class="watchlist__empty-actions">
                        <router-link to="/movies" class="watchlist__empty-cta watchlist__empty-cta--primary">
                            Browse films
                        </router-link>
                        <router-link to="/tv-shows" class="watchlist__empty-cta">
                            Browse series
                        </router-link>
                        <button type="button" class="watchlist__empty-cta" @click="triggerImport">
                            Import JSON
                        </button>
                    </div>
                </div>
            </section>
        </main>

        <SiteFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import SiteHeader from '../components/navigation/SiteHeader.vue';
import SiteFooter from '../components/navigation/SiteFooter.vue';
import { useWebImage } from '../utils/useWebImage';
import {
    useWatchlist,
    WatchlistItem
} from '../composables/useWatchlist';
import { useToast } from '../composables/useToast';

type FilterKey = 'all' | 'movie' | 'tv' | 'watched' | 'unwatched';
type SortKey = 'recent' | 'title' | 'rating' | 'unwatched';

export default defineComponent({
    name: 'Watchlist',
    components: { SiteHeader, SiteFooter },
    setup() {
        const {
            watchlist,
            removeFromWatchlist,
            setWatched,
            clearWatchlist,
            replaceWatchlist
        } = useWatchlist();
        const { addToast } = useToast();

        const activeFilter = ref<FilterKey>('all');
        const sortBy = ref<SortKey>('recent');
        const importInput = ref<HTMLInputElement | null>(null);

        const totalCount = computed(() => watchlist.value.length);

        const movieCount = computed(
            () => watchlist.value.filter(i => i.type === 'movie').length
        );
        const tvCount = computed(
            () => watchlist.value.filter(i => i.type === 'tv').length
        );
        const watchedCount = computed(
            () => watchlist.value.filter(i => i.watched).length
        );
        const unwatchedCount = computed(
            () => watchlist.value.filter(i => !i.watched).length
        );

        const filters = computed(() => [
            { value: 'all' as FilterKey, label: 'All', count: totalCount.value },
            { value: 'movie' as FilterKey, label: 'Films', count: movieCount.value },
            { value: 'tv' as FilterKey, label: 'Series', count: tvCount.value },
            { value: 'unwatched' as FilterKey, label: 'Unwatched', count: unwatchedCount.value },
            { value: 'watched' as FilterKey, label: 'Watched', count: watchedCount.value }
        ]);

        const activeFilterLabel = computed(
            () => filters.value.find(f => f.value === activeFilter.value)?.label ?? 'All'
        );

        const filtered = computed<WatchlistItem[]>(() => {
            const f = activeFilter.value;
            const list = watchlist.value.filter(item => {
                if (f === 'all') return true;
                if (f === 'movie' || f === 'tv') return item.type === f;
                if (f === 'watched') return !!item.watched;
                if (f === 'unwatched') return !item.watched;
                return true;
            });

            // Build sortable copies — never mutate stored array
            const indexed = list.map((item, idx) => ({ item, idx }));
            indexed.sort((a, b) => {
                switch (sortBy.value) {
                    case 'title':
                        return a.item.title.localeCompare(b.item.title);
                    case 'rating':
                        return (b.item.rating ?? 0) - (a.item.rating ?? 0);
                    case 'unwatched':
                        if (!!a.item.watched !== !!b.item.watched) {
                            return a.item.watched ? 1 : -1;
                        }
                        return a.idx - b.idx;
                    case 'recent':
                    default: {
                        const ta = a.item.addedAt ?? Number.MAX_SAFE_INTEGER - a.idx;
                        const tb = b.item.addedAt ?? Number.MAX_SAFE_INTEGER - b.idx;
                        if (a.item.addedAt && b.item.addedAt) return tb - ta;
                        return a.idx - b.idx;
                    }
                }
            });
            return indexed.map(x => x.item);
        });

        const toggleWatched = (item: WatchlistItem) => {
            const next = !item.watched;
            setWatched(item.id, item.type, next);
            addToast(
                next ? `Marked "${item.title}" as watched` : `Returned "${item.title}" to unwatched`,
                'success',
                2000
            );
        };

        const onRemove = (item: WatchlistItem) => {
            removeFromWatchlist(item.id, item.type);
            addToast(`Removed "${item.title}" from watchlist`, 'info', 2400);
        };

        const confirmClear = () => {
            if (!totalCount.value) return;
            const ok = window.confirm(
                `Clear all ${totalCount.value} title(s) from your watchlist? This cannot be undone.`
            );
            if (!ok) return;
            clearWatchlist();
            addToast('Watchlist cleared', 'info', 2400);
        };

        const onExport = () => {
            try {
                const payload = JSON.stringify(
                    { version: 1, exportedAt: new Date().toISOString(), items: watchlist.value },
                    null,
                    2
                );
                const blob = new Blob([payload], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const stamp = new Date().toISOString().slice(0, 10);
                a.href = url;
                a.download = `movieace-watchlist-${stamp}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                addToast('Watchlist exported', 'success', 2400);
            } catch {
                addToast('Could not export watchlist', 'error', 3000);
            }
        };

        const triggerImport = () => {
            importInput.value?.click();
        };

        const onImport = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                const incoming: unknown =
                    Array.isArray(parsed) ? parsed : parsed?.items;

                if (!Array.isArray(incoming)) {
                    throw new Error('Invalid file shape');
                }

                const valid = (incoming as any[])
                    .filter(isValidItem)
                    .map<WatchlistItem>(x => ({
                        id: x.id,
                        title: x.title,
                        image: x.image ?? null,
                        rating: Number(x.rating) || 0,
                        categories: Array.isArray(x.categories) ? x.categories : [],
                        adult: !!x.adult,
                        type: x.type === 'tv' ? 'tv' : 'movie',
                        addedAt: typeof x.addedAt === 'number' ? x.addedAt : Date.now(),
                        watched: !!x.watched,
                        watchedAt: typeof x.watchedAt === 'number' ? x.watchedAt : undefined
                    }));

                if (!valid.length) throw new Error('No valid items');

                const replace = window.confirm(
                    `Import ${valid.length} title(s)?\n\nOK = replace current watchlist.\nCancel = merge with existing (no duplicates).`
                );

                if (replace) {
                    replaceWatchlist(valid);
                    addToast(`Replaced watchlist with ${valid.length} title(s)`, 'success', 2800);
                } else {
                    const seen = new Set(
                        watchlist.value.map(i => `${i.type}-${i.id}`)
                    );
                    const additions = valid.filter(
                        i => !seen.has(`${i.type}-${i.id}`)
                    );
                    replaceWatchlist([...additions, ...watchlist.value]);
                    addToast(`Merged ${additions.length} new title(s)`, 'success', 2800);
                }
            } catch (err) {
                addToast('Import failed — file is not a valid watchlist export', 'error', 3500);
            } finally {
                if (importInput.value) importInput.value.value = '';
            }
        };

        const formatRelative = (ts: number): string => {
            const diff = Date.now() - ts;
            if (diff < 0) return 'just now';
            const minute = 60 * 1000;
            const hour = 60 * minute;
            const day = 24 * hour;
            const week = 7 * day;
            if (diff < minute) return 'just now';
            if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
            if (diff < day) return `${Math.floor(diff / hour)}h ago`;
            if (diff < week) return `${Math.floor(diff / day)}d ago`;
            const weeks = Math.floor(diff / week);
            if (weeks < 8) return `${weeks}w ago`;
            return new Date(ts).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        };

        return {
            watchlist,
            useWebImage,
            activeFilter,
            sortBy,
            filters,
            activeFilterLabel,
            filtered,
            totalCount,
            unwatchedCount,
            importInput,
            toggleWatched,
            onRemove,
            confirmClear,
            onExport,
            triggerImport,
            onImport,
            formatRelative
        };
    }
});

function isValidItem(x: any): boolean {
    return (
        x &&
        (typeof x.id === 'number' || typeof x.id === 'string') &&
        typeof x.title === 'string' &&
        (x.type === 'movie' || x.type === 'tv')
    );
}
</script>

<style lang="scss" scoped>
.watchlist {
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
            inset: -10% auto auto -20%;
            width: 60%;
            aspect-ratio: 1;
            background: radial-gradient(
                circle at center,
                rgba(201, 167, 106, 0.16),
                transparent 60%
            );
            filter: blur(60px);
            z-index: -1;
            pointer-events: none;
        }
    }

    &__eyebrow {
        color: var(--gold-leaf);
        margin: 0 0 var(--s-2);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(2.4rem, 6vw, 4.5rem);
        line-height: 1;
        letter-spacing: var(--ls-tight);
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

    // ── Body ──────────────────────────────────────────────────────────────
    &__body {
        padding-bottom: clamp(var(--s-7), 8vw, var(--s-10));
    }

    &__toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-4);
        margin-bottom: var(--s-6);
    }

    // ── Filters ──────────────────────────────────────────────────────────
    &__filters {
        display: inline-flex;
        gap: var(--s-1);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        padding: 0.25rem;
        flex-wrap: wrap;
    }

    &__filter {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        padding: 0.5rem var(--s-4);
        border-radius: var(--r-pill);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        color: var(--bone-300);
        transition: color var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out);

        &:hover { color: var(--bone-100); }

        &.is-active {
            color: var(--ink-900);
            background: var(--bone-50);

            .watchlist__filter-count {
                color: var(--ink-900);
                background: rgba(11, 10, 8, 0.12);
            }
        }
    }

    &__filter-count {
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        color: var(--bone-400);
        background: var(--surface-tint);
        padding: 0.05rem 0.45rem;
        border-radius: var(--r-pill);
        transition: color var(--dur-fast) var(--ease-out);
    }

    // ── Controls ─────────────────────────────────────────────────────────
    &__controls {
        display: inline-flex;
        align-items: center;
        gap: var(--s-3);
        flex-wrap: wrap;
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

        &:hover { border-color: var(--rule-strong); }

        span { color: var(--bone-400); }

        select {
            all: unset;
            background: transparent;
            color: inherit;
            font: inherit;
            cursor: pointer;
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

    &__io {
        display: inline-flex;
        gap: var(--s-2);
    }

    &__icon-btn {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        padding: 0.5rem var(--s-4);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        color: var(--bone-200);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        transition:
            background-color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--surface-tint-hover);
            border-color: var(--rule-strong);
            color: var(--bone-50);
        }
    }

    &__file-input { display: none; }

    // ── Grid ─────────────────────────────────────────────────────────────
    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--s-6) var(--s-5);

        @media (max-width: 720px) {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: var(--s-5) var(--s-4);
        }
    }

    // ── Empty (no titles in current filter) ───────────────────────────────
    &__empty-filter {
        text-align: center;
        padding-block: clamp(var(--s-7), 8vw, var(--s-9));
        max-width: 520px;
        margin: 0 auto;

        .eyebrow { color: var(--bone-400); margin-bottom: var(--s-2); }
    }

    &__empty-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.6rem, 3vw, 2.4rem);
        color: var(--bone-50);
        margin: 0 0 var(--s-3);
        font-variation-settings: 'opsz' 144;
        letter-spacing: var(--ls-tight);
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
        transition: transform var(--dur-fast) var(--ease-out);

        &:hover { transform: translateY(-1px); }
    }

    // ── Footer row ───────────────────────────────────────────────────────
    &__footer-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-3);
        margin-top: var(--s-7);
        padding-top: var(--s-5);
        border-top: 1px solid var(--rule);

        .meta { color: var(--bone-400); margin: 0; }
    }

    &__danger {
        all: unset;
        cursor: pointer;
        padding: 0.55rem var(--s-4);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        color: var(--bone-400);
        border-radius: var(--r-pill);
        border: 1px solid var(--rule);
        transition:
            color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            background-color var(--dur-fast) var(--ease-out);

        &:hover {
            color: var(--danger);
            border-color: rgba(201, 78, 61, 0.4);
            background: rgba(201, 78, 61, 0.08);
        }
    }

    // ── Empty (no items at all) ──────────────────────────────────────────
    &__empty {
        padding-block: clamp(var(--s-7), 8vw, var(--s-10));
    }

    &__empty-card {
        max-width: 640px;
        margin: 0 auto;
        text-align: center;
        padding: clamp(var(--s-6), 6vw, var(--s-8));
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-lg);
    }

    &__empty-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ember);
        margin-bottom: var(--s-4);
        opacity: 0.85;
    }

    &__empty-actions {
        display: inline-flex;
        flex-wrap: wrap;
        gap: var(--s-3);
        justify-content: center;
        margin-top: var(--s-2);
    }

    &__empty-cta {
        all: unset;
        cursor: pointer;
        padding: 0.7rem var(--s-5);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        color: var(--bone-100);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 500;
        text-decoration: none;
        transition:
            background-color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--surface-tint-hover);
            border-color: var(--rule-strong);
        }

        &--primary {
            background: var(--ember);
            color: var(--ink-900);
            border-color: var(--ember);
            font-weight: 600;

            &:hover {
                background: var(--ember-600);
                border-color: var(--ember-600);
            }
        }
    }
}

// ── Watchlist card ───────────────────────────────────────────────────────────
.wl-card {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);

    &.is-watched .wl-card__poster img,
    &.is-watched .wl-card__poster-empty {
        opacity: 0.55;
        filter: saturate(0.7);
    }

    &__poster {
        position: relative;
        display: block;
        aspect-ratio: 2 / 3;
        border-radius: var(--r-md);
        overflow: hidden;
        background: var(--ink-700);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
        transition:
            transform var(--dur-base) var(--ease-out),
            box-shadow var(--dur-base) var(--ease-out);
        text-decoration: none;
        color: inherit;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform var(--dur-slow) var(--ease-out), opacity var(--dur-base) var(--ease-out);
        }

        &:hover {
            transform: translateY(-4px);
            box-shadow:
                var(--shadow-lg),
                0 0 0 1px rgba(255, 90, 31, 0.22);

            img { transform: scale(1.04); }
        }
    }

    &__poster-empty {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        background: radial-gradient(70% 70% at 50% 30%, var(--ink-600), var(--ink-800));
        color: var(--bone-500);
        font-size: clamp(2rem, 8cqi, 4rem);
        transition: opacity var(--dur-base) var(--ease-out);
    }

    &__badges {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        right: 0.5rem;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--s-2);
        pointer-events: none;
    }

    &__type {
        padding: 0.2rem 0.5rem;
        background: rgba(11, 10, 8, 0.7);
        backdrop-filter: blur(6px);
        color: var(--bone-200);
        font-family: var(--font-mono);
        font-size: 0.625rem;
        text-transform: uppercase;
        letter-spacing: var(--ls-micro);
        border-radius: var(--r-sm);
    }

    &__rating {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.2rem 0.5rem;
        background: rgba(11, 10, 8, 0.7);
        backdrop-filter: blur(6px);
        color: var(--gold-leaf);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        font-weight: 600;
        border-radius: var(--r-sm);

        svg { width: 11px; height: 11px; }
    }

    &__stamp {
        position: absolute;
        right: 0.5rem;
        bottom: 0.5rem;
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.3rem 0.65rem;
        background: rgba(255, 90, 31, 0.92);
        color: var(--ink-900);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: var(--ls-micro);
        border-radius: var(--r-sm);
        box-shadow: 0 4px 14px rgba(255, 90, 31, 0.35);
    }

    &__body {
        padding: 0 0.1rem;
    }

    &__title {
        margin: 0;
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 500;
        color: var(--bone-50);
        line-height: 1.3;
        letter-spacing: var(--ls-snug);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__added {
        margin: 0.3rem 0 0;
        color: var(--bone-500);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
    }

    &__actions {
        display: flex;
        gap: var(--s-2);
        margin-top: auto;
    }

    &__btn {
        all: unset;
        cursor: pointer;
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.55rem var(--s-3);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-md);
        color: var(--bone-200);
        font-family: var(--font-ui);
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: var(--ls-snug);
        transition:
            background-color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--surface-tint-hover);
            border-color: var(--rule-strong);
            color: var(--bone-50);
        }

        &.is-on {
            background: rgba(255, 90, 31, 0.14);
            border-color: rgba(255, 90, 31, 0.35);
            color: var(--ember);
        }

        &--ghost {
            &:hover {
                background: rgba(201, 78, 61, 0.1);
                border-color: rgba(201, 78, 61, 0.35);
                color: var(--danger);
            }
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .wl-card__poster:hover { transform: none; }
    .wl-card__poster:hover img { transform: none; }
}
</style>
