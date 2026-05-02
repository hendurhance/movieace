<template>
    <LmRail
        v-if="entries.length"
        :title="title"
        :eyebrow="eyebrow"
        density="keyart"
        :peek-room="false"
    >
        <article
            v-for="entry in entries"
            :key="`cw-${entry.type}-${entry.id}`"
            class="continue"
        >
            <router-link :to="entry.resumePath" class="continue__link" :aria-label="entry.ariaLabel">
                <div class="continue__art">
                    <img
                        v-if="entry.image"
                        :src="entry.image"
                        :alt="entry.title"
                        loading="lazy"
                        decoding="async"
                    />
                    <div v-else class="continue__placeholder" aria-hidden="true">
                        <span>{{ entry.initial }}</span>
                    </div>

                    <div class="continue__scrim" aria-hidden="true" />

                    <div class="continue__play">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>

                    <div
                        class="continue__progress"
                        :style="{ width: `${entry.progress}%` }"
                        :aria-valuenow="entry.progress"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        role="progressbar"
                        :aria-label="`${entry.progress}% watched`"
                    />
                </div>

                <div class="continue__body">
                    <span class="eyebrow continue__eyebrow">{{ entry.eyebrow }}</span>
                    <h4 class="continue__title">{{ entry.title }}</h4>
                    <p v-if="entry.subtitle" class="meta continue__sub">{{ entry.subtitle }}</p>
                </div>
            </router-link>
        </article>
    </LmRail>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import LmRail from './Rail.vue';
import { viewHistory } from '../../composables/useHistory';
import { streamData } from '../../composables/useStream';
import { getProgressPercent } from '../../composables/useProgress';
import { useWebImage } from '../../utils/useWebImage';

interface Entry {
    id: number | string;
    type: 'movie' | 'tv';
    title: string;
    image: string;
    initial: string;
    eyebrow: string;
    subtitle: string;
    resumePath: string;
    progress: number; // 0..100
    ariaLabel: string;
}

export default defineComponent({
    name: 'ContinueShelf',
    components: { LmRail },
    props: {
        title: { type: String, default: 'Continue watching' },
        eyebrow: { type: String, default: 'Pick up where you left off' }
    },
    setup() {
        const entries = computed<Entry[]>(() => {
            return viewHistory.value.map(item => {
                const id = String(item.id);
                const state = streamData.value.movieServerMap[id];
                const image = item.image ? useWebImage(item.image, 'medium') : '';
                const initial = (item.title?.[0] || '·').toUpperCase();

                const isTv = item.type === 'tv';
                const season = state?.season && state.season > 0 ? state.season : 1;
                const episode = state?.episode && state.episode > 0 ? state.episode : 1;

                const progress = getProgressPercent(
                    item.id,
                    item.type,
                    isTv ? season : undefined,
                    isTv ? episode : undefined
                );
                const resumePath = isTv
                    ? `/stream/tv-show/${item.id}/season/${season}/episode/${episode}`
                    : `/stream/movie/${item.id}`;

                const subtitle = isTv
                    ? `S${season} · E${episode}`
                    : item.rating
                        ? `★ ${item.rating.toFixed(1)}`
                        : '';

                return {
                    id: item.id,
                    type: item.type,
                    title: item.title,
                    image,
                    initial,
                    eyebrow: isTv ? 'Series' : 'Film',
                    subtitle,
                    resumePath,
                    progress,
                    ariaLabel: isTv
                        ? `Resume ${item.title} Season ${season} Episode ${episode}`
                        : `Resume ${item.title}`
                } satisfies Entry;
            });
        });

        return { entries };
    }
});
</script>

<style lang="scss" scoped>
.continue {
    display: block;

    &__link {
        display: block;
        color: inherit;
        text-decoration: none;
    }

    &__art {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: var(--r-md);
        overflow: hidden;
        background: var(--ink-700);
        box-shadow: var(--shadow-md);
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
    }

    &__link:hover &__art,
    &__link:focus-visible &__art {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);

        img { transform: scale(1.04); }
        .continue__play { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    &__placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-family: var(--font-display);
        color: var(--bone-500);
        font-size: 3rem;
        background:
            radial-gradient(70% 70% at 40% 40%, var(--ink-600), var(--ink-800));
    }

    &__scrim {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
            180deg,
            transparent 50%,
            rgba(11, 10, 8, 0.75) 100%
        );
    }

    &__play {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 46px;
        height: 46px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
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

    &__progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        background: var(--ember);
        box-shadow: 0 0 12px var(--ember-glow);
        min-width: 6px;
        transition: width var(--dur-base) var(--ease-out);
    }

    // ── Body ──────────────────────────────────────────────────────────────
    &__body {
        padding: var(--s-3) 0 0;
    }

    &__eyebrow {
        color: var(--ember);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-base);
        line-height: 1.2;
        color: var(--bone-50);
        margin-top: 0.25rem;
        font-variation-settings: 'opsz' 36;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__sub {
        margin-top: 0.25rem;
        color: var(--bone-400);
    }
}

@media (prefers-reduced-motion: reduce) {
    .continue {
        &__art, img, .continue__play { transition: none; transform: none !important; }
    }
}
</style>
