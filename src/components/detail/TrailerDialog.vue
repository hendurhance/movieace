<template>
    <LmDialog v-model="dialogOpen" size="xl" class="trailer-shell" @close="$emit('close')">
        <template #header>
            <div class="trailer-shell__heading">
                <span class="trailer-shell__eyebrow">{{ headerEyebrow }}</span>
                <h3 class="trailer-shell__title">{{ title }}</h3>
            </div>
        </template>

        <div class="trailer-dialog" :class="{ 'is-solo': videos.length <= 1 }">
            <div class="trailer-dialog__stage">
                <div v-if="activeEmbed" class="trailer-dialog__frame">
                    <iframe
                        :key="activeKey || ''"
                        :src="activeEmbed"
                        title="Trailer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    />
                </div>
                <div v-else class="trailer-dialog__empty">
                    <span class="meta">No trailer filed for this title.</span>
                </div>
            </div>

            <div v-if="activeVideo" class="trailer-dialog__caption">
                <span
                    class="trailer-dialog__badge"
                    :class="{ 'is-official': activeVideo.official }"
                >
                    <svg
                        v-if="activeVideo.official"
                        viewBox="0 0 24 24"
                        width="10"
                        height="10"
                        aria-hidden="true"
                    >
                        <path
                            fill="currentColor"
                            d="M12 2l2.9 6.88L22 9.82l-5.34 4.94L18.18 22 12 18.27 5.82 22l1.52-7.24L2 9.82l7.1-.94z"
                        />
                    </svg>
                    {{ activeVideo.official ? 'Official' : '' }}
                    <span v-if="activeVideo.official" class="trailer-dialog__badge-sep">·</span>
                    {{ activeVideo.type }}
                </span>
                <span class="trailer-dialog__name">{{ activeVideo.name }}</span>
                <span v-if="videos.length > 1" class="trailer-dialog__counter">
                    <span class="trailer-dialog__counter-now">{{ pad(activeIndex + 1) }}</span>
                    <span class="trailer-dialog__counter-sep">/</span>
                    <span>{{ pad(videos.length) }}</span>
                </span>
            </div>

            <section v-if="videos.length > 1" class="trailer-dialog__reel">
                <div class="trailer-dialog__reel-head">
                    <span class="trailer-dialog__reel-eyebrow">The Reel</span>
                    <div class="trailer-dialog__reel-nav">
                        <button
                            type="button"
                            class="trailer-dialog__nav"
                            aria-label="Previous trailer"
                            :disabled="activeIndex === 0"
                            @click="step(-1)"
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 6l-6 6 6 6" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            class="trailer-dialog__nav"
                            aria-label="Next trailer"
                            :disabled="activeIndex >= videos.length - 1"
                            @click="step(1)"
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 6l6 6-6 6" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div
                    ref="reelEl"
                    class="trailer-dialog__strip"
                    role="tablist"
                    aria-label="Available trailers"
                >
                    <button
                        v-for="(v, i) in videos"
                        :key="v.id"
                        :ref="el => setChipRef(el, i)"
                        type="button"
                        role="tab"
                        :aria-selected="v.key === activeKey"
                        class="trailer-dialog__chip"
                        :class="{ 'is-active': v.key === activeKey }"
                        @click="activeKey = v.key"
                    >
                        <span class="trailer-dialog__chip-thumb">
                            <img
                                :src="`https://i.ytimg.com/vi/${v.key}/mqdefault.jpg`"
                                :alt="v.name"
                                loading="lazy"
                                decoding="async"
                            />
                            <span class="trailer-dialog__chip-num">{{ pad(i + 1) }}</span>
                            <span class="trailer-dialog__chip-type">{{ v.type }}</span>
                            <span
                                v-if="v.key === activeKey"
                                class="trailer-dialog__chip-marker"
                                aria-hidden="true"
                            >
                                <span class="trailer-dialog__chip-pulse" />
                                <svg viewBox="0 0 24 24" width="22" height="22">
                                    <path fill="currentColor" d="M8 5v14l11-7z" />
                                </svg>
                            </span>
                        </span>
                        <span class="trailer-dialog__chip-name">{{ v.name }}</span>
                    </button>
                </div>
            </section>
        </div>
    </LmDialog>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, PropType, ref, watch } from 'vue';
