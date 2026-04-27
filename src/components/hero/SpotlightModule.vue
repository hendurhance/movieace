<template>
    <section class="spotlight" :aria-label="`Spotlight: ${title}`">
        <div class="spotlight__bloom" aria-hidden="true" />
        <hr class="spotlight__rule spotlight__rule--top" aria-hidden="true" />

        <div class="container-lm spotlight__grid">
            <router-link
                :to="detailRoute"
                class="spotlight__art"
                :aria-label="`Open ${title}`"
            >
                <img
                    v-if="artUrl"
                    :src="artUrl"
                    :alt="title"
                    loading="lazy"
                    decoding="async"
                />
                <div v-else class="spotlight__art-placeholder" aria-hidden="true">
                    <span>{{ (title?.[0] || '·').toUpperCase() }}</span>
                </div>
                <div class="spotlight__art-scrim" aria-hidden="true" />
                <span class="spotlight__art-frame" aria-hidden="true" />
            </router-link>

            <div class="spotlight__body">
                <span class="eyebrow spotlight__eyebrow">{{ eyebrow }}</span>

                <h2 class="spotlight__title display">
                    <span v-if="titleLead">{{ titleLead }} </span>
                    <em v-if="titleAccent">{{ titleAccent }}</em>
                    <span v-else-if="!titleLead">{{ title }}</span>
                </h2>

                <blockquote v-if="pullQuote" class="spotlight__quote pull-quote">
                    <p>
                        <span class="spotlight__quote-mark" aria-hidden="true">“</span>{{ pullQuote }}<span class="spotlight__quote-mark" aria-hidden="true">”</span>
                    </p>
                    <footer v-if="attribution" class="meta">{{ attribution }}</footer>
                </blockquote>

                <p v-else-if="overview" class="spotlight__overview">
                    {{ truncatedOverview }}
                </p>

                <ul class="spotlight__meta meta">
                    <li v-if="year">{{ year }}</li>
                    <li v-if="runtime">{{ runtime }}</li>
                    <li v-if="ratingLabel" class="spotlight__rating">
                        <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
                            <path fill="currentColor" d="M12 2l2.9 6.88L22 9.82l-5.34 4.94L18.18 22 12 18.27 5.82 22l1.52-7.24L2 9.82l7.1-.94z"/>
                        </svg>
                        {{ ratingLabel }}
                    </li>
                </ul>

                <div class="spotlight__actions">
                    <LmButton variant="primary" :to="playRoute" aria-label="Play">
                        <template #leading>
                            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                <path fill="currentColor" d="M8 5v14l11-7z"/>
                            </svg>
                        </template>
                        Play
                    </LmButton>
                    <LmButton variant="ghost" :to="detailRoute">Read the feature</LmButton>
                </div>
            </div>
        </div>

        <hr class="spotlight__rule spotlight__rule--bottom" aria-hidden="true" />
    </section>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import LmButton from '../primitives/Button.vue';

export default defineComponent({
    name: 'SpotlightModule',
    components: { LmButton },
    props: {
        id: { type: [Number, String], required: true },
        type: { type: String as PropType<'movie' | 'tv'>, default: 'movie' },
        title: { type: String, required: true },
        /** Optional — render the title as "lead <em>accent</em>" (e.g., "The · Bear"). */
        titleLead: { type: String, default: '' },
        titleAccent: { type: String, default: '' },
        eyebrow: { type: String, default: 'The Feature' },
        overview: { type: String, default: '' },
        pullQuote: { type: String, default: '' },
        attribution: { type: String, default: '' },
        backdropPath: { type: String as PropType<string | null>, default: null },
        posterPath: { type: String as PropType<string | null>, default: null },
        rating: { type: Number, default: 0 },
        releaseDate: { type: String, default: '' },
        runtime: { type: String, default: '' }
    },
    setup(props) {
        const IMAGE_BASEURL = (import.meta as any).env.VITE_IMAGE_BASE_URL;

        const artUrl = computed(() => {
            const path = props.backdropPath || props.posterPath;
            if (!path) return '';
            const size = props.backdropPath ? 'w1280' : 'w780';
            return `${IMAGE_BASEURL}${size}${path}`;
        });

        const year = computed(() =>
            props.releaseDate ? new Date(props.releaseDate).getFullYear() : null
        );

        const ratingLabel = computed(() =>
            props.rating > 0 ? props.rating.toFixed(1) : ''
        );

        const truncatedOverview = computed(() => {
            if (!props.overview) return '';
            if (props.overview.length <= 280) return props.overview;
            return `${props.overview.slice(0, 277).trim()}…`;
        });

        const playRoute = computed(() =>
            props.type === 'tv'
                ? `/stream/tv-show/${props.id}/season/1/episode/1`
                : `/stream/movie/${props.id}`
        );

        const detailRoute = computed(() =>
            props.type === 'tv' ? `/tv-show/${props.id}` : `/movie/${props.id}`
        );

        return {
            artUrl,
            year,
            ratingLabel,
            truncatedOverview,
            playRoute,
            detailRoute
        };
    }
});
</script>

