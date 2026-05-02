<template>
    <article
        class="collection-tile"
        :style="themeVars"
    >
        <router-link :to="to" class="collection-tile__link" :aria-label="title">
            <div class="collection-tile__frame">
                <img
                    v-if="imageUrl"
                    :src="imageUrl"
                    :alt="title"
                    loading="lazy"
                    decoding="async"
                    class="collection-tile__img"
                />
                <div v-else class="collection-tile__placeholder" aria-hidden="true" />

                <div class="collection-tile__wash" aria-hidden="true" />

                <div class="collection-tile__inner">
                    <span v-if="eyebrow" class="eyebrow collection-tile__eyebrow">
                        {{ eyebrow }}
                    </span>
                    <h3 class="collection-tile__title">{{ title }}</h3>
                    <p v-if="description" class="collection-tile__desc">{{ description }}</p>
                    <span class="collection-tile__cta">
                        <span>Explore</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                    </span>
                </div>
            </div>
        </router-link>
    </article>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'CollectionTile',
    props: {
        to: { type: [String, Object] as PropType<string | object>, required: true },
        title: { type: String, required: true },
        eyebrow: { type: String, default: '' },
        description: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        tint: { type: String, default: 'rgba(255, 90, 31, 0.35)' } // per-hub accent
    },
    setup(props) {
        const themeVars = computed(() => ({
            '--tile-tint': props.tint
        }));
        return { themeVars };
    }
});
</script>

<style lang="scss" scoped>
.collection-tile {
    position: relative;
    display: block;

    &__link {
        display: block;
        color: inherit;
        text-decoration: none;
    }

    &__frame {
        position: relative;
        aspect-ratio: 4 / 5;
        border-radius: var(--r-lg);
        overflow: hidden;
        background: var(--ink-700);
        box-shadow: var(--shadow-md);
        transition:
            transform var(--dur-base) var(--ease-out),
            box-shadow var(--dur-base) var(--ease-out);
    }

    &__link:hover &__frame,
    &__link:focus-visible &__frame {
        transform: translateY(-6px);
        box-shadow: var(--shadow-lg);

        .collection-tile__img { transform: scale(1.06); }
        .collection-tile__cta svg { transform: translateX(4px); }
    }

    &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform var(--dur-slow) var(--ease-out);
    }

    &__placeholder {
        width: 100%;
        height: 100%;
        background:
            radial-gradient(80% 80% at 30% 20%, var(--tile-tint), transparent 65%),
            linear-gradient(135deg, var(--ink-700), var(--ink-850));
    }

    &__wash {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
            linear-gradient(180deg, transparent 40%, rgba(11, 10, 8, 0.85) 100%),
            radial-gradient(80% 100% at 0% 100%, var(--tile-tint), transparent 70%);
        mix-blend-mode: normal;
    }

    &__inner {
        position: absolute;
        inset: auto 0 0 0;
        padding: var(--s-5) var(--s-5) var(--s-5);
    }

    &__eyebrow {
        display: block;
        color: var(--bone-50);
        margin-bottom: var(--s-2);
        opacity: 0.8;
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-2xl);
        line-height: 0.98;
        color: var(--bone-50);
        letter-spacing: -0.02em;
        font-variation-settings: 'opsz' 144, 'SOFT' 40;
        text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
    }

    &__desc {
        margin-top: var(--s-3);
        color: var(--bone-200);
        font-size: var(--fs-sm);
        line-height: var(--lh-base);
        max-width: 32ch;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__cta {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-top: var(--s-4);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        text-transform: uppercase;
        letter-spacing: var(--ls-wide);
        color: var(--bone-50);

        svg {
            width: 14px;
            height: 14px;
            transition: transform var(--dur-base) var(--ease-out);
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .collection-tile {
        &__link:hover &__frame { transform: none; }
        &__img { transition: none; }
    }
}
</style>
