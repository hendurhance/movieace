<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <Hero :title="'Discover TV Shows'" :subtitle="'Find your favorite tv shows and explore new ones'"
                    :search="true" :searchPlaceholder="'Search for a tv show'" @search="handleSearchTvShows" />
                <GenreLists :genres="genres" @genre-click="handleAddGenre" />
            </div>
            <div class="container">
                <div class="movie-meta-grid">
                    <div class="movie-item-grid">
                        <MovieItem v-for="item in discoveredShows" :key="item.id" :size="'large'" :title="item.name" :movie-id="item.id" type="tv"
                            :image="item.poster_path" :rating="item.vote_average" :categories="item.genre_ids" />
                    </div>
                    <div class="pagination" v-if="totalPage > 1">
                        <button @click="handleLoadMoreTvShows" type="button">Load More</button>
                    </div>
                </div>
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import MovieItem from '../components/layout/MovieItem.vue';
import Hero from '../containers/Hero.vue';
import GenreLists from '../components/layout/GenreLists.vue';
import { useGenres, Genre } from '../composables/useGenre';
import { TVShowType, useTvShows } from '../composables/useTvShows';
import debounce from 'lodash.debounce';

export default defineComponent({
    name: 'TVShows',
    components: {
        BaseHeader,
        BaseFooter,
        MovieItem,
        Hero,
        GenreLists
    },
    setup() {
        const genres = ref<Genre[]>([]);
        const { getGenres } = useGenres('tv');
        const pageNumber = ref<number>(1);
        const mainUrl = "https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=popularity.desc"
        const totalPage = ref<number>(1);
        const filteredGenres = ref<number[]>([]);
        const computedFetchUrl = computed(() => {
            if (filteredGenres.value.length > 0) {
                return `${mainUrl}&with_genres=${filteredGenres.value.join(',')}&page=${pageNumber.value}`
            }
            return `${mainUrl}&page=${pageNumber.value}`
        })

        const fetchGenres = async () => {
            const { data } = await getGenres();
            genres.value = data.value;
        };
        const discoveredShows = ref<TVShowType[]>([])
        const { fetchDiscoverShows } = useTvShows();
        const handleFetchDiscoverShows = async () => {
            const { data } = await fetchDiscoverShows(mainUrl);
            totalPage.value = data.value?.total_pages ?? 0
            discoveredShows.value = data.value?.results ?? [];
        }
        const handleLoadMoreTvShows = async () => {
            if (pageNumber.value < totalPage.value) {
                pageNumber.value += 1;
                const { data } = await fetchDiscoverShows(computedFetchUrl.value);
                discoveredShows.value = [...discoveredShows.value, ...data.value?.results ?? []];
            }
        }
        const handleAddGenre = async (genre: { id: number, name: string }) => {
            if (!filteredGenres.value.includes(genre.id)) {
                filteredGenres.value.push(genre.id)
            } else {
                filteredGenres.value = filteredGenres.value.filter((item) => item !== genre.id)
            }
            pageNumber.value = 1;
            const { data } = await fetchDiscoverShows(computedFetchUrl.value);
            totalPage.value = data.value?.total_pages ?? 0
            discoveredShows.value = data.value?.results ?? [];
        }
        const searchTvShows = async (searchUrl: string) => {
            const { data } = await fetchDiscoverShows(searchUrl);
            discoveredShows.value = pageNumber.value === 1 ? data.value?.results ?? [] : [...discoveredShows.value, ...data.value?.results ?? []];
        }

        const handleSearchTvShows = debounce(async (searchValue: string) => {
            if (searchValue === '') {
                pageNumber.value = 1;
                await handleFetchDiscoverShows();
                return
            }
            let searchQueryBefore: string = '';
            if (searchQueryBefore?.trim() === searchValue) return
            searchQueryBefore = searchValue
            const searchUrl = `https://api.themoviedb.org/3/search/tv?query=${searchValue}&language=en-US&page=${pageNumber.value}`
            await searchTvShows(searchUrl)
        }, 500)
        onMounted(() => {
            fetchGenres();
            handleFetchDiscoverShows();
        });
        return {
            genres,
            discoveredShows,
            handleLoadMoreTvShows,
            handleAddGenre,
            handleSearchTvShows,
            totalPage
        }
    }
});
</script>

<style scoped lang="scss">
@import url('../assets/styles/_masthead.scss');
</style>