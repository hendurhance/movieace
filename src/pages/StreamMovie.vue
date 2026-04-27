<template>
    <div class="watch-stage">
        <header class="watch-stage__chrome">
            <div class="watch-stage__chrome-inner">
                <div class="watch-stage__crumb">
                    <button
                        type="button"
                        class="watch-stage__back"
                        aria-label="Back to feature"
                        @click="goBack"
                    >
                        <ArrowLeft />
                    </button>
                    <p class="eyebrow">Now projecting</p>
                </div>

                <h1 v-if="movie" class="watch-stage__title">{{ movie.title }}</h1>
                <span v-else class="watch-stage__title-skeleton" aria-hidden="true" />

                <div class="watch-stage__actions">
                    <ShareScreen />
                </div>
            </div>
        </header>

        <main class="watch-stage__main" id="main">
            <StreamFrame
                :embed-url="currentEmbedUrl"
                :title="movie?.title || 'Stream'"
                :backdrop-path="movie?.backdrop_path || ''"
                :poster-path="movie?.poster_path || ''"
            />

            <section class="watch-stage__rack">
                <ServerAccordion
                    :servers="availableServers"
                    :active-server-index="currentStreamData.currentServer"
                    @server-change="changeServer"
                />
            </section>

            <section v-if="movie" class="watch-stage__feature">
                <div class="watch-stage__poster">
                    <img
                        v-if="movie.poster_path"
                        :src="posterUrl"
                        :alt="movie.title"
                        loading="lazy"
                    />
                    <span v-if="movie.vote_average" class="watch-stage__rating">
                        <span class="watch-stage__rating-num">{{ movie.vote_average.toFixed(1) }}</span>
                        <span class="meta">/ 10</span>
                    </span>
                </div>

                <div class="watch-stage__feature-body">
                    <p class="eyebrow">The feature</p>
                    <h2 class="watch-stage__feature-title">{{ movie.title }}</h2>
                    <p v-if="movie.tagline" class="watch-stage__tagline">{{ movie.tagline }}</p>

                    <ul class="watch-stage__meta">
                        <li v-if="releaseYear">
                            <span class="meta">Year</span>
                            <span>{{ releaseYear }}</span>
                        </li>
                        <li v-if="runtimeLabel">
                            <span class="meta">Runtime</span>
                            <span>{{ runtimeLabel }}</span>
                        </li>
                        <li v-if="movie.genres?.length">
                            <span class="meta">Genres</span>
                            <span>{{ movie.genres.slice(0, 3).map(g => g.name).join(' · ') }}</span>
                        </li>
                    </ul>

                    <p v-if="movie.overview" class="watch-stage__overview">{{ movie.overview }}</p>
                </div>
            </section>

            <p class="watch-stage__disclaimer meta">
                Streams are mirrored from third-party providers. Movieace does not host video files.
            </p>
        </main>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMovies, MovieDetails } from '../composables/useMovies';
import { useMiniPlayer } from '../composables/useMiniPlayer';
import {
    currentStreamData,
    getPreferredStreamData,
    savePreferredServer,
    getServers,
    buildStreamUrl
} from '../composables/useStream';
import { useWebImage } from '../utils/useWebImage';

import StreamFrame from '../components/player/StreamFrame.vue';
import ServerAccordion from '../components/player/ServerAccordion.vue';
import ShareScreen from '../components/player/ShareScreen.vue';
import ArrowLeft from '../components/svg/outline/arrow-left-long.vue';

