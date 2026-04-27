<template>
    <div class="watch-stage">
        <header class="watch-stage__chrome">
            <div class="watch-stage__chrome-inner">
                <div class="watch-stage__crumb">
                    <button
                        type="button"
                        class="watch-stage__back"
                        aria-label="Back to show"
                        @click="goBack"
                    >
                        <ArrowLeft />
                    </button>
                    <p class="eyebrow">Now projecting</p>
                </div>

                <div class="watch-stage__title-block">
                    <h1 v-if="show" class="watch-stage__title">{{ show.name }}</h1>
                    <span v-else class="watch-stage__title-skeleton" aria-hidden="true" />
                    <p class="meta watch-stage__code">
                        S{{ currentSeason }} · E{{ String(currentEpisode).padStart(2, '0') }}
                    </p>
                </div>

                <div class="watch-stage__actions">
                    <ShareScreen />
                </div>
            </div>
        </header>

        <main class="watch-stage__main" id="main">
            <StreamFrame
                :embed-url="currentEmbedUrl"
                :title="show?.name || 'Stream'"
                :backdrop-path="show?.backdrop_path || ''"
                :poster-path="show?.poster_path || ''"
            />

            <section class="watch-stage__rack">
                <ServerAccordion
                    :servers="availableServers"
                    :active-server-index="currentStreamData.currentServer"
                    @server-change="changeServer"
                />
            </section>

            <section v-if="availableSeasons.length" class="watch-stage__rack">
                <EpisodeNavigator
                    :available-seasons="availableSeasons"
                    :season-episodes="seasonEpisodes"
                    :current-season="currentSeason"
                    :current-episode="currentEpisode"
                    :is-loading-episodes="isLoadingEpisodes"
                    @season-change="onSeasonChange"
                    @select="changeEpisode"
                    @previous="goToPreviousEpisode"
                    @next="goToNextEpisode"
                />
            </section>

            <section v-if="currentEpisodeDetails && show" class="watch-stage__feature">
                <div class="watch-stage__poster">
                    <img
                        v-if="currentEpisodeDetails.still_path || show.poster_path"
                        :src="episodeStill"
                        :alt="currentEpisodeDetails.name"
                        loading="lazy"
                    />
                    <span v-if="currentEpisodeDetails.vote_average" class="watch-stage__rating">
                        <span class="watch-stage__rating-num">
                            {{ currentEpisodeDetails.vote_average.toFixed(1) }}
                        </span>
                        <span class="meta">/ 10</span>
                    </span>
                </div>

                <div class="watch-stage__feature-body">
                    <p class="eyebrow">This episode</p>
                    <h2 class="watch-stage__feature-title">{{ currentEpisodeDetails.name }}</h2>

                    <ul class="watch-stage__meta">
                        <li v-if="airYear">
                            <span class="meta">Aired</span>
                            <span>{{ airYear }}</span>
                        </li>
                        <li v-if="runtimeLabel">
                            <span class="meta">Runtime</span>
                            <span>{{ runtimeLabel }}</span>
                        </li>
                        <li>
                            <span class="meta">Season</span>
                            <span>{{ currentSeason }}</span>
                        </li>
                    </ul>

                    <p v-if="currentEpisodeDetails.overview" class="watch-stage__overview">
                        {{ currentEpisodeDetails.overview }}
                    </p>
                </div>
            </section>

            <p class="watch-stage__disclaimer meta">
                Streams are mirrored from third-party providers. Movieace does not host video files.
            </p>
        </main>

        <UpNextDrawer
            v-if="show && availableSeasons.length"
            :current-season="currentSeason"
            :current-episode="currentEpisode"
            :season-episodes="seasonEpisodes"
            :next-season-number="nextSeasonNumber"
            :next-season-episodes="nextSeasonEpisodes"
            @select="onUpNextSelect"
            @season-change="onUpNextSeasonChange"
        />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    useTvShows,
    TVShowDetails,
    Episode,
    TVShowSeasonDetails
} from '../composables/useTvShows';
import { useMiniPlayer } from '../composables/useMiniPlayer';
import {
    currentStreamData,
    getPreferredStreamData,
    savePreferredServer,
    saveLastWatchedMetaData,
    getServers,
    buildStreamUrl
} from '../composables/useStream';
import { useWebImage } from '../utils/useWebImage';

