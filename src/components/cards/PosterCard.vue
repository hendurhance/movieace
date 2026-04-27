<template>
    <article
        class="poster-card"
        :class="[`poster-card--${size}`, { 'is-peeking': peeking }]"
        @mouseenter="handleEnter"
        @mouseleave="handleLeave"
        @focusin="handleEnter"
        @focusout="handleLeaveFocus"
    >
        <router-link :to="routeTo" class="poster-card__link" :aria-label="title">
            <div class="poster-card__poster">
                <img
                    v-if="imageUrl"
                    :src="imageUrl"
                    :alt="title"
                    loading="lazy"
                    decoding="async"
                    class="poster-card__img"
                />
                <div v-else class="poster-card__img poster-card__img--empty">
                    <span class="display display--italic">{{ initial }}</span>
                </div>

                <div class="poster-card__badges">
                    <span v-if="rating > 0" class="poster-card__rating" aria-label="Rating">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="m12 2 3 7 7 .6-5.3 4.7 1.6 7L12 17.7 5.7 21.3l1.6-7L2 9.6 9 9z"/>
                        </svg>
                        {{ ratingLabel }}
                    </span>
                    <span v-if="adult" class="poster-card__adult">18+</span>
                </div>

                <div class="poster-card__scrim" aria-hidden="true" />
            </div>

            <div class="poster-card__caption">
                <h4 class="poster-card__title">{{ title }}</h4>
                <div class="poster-card__meta meta">
                    <span v-if="year">{{ year }}</span>
                    <span v-if="year && genreLabel" class="poster-card__dot">·</span>
                    <span v-if="genreLabel">{{ genreLabel }}</span>
                </div>
            </div>
        </router-link>

        <!-- Peek overlay — actions surface on hover -->
        <div class="poster-card__peek" aria-hidden="true">
            <div class="poster-card__peek-actions">
                <button
                    type="button"
                    class="poster-card__peek-btn poster-card__peek-btn--primary"
                    :aria-label="`Play ${title}`"
                    @click.prevent.stop="goToStream"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
                <button
                    type="button"
                    class="poster-card__peek-btn"
                    :class="{ 'is-added': inWatchlist }"
                    :aria-label="inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'"
                    @click.prevent.stop="toggleWatchlist"
                >
                    <svg v-if="!inWatchlist" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="m5 13 4 4L19 7"/>
                    </svg>
                </button>
            </div>
        </div>
    </article>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, PropType, ref } from 'vue';
import { useWebImage } from '../../utils/useWebImage';
import { genreName } from '../../composables/useGenreLookup';
import { isInWatchlist, toggleWatchlistItem } from '../../composables/useWatchlist';
import { useRouter } from 'vue-router';

type MediaType = 'movie' | 'tv';

