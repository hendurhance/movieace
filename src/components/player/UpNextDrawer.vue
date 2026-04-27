<template>
    <Teleport to="body">
        <div class="up-next" :class="{ 'is-open': open }" :aria-hidden="!open">
            <button
                v-if="!open && hasUpcoming"
                type="button"
                class="up-next__handle"
                aria-label="Open up-next drawer"
                @click="open = true"
            >
                <span class="meta">Up next</span>
                <span class="up-next__handle-title">{{ upcoming[0]?.label }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>

            <aside
                v-show="open"
                class="up-next__panel"
                role="dialog"
                aria-label="Up next episodes"
            >
                <header class="up-next__head">
                    <div>
                        <p class="eyebrow">Up next</p>
                        <h3 class="up-next__title">Coming up</h3>
                    </div>
                    <button
                        type="button"
                        class="up-next__close"
                        aria-label="Close drawer"
                        @click="open = false"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                            <path d="M6 6l12 12M6 18L18 6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </header>

                <ul v-if="hasUpcoming" class="up-next__list">
                    <li
                        v-for="(item, idx) in upcoming"
                        :key="item.key"
                        class="up-next__item"
                        :class="{ 'is-priming': idx === 0 && countingDown }"
                    >
                        <button type="button" class="up-next__row" @click="select(item)">
                            <div class="up-next__still">
                                <img
                                    v-if="item.still"
                                    :src="item.still"
                                    :alt="item.label"
                                    loading="lazy"
                                />
                                <div v-else class="up-next__placeholder" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                                        <rect x="3" y="6" width="18" height="12" rx="2" />
                                        <path d="m8 3 4 3 4-3" />
                                    </svg>
                                </div>
                                <span v-if="idx === 0 && countingDown" class="up-next__count">
                                    {{ countdown }}s
                                </span>
                            </div>
                            <div class="up-next__body">
                                <span class="meta up-next__meta">{{ item.code }} · {{ item.label }}</span>
                                <h4 class="up-next__name">{{ item.title }}</h4>
                                <p v-if="item.overview" class="up-next__overview">
                                    {{ truncate(item.overview, 110) }}
                                </p>
                            </div>
                        </button>
                    </li>
                </ul>
                <p v-else class="meta up-next__empty">No more episodes filed for this run.</p>

                <footer class="up-next__foot">
                    <label class="up-next__autoplay">
                        <input type="checkbox" v-model="autoplay" />
                        <span class="meta">Autoplay next episode</span>
                    </label>
                </footer>
            </aside>

            <div v-show="open" class="up-next__scrim" @click="open = false" aria-hidden="true" />
        </div>
    </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, PropType, ref, watch } from 'vue';
import { useStorage } from '@vueuse/core';
import { useWebImage } from '../../utils/useWebImage';
import { Episode } from '../../composables/useTvShows';

export interface UpNextItem {
    key: string;
    season: number;
    episode: number;
    code: string;
    label: string;
    title: string;
    overview: string;
    still: string;
}

export default defineComponent({
    name: 'UpNextDrawer',
    props: {
        currentSeason: { type: Number, required: true },
        currentEpisode: { type: Number, required: true },
        seasonEpisodes: { type: Array as PropType<Episode[]>, required: true },
        nextSeasonNumber: { type: Number, default: 0 },
        nextSeasonEpisodes: { type: Array as PropType<Episode[]>, default: () => [] },
        autoplayCountdown: { type: Number, default: 12 }
    },
    emits: ['select', 'season-change'],
    setup(props, { emit }) {
        const open = useStorage<boolean>('lm:upnext:open', false);
        const autoplay = useStorage<boolean>('lm:upnext:autoplay', false);

        const formatLabel = (ep: Episode) => {
            const air = ep.air_date ? new Date(ep.air_date) : null;
            if (!air || Number.isNaN(air.getTime())) return ep.name || `Episode ${ep.episode_number}`;
            return ep.name || `Episode ${ep.episode_number}`;
        };

        const upcoming = computed<UpNextItem[]>(() => {
            const items: UpNextItem[] = [];
            const remaining = props.seasonEpisodes.filter(
                (ep) => ep.episode_number > props.currentEpisode
            );

            remaining.slice(0, 3).forEach((ep) => {
                items.push({
                    key: `s${props.currentSeason}e${ep.episode_number}`,
                    season: props.currentSeason,
                    episode: ep.episode_number,
                    code: `S${props.currentSeason} · E${String(ep.episode_number).padStart(2, '0')}`,
                    label: formatLabel(ep),
                    title: ep.name || `Episode ${ep.episode_number}`,
                    overview: ep.overview || '',
                    still: ep.still_path ? useWebImage(ep.still_path, 'medium') : ''
                });
            });

            if (items.length < 3 && props.nextSeasonNumber && props.nextSeasonEpisodes.length) {
                const need = 3 - items.length;
                props.nextSeasonEpisodes.slice(0, need).forEach((ep) => {
                    items.push({
                        key: `s${props.nextSeasonNumber}e${ep.episode_number}`,
                        season: props.nextSeasonNumber,
                        episode: ep.episode_number,
                        code: `S${props.nextSeasonNumber} · E${String(ep.episode_number).padStart(2, '0')}`,
                        label: formatLabel(ep),
                        title: ep.name || `Episode ${ep.episode_number}`,
                        overview: ep.overview || '',
                        still: ep.still_path ? useWebImage(ep.still_path, 'medium') : ''
                    });
                });
            }

            return items;
        });

        const hasUpcoming = computed(() => upcoming.value.length > 0);

        const countingDown = ref(false);
        const countdown = ref(props.autoplayCountdown);
        let timer: ReturnType<typeof setInterval> | null = null;

        const stopCountdown = () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            countingDown.value = false;
            countdown.value = props.autoplayCountdown;
        };

        const startCountdown = () => {
            stopCountdown();
            if (!autoplay.value || !hasUpcoming.value) return;
            countingDown.value = true;
            countdown.value = props.autoplayCountdown;
            timer = setInterval(() => {
                countdown.value -= 1;
                if (countdown.value <= 0) {
                    stopCountdown();
                    const next = upcoming.value[0];
                    if (next) select(next);
                }
            }, 1000);
        };

        const select = (item: UpNextItem) => {
            stopCountdown();
            if (item.season !== props.currentSeason) {
                emit('season-change', item.season);
            }
            emit('select', { season: item.season, episode: item.episode });
            open.value = false;
        };

        const truncate = (text: string, length: number) => {
            if (!text) return '';
            if (text.length <= length) return text;
            return text.slice(0, length).replace(/\s+\S*$/, '') + '…';
        };

        watch(
            () => [autoplay.value, props.currentEpisode, hasUpcoming.value],
            () => {
                if (autoplay.value && hasUpcoming.value) startCountdown();
                else stopCountdown();
            },
            { immediate: true }
        );

        onUnmounted(stopCountdown);

        return {
            open,
            autoplay,
            upcoming,
            hasUpcoming,
            countdown,
            countingDown,
            select,
            truncate
        };
    }
});
</script>