export default defineComponent({
    name: 'StreamMovie',
    components: { StreamFrame, ServerAccordion, ShareScreen, ArrowLeft },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const miniPlayer = useMiniPlayer();

        const movieId = ref<string>(route.params.id as string);
        const movie = ref<MovieDetails | null>(null);
        const error = ref<string | null>(null);
        const { fetchMovie } = useMovies();

        const availableServers = computed(() => getServers('movie'));
        const reloadKey = ref(0);

        const currentEmbedUrl = computed(() => {
            if (!movieId.value) return '';

            const base = buildStreamUrl(
                movieId.value,
                'movie',
                currentStreamData.value.currentServer
            );
            if (reloadKey.value > 0) {
                return `${base}${base.includes('?') ? '&' : '?'}t=${reloadKey.value}`;
            }
            return base;
        });

        const posterUrl = computed(() =>
            movie.value?.poster_path ? useWebImage(movie.value.poster_path, 'medium') : ''
        );

        const releaseYear = computed(() => {
            if (!movie.value?.release_date) return '';
            const d = new Date(movie.value.release_date);
            return Number.isNaN(d.getTime()) ? '' : d.getFullYear().toString();
        });

        const runtimeLabel = computed(() => {
            const r = movie.value?.runtime;
            if (!r) return '';
            const hours = Math.floor(r / 60);
            const minutes = r % 60;
            if (!hours) return `${minutes}m`;
            return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
        });

        const loadMovie = async () => {
            if (!movieId.value) {
                error.value = 'Invalid movie ID';
                return;
            }
            try {
                const { data } = await fetchMovie(movieId.value);
                if (!data.value) throw new Error('No movie data received');
                movie.value = data.value;
                document.title = `Stream · ${data.value.title}`;

                if (!getPreferredStreamData(movieId.value, 'movie')) {
                    savePreferredServer(movieId.value, 0, 'movie');
                    getPreferredStreamData(movieId.value, 'movie');
                }

                registerMiniPlayer();
            } catch (err) {
                error.value = err instanceof Error ? err.message : 'Failed to load movie';
                console.error(err);
            }
        };

        const registerMiniPlayer = () => {
            if (!movie.value || !currentEmbedUrl.value) return;
            miniPlayer.setStream({
                mediaId: movieId.value,
                mediaType: 'movie',
                title: movie.value.title,
                embedUrl: currentEmbedUrl.value,
                posterPath: movie.value.poster_path,
                backdropPath: movie.value.backdrop_path,
                routeName: 'StreamMovie',
                routeParams: { id: movieId.value }
            });
        };

        const changeServer = (index: number) => {
            if (index < 0 || index >= availableServers.value.length) return;
            savePreferredServer(movieId.value, index, 'movie');
            getPreferredStreamData(movieId.value, 'movie');
            reloadKey.value = Date.now();
            registerMiniPlayer();
        };

        const goBack = () => router.push(`/movie/${movieId.value}`);

        watch(
            () => route.params.id,
            (next, prev) => {
                if (next && next !== prev) {
                    movieId.value = next as string;
                    loadMovie();
                }
            }
        );

        watch(currentEmbedUrl, registerMiniPlayer);

        onMounted(() => {
            loadMovie();
        });

        return {
            movieId,
            movie,
            currentStreamData,
            availableServers,
            currentEmbedUrl,
            posterUrl,
            releaseYear,
            runtimeLabel,
            changeServer,
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

    &__title {
        grid-area: title;
        margin: 0;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-lg);
        letter-spacing: var(--ls-tight);
        color: var(--bone-50);
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        @media (min-width: 768px) {
            font-size: var(--fs-xl);
        }

        @media (max-width: 640px) {
            text-align: left;
            padding-inline: var(--s-1);
        }
    }

    &__title-skeleton {
        grid-area: title;
        display: block;
        height: 18px;
        max-width: 280px;
        margin: 0 auto;
        background: var(--surface-tint);
        border-radius: var(--r-pill);
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
        aspect-ratio: 2 / 3;
        max-width: 280px;
        border-radius: var(--r-lg);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        margin: 0 auto;

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

    &__tagline {
        margin: 0;
        font-family: var(--font-display);
        font-style: italic;
        color: var(--bone-200);
        font-size: var(--fs-lg);
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
