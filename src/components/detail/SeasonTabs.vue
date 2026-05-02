<template>
    <section class="season-tabs" :aria-label="ariaLabel">
        <header class="season-tabs__head">
            <p v-if="eyebrow" class="eyebrow season-tabs__eyebrow">{{ eyebrow }}</p>
            <h2 class="season-tabs__title display">{{ title }}</h2>
            <p v-if="description" class="season-tabs__desc">{{ description }}</p>
        </header>

        <div v-if="tabs.length" class="season-tabs__rail">
            <LmTabs
                v-model="activeSeason"
                :tabs="tabs"
                variant="pill"
                :aria-label="`${title} — season selector`"
            />
        </div>

        <div v-if="loading" class="season-tabs__loading meta">
            Loading season…
        </div>

        <div v-else-if="visibleEpisodes.length" class="season-tabs__episodes" role="list">
            <article
                v-for="ep in visibleEpisodes"
                :key="ep.id"
                class="season-tabs__ep"
                role="listitem"
            >
                <router-link
                    :to="buildEpisodeRoute(ep)"
                    class="season-tabs__link"
                    :aria-label="`Play S${activeSeason} · E${ep.episode_number} — ${ep.name}`"
                >
                    <div class="season-tabs__still">
                        <img
                            v-if="ep.still_path"
                            :src="stillUrl(ep.still_path)"
                            :alt="ep.name"
                            loading="lazy"
                            decoding="async"
                        />
                        <div v-else class="season-tabs__still season-tabs__still--placeholder" aria-hidden="true" />
                        <span class="season-tabs__play" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M8 5v14l11-7z"/>
                            </svg>
                        </span>
                    </div>

                    <div class="season-tabs__body">
                        <p class="season-tabs__num">
                            <span class="season-tabs__num-label">Episode</span>
                            <span class="season-tabs__num-val">{{ pad(ep.episode_number) }}</span>
                            <span v-if="ep.air_date" class="season-tabs__air">· {{ formatDate(ep.air_date) }}</span>
                        </p>
                        <h3 class="season-tabs__ep-title">{{ ep.name || `Episode ${ep.episode_number}` }}</h3>
                        <p v-if="ep.overview" class="season-tabs__ep-overview">{{ truncate(ep.overview, 180) }}</p>
                    </div>
                </router-link>
            </article>
        </div>

        <div v-else-if="hasLoaded" class="season-tabs__empty meta">
            No episodes filed for this season.
        </div>
    </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue';
import LmTabs, { TabDef } from '../primitives/Tabs.vue';
import { useTvShows, Episode, TVShowDetails } from '../../composables/useTvShows';
import { useWebImage } from '../../utils/useWebImage';

