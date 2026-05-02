<template>
    <section class="rail" :class="[`rail--${density}`, { 'has-peek-room': peekRoom }]">
        <header v-if="title || eyebrow || moreTo" class="rail__header container-lm">
            <div class="rail__heading">
                <span v-if="eyebrow" class="eyebrow rail__eyebrow">{{ eyebrow }}</span>
                <h2 v-if="title" class="rail__title">{{ title }}</h2>
                <p v-if="description" class="rail__description">{{ description }}</p>
            </div>

            <div class="rail__header-right">
                <router-link v-if="moreTo" :to="moreTo" class="rail__more">
                    <span>{{ moreLabel }}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </router-link>

                <div class="rail__arrows" v-if="showArrows">
                    <button
                        type="button"
                        class="rail__arrow"
                        :disabled="atStart"
                        aria-label="Scroll backward"
                        @click="scrollBy(-1)"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 6l-6 6 6 6"/></svg>
                    </button>
                    <button
                        type="button"
                        class="rail__arrow"
                        :disabled="atEnd"
                        aria-label="Scroll forward"
                        @click="scrollBy(1)"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 6l6 6-6 6"/></svg>
                    </button>
                </div>
            </div>
        </header>

        <div class="rail__viewport">
            <div
                ref="track"
                class="rail__track no-scrollbar"
                :style="trackStyle"
                @scroll.passive="onScroll"
            >
                <slot />
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, PropType, ref } from 'vue';

type Density = 'poster' | 'keyart' | 'episode' | 'person' | 'collection' | 'free';

export default defineComponent({
    name: 'LmRail',
    props: {
        title: { type: String, default: '' },
        eyebrow: { type: String, default: '' },
        description: { type: String, default: '' },
        moreTo: { type: [String, Object], default: null },
        moreLabel: { type: String, default: 'See all' },
        density: { type: String as PropType<Density>, default: 'poster' },
        /** Adds vertical room above the track so hover-peek cards aren't clipped. */
        peekRoom: { type: Boolean, default: true },
        /** Columns for each breakpoint (min-width). */
        columns: {
            type: Object as PropType<{ base?: number; sm?: number; md?: number; lg?: number; xl?: number }>,
            default: () => ({})
        }
    },
    setup(props) {
        const track = ref<HTMLElement | null>(null);
        const atStart = ref(true);
        const atEnd = ref(false);
        const showArrows = ref(false);

        const defaultColumns: Record<Density, { base: number; sm: number; md: number; lg: number; xl: number }> = {
            poster:     { base: 2.4, sm: 3.4, md: 4.4, lg: 5.4, xl: 6.4 },
            keyart:     { base: 1.2, sm: 1.8, md: 2.4, lg: 3.2, xl: 3.6 },
            episode:    { base: 1.2, sm: 1.8, md: 2.4, lg: 3.2, xl: 3.6 },
            person:     { base: 3.4, sm: 4.4, md: 5.4, lg: 6.4, xl: 7.4 },
            collection: { base: 1.4, sm: 2.2, md: 2.8, lg: 3.4, xl: 4 },
            free:       { base: 1.2, sm: 2, md: 3, lg: 4, xl: 5 }
        };

        const cols = computed(() => ({
            ...defaultColumns[props.density],
            ...props.columns
        }));

        const trackStyle = computed(() => ({
            '--rail-cols-base': String(cols.value.base),
            '--rail-cols-sm': String(cols.value.sm),
            '--rail-cols-md': String(cols.value.md),
            '--rail-cols-lg': String(cols.value.lg),
            '--rail-cols-xl': String(cols.value.xl)
        } as Record<string, string>));

        const onScroll = () => {
            const el = track.value;
            if (!el) return;
            atStart.value = el.scrollLeft < 8;
            atEnd.value = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 8;
        };

        const measureArrows = () => {
            const el = track.value;
            if (!el) return;
            showArrows.value = el.scrollWidth > el.clientWidth + 8;
        };

        const scrollBy = (dir: number) => {
            const el = track.value;
            if (!el) return;
            const amount = Math.round(el.clientWidth * 0.9) * dir;
            el.scrollBy({ left: amount, behavior: 'smooth' });
        };

        let ro: ResizeObserver | null = null;

        onMounted(() => {
            nextTick(() => {
                onScroll();
                measureArrows();
                if (track.value && typeof ResizeObserver !== 'undefined') {
                    ro = new ResizeObserver(() => {
                        measureArrows();
                        onScroll();
                    });
                    ro.observe(track.value);
                    Array.from(track.value.children).forEach(c => ro?.observe(c as Element));
                }
            });
        });

        onBeforeUnmount(() => {
            ro?.disconnect();
            ro = null;
        });

        return {
            track,
            atStart,
            atEnd,
            showArrows,
            trackStyle,
            onScroll,
            scrollBy
        };
    }
});
</script>

