<template>
    <div class="tv-detail">
        <SiteHeader />

        <main v-if="show" id="main" class="tv-detail__main" role="main">
            <TitleMasthead
                :id="show.id"
                type="tv"
                :title="show.name"
                :tagline="show.tagline"
                :eyebrow="mastheadEyebrow"
                :backdrop-path="show.backdrop_path"
                :poster-path="show.poster_path"
                :rating="show.vote_average"
                :release-date="show.first_air_date"
                :genres="genreNames"
                :genre-ids="genreIds"
                :adult="false"
                :play-route="playRoute"
                :play-label="playLabel"
                :show-trailer="hasTrailer"
                @trailer="openTrailer"
            />

            <section class="tv-detail__section container-lm tv-detail__opening">
                <MetaBar :items="metaItems" aria-label="Series metadata" />

                <div class="tv-detail__columns">
                    <div class="tv-detail__col--main">
                        <DropCapSynopsis
                            :body="show.overview"
                            eyebrow="The Synopsis"
                        />
                    </div>

                    <div class="tv-detail__col--side">
                        <StatsBlock
                            v-if="statsItems.length"
                            :stats="statsItems"
                            title="By the numbers"
                            eyebrow="Ledger"
                        />
                    </div>
                </div>
            </section>

            <section v-if="show.seasons?.length" class="tv-detail__section container-lm">
                <SeasonTabs
                    :show-id="show.id"
                    :seasons="show.seasons"
                    title="Episode guide"
                    eyebrow="The Schedule"
                    description="Every installment, in running order."
                />
            </section>

            <section v-if="cast.length" class="tv-detail__section container-lm">
                <CastGrid :casts="cast" title="The Ensemble" eyebrow="The Cast" :limit="12" />
            </section>

            <section v-if="reviews.length" class="tv-detail__section container-lm">
                <ReviewsPullQuote
                    :reviews="reviews"
                    title="Pressed into print"
                    eyebrow="The Critics"
                />
            </section>

            <section v-if="similarItems.length" class="tv-detail__section">
                <CuratedRail
                    :items="similarItems"
                    title="Companion pieces"
                    eyebrow="If you liked this"
                    description="Series in a similar register."
                    default-type="tv"
                />
            </section>
        </main>

        <div v-else-if="loading" class="tv-detail__loading" role="status">
            <div class="tv-detail__spinner" aria-hidden="true" />
            <span class="meta">Loading series…</span>
        </div>

        <SiteFooter />

        <TrailerDialog
            v-model="trailerOpen"
            :videos="trailers"
            :title="show ? show.name : 'Trailers'"
            @close="closeTrailer"
        />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SiteHeader from '../components/navigation/SiteHeader.vue';
import SiteFooter from '../components/navigation/SiteFooter.vue';
import TitleMasthead from '../components/detail/TitleMasthead.vue';
import MetaBar, { MetaEntry } from '../components/detail/MetaBar.vue';
import DropCapSynopsis from '../components/detail/DropCapSynopsis.vue';
import StatsBlock, { StatEntry } from '../components/detail/StatsBlock.vue';
import CastGrid from '../components/detail/CastGrid.vue';
import ReviewsPullQuote, { ReviewEntry } from '../components/detail/ReviewsPullQuote.vue';
import SeasonTabs from '../components/detail/SeasonTabs.vue';
import CuratedRail, { CuratedItem } from '../components/rails/CuratedRail.vue';
import TrailerDialog from '../components/detail/TrailerDialog.vue';
import { useTvShows, TVShowDetails, TVShowType } from '../composables/useTvShows';
import { Cast, Crew } from '../composables/useMovies';
import { fetchTrailerVideos, type TrailerVideo } from '../composables/useTrailer';
import { addViewedItem } from '../composables/useHistory';
import { getLastWatchedMetaData } from '../composables/useStream';
import useAxios from '../composables/useAxios';
import { primeGenres } from '../composables/useGenreLookup';

interface ReviewsResponse {
    results: Array<{
        id: string;
        author: string;
        content: string;
        created_at?: string;
        url?: string;
    }>;
}

