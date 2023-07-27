<template>
    <div>
        <AppHeader />
        <section>
            <div class="container">
                <div class="highlights">
                    <div class="title-wrapper">
                        <h1>Highlights today</h1>
                        <p>Be sure not to miss todays highlight.</p>
                    </div>
                    <div class="button-tabs">
                        <button v-for="button in highlightsButtons" :key="button.name"
                            :class="{ 'active': button.current }">
                            {{ button.name }}
                        </button>
                    </div>
                </div>
                <div class="movie-grid">
                    <div class="movie-grid-panel">
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                        <MovieItem />
                    </div>
                </div>
            </div>
            <div class="full-width">
                <FeaturedMovie />
            </div>
            <div class="container push-up">
                <div class="new-releases-title-wrapper">
                    <h1>New Releases</h1>
                    <p>Our most recently released movies & tv shows.</p>
                </div>
                <div class="new-releases-row">
                    <div class="right-column">
                        <div class="item-block">
                            <MovieItem />
                        </div>
                    </div>
                    <div class="column">
                        <div class="movie-list-item-small">
                            <a href=""></a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppHeader from '../components/layout/AppHeader.vue'
import MovieItem from '../components/layout/MovieItem.vue'
import FeaturedMovie from '../components/layout/FeaturedMovie.vue';
import { highlightsButtons } from '../utils/button-layout.ts'

export default defineComponent({
    name: 'Index',
    components: {
        AppHeader,
        MovieItem,
        FeaturedMovie,
    },
    setup() {
        return {
            highlightsButtons,
        }
    }
});
</script>

<style lang="scss" scoped>
.highlights {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .title-wrapper {
        text-align: left;

        h1 {
            font-size: 3rem;
            color: #fff;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        p {
            font-size: 1.5rem;
            font-weight: 400;
            color: #8ea9bd;
            margin-top: 1rem;
        }
    }

    .button-tabs {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 2rem;

        button {
            margin-left: 1rem;
            padding: 1rem 2rem;
            border-radius: 3rem;
            border: 0;
            font-size: 1rem;
            font-weight: 400;
            color: #3b4b57;
            background-color: #0c2738;
            cursor: pointer;

            &.active {
                background-color: #fff;
                color: #3b4b57;
            }
        }
    }
}

.movie-grid {
    margin-top: 2rem;

    .movie-grid-panel {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 2rem;
    }

}

.full-width {
    width: 100%;
    height: 100%;
    margin-top: 5rem;
    padding-top: 0px;
    padding-bottom: 0px;
}

.push-up{
    margin-top: -5rem;

    .new-releases-title-wrapper{
        text-align: center;

        h1 {
            font-size: 6rem;
            line-height: 1rem;
            color: #fff;
            font-weight: 700;
        }

        p {
            font-size: 1.5rem;
            font-weight: 400;
            color: #8ea9bd;
            margin-top: 1rem;
        }
    }
}
</style>