import StreamFrame from '../components/player/StreamFrame.vue';
import ServerAccordion from '../components/player/ServerAccordion.vue';
import EpisodeNavigator from '../components/player/EpisodeNavigator.vue';
import UpNextDrawer from '../components/player/UpNextDrawer.vue';
import ShareScreen from '../components/player/ShareScreen.vue';
import ArrowLeft from '../components/svg/outline/arrow-left-long.vue';

export default defineComponent({
    name: 'StreamTVShow',
    components: {
        StreamFrame,
        ServerAccordion,
        EpisodeNavigator,
        UpNextDrawer,
        ShareScreen,
        ArrowLeft
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const miniPlayer = useMiniPlayer();
        const { fetchTvShow, fetchTvShowBySeason } = useTvShows();

        const showId = ref<string>(route.params.id as string);
        const externalId = ref<string>('');
        const show = ref<TVShowDetails | null>(null);
        const seasons = ref<TVShowSeasonDetails[]>([]);
        const seasonEpisodes = ref<Episode[]>([]);
        const nextSeasonEpisodes = ref<Episode[]>([]);
        const currentSeason = ref<number>(parseInt(route.params.season as string) || 1);
        const currentEpisode = ref<number>(parseInt(route.params.episode as string) || 1);
        const currentEpisodeDetails = ref<Episode | null>(null);
        const isLoadingEpisodes = ref(false);

        const availableServers = computed(() => getServers('tv'));
        const availableSeasons = computed(() =>
            seasons.value.filter((s) => s.season_number > 0)
        );

        const nextSeasonNumber = computed(() => {
            const next = availableSeasons.value.find(
                (s) => s.season_number === currentSeason.value + 1
            );
            return next ? next.season_number : 0;
        });

        const isLastEpisode = computed(() => {
            const lastInSeason = currentEpisode.value === seasonEpisodes.value.length;
            const lastSeason = !nextSeasonNumber.value;
            return lastInSeason && lastSeason;
        });

        const currentEmbedUrl = computed(() => {
            if (!externalId.value) return '';
            return buildStreamUrl(
                externalId.value,
                'tv',
                currentStreamData.value.currentServer,
                currentSeason.value,
                currentEpisode.value
            );
        });

        const episodeStill = computed(() => {
            if (currentEpisodeDetails.value?.still_path) {
                return useWebImage(currentEpisodeDetails.value.still_path, 'large');
            }
            if (show.value?.poster_path) {
                return useWebImage(show.value.poster_path, 'medium');
            }
            return '';
        });

        const airYear = computed(() => {
            if (!currentEpisodeDetails.value?.air_date) return '';
            const d = new Date(currentEpisodeDetails.value.air_date);
            return Number.isNaN(d.getTime()) ? '' : d.getFullYear().toString();
        });

        const runtimeLabel = computed(() => {
            const r = currentEpisodeDetails.value?.runtime;
            if (!r) return '';
            const hours = Math.floor(r / 60);
            const minutes = r % 60;
            if (!hours) return `${minutes}m`;
            return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
        });

        const updateDocumentTitle = () => {
            if (show.value?.name) {
                document.title = `Stream · ${show.value.name} · S${currentSeason.value}E${currentEpisode.value}`;
            }
        };

        const registerMiniPlayer = () => {
            if (!show.value || !currentEmbedUrl.value) return;
            miniPlayer.setStream({
                mediaId: showId.value,
                mediaType: 'tv',
                title: show.value.name,
                embedUrl: currentEmbedUrl.value,
                posterPath: show.value.poster_path,
                backdropPath: show.value.backdrop_path,
                season: currentSeason.value,
                episode: currentEpisode.value,
                routeName: 'StreamTVShow',
                routeParams: {
                    id: showId.value,
                    season: currentSeason.value,
                    episode: currentEpisode.value
                }
            });
        };

        const loadShow = async () => {
            if (!showId.value) return;
            try {
                const { data } = await fetchTvShow(showId.value);
                if (!data.value) throw new Error('No show data received');
                show.value = data.value;
                seasons.value = (data.value.seasons || []).map((s) => ({
                    ...s,
                    _id: String(s.id),
                    episodes: []
                }));
                externalId.value = showId.value;

                const preferred = getPreferredStreamData(showId.value, 'tv');
                if (!preferred) {
                    savePreferredServer(showId.value, 0, 'tv');
                }

                await loadSeason();
                updateDocumentTitle();
                registerMiniPlayer();
            } catch (err) {
                console.error('Failed to load show:', err);
            }
        };

        const loadSeason = async () => {
            isLoadingEpisodes.value = true;
            try {
                const { data } = await fetchTvShowBySeason(showId.value, currentSeason.value);
                seasonEpisodes.value = data.value?.episodes || [];
                currentEpisodeDetails.value =
                    seasonEpisodes.value.find((ep) => ep.episode_number === currentEpisode.value) ||
                    seasonEpisodes.value[0] ||
                    null;

                if (currentEpisodeDetails.value) {
                    saveLastWatchedMetaData(showId.value, 'tv', {
                        season: currentSeason.value,
                        episode: currentEpisode.value
                    });
                }

                if (nextSeasonNumber.value) {
                    fetchTvShowBySeason(showId.value, nextSeasonNumber.value)
                        .then(({ data }) => {
                            nextSeasonEpisodes.value = data.value?.episodes || [];
                        })
                        .catch(() => {
                            nextSeasonEpisodes.value = [];
                        });
                } else {
                    nextSeasonEpisodes.value = [];
                }
            } catch (err) {
                console.error('Failed to load season:', err);
            } finally {
                isLoadingEpisodes.value = false;
            }
        };

        const updateRoute = async () => {
            try {
                await router.replace({
                    name: 'StreamTVShow',
                    params: {
                        id: showId.value,
                        season: String(currentSeason.value),
                        episode: String(currentEpisode.value)
                    }
                });
                saveLastWatchedMetaData(showId.value, 'tv', {
                    season: currentSeason.value,
                    episode: currentEpisode.value
                });
                updateDocumentTitle();
                registerMiniPlayer();
            } catch (err) {
                console.error('Failed to update route:', err);
            }
        };

        const onSeasonChange = async (next: number) => {
            if (currentSeason.value === next) return;
            currentSeason.value = next;
            currentEpisode.value = 1;
            await updateRoute();
            await loadSeason();
        };

        const changeEpisode = async (next: number) => {
            if (next < 1 || next === currentEpisode.value) return;
            currentEpisode.value = next;
            currentEpisodeDetails.value =
                seasonEpisodes.value.find((ep) => ep.episode_number === next) || null;
            await updateRoute();
        };

        const goToPreviousEpisode = async () => {
            if (currentEpisode.value > 1) {
                changeEpisode(currentEpisode.value - 1);
            } else if (currentSeason.value > 1) {
                const prevSeasonNum = currentSeason.value - 1;
                currentSeason.value = prevSeasonNum;
                currentEpisode.value = 1;
                await updateRoute();
                await loadSeason();
                if (seasonEpisodes.value.length) {
                    changeEpisode(seasonEpisodes.value.length);
                }
            }
        };

        const goToNextEpisode = () => {
            if (isLastEpisode.value) return;
            if (currentEpisode.value < seasonEpisodes.value.length) {
                changeEpisode(currentEpisode.value + 1);
            } else if (nextSeasonNumber.value) {
                onSeasonChange(nextSeasonNumber.value).then(() => changeEpisode(1));
            }
        };

        const onUpNextSelect = async (payload: { season: number; episode: number }) => {
            if (payload.season !== currentSeason.value) {
                currentSeason.value = payload.season;
                currentEpisode.value = payload.episode;
                await updateRoute();
                await loadSeason();
            } else {
                changeEpisode(payload.episode);
            }
        };

        const onUpNextSeasonChange = (next: number) => {
            if (next !== currentSeason.value) {
                onSeasonChange(next);
            }
        };

        const changeServer = (index: number) => {
            savePreferredServer(showId.value, index, 'tv');
            getPreferredStreamData(showId.value, 'tv');
            registerMiniPlayer();
        };

        const goBack = () => {
            router.push(`/tv-show/${showId.value}?season=${currentSeason.value}&episode=${currentEpisode.value}`);
        };

        watch(
            () => route.params,
            async (next) => {
                const nextSeason = parseInt(next.season as string);
                const nextEpisode = parseInt(next.episode as string);
                if (next.id !== showId.value) {
                    showId.value = next.id as string;
                    await loadShow();
                } else if (
                    nextSeason !== currentSeason.value ||
                    nextEpisode !== currentEpisode.value
                ) {
                    currentSeason.value = nextSeason || 1;
                    currentEpisode.value = nextEpisode || 1;
                    await loadSeason();
                    registerMiniPlayer();
                }
            },
            { deep: true }
        );

        watch(currentEmbedUrl, registerMiniPlayer);

        onMounted(() => {
            loadShow();
        });

        return {
            showId,
            externalId,
            show,
            currentStreamData,
            availableServers,
            availableSeasons,
            seasonEpisodes,
            currentSeason,
            currentEpisode,
            currentEpisodeDetails,
            isLoadingEpisodes,
            currentEmbedUrl,
            episodeStill,
            airYear,
            runtimeLabel,
            nextSeasonNumber,
            nextSeasonEpisodes,
            changeServer,
            onSeasonChange,
            changeEpisode,
            goToPreviousEpisode,
            goToNextEpisode,
            onUpNextSelect,
            onUpNextSeasonChange,
            goBack
        };
    }
});
</script>

