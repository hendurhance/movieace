<template>
    <aside class="filter-panel" :aria-label="ariaLabel">
        <header class="filter-panel__head">
            <p class="eyebrow filter-panel__eyebrow">Refine</p>
            <h2 class="filter-panel__title display">The filters</h2>
            <button
                v-if="hasActiveFilters"
                type="button"
                class="filter-panel__reset"
                @click="resetAll"
            >
                Reset all
            </button>
        </header>

        <div class="filter-panel__body">
            <section class="filter-panel__section">
                <GenreChips
                    :genres="genres"
                    :model-value="filters.genres"
                    label="Genres"
                    :loading="genresLoading"
                    @update:model-value="onGenresChange"
                />
            </section>

            <section class="filter-panel__section">
                <YearRangeSlider
                    :min="yearBounds[0]"
                    :max="yearBounds[1]"
                    :model-value="filters.yearRange"
                    label="Year"
                    @update:model-value="onYearChange"
                />
            </section>

            <section class="filter-panel__section">
                <header class="filter-panel__row-head">
                    <p class="eyebrow filter-panel__row-label">Minimum rating</p>
                    <p class="filter-panel__row-display meta">
                        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                            <path fill="currentColor" d="M12 2l2.9 6.88L22 9.82l-5.34 4.94L18.18 22 12 18.27 5.82 22l1.52-7.24L2 9.82l7.1-.94z"/>
                        </svg>
                        {{ filters.minRating.toFixed(1) }}
                    </p>
                </header>
                <div class="filter-panel__stepper" role="group" aria-label="Minimum rating">
                    <button
                        v-for="v in ratingSteps"
                        :key="v"
                        type="button"
                        class="filter-panel__stepper-btn"
                        :class="{ 'is-active': filters.minRating === v }"
                        @click="onRatingChange(v)"
                    >{{ v === 0 ? 'Any' : v.toFixed(0) }}+</button>
                </div>
            </section>

            <section class="filter-panel__section">
                <header class="filter-panel__row-head">
                    <p class="eyebrow filter-panel__row-label">Runtime</p>
                </header>
                <div class="filter-panel__chips" role="group" aria-label="Runtime band">
                    <LmChip
                        v-for="band in runtimeBands"
                        :key="band.value"
                        :active="filters.runtimeBand === band.value"
                        size="sm"
                        @toggle="onRuntimeChange(band.value)"
                    >{{ band.label }}</LmChip>
                </div>
            </section>

            <section class="filter-panel__section">
                <header class="filter-panel__row-head">
                    <p class="eyebrow filter-panel__row-label">Original language</p>
                </header>
                <div class="filter-panel__select-wrap">
                    <select
                        class="filter-panel__select"
                        :value="filters.language"
                        @change="onLanguageChange(($event.target as HTMLSelectElement).value)"
                    >
                        <option value="">Any language</option>
                        <option v-for="l in languages" :key="l.code" :value="l.code">{{ l.label }}</option>
                    </select>
                </div>
            </section>

            <section class="filter-panel__section">
                <header class="filter-panel__row-head">
                    <p class="eyebrow filter-panel__row-label">Sort by</p>
                </header>
                <div class="filter-panel__select-wrap">
                    <select
                        class="filter-panel__select"
                        :value="filters.sortBy"
                        @change="onSortChange(($event.target as HTMLSelectElement).value)"
                    >
                        <option v-for="s in sortOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                    </select>
                </div>
            </section>
        </div>
    </aside>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import GenreChips from './GenreChips.vue';
import YearRangeSlider from './YearRangeSlider.vue';
import LmChip from '../primitives/Chip.vue';
import type { Genre } from '../../composables/useGenreLookup';

export type MediaKind = 'movie' | 'tv';

export interface RuntimeBand {
    value: string;
    label: string;
    gte?: number;
    lte?: number;
}

export interface SortOption {
    value: string;
    label: string;
}