export default defineComponent({
    name: 'TVShow',
    components: {
        SiteHeader,
        SiteFooter,
        TitleMasthead,
        MetaBar,
        DropCapSynopsis,
        StatsBlock,
        CastGrid,
        ReviewsPullQuote,
        SeasonTabs,
        CuratedRail,
        TrailerDialog
    },
    setup() {
        const route = useRoute();
        const { fetchTvShow, fetchTvShowCredit, fetchSimilarTvShows } = useTvShows();

        const show = ref<TVShowDetails | null>(null);
        const cast = ref<Cast[]>([]);
        const crew = ref<Crew[]>([]);
        const similar = ref<TVShowType[]>([]);
        const reviews = ref<ReviewEntry[]>([]);
        const loading = ref(true);

        const trailerOpen = ref(false);
        const trailers = ref<TrailerVideo[]>([]);

        const genreNames = computed(() => (show.value?.genres ?? []).map(g => g.name));
        const genreIds = computed(() => (show.value?.genres ?? []).map(g => g.id));

        const creator = computed(() =>
            (show.value?.created_by ?? []).map(c => c.name).slice(0, 2).join(', ')
        );

        const network = computed(() => show.value?.networks?.[0]?.name ?? '');

        const mastheadEyebrow = computed(() => {
            const g = genreNames.value[0];
            return g ? `${g} · Series` : 'Series';
        });

        const hasTrailer = computed(() => trailers.value.length > 0);

        const avgRuntime = computed(() => {
            const list = show.value?.episode_run_time ?? [];
            if (!list.length) return '';
            const avg = Math.round(list.reduce((s, n) => s + n, 0) / list.length);
            return `${avg}m / episode`;
        });

        const formatDate = (iso: string) => {
            if (!iso) return '';
            try {
                return new Date(iso).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            } catch { return iso; }
        };

        const airingWindow = computed(() => {
            if (!show.value) return '';
            const start = show.value.first_air_date ? new Date(show.value.first_air_date).getFullYear() : '';
            const end = show.value.last_air_date ? new Date(show.value.last_air_date).getFullYear() : '';
            if (!start) return '';
            if (!end || show.value.in_production) return `${start} —`;
            if (start === end) return `${start}`;
            return `${start}–${end}`;
        });

        const metaItems = computed<MetaEntry[]>(() => {
            if (!show.value) return [];
            const country = show.value.production_countries?.[0]?.name ?? '';
            const language = show.value.spoken_languages?.[0]?.english_name
                ?? (show.value.original_language ? show.value.original_language.toUpperCase() : '');
            return [
                { label: 'Premiered', value: formatDate(show.value.first_air_date) },
                { label: 'Airing', value: airingWindow.value },
                { label: 'Creator', value: creator.value },
                { label: 'Network', value: network.value },
                { label: 'Runtime', value: avgRuntime.value },
                { label: 'Country', value: country },
                { label: 'Language', value: language },
                { label: 'Status', value: show.value.status }
            ];
        });

        const statsItems = computed<StatEntry[]>(() => {
            if (!show.value) return [];
            return [
                { label: 'Seasons', value: show.value.number_of_seasons || '' },
                { label: 'Episodes', value: show.value.number_of_episodes || '' },
                {
                    label: 'Type',
                    value: show.value.type || '',
                    hint: show.value.in_production ? 'In production' : 'Concluded'
                },
                { label: 'Popularity', value: show.value.popularity ? show.value.popularity.toFixed(0) : '' },
                { label: 'Votes', value: show.value.vote_count ? show.value.vote_count.toLocaleString() : '' }
            ];
        });

        const similarItems = computed<CuratedItem[]>(() =>
            similar.value.slice(0, 14).map(s => ({
                id: s.id,
                title: s.name,
                posterPath: s.poster_path,
                rating: s.vote_average,
                releaseDate: s.release_date,
                genreIds: s.genre_ids,
                adult: s.adult,
                type: 'tv' as const
            }))
        );

        const playRoute = computed(() => {
            const id = String(route.params.id);
            const last = getLastWatchedMetaData(id);
            const season = last?.season && last.season > 0 ? last.season : 1;
            const episode = last?.episode && last.episode > 0 ? last.episode : 1;
            return {
                name: 'StreamTVShow',
                params: {
                    id,
                    season: String(season),
                    episode: String(episode)
                }
            };
        });

        const playLabel = computed(() => {
            const id = String(route.params.id);
            const last = getLastWatchedMetaData(id);
            if (last && last.season && last.episode) {
                return `Resume S${last.season} · E${last.episode}`;
            }
            return 'Play';
        });

        const openTrailer = () => {
            if (trailers.value.length) trailerOpen.value = true;
        };
        const closeTrailer = () => {
            trailerOpen.value = false;
        };

        const fetchReviews = async (id: string) => {
            try {
                const res = await useAxios().get(`https://api.themoviedb.org/3/tv/${id}/reviews?language=en-US&page=1`);
                const data = res.data as ReviewsResponse;
                reviews.value = (data.results ?? [])
                    .slice(0, 6)
                    .map(r => ({
                        id: r.id,
                        author: r.author,
                        content: r.content,
                        created_at: r.created_at,
                        url: r.url
                    }));
            } catch {
                reviews.value = [];
            }
        };

        const loadShow = async (id: string) => {
            loading.value = true;
            show.value = null;
            cast.value = [];
            crew.value = [];
            similar.value = [];
            reviews.value = [];
            trailers.value = [];

            try {
                const [details, credits, sim, videos] = await Promise.all([
                    fetchTvShow(id),
                    fetchTvShowCredit(id),
                    fetchSimilarTvShows(id),
                    fetchTrailerVideos(id, 'tv'),
                    fetchReviews(id)
                ]);

                show.value = details.data.value ?? null;
                cast.value = credits.data.value?.cast ?? [];
                crew.value = credits.data.value?.crew ?? [];
                similar.value = (sim.data.value?.results ?? []) as TVShowType[];
                trailers.value = videos ?? [];

                if (show.value) {
                    document.title = `${show.value.name} — Movieace`;
                    addViewedItem({
                        id: show.value.id,
                        title: show.value.name,
                        image: show.value.poster_path,
                        rating: show.value.vote_average,
                        categories: genreIds.value,
                        adult: false,
                        type: 'tv'
                    });
                }
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            primeGenres();
            loadShow(String(route.params.id));
        });

        watch(
            () => route.params.id,
            newId => {
                if (newId && route.name === 'TVShow') {
                    loadShow(String(newId));
                }
            }
        );

        return {
            show,
            cast,
            reviews,
            loading,
            genreNames,
            genreIds,
            mastheadEyebrow,
            hasTrailer,
            trailerOpen,
            trailers,
            metaItems,
            statsItems,
            similarItems,
            playRoute,
            playLabel,
            openTrailer,
            closeTrailer
        };
    }
});
</script>

<style lang="scss" scoped>
.tv-detail {
    position: relative;
    min-height: 100dvh;
    background: var(--ink-900);
    color: var(--bone-50);

    &__main {
        position: relative;
    }

    &__section {
        margin-top: clamp(var(--s-7), 7vw, var(--s-10));

        &:last-of-type {
            margin-bottom: clamp(var(--s-8), 8vw, var(--s-10));
        }
    }

    &__opening {
        display: grid;
        gap: clamp(var(--s-6), 6vw, var(--s-8));
    }

    &__columns {
        display: grid;
        gap: clamp(var(--s-6), 5vw, var(--s-8));
        grid-template-columns: minmax(0, 1fr);

        @media (min-width: 960px) {
            grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
            align-items: start;
        }
    }

    &__col--main,
    &__col--side {
        min-width: 0;
    }

    &__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--s-3);
        min-height: 60vh;
        color: var(--bone-300);
    }

    &__spinner {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid var(--rule-strong);
        border-top-color: var(--ember);
        animation: tv-spin 0.8s linear infinite;
    }

}

@keyframes tv-spin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .tv-detail__spinner { animation: none; }
}
</style>