<style lang="scss" scoped>
.watch-stage {
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--ink-900);
    color: var(--bone-50);

    &__chrome {
        position: sticky;
        top: 0;
        z-index: var(--z-header);
        background: linear-gradient(
            180deg,
            rgba(11, 10, 8, 0.95),
            rgba(11, 10, 8, 0.6) 70%,
            rgba(11, 10, 8, 0)
        );
        backdrop-filter: blur(14px);
    }

    &__chrome-inner {
        max-width: 1280px;
        margin: 0 auto;
        padding: var(--s-3) var(--s-4);
        display: grid;
        grid-template-columns: auto 1fr auto;
        grid-template-areas: 'crumb title actions';
        align-items: center;
        gap: var(--s-3) var(--s-4);

        @media (min-width: 768px) {
            padding: var(--s-4) var(--s-5);
        }

        // ── Mobile: stack title beneath the controls row ────────────────
        @media (max-width: 640px) {
            grid-template-columns: auto 1fr;
            grid-template-areas:
                'crumb actions'
                'title title';
            padding: var(--s-2) var(--s-3);
            gap: var(--s-2);
        }
    }

    &__crumb {
        grid-area: crumb;
        display: inline-flex;
        align-items: center;
        gap: var(--s-3);
        min-width: 0;

        @media (max-width: 640px) {
            gap: var(--s-2);

            .eyebrow {
                display: none;
            }
        }
    }

    &__back {
        all: unset;
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border-radius: 50%;
        background: var(--surface-tint);
        cursor: pointer;
        color: var(--bone-100);

        @media (max-width: 640px) {
            width: 36px;
            height: 36px;
        }
        transition:
            background-color var(--dur-fast) var(--ease-out),
            transform var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--ember);
            color: var(--ink-900);
            transform: translateX(-2px);
        }

        &:focus-visible {
            outline: 2px solid var(--ember);
            outline-offset: 2px;
        }

        :deep(svg) { width: 18px; height: 18px; }
    }

    &__title-block {
        grid-area: title;
        display: grid;
        gap: 0.15rem;
        text-align: center;
        min-width: 0;

        @media (max-width: 640px) {
            text-align: left;
            padding-inline: var(--s-1);
        }
    }

    &__title {
        margin: 0;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-lg);
        letter-spacing: var(--ls-tight);
        color: var(--bone-50);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        @media (min-width: 768px) {
            font-size: var(--fs-xl);
        }
    }

    &__title-skeleton {
        display: block;
        height: 18px;
        max-width: 280px;
        margin: 0 auto;
        background: var(--surface-tint);
        border-radius: var(--r-pill);
    }

    &__code {
        color: var(--bone-400);
        font-family: var(--font-mono);
    }

    &__actions {
        grid-area: actions;
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        justify-content: flex-end;

        :deep(.share-screen-button) {
            background: var(--surface-tint);
            border: 0;
            box-shadow: inset 0 0 0 1px var(--rule);
            border-radius: var(--r-pill);
            color: var(--bone-50);
            padding: 0.5rem 1rem;
            min-height: 38px;
            font-family: var(--font-ui);
            font-size: var(--fs-sm);
            transition: background-color var(--dur-fast) var(--ease-out);

            &:hover {
                background: var(--surface-tint-hover);
                box-shadow: inset 0 0 0 1px var(--rule-strong);
            }
        }

        @media (max-width: 640px) {
            gap: var(--s-1);

            :deep(.share-screen-button .button-text) {
                display: none;
            }

            :deep(.share-screen-button) {
                width: 36px;
                min-height: 36px;
                padding: 0;
                display: inline-grid;
                place-items: center;
            }
        }
    }

    &__main {
        display: grid;
        gap: var(--s-7);
        padding-bottom: var(--s-9);
    }

    &__rack {
        max-width: 1280px;
        width: 100%;
        margin: 0 auto;
        padding: 0 var(--s-4);
        box-sizing: border-box;

        @media (min-width: 768px) {
            padding: 0 var(--s-5);
        }
    }

    &__feature {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 var(--s-4);
        display: grid;
        gap: var(--s-6);

        @media (min-width: 768px) {
            padding: 0 var(--s-5);
            grid-template-columns: 280px 1fr;
            align-items: start;
        }
    }

    &__poster {
        position: relative;
        aspect-ratio: 16 / 9;
        max-width: 280px;
        border-radius: var(--r-lg);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        margin: 0 auto;

        @media (min-width: 768px) {
            aspect-ratio: 2 / 3;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
    }

    &__rating {
        position: absolute;
        top: var(--s-3);
        left: var(--s-3);
        display: inline-flex;
        align-items: baseline;
        gap: 0.35rem;
        background: rgba(11, 10, 8, 0.7);
        backdrop-filter: blur(8px);
        padding: 0.5rem 0.85rem;
        border-radius: var(--r-pill);
        box-shadow: inset 0 0 0 1px var(--rule-strong);

        > .meta { color: var(--bone-300); }
    }

    &__rating-num {
        font-family: var(--font-display);
        font-weight: 600;
        color: var(--gold-leaf);
        font-size: var(--fs-lg);
    }

    &__feature-body {
        display: grid;
        gap: var(--s-3);
        align-content: start;
    }

    &__feature-title {
        margin: 0;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-3xl);
        line-height: var(--lh-tight);
        letter-spacing: var(--ls-tight);
        color: var(--bone-50);

        @media (min-width: 768px) {
            font-size: var(--fs-4xl);
        }
    }

    &__meta {
        list-style: none;
        margin: 0;
        padding: var(--s-3) 0;
        display: grid;
        gap: var(--s-3);
        border-top: 1px solid var(--rule);
        border-bottom: 1px solid var(--rule);
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));

        li {
            display: grid;
            gap: 0.2rem;

            > .meta {
                color: var(--bone-400);
                text-transform: uppercase;
                letter-spacing: var(--ls-micro);
                font-size: var(--fs-xs);
            }

            > span:not(.meta) {
                color: var(--bone-50);
                font-family: var(--font-ui);
                font-size: var(--fs-base);
            }
        }
    }

    &__overview {
        margin: 0;
        color: var(--bone-200);
        line-height: var(--lh-base);
        max-width: 60ch;
    }

    &__disclaimer {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 var(--s-4);
        text-align: center;
        color: var(--bone-500);

        @media (min-width: 768px) {
            padding: 0 var(--s-5);
        }
    }
}
</style>
