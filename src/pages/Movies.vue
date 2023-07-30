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
                />
                <GenreLists :genres="genres" />
            </div>
            <div class="container">
                <div class="movie-meta-grid">
                    <div class="movie-item-grid">
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                    </div>
                    <div class="pagination">
                        <button>Load More</button>
                    </div>
                </div>
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import MovieItem from '../components/layout/MovieItem.vue';
import Hero from '../containers/Hero.vue';
import GenreLists from '../components/layout/GenreLists.vue';
import { useGenres, Genre } from '../composables/useGenre';
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
        const genres = ref<Genre[]>([]);
        const { getGenres } = useGenres('movie');

        const fetchGenres = async () => {
            const { data } = await getGenres();
            genres.value = data.value;
            console.log(genres.value); 
        };

        onMounted(fetchGenres); 
        return {
            genres
        }
    }
});
</script>

<style scoped lang="scss">
@import url('../assets/styles/_masthead.scss');
</style>