export interface DiscoverFilters {
    genres: number[];
    yearRange: [number, number];
    minRating: number;
    runtimeBand: string;
    language: string;
    sortBy: string;
}

export default defineComponent({
    name: 'FilterPanel',
    components: { GenreChips, YearRangeSlider, LmChip },
    props: {
        kind: { type: String as PropType<MediaKind>, default: 'movie' },
        genres: { type: Array as PropType<Genre[]>, required: true },
        genresLoading: { type: Boolean, default: false },
        filters: { type: Object as PropType<DiscoverFilters>, required: true },
        yearBounds: { type: Array as unknown as PropType<[number, number]>, default: () => [1950, new Date().getFullYear() + 2] },
        ariaLabel: { type: String, default: 'Filter panel' }
    },
    emits: ['update:filters', 'reset'],
    setup(props, { emit }) {
        const ratingSteps = [0, 5, 6, 7, 8, 9];

        const runtimeBands: RuntimeBand[] = props.kind === 'tv'
            ? [
                { value: 'any', label: 'Any length' },
                { value: 'short', label: '< 30m', lte: 29 },
                { value: 'standard', label: '30–59m', gte: 30, lte: 59 },
                { value: 'long', label: '60m+', gte: 60 }
            ]
            : [
                { value: 'any', label: 'Any length' },
                { value: 'short', label: '< 90m', lte: 89 },
                { value: 'standard', label: '90–119m', gte: 90, lte: 119 },
                { value: 'feature', label: '120–149m', gte: 120, lte: 149 },
                { value: 'epic', label: '150m+', gte: 150 }
            ];

        const languages = [
            { code: 'en', label: 'English' },
            { code: 'fr', label: 'French' },
            { code: 'es', label: 'Spanish' },
            { code: 'it', label: 'Italian' },
            { code: 'de', label: 'German' },
            { code: 'ja', label: 'Japanese' },
            { code: 'ko', label: 'Korean' },
            { code: 'zh', label: 'Chinese' },
            { code: 'hi', label: 'Hindi' },
            { code: 'pt', label: 'Portuguese' },
            { code: 'ru', label: 'Russian' },
            { code: 'ar', label: 'Arabic' }
        ];

        const sortOptions: SortOption[] = props.kind === 'tv'
            ? [
                { value: 'popularity.desc', label: 'Most popular' },
                { value: 'first_air_date.desc', label: 'Newest first' },
                { value: 'first_air_date.asc', label: 'Oldest first' },
                { value: 'vote_average.desc', label: 'Highest rated' },
                { value: 'vote_count.desc', label: 'Most voted' },
                { value: 'name.asc', label: 'A–Z' }
            ]
            : [
                { value: 'popularity.desc', label: 'Most popular' },
                { value: 'release_date.desc', label: 'Newest first' },
                { value: 'release_date.asc', label: 'Oldest first' },
                { value: 'vote_average.desc', label: 'Highest rated' },
                { value: 'vote_count.desc', label: 'Most voted' },
                { value: 'revenue.desc', label: 'Top grossing' },
                { value: 'title.asc', label: 'A–Z' }
            ];

        const defaultSort = computed(() => sortOptions[0].value);

        const hasActiveFilters = computed(() => {
            const f = props.filters;
            const [lo, hi] = f.yearRange;
            const [boundLo, boundHi] = props.yearBounds;
            return (
                f.genres.length > 0 ||
                f.minRating > 0 ||
                (f.runtimeBand && f.runtimeBand !== 'any') ||
                !!f.language ||
                f.sortBy !== defaultSort.value ||
                lo !== boundLo ||
                hi !== boundHi
            );
        });

        const patch = (changes: Partial<DiscoverFilters>) => {
            emit('update:filters', { ...props.filters, ...changes });
        };

        const onGenresChange = (ids: number[]) => patch({ genres: ids });
        const onYearChange = (range: [number, number]) => patch({ yearRange: range });
        const onRatingChange = (v: number) => patch({ minRating: v });
        const onRuntimeChange = (v: string) => patch({ runtimeBand: v });
        const onLanguageChange = (v: string) => patch({ language: v });
        const onSortChange = (v: string) => patch({ sortBy: v });

        const resetAll = () => emit('reset');

        return {
            ratingSteps,
            runtimeBands,
            languages,
            sortOptions,
            hasActiveFilters,
            onGenresChange,
            onYearChange,
            onRatingChange,
            onRuntimeChange,
            onLanguageChange,
            onSortChange,
            resetAll
        };
    }
});
</script>