import LmDialog from '../primitives/Dialog.vue';
import { buildTrailerEmbed, type TrailerVideo } from '../../composables/useTrailer';

export default defineComponent({
    name: 'TrailerDialog',
    components: { LmDialog },
    props: {
        modelValue: { type: Boolean, required: true },
        videos: { type: Array as PropType<TrailerVideo[]>, default: () => [] },
        title: { type: String, default: 'Trailers' }
    },
    emits: ['update:modelValue', 'close'],
    setup(props, { emit }) {
        const activeKey = ref<string | null>(props.videos[0]?.key ?? null);
        const reelEl = ref<HTMLElement | null>(null);
        const chipEls = ref<HTMLElement[]>([]);

        const setChipRef = (el: any, i: number) => {
            if (el) chipEls.value[i] = el as HTMLElement;
        };

        const dialogOpen = computed({
            get: () => props.modelValue,
            set: (v: boolean) => emit('update:modelValue', v)
        });

        const activeIndex = computed(() => {
            const i = props.videos.findIndex(v => v.key === activeKey.value);
            return i < 0 ? 0 : i;
        });

        const activeVideo = computed(
            () => props.videos.find(v => v.key === activeKey.value) ?? null
        );

        const activeEmbed = computed(() =>
            activeKey.value
                ? buildTrailerEmbed(activeKey.value, {
                      muted: false,
                      autoplay: true,
                      controls: true,
                      loop: false
                  })
                : ''
        );

        const headerEyebrow = computed(() => {
            const n = props.videos.length;
            if (n === 0) return 'No trailer filed';
            if (n === 1) return 'Trailer';
            return `Trailers · ${pad(n)}`;
        });

        const pad = (n: number) => String(n).padStart(2, '0');

        const step = (delta: number) => {
            const next = activeIndex.value + delta;
            const target = props.videos[next];
            if (target) activeKey.value = target.key;
        };

        const scrollChipIntoView = (smooth = true) => {
            const strip = reelEl.value;
            const chip = chipEls.value[activeIndex.value];
            if (!strip || !chip) return;
            const target =
                chip.offsetLeft - strip.clientWidth / 2 + chip.offsetWidth / 2;
            const reduce =
                typeof window !== 'undefined' &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            strip.scrollTo({
                left: target,
                behavior: smooth && !reduce ? 'smooth' : 'auto'
            });
        };

        watch(
            () => props.videos,
            list => {
                if (!list.length) {
                    activeKey.value = null;
                    return;
                }
                if (!list.some(v => v.key === activeKey.value)) {
                    activeKey.value = list[0].key;
                }
            },
            { immediate: true }
        );

        watch(activeKey, async () => {
            await nextTick();
            scrollChipIntoView(true);
        });

        watch(
            () => props.modelValue,
            async open => {
                if (!open) return;
                if (props.videos.length && !activeKey.value) {
                    activeKey.value = props.videos[0].key;
                }
                await nextTick();
                scrollChipIntoView(false);
            }
        );

        return {
            dialogOpen,
            headerEyebrow,
            activeKey,
            activeIndex,
            activeVideo,
            activeEmbed,
            reelEl,
            setChipRef,
            step,
            pad
        };
    }
});
</script>

<style lang="scss" scoped>
.trailer-shell {
    :deep(.lm-dialog__panel) {
        background: var(--ink-850);
        border-color: var(--rule);
    }

    :deep(.lm-dialog__header) {
        align-items: flex-start;
        padding-block: var(--s-4) var(--s-4);
        background: var(--ink-850);
    }

    :deep(.lm-dialog__body) {
        padding: 0;
        background: var(--ink-900);
    }

    &__heading {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        min-width: 0;
    }

    &__eyebrow {
        font-family: var(--font-mono);
        font-size: 0.72rem;
        letter-spacing: var(--ls-micro);
        text-transform: uppercase;
        color: var(--ember);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.4rem, 2.4vw, 1.85rem);
        line-height: 1.1;
        letter-spacing: var(--ls-tight);
        color: var(--bone-50);
        margin: 0;
        text-wrap: balance;
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
    }
}

