<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <div class="masthead-wrapper">
                    <h1>Discover TV Shows</h1>
                    <p>Find your favorite tv shows and explore new ones</p>
                    <div class="mini-search">
                        <form>
                            <input type="text" placeholder="Search for a movie" />
                        </form>
                    </div>
                </div>
                <div class="genre-grid">
                    <span>All Movies</span>
                    <span>Action</span>
                    <span>Adventure</span>
                    <span>Animation</span>
                    <span>Comedy</span>
                    <span>Crime</span>
                    <span>Drama</span>
                    <span>Family</span>
                </div>
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
import { defineComponent } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import MovieItem from '../components/layout/MovieItem.vue';
export default defineComponent({
    name: 'TVShows',
    components: {
    BaseHeader,
    BaseFooter,
    MovieItem
}
});
</script>

<style scoped lang="scss">
@import url('../assets/styles/_masthead.scss');
</style>