export default defineComponent({
    name: 'PosterCard',
    props: {
        id: { type: [Number, String], required: true },
        type: { type: String as PropType<MediaType>, default: 'movie' },
        title: { type: String, required: true },
        posterPath: { type: String as PropType<string | null>, default: null },
        rating: { type: Number, default: 0 },
        releaseDate: { type: String, default: '' },
        genreIds: { type: Array as PropType<number[]>, default: () => [] },
        adult: { type: Boolean, default: false },
        size: {
            type: String as PropType<'sm' | 'md' | 'lg'>,
            default: 'md'
        }
    },
    setup(props) {
        const router = useRouter();
        const peeking = ref(false);
        let enterTimer: number | null = null;
        let leaveTimer: number | null = null;

        const imageUrl = computed(() => {
            if (!props.posterPath) return '';
            const size = props.size === 'lg' ? 'large' : 'medium';
            return useWebImage(props.posterPath, size);
        });

        const initial = computed(() => props.title?.[0]?.toUpperCase() ?? '·');

        const ratingLabel = computed(() =>
            props.rating ? props.rating.toFixed(1) : ''
        );

        const year = computed(() =>
            props.releaseDate ? String(new Date(props.releaseDate).getFullYear()) : ''
        );

        const genreLabel = computed(() => {
            if (!props.genreIds?.length) return '';
            return genreName(props.genreIds[0], props.type) ?? '';
        });

        const routeTo = computed(() =>
            props.type === 'tv' ? `/tv-show/${props.id}` : `/movie/${props.id}`
        );

        const inWatchlist = computed(() =>
            isInWatchlist(props.id, props.type)
        );

        const toggleWatchlist = () => {
            toggleWatchlistItem({
                id: props.id,
                title: props.title,
                image: props.posterPath,
                rating: props.rating,
                categories: props.genreIds,
                adult: props.adult,
                type: props.type
            });
        };

        const goToStream = () => {
            if (props.type === 'tv') {
                router.push(`/stream/tv-show/${props.id}/season/1/episode/1`);
            } else {
                router.push(`/stream/movie/${props.id}`);
            }
        };

        const clearTimers = () => {
            if (enterTimer !== null) {
                window.clearTimeout(enterTimer);
                enterTimer = null;
            }
            if (leaveTimer !== null) {
                window.clearTimeout(leaveTimer);
                leaveTimer = null;
            }
        };

        const handleEnter = () => {
            if (leaveTimer !== null) {
                window.clearTimeout(leaveTimer);
                leaveTimer = null;
            }
            if (enterTimer !== null) return;
            enterTimer = window.setTimeout(() => {
                peeking.value = true;
                enterTimer = null;
            }, 240);
        };

        const handleLeave = () => {
            if (enterTimer !== null) {
                window.clearTimeout(enterTimer);
                enterTimer = null;
            }
            leaveTimer = window.setTimeout(() => {
                peeking.value = false;
                leaveTimer = null;
            }, 80);
        };

        const handleLeaveFocus = (e: FocusEvent) => {
            const next = e.relatedTarget as HTMLElement | null;
            const card = (e.currentTarget as HTMLElement) ?? null;
            if (card && next && card.contains(next)) return;
            handleLeave();
        };

        onBeforeUnmount(clearTimers);

        return {
            peeking,
            imageUrl,
            initial,
            ratingLabel,
            year,
            genreLabel,
            routeTo,
            inWatchlist,
            toggleWatchlist,
            goToStream,
            handleEnter,
            handleLeave,
            handleLeaveFocus
        };
    }
});
</script>

