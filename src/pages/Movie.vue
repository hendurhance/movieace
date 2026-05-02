<template>
    <div class="movie-detail">
        <SiteHeader />

        <main v-if="movie" id="main" class="movie-detail__main" role="main">
            <TitleMasthead
                :id="movie.id"
                type="movie"
                :title="movie.title"
                :tagline="movie.tagline"
                :eyebrow="mastheadEyebrow"
                :backdrop-path="movie.backdrop_path"
                :poster-path="movie.poster_path"
                :rating="movie.vote_average"
                :release-date="movie.release_date"
                :genres="genreNames"
                :genre-ids="genreIds"
                :adult="movie.adult"
                :play-route="playRoute"
                :play-label="playLabel"
                :show-trailer="hasTrailer"
                @trailer="openTrailer"
            />

            <section class="movie-detail__section container-lm movie-detail__opening">
                <MetaBar :items="metaItems" aria-label="Film metadata" />

                <div class="movie-detail__columns">
                    <div class="movie-detail__col--main">
                        <DropCapSynopsis
                            :body="movie.overview"
                            eyebrow="The Synopsis"
                        />
                    </div>

                    <div class="movie-detail__col--side">
                        <StatsBlock
                            v-if="statsItems.length"
                            :stats="statsItems"
                            title="By the numbers"
                            eyebrow="Ledger"
                        />
                    </div>
                </div>
            </section>

            <section v-if="cast.length" class="movie-detail__section container-lm">
                <CastGrid :casts="cast" title="The Players" eyebrow="The Cast" :limit="12" />
            </section>

            <section v-if="reviews.length" class="movie-detail__section container-lm">
                <ReviewsPullQuote
                    :reviews="reviews"
                    title="Pressed into print"
                    eyebrow="The Critics"
                />
            </section>

            <section v-if="similarItems.length" class="movie-detail__section">
                <CuratedRail
                    :items="similarItems"
                    title="Double bill"
                    eyebrow="If you liked this"
                    description="Features of a similar cut, also in rotation."
                    default-type="movie"
                />
            </section>
        </main>

        <div v-else-if="loading" class="movie-detail__loading" role="status">
            <div class="movie-detail__spinner" aria-hidden="true" />
            <span class="meta">Loading feature…</span>
        </div>

        <SiteFooter />

        <LmDialog v-model="trailerOpen" size="xl" title="Trailer" @close="closeTrailer">
            <div v-if="trailerKey" class="movie-detail__trailer">
                <iframe
                    :src="trailerEmbedUrl"
                    title="Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    loading="lazy"
                />
            </div>
            <p v-else class="meta">No trailer filed for this title.</p>
        </LmDialog>
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
import CuratedRail, { CuratedItem } from '../components/rails/CuratedRail.vue';
import LmDialog from '../components/primitives/Dialog.vue';
import { useMovies, MovieDetails, Cast, Crew } from '../composables/useMovies';
import { fetchTrailerKey, buildTrailerEmbed } from '../composables/useTrailer';
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

interface SimilarMovie {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    release_date: string;
    genre_ids: number[];
    adult: boolean;
}

