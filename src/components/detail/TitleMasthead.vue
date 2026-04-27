<template>
    <header ref="rootRef" class="masthead" :aria-label="`${title} — masthead`">
        <div class="masthead__stage">
            <img
                v-if="backdropUrl"
                class="masthead__art"
                :src="backdropUrl"
                :alt="title"
                fetchpriority="high"
                decoding="async"
            />
            <div v-else class="masthead__art masthead__art--placeholder" aria-hidden="true" />

            <div class="masthead__scrim" aria-hidden="true" />
            <div class="masthead__bloom" aria-hidden="true" />
            <div class="masthead__grain grain" aria-hidden="true" />
        </div>

        <div class="container-lm masthead__inner">
            <router-link to="/" class="masthead__crumb eyebrow">
                <span aria-hidden="true">←</span>
                Back to issue
            </router-link>

            <div class="masthead__content">
                <span class="eyebrow masthead__eyebrow">
                    {{ eyebrow }}
                    <span v-if="year" class="masthead__year">· {{ year }}</span>
                </span>

                <h1 class="masthead__title display" data-reveal>{{ title }}</h1>

                <p v-if="tagline" class="masthead__tagline">
                    <span class="masthead__quote" aria-hidden="true">“</span>{{ tagline }}<span class="masthead__quote" aria-hidden="true">”</span>
                </p>

                <ul v-if="genres.length || ratingLabel" class="masthead__chips">
                    <li v-if="ratingLabel" class="masthead__rating">
                        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                            <path fill="currentColor" d="M12 2l2.9 6.88L22 9.82l-5.34 4.94L18.18 22 12 18.27 5.82 22l1.52-7.24L2 9.82l7.1-.94z"/>
                        </svg>
                        {{ ratingLabel }}
                    </li>
                    <li v-for="g in genres.slice(0, 4)" :key="g" class="masthead__chip">{{ g }}</li>
                    <li v-if="adult" class="masthead__cert">18+</li>
                </ul>

                <div class="masthead__actions">
                    <LmButton variant="primary" size="lg" :to="playRoute" :aria-label="playLabel">
                        <template #leading>
                            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                <path fill="currentColor" d="M8 5v14l11-7z"/>
                            </svg>
                        </template>
                        {{ playLabel }}
                    </LmButton>

                    <LmButton
                        v-if="showTrailer"
                        variant="outline"
                        size="lg"
                        @click="$emit('trailer')"
                    >
                        <template #leading>
                            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="5" width="18" height="14" rx="2"/>
                                <path d="M10 9l5 3-5 3z" fill="currentColor"/>
                            </svg>
                        </template>
                        Trailer
                    </LmButton>

                    <LmButton
                        variant="ghost"
                        size="lg"
                        @click="toggleWatchlist"
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
                </div>
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import LmButton from '../primitives/Button.vue';
import { isInWatchlist, toggleWatchlistItem } from '../../composables/useWatchlist';
import { useAmbientColor } from '../../composables/useAmbientColor';