export default defineComponent({
    name: 'SeasonTabs',
    components: { LmTabs },
    props: {
        showId: { type: [Number, String], required: true },
        seasons: { type: Array as PropType<TVShowDetails['seasons']>, default: () => [] },
        title: { type: String, default: 'Episode guide' },
        eyebrow: { type: String, default: 'Seasons' },
        description: { type: String, default: '' },
        ariaLabel: { type: String, default: 'Season and episode selector' }
    },
    setup(props) {
        const { fetchTvShowBySeason } = useTvShows();

        const tabs = computed<TabDef[]>(() =>
            (props.seasons ?? [])
                .filter(s => s.season_number > 0)
                .map(s => ({
                    label: s.name || `Season ${s.season_number}`,
                    value: String(s.season_number),
                    count: s.episode_count
                }))
        );

        const activeSeason = ref<string>(tabs.value[0]?.value ?? '1');
        const episodes = ref<Episode[]>([]);
        const loading = ref(false);
        const hasLoaded = ref(false);
        const cache = new Map<string, Episode[]>();

        const loadSeason = async (seasonNum: string) => {
            const key = `${props.showId}-${seasonNum}`;
            if (cache.has(key)) {
                episodes.value = cache.get(key)!;
                hasLoaded.value = true;
                return;
            }
            loading.value = true;
            try {
                const { data } = await fetchTvShowBySeason(String(props.showId), Number(seasonNum));
                const list = data.value?.episodes ?? [];
                cache.set(key, list);
                episodes.value = list;
            } finally {
                loading.value = false;
                hasLoaded.value = true;
            }
        };

        watch(activeSeason, val => loadSeason(val));
        watch(
            () => tabs.value[0]?.value,
            val => {
                if (val && !cache.has(`${props.showId}-${activeSeason.value}`)) {
                    activeSeason.value = val;
                }
            }
        );

        onMounted(() => {
            if (activeSeason.value) loadSeason(activeSeason.value);
        });

        const visibleEpisodes = computed(() => episodes.value);

        const stillUrl = (path: string) => useWebImage(path, 'medium');

        const pad = (n: number) => String(n).padStart(2, '0');

        const formatDate = (iso: string) => {
            try {
                return new Date(iso).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            } catch { return ''; }
        };

        const truncate = (text: string, max: number) => {
            if (!text) return '';
            const clean = text.replace(/\s+/g, ' ').trim();
            if (clean.length <= max) return clean;
            const slice = clean.slice(0, max);
            const lastSpace = slice.lastIndexOf(' ');
            return `${slice.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
        };

        const buildEpisodeRoute = (ep: Episode) => ({
            name: 'StreamTVShow',
            params: {
                id: String(props.showId),
                season: String(activeSeason.value),
                episode: String(ep.episode_number)
            }
        });

        return {
            tabs,
            activeSeason,
            visibleEpisodes,
            loading,
            hasLoaded,
            stillUrl,
            pad,
            formatDate,
            truncate,
            buildEpisodeRoute
        };
    }
});
</script>

<style lang="scss" scoped>
.season-tabs {
    &__head {
        margin-bottom: var(--s-5);
        max-width: 68ch;
    }

    &__eyebrow {
        color: var(--ember);
        margin: 0 0 var(--s-2);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.6rem, 3vw, 2.4rem);
        line-height: 1.05;
        letter-spacing: -0.01em;
        color: var(--bone-50);
        margin: 0;
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
    }

    &__desc {
        margin-top: var(--s-3);
        color: var(--bone-300);
    }

    &__rail {
        margin-bottom: var(--s-6);
        overflow-x: auto;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }
    }

    &__loading,
    &__empty {
        color: var(--bone-400);
        font-style: italic;
        padding: var(--s-6) 0;
    }

    &__episodes {
        display: grid;
        gap: var(--s-5);
        grid-template-columns: 1fr;

        @media (min-width: 720px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (min-width: 1080px) {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    &__ep {
        min-width: 0;
    }

    &__link {
        display: grid;
        gap: var(--s-3);
        color: inherit;
        text-decoration: none;
        padding: var(--s-3);
        border-radius: var(--r-md);
        transition: background-color var(--dur-fast) var(--ease-out);

        &:hover, &:focus-visible {
            background: var(--surface-tint);
        }

        &:hover .season-tabs__play,
        &:focus-visible .season-tabs__play {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        &:hover .season-tabs__ep-title {
            color: var(--ember);
        }
    }

    &__still {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        background: var(--ink-700);
        border-radius: var(--r-sm);
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        &--placeholder {
            background:
                radial-gradient(70% 70% at 50% 40%, var(--ink-700), var(--ink-900));
        }
    }

    &__play {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.85);
        width: 48px;
        height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--ember);
        color: var(--ink-900);
        opacity: 0;
        transition:
            opacity var(--dur-base) var(--ease-out),
            transform var(--dur-base) var(--ease-out);
    }

    &__body {
        display: grid;
        gap: var(--s-1);
        min-width: 0;
    }

    &__num {
        margin: 0;
        display: flex;
        align-items: center;
        gap: var(--s-2);
        flex-wrap: wrap;
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--bone-400);
    }

    &__num-label { color: var(--bone-400); }
    &__num-val { color: var(--ember); }
    &__air { color: var(--bone-400); }

    &__ep-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-lg);
        color: var(--bone-50);
        margin: 0;
        line-height: 1.2;
        transition: color var(--dur-fast) var(--ease-out);
    }

    &__ep-overview {
        margin: 0;
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        color: var(--bone-300);
        line-height: 1.55;
    }
}

@media (prefers-reduced-motion: reduce) {
    .season-tabs__play,
    .season-tabs__link { transition: none; }
}
</style>
