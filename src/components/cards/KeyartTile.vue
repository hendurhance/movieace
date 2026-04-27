<template>
    <article class="keyart-tile" :class="{ 'is-large': size === 'lg' }">
        <router-link :to="routeTo" class="keyart-tile__link" :aria-label="title">
            <div class="keyart-tile__frame">
                <img
                    v-if="imageUrl"
                    :src="imageUrl"
                    :alt="title"
                    loading="lazy"
                    decoding="async"
                    class="keyart-tile__img"
                />
                <div v-else class="keyart-tile__placeholder">
                    <span class="display">{{ initial }}</span>
                </div>

                <div class="keyart-tile__scrim" aria-hidden="true" />

                <div class="keyart-tile__overlay">
                    <div class="keyart-tile__meta">
                        <span v-if="eyebrow" class="eyebrow keyart-tile__eyebrow">{{ eyebrow }}</span>
                        <h3 class="keyart-tile__title">{{ title }}</h3>
                        <div v-if="showMeta" class="keyart-tile__row meta">
                            <span v-if="year">{{ year }}</span>
                            <span v-if="rating > 0" class="keyart-tile__rating">
                                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="m12 2 3 7 7 .6-5.3 4.7 1.6 7L12 17.7 5.7 21.3l1.6-7L2 9.6 9 9z"/>
                                </svg>
                                {{ rating.toFixed(1) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </router-link>
    </article>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { useWebImage } from '../../utils/useWebImage';

type MediaType = 'movie' | 'tv';

export default defineComponent({
    name: 'KeyartTile',
    props: {
        id: { type: [Number, String], required: true },
        type: { type: String as PropType<MediaType>, default: 'movie' },
        title: { type: String, required: true },
        backdropPath: { type: String as PropType<string | null>, default: null },
        posterPath: { type: String as PropType<string | null>, default: null },
        rating: { type: Number, default: 0 },
        releaseDate: { type: String, default: '' },
        eyebrow: { type: String, default: '' },
        showMeta: { type: Boolean, default: true },
        size: {
            type: String as PropType<'md' | 'lg'>,
            default: 'md'
        }
    },
    setup(props) {
        const imageUrl = computed(() => {
            const path = props.backdropPath || props.posterPath;
            if (!path) return '';
            return useWebImage(path, props.size === 'lg' ? 'large' : 'medium');
        });

        const initial = computed(() => props.title?.[0]?.toUpperCase() ?? '·');

        const year = computed(() =>
            props.releaseDate ? String(new Date(props.releaseDate).getFullYear()) : ''
        );

        const routeTo = computed(() =>
            props.type === 'tv' ? `/tv-show/${props.id}` : `/movie/${props.id}`
        );

        return { imageUrl, initial, year, routeTo };
    }
});
</script>

<style lang="scss" scoped>
.keyart-tile {
    display: block;

    &__link {
        display: block;
        color: inherit;
        text-decoration: none;
    }

    &__frame {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: var(--r-md);
        overflow: hidden;
        background: var(--ink-700);
        box-shadow: var(--shadow-md);
        transition:
            transform var(--dur-base) var(--ease-out),
            box-shadow var(--dur-base) var(--ease-out);
    }

    &__link:hover &__frame,
    &__link:focus-visible &__frame {
        transform: translateY(-4px);
        box-shadow:
            var(--shadow-lg),
            0 0 0 1px rgba(255, 90, 31, 0.22);

        .keyart-tile__img { transform: scale(1.04); }
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
        background:
            radial-gradient(60% 80% at 30% 40%, var(--ink-600), var(--ink-800));
        color: var(--bone-500);
    }

    &__scrim {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
            180deg,
            transparent 30%,
            rgba(11, 10, 8, 0.35) 60%,
            rgba(11, 10, 8, 0.9) 100%
        );
    }

    &__overlay {
        position: absolute;
        inset: auto 0 0 0;
        padding: var(--s-4) var(--s-5);
    }

    &__eyebrow {
        display: block;
        color: var(--ember);
        margin-bottom: var(--s-1);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-xl);
        line-height: 1.1;
        color: var(--bone-50);
        letter-spacing: var(--ls-tight);
        font-variation-settings: 'opsz' 72, 'SOFT' 40;
        text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__row {
        display: inline-flex;
        align-items: center;
        gap: var(--s-3);
        margin-top: var(--s-2);
        color: var(--bone-300);
    }

    &__rating {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--gold-leaf);

        svg { width: 12px; height: 12px; }
    }

    // Large variant — for billboard-adjacent rails
    &.is-large {
        .keyart-tile__title {
            font-size: var(--fs-2xl);
        }

        .keyart-tile__overlay {
            padding: var(--s-5) var(--s-6);
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .keyart-tile {
        &__link:hover &__frame { transform: none; }
        &__img { transition: none; }
    }
}
</style>