<style lang="scss" scoped>
.up-next {
    pointer-events: none;
    position: fixed;
    inset: 0;
    z-index: var(--z-drawer);

    &__handle {
        pointer-events: auto;
        position: fixed;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        display: inline-flex;
        flex-direction: column;
        gap: 0.25rem;
        max-width: 220px;
        background: var(--ink-800);
        color: var(--bone-50);
        border: 0;
        border-right: 0;
        padding: var(--s-3) var(--s-4);
        border-radius: var(--r-md) 0 0 var(--r-md);
        box-shadow: inset 0 0 0 1px var(--rule), -8px 0 24px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        text-align: left;
        transition:
            background-color var(--dur-fast) var(--ease-out),
            transform var(--dur-fast) var(--ease-out);

        > .meta {
            color: var(--bone-400);
            text-transform: uppercase;
            letter-spacing: var(--ls-micro);
            font-size: var(--fs-xs);
        }

        > svg {
            position: absolute;
            right: var(--s-2);
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            color: var(--bone-400);
        }

        &:hover {
            background: var(--ink-700);
            transform: translateY(-50%) translateX(-2px);
        }

        @media (max-width: 900px) {
            display: none;
        }
    }

    &__handle-title {
        font-family: var(--font-display);
        font-size: var(--fs-base);
        line-height: var(--lh-snug);
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__panel {
        pointer-events: auto;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: min(420px, 92vw);
        background: var(--ink-850);
        box-shadow: -24px 0 60px rgba(0, 0, 0, 0.6);
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: var(--s-4);
        padding: var(--s-5);
        animation: upNextSlideIn var(--dur-base) var(--ease-out);
        overflow-y: auto;
    }

    &__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--s-3);
    }

    &__title {
        margin: 0;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-2xl);
        color: var(--bone-50);
        letter-spacing: var(--ls-tight);
    }

    &__close {
        all: unset;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        cursor: pointer;
        color: var(--bone-200);
        transition: background-color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--surface-tint);
            color: var(--bone-50);
        }

        svg { width: 18px; height: 18px; }
    }

    &__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: var(--s-3);
    }

    &__item {
        background: var(--ink-800);
        border-radius: var(--r-md);
        box-shadow: inset 0 0 0 1px var(--rule);
        overflow: hidden;
        transition: box-shadow var(--dur-fast) var(--ease-out);

        &.is-priming {
            box-shadow: inset 0 0 0 1px rgba(255, 90, 31, 0.45);
        }
    }

    &__row {
        all: unset;
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: var(--s-3);
        cursor: pointer;
        padding: var(--s-3);
        width: 100%;
        box-sizing: border-box;

        &:hover {
            background: var(--surface-tint);
        }

        &:focus-visible {
            outline: 2px solid var(--ember);
            outline-offset: -2px;
        }
    }

    &__still {
        position: relative;
        aspect-ratio: 16 / 9;
        background: var(--ink-900);
        border-radius: var(--r-sm);
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
    }

    &__placeholder {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: var(--bone-500);

        svg { width: 24px; height: 24px; }
    }

    &__count {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(11, 10, 8, 0.55);
        font-family: var(--font-mono);
        font-size: var(--fs-base);
        color: var(--ember);
    }

    &__body {
        display: grid;
        gap: 0.25rem;
        min-width: 0;
    }

    &__meta {
        color: var(--bone-400);
    }

    &__name {
        margin: 0;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-base);
        color: var(--bone-50);
        line-height: var(--lh-snug);
        letter-spacing: var(--ls-tight);
    }

    &__overview {
        margin: 0;
        color: var(--bone-300);
        font-size: var(--fs-xs);
        line-height: var(--lh-base);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__empty {
        color: var(--bone-400);
    }

    &__foot {
        border-top: 1px solid var(--rule);
        padding-top: var(--s-3);
    }

    &__autoplay {
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        cursor: pointer;
        color: var(--bone-200);

        input {
            accent-color: var(--ember);
        }
    }

    &__scrim {
        pointer-events: auto;
        position: fixed;
        inset: 0;
        background: rgba(11, 10, 8, 0.55);
        backdrop-filter: blur(2px);
        animation: upNextScrimIn var(--dur-base) var(--ease-out);
    }
}

@keyframes upNextSlideIn {
    from { transform: translateX(8%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes upNextScrimIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
    .up-next__panel,
    .up-next__scrim {
        animation: none;
    }
}
</style>