<style lang="scss" scoped>
.filter-panel {
    background: var(--ink-800);
    border: 1px solid var(--rule);
    border-radius: var(--r-lg);
    padding: var(--s-6);
    position: sticky;
    top: calc(var(--header-h, 72px) + var(--s-5));
    max-height: calc(100dvh - var(--header-h, 72px) - var(--s-7));
    overflow-y: auto;

    &__head {
        display: grid;
        gap: var(--s-1);
        margin-bottom: var(--s-6);
        padding-bottom: var(--s-5);
        border-bottom: 1px solid var(--rule);
        position: relative;
    }

    &__eyebrow {
        color: var(--ember);
        margin: 0;
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-xl);
        color: var(--bone-50);
        margin: 0;
        letter-spacing: -0.01em;
    }

    &__reset {
        position: absolute;
        right: 0;
        top: 0;
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--bone-300);
        padding: 0.3rem 0.7rem;
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        transition:
            color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out);

        &:hover, &:focus-visible {
            color: var(--ember);
            border-color: currentColor;
        }
    }

    &__body {
        display: grid;
        gap: var(--s-6);
    }

    &__section {
        display: grid;
        gap: var(--s-3);
        padding-bottom: var(--s-5);
        border-bottom: 1px solid var(--rule);

        &:last-child {
            padding-bottom: 0;
            border-bottom: 0;
        }
    }

    &__row-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--s-3);
    }

    &__row-label {
        color: var(--bone-400);
        margin: 0;
    }

    &__row-display {
        font-family: var(--font-mono);
        color: var(--gold-leaf);
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
    }

    &__stepper {
        display: inline-flex;
        flex-wrap: wrap;
        gap: var(--s-1);
        padding: var(--s-1);
        background: var(--surface-tint);
        border-radius: var(--r-pill);
    }

    &__stepper-btn {
        padding: 0.35rem 0.75rem;
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        font-weight: 500;
        color: var(--bone-300);
        background: transparent;
        border: 0;
        border-radius: var(--r-pill);
        letter-spacing: 0.06em;
        transition:
            color var(--dur-fast) var(--ease-out),
            background-color var(--dur-fast) var(--ease-out);

        &:hover { color: var(--bone-50); }

        &.is-active {
            color: var(--ink-900);
            background: var(--bone-50);
        }
    }

    &__chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-2);
    }

    &__select-wrap {
        position: relative;

        &::after {
            content: '';
            position: absolute;
            top: 50%;
            right: 0.9rem;
            width: 8px;
            height: 8px;
            border-right: 1.5px solid var(--bone-400);
            border-bottom: 1.5px solid var(--bone-400);
            transform: translateY(-70%) rotate(45deg);
            pointer-events: none;
        }
    }

    &__select {
        width: 100%;
        appearance: none;
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        color: var(--bone-50);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-md);
        padding: 0.65rem 2.25rem 0.65rem 0.85rem;
        cursor: pointer;
        transition:
            border-color var(--dur-fast) var(--ease-out),
            background-color var(--dur-fast) var(--ease-out);

        &:hover { background: var(--surface-tint-hover); }
        &:focus-visible { outline: none; border-color: var(--ember); }
    }
}
</style>