<style lang="scss" scoped>
.rail {
    position: relative;
    display: block;
    content-visibility: auto;
    contain-intrinsic-size: 540px 1px;

    &__header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--s-5);
        margin-bottom: var(--s-5);
    }

    &__heading {
        display: flex;
        flex-direction: column;
        gap: var(--s-2);
        min-width: 0;
    }

    &__eyebrow {
        color: var(--ember);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(var(--fs-2xl), 4vw, var(--fs-3xl));
        line-height: 1.0;
        letter-spacing: -0.02em;
        color: var(--bone-50);
        font-variation-settings: 'opsz' 72, 'SOFT' 30;
        margin: 0;
    }

    &__description {
        color: var(--bone-300);
        font-size: var(--fs-base);
        line-height: var(--lh-snug);
        max-width: 56ch;
    }

    &__header-right {
        display: inline-flex;
        align-items: center;
        gap: var(--s-4);
        flex-shrink: 0;
    }

    &__more {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        text-transform: uppercase;
        letter-spacing: var(--ls-wide);
        color: var(--bone-200);
        transition: color var(--dur-fast) var(--ease-out);

        svg {
            width: 14px;
            height: 14px;
            transition: transform var(--dur-base) var(--ease-out);
        }

        &:hover {
            color: var(--ember);
            svg { transform: translateX(3px); }
        }
    }

    &__arrows {
        display: inline-flex;
        gap: var(--s-1);

        @media (max-width: 768px) {
            display: none;
        }
    }

    &__arrow {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        color: var(--bone-200);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition:
            background-color var(--dur-fast),
            color var(--dur-fast),
            border-color var(--dur-fast),
            opacity var(--dur-fast);

        svg { width: 16px; height: 16px; }

        &:hover:not(:disabled) {
            background: var(--surface-tint-hover);
            color: var(--bone-50);
            border-color: var(--rule-strong);
        }

        &:disabled {
            opacity: 0.35;
            cursor: not-allowed;
        }
    }

    // ── Viewport + track ─────────────────────────────────────────────────
    &__viewport {
        position: relative;

        // Edge fade — subtle indication that content continues
        &::before,
        &::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            width: 80px;
            z-index: 2;
            pointer-events: none;
            opacity: 0;
            transition: opacity var(--dur-base) var(--ease-out);
        }

        &::before {
            left: 0;
            background: linear-gradient(90deg, var(--ink-900) 0%, transparent 100%);
        }

        &::after {
            right: 0;
            background: linear-gradient(270deg, var(--ink-900) 0%, transparent 100%);
        }

        .rail:not(.is-at-start) &::before { opacity: 1; }
        .rail:not(.is-at-end) &::after { opacity: 1; }
    }

    &__track {
        --rail-gap: var(--s-4);
        --rail-cols: var(--rail-cols-base, 2.4);

        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: calc(
            (100% - (var(--rail-cols) - 1) * var(--rail-gap)) / var(--rail-cols)
        );
        gap: var(--rail-gap);
        overflow-x: auto;
        overflow-y: clip;
        overflow-clip-margin: 32px;
        scroll-behavior: smooth;
        scroll-snap-type: x mandatory;
        padding-inline: var(--container-gutter);
        padding-block: var(--s-2);

        > :deep(*) {
            scroll-snap-align: start;
            min-width: 0;
        }

        @media (min-width: 640px) {
            --rail-cols: var(--rail-cols-sm, var(--rail-cols-base, 3.4));
        }
        @media (min-width: 900px) {
            --rail-cols: var(--rail-cols-md, var(--rail-cols-sm, 4.4));
        }
        @media (min-width: 1200px) {
            --rail-cols: var(--rail-cols-lg, var(--rail-cols-md, 5.4));
        }
        @media (min-width: 1600px) {
            --rail-cols: var(--rail-cols-xl, var(--rail-cols-lg, 6.4));
        }
    }

    // Give hover-peeking cards a little vertical breathing room
    &.has-peek-room &__track {
        padding-block: var(--s-3) var(--s-4);
    }
}

@media (max-width: 768px) {
    .rail__header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--s-3);
    }
}
</style>
