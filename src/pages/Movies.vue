<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <Hero 
                    :title="'Discover Movies'" 
                    :subtitle="'Find your favorite movies and explore new ones'" 
                    :search="true" 
                    :searchPlaceholder="'Search for a movie'" 
                    @search="handleSearchMovies"
                />
                <GenreLists :genres="genresFetched" @genre-click="handleAddGenre" />
            </div>
            <div class="container">
                <div class="movie-meta-grid">
                    <div class="movie-item-grid">
                        <MovieItem v-for="item in discoveredMovies" :key="item.id" :size="'small'" :title="item.title"
                            :image="item.poster_path" :rating="item.vote_average" :categories="item.genre_ids" />
                    </div>
                    <div class="pagination" v-if="totalPage > 1">
                        <button @click="handleLoadMoreMovies" tyep="button">Load More</button>
                    </div>
                </div>
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import MovieItem from '../components/layout/MovieItem.vue';
import Hero from '../containers/Hero.vue';
import GenreLists from '../components/layout/GenreLists.vue';
import { useGenres, Genre } from '../composables/useGenre';
import {Movie} from '../composables/useHighlights'
import { useMovies } from '../composables/useMovies';
import debounce from 'lodash.debounce';

export default defineComponent({
    name: 'Movies',
    components: {
        BaseHeader,
        BaseFooter,
        MovieItem,
        Hero,
        GenreLists
    },
    setup() {
        const pageNumber = ref<number>(1);
        const mainUrl = "https://api.themoviedb.org/3/discover/movie?language=en-US&sort_by=popularity.desc"
        const totalPage = ref<number>(1);
        const filteredGenres = ref<number[]>([]);
        const computedFetchUrl = computed(() => {
            if (filteredGenres.value.length > 0) {
                return `${mainUrl}&with_genres=${filteredGenres.value.join(',')}&page=${pageNumber.value}`
            }
            return `${mainUrl}&page=${pageNumber.value}`
        })
        const genresFetched = ref<Genre[]>([]);
        const { getGenres } = useGenres('movie');

        const fetchGenres = async () => {
            const { data } = await getGenres();
            genresFetched.value = data.value;
        };
        const discoveredMovies = ref<Movie[]>([])
        const { fetchDiscoverMovies } = useMovies();
        const handleFetchDiscoverMovies = async () => {
            const { data } = await fetchDiscoverMovies(mainUrl);
            totalPage.value = data.value?.total_pages ?? 0
            discoveredMovies.value = data.value?.results ?? [];
        }
        const handleLoadMoreMovies = async () => {
            if (pageNumber.value < totalPage.value) {
                pageNumber.value += 1;
                const { data } = await fetchDiscoverMovies(computedFetchUrl.value);
                discoveredMovies.value = [...discoveredMovies.value, ...data.value?.results ?? []];
            }
        }
        const handleAddGenre = async (genre: { id: number, name: string }) => {
            if (!filteredGenres.value.includes(genre.id)) {
                filteredGenres.value.push(genre.id)
            } else {
                filteredGenres.value = filteredGenres.value.filter((item) => item !== genre.id)
            }
            pageNumber.value = 1;
            const { data } = await fetchDiscoverMovies(computedFetchUrl.value);
            totalPage.value = data.value?.total_pages ?? 0
            discoveredMovies.value = data.value?.results ?? [];
        }
        const searchMovies = async (searchUrl: string) => {
            const { data } = await fetchDiscoverMovies(searchUrl);
            discoveredMovies.value = pageNumber.value === 1 ? data.value?.results ?? [] : [...discoveredMovies.value, ...data.value?.results ?? []];
        }

        const handleSearchMovies = debounce(async (searchValue: string) => {
            if (searchValue === '') {
                pageNumber.value = 1;
                await handleFetchDiscoverMovies();
                return
            }
            let searchQueryBefore: string = '';
            if (searchQueryBefore?.trim() === searchValue) return
            searchQueryBefore = searchValue
            const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${searchValue}&language=en-US&page=${pageNumber.value}`
            await searchMovies(searchUrl)
        }, 500)
        onMounted(() => {
            fetchGenres();
            handleFetchDiscoverMovies();
        });
        return {
            genresFetched,
            discoveredMovies,
            handleFetchDiscoverMovies,
            handleLoadMoreMovies,
            handleAddGenre,
            handleSearchMovies,
            totalPage
        }
    }
});
</script>

<style scoped lang="scss">
@import url('../assets/styles/_masthead.scss');
</style>