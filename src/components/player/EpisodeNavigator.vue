<template>
    <section class="episode-navigator">
        <header class="episode-navigator__head">
            <div class="episode-navigator__heading">
                <p class="eyebrow">Reel order</p>
                <h3 class="episode-navigator__title">
                    Season {{ currentSeason }}
                    <span class="meta episode-navigator__count">
                        · {{ seasonEpisodes.length }} episodes
                    </span>
                </h3>
            </div>

            <div class="episode-navigator__controls" role="group" aria-label="Episode navigation">
                <button
                    type="button"
                    class="episode-navigator__nav"
                    :disabled="!canGoPrevious"
                    aria-label="Previous episode"
                    @click="emit('previous')"
                >
                    <ArrowLeft />
                </button>
                <span class="episode-navigator__current" aria-live="polite">
                    S{{ currentSeason }} · E{{ String(currentEpisode).padStart(2, '0') }}
                </span>
                <button
                    type="button"
                    class="episode-navigator__nav"
                    :disabled="!canGoNext"
                    aria-label="Next episode"
                    @click="emit('next')"
                >
                    <ArrowRight />
                </button>
            </div>
        </header>

        <div class="episode-navigator__season">
            <label class="meta episode-navigator__label" for="ep-nav-season">Season</label>
            <div class="episode-navigator__select">
                <select
                    id="ep-nav-season"
                    :value="currentSeason"
                    @change="onSeasonChange(($event.target as HTMLSelectElement).value)"
                >
                    <option
                        v-for="season in availableSeasons"
                        :key="season.id"
                        :value="season.season_number"
                    >
                        Season {{ season.season_number }}
                        <span v-if="season.episode_count">
                            · {{ season.episode_count }} episodes
                        </span>
                    </option>
                </select>
                <span class="episode-navigator__chev" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </span>
            </div>
        </div>

        <div v-if="isLoadingEpisodes" class="episode-navigator__loading" role="status">
            <span class="episode-navigator__spinner" aria-hidden="true" />
            <span class="meta">Loading episodes…</span>
        </div>

        <ol v-else class="episode-navigator__list" role="listbox" aria-label="Episodes">
            <li v-for="ep in seasonEpisodes" :key="ep.id">
                <button
                    type="button"
                    class="ep-row"
                    :class="{ 'is-active': ep.episode_number === currentEpisode }"
                    role="option"
                    :aria-selected="ep.episode_number === currentEpisode"
                    @click="emit('select', ep.episode_number)"
                >
                    <div class="ep-row__still">
                        <img
                            v-if="ep.still_path"
                            :src="webImage(ep.still_path)"
                            :alt="`Episode ${ep.episode_number}: ${ep.name}`"
                            loading="lazy"
                        />
                        <div v-else class="ep-row__placeholder" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                                <rect x="3" y="6" width="18" height="12" rx="2" />
                                <path d="m8 3 4 3 4-3" />
                            </svg>
                        </div>
                        <span v-if="ep.episode_number === currentEpisode" class="ep-row__playing">
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </span>
                        <div
                            v-if="epProgress(ep.episode_number) > 0 && epProgress(ep.episode_number) < 1"
                            class="ep-row__progress"
                            :style="{ width: `${Math.round(epProgress(ep.episode_number) * 100)}%` }"
                            aria-hidden="true"
                        />
                    </div>

                    <div class="ep-row__body">
                        <div class="ep-row__meta">
                            <span class="meta">EP {{ String(ep.episode_number).padStart(2, '0') }}</span>
                            <span v-if="ep.air_date" class="meta">{{ formatDate(ep.air_date) }}</span>
                            <span v-if="ep.runtime" class="meta">{{ ep.runtime }} min</span>
                        </div>
                        <h4 class="ep-row__title">{{ ep.name || `Episode ${ep.episode_number}` }}</h4>
                        <p v-if="ep.overview" class="ep-row__overview">{{ truncate(ep.overview, 160) }}</p>
                    </div>

                    <span v-if="ep.episode_number === currentEpisode" class="ep-row__badge">Now</span>
                </button>
            </li>
        </ol>
    </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, PropType } from 'vue';