export default defineComponent({
    name: 'TitleMasthead',
    components: { LmButton },
    emits: ['trailer'],
    props: {
        id: { type: [Number, String], required: true },
        type: { type: String as PropType<'movie' | 'tv'>, default: 'movie' },
        title: { type: String, required: true },
        tagline: { type: String, default: '' },
        eyebrow: { type: String, default: 'Feature' },
        backdropPath: { type: String as PropType<string | null>, default: null },
        posterPath: { type: String as PropType<string | null>, default: null },
        rating: { type: Number, default: 0 },
        releaseDate: { type: String, default: '' },
        genres: { type: Array as PropType<string[]>, default: () => [] },
        genreIds: { type: Array as PropType<number[]>, default: () => [] },
        adult: { type: Boolean, default: false },
        playRoute: { type: [String, Object] as PropType<string | Record<string, unknown>>, required: true },
        playLabel: { type: String, default: 'Play' },
        showTrailer: { type: Boolean, default: true }
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

        const inWatchlist = computed(() => isInWatchlist(props.id, props.type));

        const toggleWatchlist = () => {
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

        return { rootRef, backdropUrl, year, ratingLabel, inWatchlist, toggleWatchlist };
    }
});
</script>

<style lang="scss" scoped>
.masthead {
    position: relative;
    isolation: isolate;
    min-height: clamp(520px, 80vh, 860px);
    color: var(--bone-50);
    display: flex;
    align-items: flex-end;
    overflow: hidden;

    &__stage {
        position: absolute;
        inset: 0;
        z-index: 0;
    }

    &__art {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 22%;

        &--placeholder {
            background: radial-gradient(70% 70% at 50% 40%, var(--ink-700), var(--ink-900));
        }
    }

    &__scrim {
        position: absolute;
        inset: 0;
        background:
            linear-gradient(180deg, rgba(11,10,8,0.6) 0%, rgba(11,10,8,0) 25%, rgba(11,10,8,0) 55%, rgba(11,10,8,0.8) 88%, var(--ink-900) 100%),
            radial-gradient(120% 90% at 0% 100%, rgba(11,10,8,0.7), rgba(11,10,8,0) 55%);
        pointer-events: none;
    }

    &__bloom {
        position: absolute;
        left: -5%;
        bottom: -10%;
        width: 70%;
        height: 70%;
        background: radial-gradient(closest-side, rgba(var(--ambient, 255 90 31), 0.18), transparent 70%);
        filter: blur(40px);
        pointer-events: none;
    }

    &__grain {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.6;
    }

    &__inner {
        position: relative;
        z-index: 1;
        padding-block: clamp(var(--s-6), 6vh, var(--s-10));
        padding-inline: var(--s-6);
    }

    &__crumb {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--bone-200);
        margin-bottom: var(--s-8);
        text-decoration: none;
        transition: color var(--dur-fast) var(--ease-out);

        &:hover, &:focus-visible { color: var(--ember); }

        span { transition: transform var(--dur-fast) var(--ease-out); }
        &:hover span { transform: translateX(-3px); }
    }

    &__content {
        max-width: 960px;
    }

    &__eyebrow {
        color: var(--ember);
        display: inline-flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: var(--s-3);
    }

    &__year {
        color: var(--bone-400);
        font-family: var(--font-mono);
        letter-spacing: 0.05em;
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(2.8rem, 8vw, 6.75rem);
        line-height: 0.94;
        letter-spacing: -0.02em;
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
        color: var(--bone-50);
        margin: 0;
        text-wrap: balance;
        max-width: 22ch;
    }

    &__tagline {
        font-family: var(--font-display);
        font-style: italic;
        font-size: clamp(1.125rem, 1.7vw, 1.6rem);
        color: var(--bone-200);
        margin: var(--s-4) 0 0;
        max-width: 54ch;
        line-height: 1.35;
    }

    &__quote {
        color: var(--ember);
        font-size: 1.2em;
        line-height: 0;
        vertical-align: -0.15em;
        padding-inline: 0.1em;
    }

    &__chips {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-2);
        margin: var(--s-5) 0 0;
        padding: 0;
        font-size: var(--fs-xs);

        li {
            padding: 0.35rem 0.7rem;
            border: 1px solid var(--rule);
            border-radius: var(--r-pill);
            color: var(--bone-200);
            background: rgba(245, 239, 228, 0.04);
            backdrop-filter: blur(6px);
        }
    }

    &__chip {
        font-family: var(--font-mono);
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    &__rating {
        color: var(--gold-leaf) !important;
        border-color: rgba(201, 167, 106, 0.35) !important;
        display: inline-flex !important;
        align-items: center;
        gap: 0.35rem;

        svg { color: var(--gold-leaf); }
    }

    &__cert {
        font-family: var(--font-mono);
        font-weight: 600;
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-3);
        margin-top: var(--s-6);
    }

    @media (max-width: 720px) {
        min-height: clamp(440px, 68vh, 620px);

        &__crumb { margin-bottom: var(--s-5); }
        &__actions { margin-top: var(--s-5); }
    }
}
</style>
