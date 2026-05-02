<template>
    <section ref="rootRef" class="billboard" :class="{ 'trailer-playing': trailerVisible }" aria-label="Featured title">
        <div class="billboard__stage">
            <img
                v-if="backdropUrl"
                class="billboard__backdrop"
                :src="backdropUrl"
                :alt="title"
                fetchpriority="high"
                decoding="async"
            />
            <div v-else class="billboard__backdrop billboard__backdrop--placeholder" aria-hidden="true" />

            <iframe
                v-if="trailerVisible && trailerSrc"
                ref="iframeRef"
                class="billboard__trailer"
                :src="trailerSrc"
                title="Trailer"
                frameborder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowfullscreen
                aria-hidden="true"
                @load="onIframeLoad"
            />

            <div class="billboard__scrim" aria-hidden="true" />
            <div class="billboard__bloom" aria-hidden="true" />
            <div class="billboard__grain grain" aria-hidden="true" />
        </div>

        <TrailerControls
            :visible="trailerVisible && trailerLive"
            :paused="userPaused"
            :muted="userMuted"
            @toggle-pause="togglePause"
            @toggle-mute="toggleMute"
        />

        <div class="container-lm billboard__content">
            <span class="eyebrow billboard__eyebrow">{{ eyebrow }}</span>

            <h1 class="billboard__title display" data-reveal>
                {{ title }}
            </h1>

            <p v-if="tagline" class="billboard__tagline">{{ tagline }}</p>

            <ul class="billboard__meta meta">
                <li v-if="year">{{ year }}</li>
                <li v-if="ratingLabel" class="billboard__rating">
                    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                        <path fill="currentColor" d="M12 2l2.9 6.88L22 9.82l-5.34 4.94L18.18 22 12 18.27 5.82 22l1.52-7.24L2 9.82l7.1-.94z"/>
                    </svg>
                    {{ ratingLabel }}
                </li>
                <li v-for="g in genreNames" :key="g">{{ g }}</li>
                <li v-if="adult" class="billboard__cert">18+</li>
            </ul>

            <p v-if="overview" class="billboard__overview">{{ truncatedOverview }}</p>

            <div class="billboard__actions">
                <LmButton
                    variant="primary"
                    size="lg"
                    :to="playRoute"
                    aria-label="Play"
                >
                    <template #leading>
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path fill="currentColor" d="M8 5v14l11-7z"/>
                        </svg>
                    </template>
                    Play
                </LmButton>

                <LmButton
                    variant="outline"
                    size="lg"
                    @click="onWatchlist"
                    :aria-pressed="inWatchlist"
                >
                    <template #leading>
                        <svg v-if="inWatchlist" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path fill="currentColor" d="M5 5h14v16l-7-4-7 4z"/>
                        </svg>
                        <svg v-else viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 5h14v16l-7-4-7 4z"/>
                        </svg>
                    </template>
                    {{ inWatchlist ? 'On your list' : 'Watchlist' }}
                </LmButton>

                <LmButton
                    variant="ghost"
                    size="lg"
                    :to="detailRoute"
                    aria-label="More info"
                >
                    More info
                </LmButton>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, toRef } from 'vue';
import LmButton from '../primitives/Button.vue';
import TrailerControls from './TrailerControls.vue';
import { genreName, primeGenres } from '../../composables/useGenreLookup';
import { isInWatchlist, toggleWatchlistItem } from '../../composables/useWatchlist';
import { useAmbientColor } from '../../composables/useAmbientColor';
import { useTrailerEmbed } from '../../composables/useTrailerEmbed';

export default defineComponent({
    name: 'BillboardHero',
    components: { LmButton, TrailerControls },
    props: {
        id: { type: [Number, String], required: true },
        type: { type: String as PropType<'movie' | 'tv'>, default: 'movie' },
        title: { type: String, required: true },
        tagline: { type: String, default: '' },
        overview: { type: String, default: '' },
        backdropPath: { type: String as PropType<string | null>, default: null },
        posterPath: { type: String as PropType<string | null>, default: null },
        rating: { type: Number, default: 0 },
        releaseDate: { type: String, default: '' },
        genreIds: { type: Array as PropType<number[]>, default: () => [] },
        adult: { type: Boolean, default: false },
        eyebrow: { type: String, default: 'This week’s feature' },
        dwellMs: { type: Number, default: 2000 }
    },
    setup(props) {
        const IMAGE_BASEURL = (import.meta as any).env.VITE_IMAGE_BASE_URL;

        const rootRef = ref<HTMLElement | null>(null);
        const ambientPath = computed(() => props.backdropPath || props.posterPath);
        useAmbientColor(ambientPath, rootRef);

        const backdropUrl = computed(() =>
            props.backdropPath ? `${IMAGE_BASEURL}original${props.backdropPath}` : ''
        );

        const year = computed(() =>
            props.releaseDate ? new Date(props.releaseDate).getFullYear() : null
        );

        const ratingLabel = computed(() =>
            props.rating > 0 ? props.rating.toFixed(1) : ''
        );

        const genreNames = computed(() => {
            return (props.genreIds || [])
                .map(id => genreName(id, props.type))
                .filter((n): n is string => !!n)
                .slice(0, 3);
        });

        const truncatedOverview = computed(() => {
            if (!props.overview) return '';
            if (props.overview.length <= 240) return props.overview;
            return `${props.overview.slice(0, 237).trim()}…`;
        });

        const playRoute = computed(() =>
            props.type === 'tv'
                ? `/stream/tv-show/${props.id}/season/1/episode/1`
                : `/stream/movie/${props.id}`
        );

        const detailRoute = computed(() =>
            props.type === 'tv' ? `/tv-show/${props.id}` : `/movie/${props.id}`
        );

        const inWatchlist = computed(() => isInWatchlist(props.id, props.type));

        const onWatchlist = () => {
            toggleWatchlistItem({
                id: props.id,
                title: props.title,
                image: props.posterPath,
                rating: props.rating,
                categories: props.genreIds || [],
                adult: props.adult,
                type: props.type
            });
        };

        const {
            iframeRef,
            trailerVisible,
            trailerBlocked,
            trailerLive,
            trailerSrc,
            userPaused,
            userMuted,
            onIframeLoad,
            togglePause,
            toggleMute
        } = useTrailerEmbed({
            id: toRef(props, 'id'),
            type: toRef(props, 'type'),
            dwellMs: props.dwellMs
        });

        onMounted(() => {
            primeGenres();
        });

        return {
            rootRef,
            iframeRef,
            backdropUrl,
            year,
            ratingLabel,
            genreNames,
            truncatedOverview,
            playRoute,
            detailRoute,
            inWatchlist,
            onWatchlist,
            trailerVisible,
            trailerBlocked,
            trailerLive,
            trailerSrc,
            userPaused,
            userMuted,
            onIframeLoad,
            togglePause,
            toggleMute
        };
    }
});
</script>