<style lang="scss" scoped>
.poster-card {
    position: relative;
    display: flex;
    flex-direction: column;
    --peek-lift: 0;
    transition: transform var(--dur-base) var(--ease-out);

    &.is-peeking {
        z-index: 2;
        --peek-lift: -6px;
    }

    &__link {
        display: block;
        color: inherit;
        text-decoration: none;
    }

    // ── Poster ────────────────────────────────────────────────────────────
    &__poster {
        position: relative;
        aspect-ratio: 2 / 3;
        border-radius: var(--r-md);
        overflow: hidden;
        background: var(--ink-700);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
        transform: translateY(var(--peek-lift));
        transition:
            transform var(--dur-base) var(--ease-out),
            box-shadow var(--dur-base) var(--ease-out);

        .is-peeking & {
            box-shadow:
                0 20px 46px rgba(0, 0, 0, 0.55),
                0 0 0 1px rgba(255, 90, 31, 0.25);
        }
    }

    &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform var(--dur-slow) var(--ease-out);

        .is-peeking & {
            transform: scale(1.04);
        }

        &--empty {
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--bone-500);
            background:
                radial-gradient(80% 80% at 50% 30%, var(--ink-600), var(--ink-800));
            font-size: clamp(2rem, 8cqi, 5rem);
            line-height: 1;
        }
    }

    &__scrim {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
            180deg,
            transparent 55%,
            rgba(11, 10, 8, 0.85) 100%
        );
        opacity: 0;
        transition: opacity var(--dur-base) var(--ease-out);

        .is-peeking & { opacity: 1; }
    }

    // ── Badges ────────────────────────────────────────────────────────────
    &__badges {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        right: 0.5rem;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        gap: 0.4rem;
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

        svg {
            width: 12px;
            height: 12px;
        }
    }

    &__adult {
        margin-left: auto;
        padding: 0.2rem 0.45rem;
        background: rgba(201, 78, 61, 0.92);
        color: var(--bone-50);
        font-family: var(--font-mono);
        font-size: 0.625rem;
        font-weight: 700;
        border-radius: var(--r-sm);
        letter-spacing: 0.03em;
    }

    // ── Caption ───────────────────────────────────────────────────────────
    &__caption {
        padding: var(--s-3) var(--s-1) var(--s-1);
        transform: translateY(calc(var(--peek-lift) * 0.5));
        transition: transform var(--dur-base) var(--ease-out);
    }

    &__title {
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 500;
        color: var(--bone-50);
        letter-spacing: var(--ls-snug);
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color var(--dur-fast) var(--ease-out);

        .is-peeking & {
            color: var(--ember);
        }
    }

    &__meta {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-top: 0.3rem;
        color: var(--bone-400);
        font-size: 0.6875rem;
    }

    &__dot {
        color: var(--bone-500);
    }

    // ── Peek actions (hover CTAs) ─────────────────────────────────────────
    &__peek {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        aspect-ratio: 2 / 3;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: var(--s-2);
        gap: var(--s-2);
        // Always pass-through on the wrapper — only the action row catches the pointer.
        // Otherwise the empty area of this overlay would steal hover/clicks from the
        // underlying <router-link>, killing the pointer cursor and detail-page nav.
        pointer-events: none;
        opacity: 0;
        transform: translateY(calc(var(--peek-lift) + 8px));
        transition:
            opacity var(--dur-base) var(--ease-out),
            transform var(--dur-base) var(--ease-out);

        .is-peeking & {
            opacity: 1;
            transform: translateY(var(--peek-lift));
        }
    }

    &__peek-actions {
        display: flex;
        gap: var(--s-2);
        pointer-events: none;

        .is-peeking & {
            pointer-events: auto;
        }
    }

    &__peek-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: rgba(11, 10, 8, 0.72);
        backdrop-filter: blur(10px);
        border: 1px solid var(--rule-strong);
        border-radius: 50%;
        color: var(--bone-50);
        cursor: pointer;
        transition:
            background-color var(--dur-fast) var(--ease-out),
            color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            transform var(--dur-fast) var(--ease-out);

        svg { width: 16px; height: 16px; }

        &:hover {
            background: var(--ember);
            color: var(--ink-900);
            border-color: var(--ember);
            transform: scale(1.08);
        }

        &--primary {
            background: var(--ember);
            color: var(--ink-900);
            border-color: var(--ember);
            box-shadow: 0 8px 18px rgba(255, 90, 31, 0.35);

            &:hover {
                background: var(--ember-600);
                border-color: var(--ember-600);
            }
        }

        &.is-added {
            background: var(--gold-leaf);
            color: var(--ink-900);
            border-color: var(--gold-leaf);
        }
    }

    // ── Size variants ─────────────────────────────────────────────────────
    &--sm &__title   { font-size: var(--fs-xs); }
    &--sm &__peek-btn { width: 30px; height: 30px; svg { width: 14px; height: 14px; } }

    &--lg &__title   { font-size: var(--fs-base); }
    &--lg &__peek-btn { width: 42px; height: 42px; svg { width: 18px; height: 18px; } }
}

// Reduced motion — no scale, snap to end-states
@media (prefers-reduced-motion: reduce) {
    .poster-card {
        --peek-lift: 0;
        &__img, &__poster, &__caption, &__peek {
            transition: none;
            transform: none !important;
        }
    }
}
</style>