export default defineComponent({
    name: 'Movie',
    components: {
        SiteHeader,
        SiteFooter,
        TitleMasthead,
        MetaBar,
        DropCapSynopsis,
        StatsBlock,
        CastGrid,
        ReviewsPullQuote,
        CuratedRail,
        LmDialog
    },
    setup() {
        const route = useRoute();
        const { fetchMovie, fetchMovieCredits, fetchSimilarMovies } = useMovies();

        const movie = ref<MovieDetails | null>(null);
        const cast = ref<Cast[]>([]);
        const crew = ref<Crew[]>([]);
        const similar = ref<SimilarMovie[]>([]);
        const reviews = ref<ReviewEntry[]>([]);
        const loading = ref(true);

        const trailerOpen = ref(false);
        const trailerKey = ref<string | null>(null);

        const genreNames = computed(() => (movie.value?.genres ?? []).map(g => g.name));
        const genreIds = computed(() => (movie.value?.genres ?? []).map(g => g.id));

        const director = computed(() => {
            const d = crew.value.find(c => c.job === 'Director');
            return d?.name ?? '';
        });

        const writer = computed(() => {
            const w = crew.value.find(c => ['Screenplay', 'Writer', 'Author'].includes(c.job));
            return w?.name ?? '';
        });

        const mastheadEyebrow = computed(() => {
            const g = genreNames.value[0];
            return g ? `${g} · Feature` : 'Feature';
        });

        const hasTrailer = computed(() => !!trailerKey.value);

        const trailerEmbedUrl = computed(() =>
            trailerKey.value
                ? buildTrailerEmbed(trailerKey.value, { muted: false, autoplay: true, controls: true })
                : ''
        );

        const runtimeLabel = computed(() => {
            const m = movie.value?.runtime ?? 0;
            if (!m) return '';
            const h = Math.floor(m / 60);
            const mm = m % 60;
            return h ? `${h}h ${mm}m` : `${mm}m`;
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

        const metaItems = computed<MetaEntry[]>(() => {
            if (!movie.value) return [];
            const country = movie.value.production_countries?.[0]?.name ?? '';
            const language = movie.value.spoken_languages?.[0]?.english_name
                ?? (movie.value.original_language ? movie.value.original_language.toUpperCase() : '');
            const items: MetaEntry[] = [
                { label: 'Released', value: formatDate(movie.value.release_date) },
                { label: 'Runtime', value: runtimeLabel.value },
                { label: 'Director', value: director.value },
                { label: 'Writer', value: writer.value },
                { label: 'Country', value: country },
                { label: 'Language', value: language },
                { label: 'Status', value: movie.value.status }
            ];
            if (movie.value.imdb_id) {
                items.push({
                    label: 'On IMDb',
                    value: movie.value.imdb_id,
                    href: `https://www.imdb.com/title/${movie.value.imdb_id}`
                });
            }
            items.push({
                label: 'On Letterboxd',
                value: 'Rate film',
                href: `https://letterboxd.com/tmdb/${movie.value.id}/`
            });
            return items;
        });

        const formatMoney = (n: number) => {
            if (!n) return '';
            if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
            if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
            if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
            return `$${n}`;
        };

        const statsItems = computed<StatEntry[]>(() => {
            if (!movie.value) return [];
            const profit = (movie.value.revenue ?? 0) - (movie.value.budget ?? 0);
            return [
                { label: 'Budget', value: formatMoney(movie.value.budget) },
                { label: 'Revenue', value: formatMoney(movie.value.revenue), accent: movie.value.revenue > 0 },
                {
                    label: 'Net',
                    value: profit !== 0 ? formatMoney(Math.abs(profit)) : '',
                    suffix: profit > 0 ? 'profit' : 'loss',
                    accent: profit > 0,
                    hint: profit > 0 ? 'Revenue minus budget' : (profit < 0 ? 'Revenue under budget' : '')
                },
                { label: 'Popularity', value: movie.value.popularity ? movie.value.popularity.toFixed(0) : '' },
                { label: 'Votes', value: movie.value.vote_count ? movie.value.vote_count.toLocaleString() : '' }
            ];
        });

        const similarItems = computed<CuratedItem[]>(() =>
            similar.value.slice(0, 14).map(m => ({
                id: m.id,
                title: m.title,
                posterPath: m.poster_path,
                rating: m.vote_average,
                releaseDate: m.release_date,
                genreIds: m.genre_ids,
                adult: m.adult,
                type: 'movie' as const
            }))
        );

        const playRoute = computed(() => ({
            name: 'StreamMovie',
            params: { id: String(route.params.id) }
        }));

        const playLabel = computed(() => {
            const id = String(route.params.id);
            return getLastWatchedMetaData(id) ? 'Resume' : 'Play';
        });

        const openTrailer = () => {
            if (trailerKey.value) trailerOpen.value = true;
        };
        const closeTrailer = () => {
            trailerOpen.value = false;
        };

        const fetchReviews = async (id: string) => {
            try {
                const res = await useAxios().get(`https://api.themoviedb.org/3/movie/${id}/reviews?language=en-US&page=1`);
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

        const loadMovie = async (id: string) => {
            loading.value = true;
            movie.value = null;
            cast.value = [];
            crew.value = [];
            similar.value = [];
            reviews.value = [];
            trailerKey.value = null;

            try {
                const [details, credits, sim, trailer] = await Promise.all([
                    fetchMovie(id),
                    fetchMovieCredits(id),
                    fetchSimilarMovies(id),
                    fetchTrailerKey(id, 'movie'),
                    fetchReviews(id)
                ]);

                movie.value = details.data.value ?? null;
                cast.value = credits.data.value?.cast ?? [];
                crew.value = credits.data.value?.crew ?? [];
                similar.value = (sim.data.value?.results ?? []) as SimilarMovie[];
                trailerKey.value = trailer ?? null;

                if (movie.value) {
                    document.title = `${movie.value.title} — Movieace`;
                    addViewedItem({
                        id: movie.value.id,
                        title: movie.value.title,
                        image: movie.value.poster_path,
                        rating: movie.value.vote_average,
                        categories: genreIds.value,
                        adult: movie.value.adult,
                        type: 'movie'
                    });
                }
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            primeGenres();
            loadMovie(String(route.params.id));
        });

        watch(
            () => route.params.id,
            newId => {
                if (newId && route.name === 'Movie') {
                    loadMovie(String(newId));
                }
            }
        );

        return {
            movie,
            cast,
            reviews,
            loading,
            genreNames,
            genreIds,
            mastheadEyebrow,
            hasTrailer,
            trailerOpen,
            trailerKey,
            trailerEmbedUrl,
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
.movie-detail {
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
        animation: movie-spin 0.8s linear infinite;
    }

    &__trailer {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #000;
        border-radius: var(--r-sm);
        overflow: hidden;

        iframe {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }
    }
}

@keyframes movie-spin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .movie-detail__spinner { animation: none; }
}
</style>