<style lang="scss" scoped>
.spotlight {
    position: relative;
    isolation: isolate;
    padding-block: clamp(var(--s-8), 10vw, var(--s-10));
    overflow: hidden;

    &__bloom {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
            radial-gradient(
                60% 60% at 80% 40%,
                rgba(var(--ambient, 255 90 31), 0.12),
                transparent 70%
            );
        z-index: -1;
    }

    &__rule {
        border: 0;
        height: 1px;
        background: var(--rule);
        margin: 0;

        &--top { margin-bottom: clamp(var(--s-6), 6vw, var(--s-8)); }
        &--bottom { margin-top: clamp(var(--s-6), 6vw, var(--s-8)); }
    }

    &__grid {
        display: grid;
        gap: clamp(var(--s-5), 4vw, var(--s-8));
        align-items: center;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);

        @media (max-width: 960px) {
            grid-template-columns: minmax(0, 1fr);
        }
    }

    &__art {
        position: relative;
        display: block;
        aspect-ratio: 16 / 9;
        border-radius: var(--r-md);
        overflow: hidden;
        background: var(--ink-700);
        box-shadow: var(--shadow-lg);
        transition:
            transform var(--dur-base) var(--ease-out),
            box-shadow var(--dur-base) var(--ease-out);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            transition: transform var(--dur-slow) var(--ease-out);
        }

        &:hover, &:focus-visible {
            transform: translateY(-3px);
            box-shadow:
                var(--shadow-lg),
                0 0 0 1px rgba(255, 90, 31, 0.32);

            img { transform: scale(1.03); }
            .spotlight__art-frame { border-color: var(--ember); }
        }
    }

    &__art-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-family: var(--font-display);
        font-size: 5rem;
        color: var(--bone-500);
        background: radial-gradient(70% 70% at 40% 40%, var(--ink-600), var(--ink-800));
    }

    &__art-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 55%, rgba(11, 10, 8, 0.55));
        pointer-events: none;
    }

    &__art-frame {
        position: absolute;
        inset: 8px;
        border: 1px solid rgba(245, 239, 228, 0.12);
        border-radius: calc(var(--r-md) - 4px);
        pointer-events: none;
        transition: border-color var(--dur-base) var(--ease-out);
    }

    &__body {
        padding-inline: var(--s-3);

        @media (min-width: 961px) {
            padding-inline: 0;
        }
    }

    &__eyebrow {
        color: var(--ember);
        display: inline-block;
        margin-bottom: var(--s-3);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        line-height: 0.98;
        letter-spacing: -0.02em;
        font-size: clamp(2.25rem, 4.8vw, 4rem);
        font-variation-settings: 'opsz' 120, 'SOFT' 40;
        color: var(--bone-50);
        margin: 0;
        text-wrap: balance;

        em {
            font-style: italic;
            color: var(--ember);
            font-variation-settings: 'opsz' 120, 'SOFT' 80;
        }
    }

    &__quote {
        margin: var(--s-5) 0 0;
        padding: 0;
        color: var(--bone-100, var(--bone-50));
        font-family: var(--font-display);
        font-weight: 400;
        font-style: italic;
        font-size: clamp(1.125rem, 1.8vw, 1.5rem);
        line-height: 1.35;
        font-variation-settings: 'opsz' 60;
        max-width: 46ch;

        p { margin: 0; }

        footer {
            margin-top: var(--s-3);
            color: var(--bone-400);
            font-style: normal;
            font-family: var(--font-mono);
        }
    }

    &__quote-mark {
        color: var(--ember);
        font-size: 1.4em;
        line-height: 0;
        vertical-align: -0.15em;
        padding-inline: 0.1em;
    }

    &__overview {
        margin: var(--s-5) 0 0;
        color: var(--bone-200);
        line-height: 1.6;
        max-width: 52ch;
    }

    &__meta {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-4);
        padding: 0;
        margin: var(--s-5) 0 0;
        color: var(--bone-400);
        font-size: var(--fs-xs);

        li {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
        }
    }

    &__rating {
        color: var(--gold-leaf);
        svg { color: var(--gold-leaf); }
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-3);
        margin-top: var(--s-5);
    }
}

@media (prefers-reduced-motion: reduce) {
    .spotlight__art, .spotlight__art img { transition: none; }
}
</style>
