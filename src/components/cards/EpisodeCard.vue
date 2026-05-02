<template>
    <article class="episode-card" :class="{ 'is-aired': aired, 'is-unaired': !aired }">
        <component
            :is="playable ? 'router-link' : 'div'"
            :to="playable ? routeTo : undefined"
            class="episode-card__link"
            :aria-label="`Episode ${episodeNumber}: ${name}`"
        >
            <div class="episode-card__still">
                <img
                    v-if="imageUrl"
                    :src="imageUrl"
                    :alt="`Episode ${episodeNumber}: ${name}`"
                    loading="lazy"
                    decoding="async"
                    class="episode-card__img"
                />
                <div v-else class="episode-card__placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
                        <rect x="3" y="6" width="18" height="12" rx="2"/>
                        <path d="m8 3 4 3 4-3"/>
                    </svg>
                </div>

                <div class="episode-card__scrim" aria-hidden="true" />

                <div v-if="playable" class="episode-card__play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>

                <span v-if="runtime" class="episode-card__runtime meta">{{ runtime }}m</span>

                <div
                    v-if="progress > 0 && progress < 1"
                    class="episode-card__progress"
                    :style="{ width: `${Math.round(progress * 100)}%` }"
                    aria-hidden="true"
                />
            </div>

            <div class="episode-card__body">
                <div class="episode-card__number meta">
                    <span>EP {{ String(episodeNumber).padStart(2, '0') }}</span>
                    <span v-if="airDate" class="episode-card__air">{{ airDateLabel }}</span>
                </div>
                <h4 class="episode-card__title">{{ name }}</h4>
                <p v-if="overview" class="episode-card__overview">{{ overview }}</p>
            </div>
        </component>
    </article>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { useWebImage } from '../../utils/useWebImage';

export default defineComponent({
    name: 'EpisodeCard',
    props: {
        showId: { type: [Number, String], required: true },
        seasonNumber: { type: Number, required: true },
        episodeNumber: { type: Number, required: true },
        name: { type: String, required: true },
        overview: { type: String, default: '' },
        stillPath: { type: String as PropType<string | null>, default: null },
        airDate: { type: String, default: '' },
        runtime: { type: Number, default: 0 },
        progress: { type: Number, default: 0 }, // 0..1
        playable: { type: Boolean, default: true }
    },
    setup(props) {
        const imageUrl = computed(() => {
            if (!props.stillPath) return '';
            return useWebImage(props.stillPath, 'medium');
        });

        const aired = computed(() => {
            if (!props.airDate) return true; // assume yes
            return new Date(props.airDate).getTime() <= Date.now();
        });

        const airDateLabel = computed(() => {
            if (!props.airDate) return '';
            return new Date(props.airDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        });

        const routeTo = computed(
            () => `/stream/tv-show/${props.showId}/season/${props.seasonNumber}/episode/${props.episodeNumber}`
        );

        return { imageUrl, aired, airDateLabel, routeTo };
    }
});
</script>

<style lang="scss" scoped>
.episode-card {
    display: block;

    &__link {
        display: block;
        color: inherit;
        text-decoration: none;
    }

    &__still {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: var(--r-md);
        overflow: hidden;
        background: var(--ink-700);
        transition:
            transform var(--dur-base) var(--ease-out),
            box-shadow var(--dur-base) var(--ease-out);
    }

    &__link:hover &__still,
    &__link:focus-visible &__still {
        transform: translateY(-3px);
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.45);

        .episode-card__img { transform: scale(1.04); }
        .episode-card__play { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform var(--dur-slow) var(--ease-out);
    }

    &__placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: var(--bone-500);
        background:
            radial-gradient(70% 70% at 50% 40%, var(--ink-600), var(--ink-800));

        svg { width: 28px; height: 28px; }
    }

    &__scrim {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
            180deg,
            transparent 50%,
            rgba(11, 10, 8, 0.7) 100%
        );
    }

    &__play {
        position: absolute;
        top: 50%;
        left: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: var(--ember);
        color: var(--ink-900);
        border-radius: 50%;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.85);
        transition:
            opacity var(--dur-fast) var(--ease-out),
            transform var(--dur-fast) var(--ease-out);
        box-shadow: 0 8px 22px rgba(255, 90, 31, 0.45);

        svg { width: 18px; height: 18px; margin-left: 2px; }
    }

    &__runtime {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.15rem 0.5rem;
        background: rgba(11, 10, 8, 0.72);
        backdrop-filter: blur(6px);
        border-radius: var(--r-sm);
        color: var(--bone-100);
        font-size: 0.625rem;
    }

    &__progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        background: var(--ember);
        box-shadow: 0 0 12px var(--ember-glow);
    }

    // ── Body ──────────────────────────────────────────────────────────────
    &__body {
        padding: var(--s-3) 0 0;
    }

    &__number {
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        color: var(--bone-400);
        margin-bottom: 0.25rem;
    }

    &__air {
        color: var(--bone-500);

        &::before {
            content: '·';
            margin-right: var(--s-2);
            color: var(--bone-500);
        }
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-base);
        line-height: 1.25;
        letter-spacing: var(--ls-snug);
        color: var(--bone-50);
        margin-bottom: var(--s-1);
        font-variation-settings: 'opsz' 36;
    }

    &__overview {
        color: var(--bone-300);
        font-size: var(--fs-sm);
        line-height: var(--lh-base);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        max-width: 52ch;
    }

    // Unaired — desaturate, no hover
    &.is-unaired {
        .episode-card__still { filter: grayscale(0.4) brightness(0.8); }
        .episode-card__link { pointer-events: none; }
        .episode-card__title { color: var(--bone-300); }
    }
}

@media (prefers-reduced-motion: reduce) {
    .episode-card {
        &__link:hover &__still { transform: none; }
        &__img, &__play { transition: none; }
    }
}
</style>
