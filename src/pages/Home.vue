<template>
    <div class="home">
        <SiteHeader />

        <main id="main" class="home__main" role="main">
            <BillboardHero
                v-if="hero"
                :id="hero.id"
                type="movie"
                :title="hero.title"
                :tagline="heroTagline"
                :overview="hero.overview"
                :backdrop-path="hero.backdrop_path"
                :poster-path="hero.poster_path"
                :rating="hero.vote_average"
                :release-date="hero.release_date"
                :genre-ids="hero.genre_ids"
                :adult="hero.adult"
                eyebrow="This week’s feature"
            />

            <ContinueShelf class="home__section" />

            <TopTenRail
                v-if="topTenItems.length"
                class="home__section"
                :items="topTenItems"
                title="Top 10 Today"
                eyebrow="The Marquee"
                description="What the house is watching right now."
                :more-to="{ name: 'Movies' }"
            />

            <SpotlightModule
                v-if="spotlight"
                class="home__section"
                :id="spotlight.id"
                type="movie"
                :title="spotlight.title"
                :overview="spotlight.overview"
                :backdrop-path="spotlight.backdrop_path"
                :poster-path="spotlight.poster_path"
                :rating="spotlight.vote_average"
                :release-date="spotlight.release_date"
                eyebrow="The Feature"
                :pull-quote="spotlightQuote"
                attribution="Movieace Review"
            />

            <CuratedRail
                v-if="nowPlayingItems.length"
                class="home__section"
                :items="nowPlayingItems"
                title="New to the marquee"
                eyebrow="Now Playing"
                description="Theatrical releases currently in rotation."
                :more-to="{ name: 'Movies' }"
            />

            <UpcomingRail
                v-if="upcomingItems.length"
                class="home__section"
                :items="upcomingItems"
                title="Airing this week"
                eyebrow="On the Schedule"
                description="New episodes from shows in season."
                default-type="tv"
                :more-to="{ name: 'TVShows' }"
            />

            <CuratedRail
                v-if="seriesItems.length"
                class="home__section"
                :items="seriesItems"
                title="Series in rotation"
                eyebrow="Trending in Series"
                default-type="tv"
                :more-to="{ name: 'TVShows' }"
            />

            <CuratedRail
                v-if="pantheonItems.length"
                class="home__section"
                :items="pantheonItems"
                title="The Pantheon"
                eyebrow="Reader Favorites"
                description="Titles our audience returns to, time after time."
                :more-to="{ name: 'Movies' }"
            />
        </main>

        <SiteFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import SiteHeader from '../components/navigation/SiteHeader.vue';
import SiteFooter from '../components/navigation/SiteFooter.vue';
import BillboardHero from '../components/hero/BillboardHero.vue';
import SpotlightModule from '../components/hero/SpotlightModule.vue';
import ContinueShelf from '../components/rails/ContinueShelf.vue';
import TopTenRail from '../components/rails/TopTenRail.vue';
import CuratedRail from '../components/rails/CuratedRail.vue';
import UpcomingRail from '../components/rails/UpcomingRail.vue';
import useAxios from '../composables/useAxios';
import { useHighlights, highLightOptions } from '../composables/useHighlights';
import { useTvShows, newShows } from '../composables/useTvShows';
import type { TVShowType } from '../composables/useTvShows';
import { primeGenres } from '../composables/useGenreLookup';

interface UpcomingTvResponse {
    results: TVShowType[];
}

export default defineComponent({
    name: 'Home',
    components: {
        SiteHeader,
        SiteFooter,
        BillboardHero,
        SpotlightModule,
        ContinueShelf,
        TopTenRail,
        CuratedRail,
        UpcomingRail
    },
    setup() {
        const { fetchAllHighlights } = useHighlights();
        const { fetchNewShows } = useTvShows();

        const upcomingTv = ref<TVShowType[]>([]);

        const hero = computed(() => highLightOptions.featured.data?.[0] ?? null);

        const spotlight = computed(() => {
            const pool = highLightOptions.featured.data ?? [];
            return pool[1] ?? pool[0] ?? null;
        });

        const heroTagline = computed(() => {
            const genres = hero.value?.genre_ids?.slice(0, 2).join(' · ');
            return genres ? '' : '';
        });

        const spotlightQuote = computed(() => {
            const overview = spotlight.value?.overview ?? '';
            if (!overview) return '';
            const firstSentence = overview.split(/(?<=[.!?])\s/)[0] ?? overview;
            return firstSentence.length > 220
                ? `${firstSentence.slice(0, 217).trim()}…`
                : firstSentence;
        });

        const topTenItems = computed(() =>
            (highLightOptions.popular.data ?? []).slice(0, 10).map(m => ({
                id: m.id,
                title: m.title,
                posterPath: m.poster_path,
                type: 'movie' as const
            }))
        );

        const nowPlayingItems = computed(() =>
            (highLightOptions.new.data ?? []).slice(0, 18).map(m => ({
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

        const pantheonItems = computed(() =>
            (highLightOptions.popular.data ?? []).slice(10, 28).map(m => ({
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

        const seriesItems = computed(() =>
            (newShows.value ?? []).slice(0, 18).map(s => ({
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

        const upcomingItems = computed(() =>
            (upcomingTv.value ?? []).slice(0, 14).map(s => ({
                id: s.id,
                title: s.name,
                backdropPath: s.backdrop_path,
                posterPath: s.poster_path,
                rating: s.vote_average,
                releaseDate: s.release_date,
                type: 'tv' as const
            }))
        );

        const fetchUpcomingTv = async () => {
            try {
                const res = await useAxios().get('https://api.themoviedb.org/3/tv/on_the_air?language=en-US&page=1');
                const data = res.data as UpcomingTvResponse;
                upcomingTv.value = data.results ?? [];
            } catch {
                upcomingTv.value = [];
            }
        };

        onMounted(async () => {
            document.title = 'Movieace — A Cinema Periodical';
            primeGenres();
            await Promise.all([
                fetchAllHighlights(),
                fetchNewShows(),
                fetchUpcomingTv()
            ]);
        });

        return {
            hero,
            spotlight,
            heroTagline,
            spotlightQuote,
            topTenItems,
            nowPlayingItems,
            pantheonItems,
            seriesItems,
            upcomingItems
        };
    }
});
</script>

<style lang="scss" scoped>
.home {
    position: relative;
    min-height: 100dvh;
    background: var(--ink-900);
    color: var(--bone-50);

    &__main {
        position: relative;
    }

    &__section {
        margin-top: clamp(var(--s-8), 8vw, var(--s-10));

        &:last-of-type {
            margin-bottom: clamp(var(--s-8), 8vw, var(--s-10));
        }
    }
}
</style>
