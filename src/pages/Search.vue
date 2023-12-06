<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <Hero :title="'Discovered Results'"
                    :subtitle="'Find your favorite actors, movies, tv shows and explore new ones'" :search="true" :default-value="currentSearchParam as string"
                    :searchPlaceholder="'Search for an actor, movie or tv show'" @search="handleSearch" />
            </div>

            <div class="container">
                <SearchResults :type="'movie'" :data="discoveredMovies" />
            </div>
            <div class="container">
                <SearchResults :type="'tv'" :data="discoveredTv" />
            </div>
            <div class="container">
                <CastWrapper :title="'Actor Results'" :casts="discoveredPeople" />
            </div>
            <div class="pagination" v-if="reqMetaData.total_pages > 1">
                <button @click="handleLoadMoreMovies" tyep="button">Load More</button>
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import Hero from '../containers/Hero.vue';
import 'swiper/css';
import SearchResults from '../containers/SearchResults.vue';
import CastWrapper from '../containers/CastWrapper.vue';
import { useRoute, useRouter } from 'vue-router';
import { useSearch, discoveredMovies, discoveredTv, discoveredPeople, reqMetaData } from '../composables/useSearch';


const route = useRoute();
const router = useRouter();
const { fetchSearchResults } = useSearch();
const handleSearch = (searchQuery: string) => {
    router.push({ query: { search: searchQuery } });
};

const currentSearchParam = ref(route.query.search);
watch(() => route.query.search, (query) => {
    currentSearchParam.value = query as string;
    fetchSearchResults(currentSearchParam.value);
});
onMounted(() => {
    window.scrollTo(0, 0);
    currentSearchParam.value = route.query.search as string;
    fetchSearchResults(currentSearchParam.value);
});
const handleLoadMoreMovies = async () => {
    if (reqMetaData.value.page < reqMetaData.value.total_pages) {
        fetchSearchResults(route.query.search as string, reqMetaData.value.page + 1);
    }
}
</script>

<style lang="scss" scoped>
.pagination {
        display: flex;
        align-items: start;
        justify-content: center;
        button {
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            background-color: #f1b722;
            color: #000;
            border: 0;
            font-size: 1rem;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            &:hover {
                background-color: #f1b722;
                color: #fff;
            }
        }
    }
</style>