.trailer-dialog {
    padding: var(--s-5) var(--s-6) var(--s-6);
    display: flex;
    flex-direction: column;
    gap: var(--s-5);

    &__stage {
        position: relative;
        width: 100%;
    }

    &__frame {
        position: relative;
        width: 100%;
        max-width: min(100%, calc((100dvh - 320px) * 16 / 9));
        margin-inline: auto;
        aspect-ratio: 16 / 9;
        background: #000;
        border-radius: var(--r-md);
        overflow: hidden;
        box-shadow:
            0 0 0 1px var(--rule-strong),
            0 30px 60px -20px rgba(0, 0, 0, 0.7),
            0 0 90px -30px rgba(255, 90, 31, 0.35);

        iframe {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }
    }

    &__empty {
        width: 100%;
        aspect-ratio: 16 / 9;
        display: grid;
        place-items: center;
        background: var(--ink-800);
        border: 1px solid var(--rule);
        border-radius: var(--r-md);
        color: var(--bone-400);

        .meta {
            text-transform: uppercase;
            letter-spacing: var(--ls-micro);
            font-size: var(--fs-xs);
        }
    }

    &__caption {
        display: flex;
        align-items: center;
        gap: var(--s-3);
        flex-wrap: wrap;
    }

    &__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.32rem 0.65rem;
        border: 1px solid var(--rule-strong);
        border-radius: var(--r-pill);
        font-family: var(--font-mono);
        text-transform: uppercase;
        letter-spacing: var(--ls-micro);
        font-size: 0.68rem;
        color: var(--bone-200);
        background: rgba(245, 239, 228, 0.03);
        white-space: nowrap;

        &.is-official {
            color: var(--gold-leaf);
            border-color: rgba(201, 167, 106, 0.4);
            background: rgba(201, 167, 106, 0.06);
        }
    }

    &__badge-sep {
        opacity: 0.5;
        margin: 0 0.05em;
    }

    &__name {
        flex: 1 1 240px;
        font-family: var(--font-display);
        font-size: clamp(1rem, 1.4vw, 1.2rem);
        color: var(--bone-100);
        line-height: 1.3;
        min-width: 0;
        text-wrap: balance;
    }

    &__counter {
        display: inline-flex;
        align-items: baseline;
        gap: 0.1rem;
        margin-left: auto;
        font-family: var(--font-mono);
        color: var(--bone-400);
        font-size: var(--fs-xs);
        letter-spacing: 0.06em;
    }

    &__counter-now {
        color: var(--ember);
        font-size: var(--fs-base);
    }

    &__counter-sep {
        margin: 0 0.45em;
        color: var(--bone-500);
    }

    &__reel {
        display: flex;
        flex-direction: column;
        gap: var(--s-3);
        padding-top: var(--s-4);
        border-top: 1px solid var(--rule);
    }

    &__reel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-3);
    }

    &__reel-eyebrow {
        font-family: var(--font-mono);
        font-size: 0.72rem;
        letter-spacing: var(--ls-micro);
        text-transform: uppercase;
        color: var(--bone-400);
    }

    &__reel-nav {
        display: inline-flex;
        gap: 0.4rem;
    }

    &__nav {
        all: unset;
        cursor: pointer;
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: var(--bone-200);
        background: rgba(245, 239, 228, 0.04);
        border: 1px solid var(--rule);
        transition:
            color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            background-color var(--dur-fast) var(--ease-out);

        &:hover:not(:disabled) {
            color: var(--ember);
            border-color: var(--ember);
            background: rgba(255, 90, 31, 0.08);
        }

        &:disabled {
            opacity: 0.35;
            cursor: not-allowed;
        }

        &:focus-visible {
            outline: 2px solid var(--ember);
            outline-offset: 2px;
        }
    }

    &__strip {
        display: flex;
        gap: var(--s-3);
        overflow-x: auto;
        overflow-y: hidden;
        padding-block: 6px var(--s-2);
        padding-inline: 2px;
        scroll-snap-type: x proximity;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        scrollbar-color: var(--rule-strong) transparent;

        &::-webkit-scrollbar { height: 6px; }
        &::-webkit-scrollbar-track { background: transparent; }
        &::-webkit-scrollbar-thumb {
            background: var(--rule-strong);
            border-radius: 3px;
        }
    }

    &__chip {
        all: unset;
        flex: 0 0 200px;
        width: 200px;
        cursor: pointer;
        scroll-snap-align: center;
        display: grid;
        grid-template-rows: 113px 36px;
        gap: 8px;
        transition: transform var(--dur-base) var(--ease-out);

        &:hover {
            transform: translateY(-2px);

            .trailer-dialog__chip-thumb {
                box-shadow: 0 0 0 1px var(--bone-300), 0 12px 30px -12px rgba(0,0,0,0.6);
            }
            img { opacity: 1; transform: scale(1.04); }
        }

        &:focus-visible .trailer-dialog__chip-thumb {
            box-shadow: 0 0 0 2px var(--ember);
        }

        &.is-active {
            .trailer-dialog__chip-thumb {
                box-shadow: 0 0 0 2px var(--ember), 0 14px 36px -10px rgba(255, 90, 31, 0.35);
            }
            img { opacity: 1; }
            .trailer-dialog__chip-name { color: var(--ember); }
        }
    }

    &__chip-thumb {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: var(--ink-800);
        border-radius: var(--r-sm);
        box-shadow: 0 0 0 1px var(--rule);
        transition: box-shadow var(--dur-base) var(--ease-out);

        img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.7;
            transition:
                opacity var(--dur-fast) var(--ease-out),
                transform var(--dur-base) var(--ease-out);
        }

        &::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(11,10,8,0.4) 0%, transparent 35%, transparent 65%, rgba(11,10,8,0.55) 100%);
            pointer-events: none;
        }
    }

    &__chip-num {
        position: absolute;
        top: 6px;
        left: 8px;
        z-index: 2;
        font-family: var(--font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.06em;
        color: var(--bone-100);
        background: rgba(11, 10, 8, 0.65);
        backdrop-filter: blur(4px);
        padding: 2px 7px;
        border-radius: var(--r-pill);
    }

    &__chip-type {
        position: absolute;
        top: 6px;
        right: 8px;
        z-index: 2;
        font-family: var(--font-mono);
        font-size: 0.62rem;
        text-transform: uppercase;
        letter-spacing: var(--ls-micro);
        color: var(--bone-200);
        background: rgba(11, 10, 8, 0.65);
        backdrop-filter: blur(4px);
        padding: 2px 7px;
        border-radius: var(--r-pill);
    }

    &__chip-marker {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: grid;
        place-items: center;
        background: rgba(11, 10, 8, 0.45);
        color: var(--ember);
        pointer-events: none;
    }

    &__chip-pulse {
        position: absolute;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: rgba(255, 90, 31, 0.18);
        animation: trailer-pulse 1.6s ease-out infinite;
    }

    &__chip-name {
        font-family: var(--font-display);
        font-size: var(--fs-sm);
        color: var(--bone-100);
        line-height: 1.3;
        text-align: left;
        padding-inline: 4px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color var(--dur-fast) var(--ease-out);
    }

    @media (max-width: 720px) {
        padding: var(--s-4) var(--s-4) var(--s-5);
        gap: var(--s-4);

        &__chip {
            flex: 0 0 160px;
            width: 160px;
            grid-template-rows: 90px 32px;
        }

        &__caption {
            gap: var(--s-2);
        }

        &__counter {
            margin-left: 0;
        }
    }
}

@keyframes trailer-pulse {
    0%   { transform: scale(0.6); opacity: 0.7; }
    70%  { transform: scale(1.4); opacity: 0; }
    100% { transform: scale(1.4); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
    .trailer-dialog__chip-pulse { animation: none; }
    .trailer-dialog__chip { transition: none; }
    .trailer-dialog__chip:hover { transform: none; }
    .trailer-dialog__chip:hover img { transform: none; }
}
</style>