import { useWebImage } from '../../utils/useWebImage';
import { getProgressPercent } from '../../composables/useProgress';
import { Episode, TVShowSeasonDetails } from '../../composables/useTvShows';
import ArrowLeft from '../svg/outline/arrow-left.vue';
import ArrowRight from '../svg/outline/arrow-right.vue';

type SeasonRef = Pick<TVShowSeasonDetails, 'id' | 'season_number'> & {
    episode_count?: number;
};

export default defineComponent({
    name: 'EpisodeNavigator',
    components: { ArrowLeft, ArrowRight },
    props: {
        availableSeasons: { type: Array as PropType<SeasonRef[]>, required: true },
        seasonEpisodes: { type: Array as PropType<Episode[]>, required: true },
        currentSeason: { type: Number, required: true },
        currentEpisode: { type: Number, required: true },
        showId: { type: [String, Number], default: '' },
        isLoadingEpisodes: { type: Boolean, default: false }
    },
    emits: ['season-change', 'select', 'previous', 'next'],
    setup(props, { emit }) {
        const canGoPrevious = computed(() => {
            if (props.currentEpisode > 1) return true;
            return !!props.availableSeasons.find((s) => s.season_number === props.currentSeason - 1);
        });

        const canGoNext = computed(() => {
            if (props.currentEpisode < props.seasonEpisodes.length) return true;
            return !!props.availableSeasons.find((s) => s.season_number === props.currentSeason + 1);
        });

        const onSeasonChange = (value: string) => {
            const seasonNum = Number(value);
            if (!Number.isNaN(seasonNum) && seasonNum !== props.currentSeason) {
                emit('season-change', seasonNum);
            }
        };

        const webImage = (path: string) => useWebImage(path, 'medium');

        const epProgress = (epNumber: number) => {
            if (!props.showId) return 0;
            return getProgressPercent(props.showId, 'tv', props.currentSeason, epNumber) / 100;
        };

        const formatDate = (s: string) => {
            const d = new Date(s);
            if (Number.isNaN(d.getTime())) return s;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        const truncate = (text: string, length: number) => {
            if (!text) return '';
            if (text.length <= length) return text;
            return text.slice(0, length).replace(/\s+\S*$/, '') + '…';
        };

        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
            if (e.key === 'ArrowLeft' && canGoPrevious.value) {
                e.preventDefault();
                emit('previous');
            } else if (e.key === 'ArrowRight' && canGoNext.value) {
                e.preventDefault();
                emit('next');
            }
        };

        onMounted(() => document.addEventListener('keydown', onKey));
        onUnmounted(() => document.removeEventListener('keydown', onKey));

        return {
            canGoPrevious,
            canGoNext,
            onSeasonChange,
            webImage,
            epProgress,
            formatDate,
            truncate,
            emit
        };
    }
});
</script>

<style lang="scss" scoped>
.episode-navigator {
    background: var(--ink-800);
    border-radius: var(--r-lg);
    box-shadow: inset 0 0 0 1px var(--rule);
    padding: var(--s-5) var(--s-5);
    display: grid;
    gap: var(--s-5);

    @media (min-width: 768px) {
        padding: var(--s-6);
    }

    &__head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-4);
    }

    &__heading {
        display: grid;
        gap: 0.15rem;
    }

    &__title {
        margin: 0;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-2xl);
        letter-spacing: var(--ls-tight);
        color: var(--bone-50);
    }

    &__count {
        color: var(--bone-400);
    }

    &__controls {
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        background: var(--ink-700);
        padding: var(--s-1);
        border-radius: var(--r-pill);
        box-shadow: inset 0 0 0 1px var(--rule);
    }

    &__nav {
        all: unset;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        color: var(--bone-100);
        transition: background-color var(--dur-fast) var(--ease-out);

        &:hover:not(:disabled) {
            background: var(--ember);
            color: var(--ink-900);
        }

        &:disabled {
            opacity: 0.35;
            cursor: not-allowed;
        }

        :deep(svg) {
            width: 16px;
            height: 16px;
        }
    }

    &__current {
        font-family: var(--font-mono);
        font-size: var(--fs-sm);
        color: var(--bone-50);
        padding: 0 var(--s-3);
    }

    &__season {
        display: grid;
        gap: var(--s-2);
    }

    &__label {
        color: var(--bone-400);
        text-transform: uppercase;
        letter-spacing: var(--ls-micro);
        font-size: var(--fs-xs);
    }

    &__select {
        position: relative;
        max-width: 360px;

        select {
            appearance: none;
            width: 100%;
            padding: 0.7rem 2.4rem 0.7rem 1rem;
            background: var(--ink-700);
            color: var(--bone-50);
            border: 0;
            border-radius: var(--r-md);
            box-shadow: inset 0 0 0 1px var(--rule);
            font-family: var(--font-ui);
            font-size: var(--fs-base);
            cursor: pointer;
            transition: box-shadow var(--dur-fast) var(--ease-out);

            &:focus-visible {
                outline: none;
                box-shadow: inset 0 0 0 1px var(--ember);
            }

            option {
                background: var(--ink-700);
                color: var(--bone-50);
            }
        }
    }

    &__chev {
        position: absolute;
        right: 0.85rem;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: var(--bone-300);
        pointer-events: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        svg { width: 18px; height: 18px; }
    }

    &__loading {
        display: flex;
        align-items: center;
        gap: var(--s-3);
        color: var(--bone-300);
        padding: var(--s-5);
    }

    &__spinner {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid var(--rule-strong);
        border-top-color: var(--ember);
        animation: epnSpin 1s linear infinite;
    }

    &__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: var(--s-3);
    }
}

