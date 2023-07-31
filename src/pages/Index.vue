<template>
    <div>
        <BaseHeader />
        <section>
            <!-- Highlights Section -->
            <div class="container">
                <div class="highlights">
                    <div class="title-wrapper">
                        <h1>Highlights today</h1>
                        <p>Be sure not to miss todays highlight.</p>
                    </div>
                    <div class="button-tabs">
                        <button v-for="(button, idx) in highlightOptions" :key="idx" @click="handleUpdateHighlight(button)"
                            :class="button.toLowerCase() === currentHighlightTitle? 'active': ''">
                            {{ button }}
                        </button>
                    </div>
                </div>
                <div class="movie-grid">
                    <div class="movie-grid-panel">
                        <MovieItem v-for="item in currentHightLightDetails.data" :key="item.id" :title="item.title" :image="item.poster_path"
                            :rating="item.vote_average" :categories="item.genre_ids" />
                    </div>
                </div>
            </div>
            <!-- Featured Movie Section -->
            <div class="full-width">
                <FeaturedMovie :name="topHightlight?.title" :details="topHightlight?.overview" :image="topHightlight?.poster_path" :categories="topHightlight?.genre_ids" :rating="topHightlight?.vote_average" :date="topHightlight?.release_date"/>
            </div>
            <!-- New Releases Section -->
            <div class="container push-up">
                <div class="new-releases-title-wrapper">
                    <h1>New Shows</h1>
                    <p>Our most recently released tv shows for you to enjoy.</p>
                </div>
                <div class="new-releases-row">
                    <div class="column">
                        <MovieItem v-for="item in newShows" :key="item.id" :size="'small'" :title="item.name" :image="item.poster_path"
                            :rating="item.vote_average" :categories="item.genre_ids" />
                    </div>
                </div>
                <SearchWrapper />
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue'
import MovieItem from '../components/layout/MovieItem.vue'
import FeaturedMovie from '../components/layout/FeaturedMovie.vue';
import SearchWrapper from '../containers/SearchWrapper.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import { useHighlights ,highLightOptions,currentHighlightTitle, currentHightLightDetails} from "../composables/useHighlights"
import { useTvShows,newShows } from '../composables/useTvShows';
export default defineComponent({
    name: 'Index',
    components: {
        BaseHeader,
        MovieItem,
        FeaturedMovie,
        SearchWrapper,
        BaseFooter
    },
    setup() {
        const { fetchHightlights, handleUpdateHighlight } = useHighlights()
        const {fetchNewShows} = useTvShows()
        type highlightButtonType = "featured" | "popular" | "new"
        const highlightOptions = Object.keys(highLightOptions) as highlightButtonType[]
        const topHightlight = computed(() => {
            return highLightOptions['featured'].data[0]
        })
        onMounted(async () => {
             await Promise.all([
                fetchHightlights(),
                fetchNewShows()
            ])
        })
        watch(currentHighlightTitle, async () => {
            console.log(currentHighlightTitle.value)
            if(currentHightLightDetails.value.data.length === 0) {
                await fetchHightlights()
            }
        })

        return {
            highlightOptions,
            currentHighlightTitle,
            handleUpdateHighlight,
            currentHightLightDetails,
            topHightlight,
            newShows
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

    @media (max-width: 768px) {
        flex-direction: column;
    }

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

        @media (max-width: 300px) {
            flex-direction: column;
        }

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
            text-transform: capitalize;

            @media (max-width: 768px) {
                margin-left: .5rem;
            }

            @media (max-width: 400px) {
                margin-left: .25rem;
                font-size: .75rem;
                padding: .85rem 1.5rem;
            }

            @media (max-width: 300px) {
                margin-left: 0;
                margin-top: .5rem;
            }

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
        align-items: start;
        min-height: 300px;

        @media (max-width: 880px) {
            grid-template-columns: repeat(3, 1fr);
        }

        @media (max-width: 768px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 480px) {
            grid-template-columns: repeat(1, 1fr);
        }
    }

}

.full-width {
    width: 100%;
    height: 100%;
    margin-top: 5rem;
    padding-top: 0px;
    padding-bottom: 0px;
}

.push-up {
    margin-top: -2rem;
    .new-releases-title-wrapper {
        text-align: center;

        h1 {
            font-size: 6rem;
            line-height: 1rem;
            color: #fff;
            font-weight: 700;

            @media (max-width: 768px) {
                font-size: 4rem;
                line-height: 1;
            }

            @media (max-width: 480px) {
                font-size: 3rem;
                line-height: 1;
            }

            @media (max-width: 320px) {
                font-size: 2rem;
                line-height: 1;
            }
        }

        p {
            font-size: 1.5rem;
            font-weight: 400;
            color: #8ea9bd;
            margin-top: 1rem;

            @media (max-width: 768px) {
                font-size: 1rem;
            }
        }
    }

    .new-releases-row {
        margin-top: 4rem;

        .column {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 2rem;

            @media (max-width: 768px) {
                grid-template-columns: repeat(2, 1fr);
            }

            @media (max-width: 480px) {
                grid-template-columns: repeat(1, 1fr);
            }
        }
    }
}
</style>