<style lang="scss" scoped>
.billboard {
    position: relative;
    isolation: isolate;
    min-height: clamp(520px, 78vh, 880px);
    display: flex;
    align-items: flex-end;
    color: var(--bone-50);
    overflow: hidden;

    &__stage {
        position: absolute;
        inset: 0;
        z-index: 0;
    }

    &__backdrop {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 25%;
        transition: opacity var(--dur-slow) var(--ease-out);

        &--placeholder {
            background: radial-gradient(70% 70% at 40% 40%, var(--ink-700), var(--ink-900));
        }
    }

    &__trailer {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 177.77vh;
        height: 100vh;
        min-width: 100%;
        min-height: 56.25vw;
        transform: translate(-50%, -50%);
        pointer-events: none;
        opacity: 0;
        transition: opacity var(--dur-slow) var(--ease-out);
    }

    &.trailer-playing &__trailer { opacity: 1; }
    &.trailer-playing &__backdrop { opacity: 0; }

    &__scrim {
        position: absolute;
        inset: 0;
        background:
            linear-gradient(180deg, rgba(11,10,8,0) 0%, rgba(11,10,8,0) 40%, rgba(11,10,8,0.75) 85%, var(--ink-900) 100%),
            linear-gradient(90deg, rgba(11,10,8,0.85) 0%, rgba(11,10,8,0.45) 45%, rgba(11,10,8,0) 75%);
        pointer-events: none;
    }

    &__bloom {
        position: absolute;
        left: -10%;
        bottom: -30%;
        width: 80%;
        height: 80%;
        background: radial-gradient(closest-side, rgba(var(--ambient, 255 90 31), 0.20), transparent 70%);
        filter: blur(40px);
        pointer-events: none;
    }

    &__grain {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.6;
    }

    &__content {
        position: relative;
        z-index: 1;
        padding-block: clamp(var(--s-6), 8vh, var(--s-10));
        padding-inline: var(--s-6);
        max-width: 860px;
    }

    &__eyebrow {
        color: var(--ember);
        display: inline-block;
        margin-bottom: var(--s-3);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(3rem, 8vw, 6.5rem);
        line-height: 0.96;
        letter-spacing: -0.02em;
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
        color: var(--bone-50);
        margin: 0;
        text-wrap: balance;
        max-width: 18ch;
    }

    &__tagline {
        font-family: var(--font-display);
        font-style: italic;
        font-size: clamp(1.125rem, 1.6vw, 1.5rem);
        color: var(--bone-200);
        margin-top: var(--s-3);
        max-width: 48ch;
    }

    &__meta {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-3);
        margin: var(--s-5) 0 0;
        padding: 0;
        color: var(--bone-200);
        font-size: var(--fs-xs);

        li {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            position: relative;
        }

        li + li::before {
            content: '·';
            color: var(--bone-400);
            margin-right: var(--s-3);
            position: absolute;
            left: calc(-1 * var(--s-3) - 0.2rem);
        }
    }

    &__rating {
        color: var(--gold-leaf);
        svg { color: var(--gold-leaf); }
    }

    &__cert {
        padding: 1px 6px;
        border: 1px solid var(--rule);
        border-radius: 2px;
        color: var(--bone-200);
    }

    &__overview {
        font-size: var(--fs-base);
        line-height: 1.55;
        color: var(--bone-200);
        margin: var(--s-5) 0 0;
        max-width: 52ch;

        @media (max-width: 600px) {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-3);
        margin-top: var(--s-6);
    }

    @media (max-width: 720px) {
        min-height: clamp(460px, 70vh, 680px);
        align-items: flex-end;

        &__content { padding-block: var(--s-6); }
        &__overview { margin-top: var(--s-4); }
        &__actions { margin-top: var(--s-5); }
    }
}

@media (prefers-reduced-motion: reduce) {
    .billboard__backdrop,
    .billboard__trailer { transition: none; }
}
</style>