.ep-row {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    display: grid;
    grid-template-columns: 168px 1fr auto;
    gap: var(--s-4);
    align-items: center;
    padding: var(--s-3);
    background: var(--ink-700);
    border-radius: var(--r-md);
    box-shadow: inset 0 0 0 1px var(--rule);
    cursor: pointer;
    transition:
        background-color var(--dur-fast) var(--ease-out),
        box-shadow var(--dur-fast) var(--ease-out),
        transform var(--dur-fast) var(--ease-out);

    &:hover:not(.is-active) {
        background: var(--ink-600);
        box-shadow: inset 0 0 0 1px var(--rule-strong);
        transform: translateY(-1px);
    }

    &:focus-visible {
        outline: 2px solid var(--ember);
        outline-offset: 2px;
    }

    &.is-active {
        background: linear-gradient(135deg, rgba(255, 90, 31, 0.12), rgba(255, 90, 31, 0.04));
        box-shadow: inset 0 0 0 1px rgba(255, 90, 31, 0.4);
    }

    &__still {
        position: relative;
        aspect-ratio: 16 / 9;
        background: var(--ink-900);
        border-radius: var(--r-sm);
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
    }

    &__placeholder {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: var(--bone-500);

        svg { width: 28px; height: 28px; }
    }

    &__playing {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(11, 10, 8, 0.55);
        color: var(--ember);

        svg { width: 28px; height: 28px; }
    }

    &__progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        background: var(--ember);
        box-shadow: 0 0 12px var(--ember-glow);
        border-radius: 0 2px 0 0;
    }

    &__body {
        display: grid;
        gap: 0.35rem;
        min-width: 0;
    }

    &__meta {
        display: inline-flex;
        align-items: center;
        gap: var(--s-3);
        color: var(--bone-400);
        font-size: var(--fs-xs);

        > .meta { color: inherit; }
    }

    &__title {
        margin: 0;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-lg);
        color: var(--bone-50);
        letter-spacing: var(--ls-tight);
        line-height: var(--lh-snug);
    }

    &__overview {
        margin: 0;
        color: var(--bone-200);
        font-size: var(--fs-sm);
        line-height: var(--lh-base);
        max-width: 60ch;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__badge {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: var(--ls-micro);
        color: var(--ember);
        padding: 0.25rem 0.6rem;
        border-radius: var(--r-pill);
        background: rgba(255, 90, 31, 0.12);
        box-shadow: inset 0 0 0 1px rgba(255, 90, 31, 0.3);
    }

    @media (max-width: 720px) {
        grid-template-columns: 120px 1fr;

        &__badge { display: none; }

        &__overview { -webkit-line-clamp: 3; line-clamp: 3; }
    }
}

@keyframes epnSpin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .episode-navigator__spinner,
    .ep-row {
        animation: none;
        transition: none;
    }
}
</style>
