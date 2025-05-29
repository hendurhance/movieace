<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <Hero :title="'Discover Actors'" :subtitle="'Find your favorite actors and explore new ones'" 
                    :search="true" :searchPlaceholder="'Search for an actor'" @search="handleSearchActors" />
            </div>

            <!-- Results Section -->
            <div class="container">
                <ResultsHeader 
                    :title="getResultsTitle()" 
                    :count="discoveredActors.length" 
                    item-type="actors"
                    :sort-value="sortBy"
                    :sort-options="actorSortOptions" 
                    @sort-change="handleSortChange" 
                />

                <!-- Loading State -->
                <LoadingState v-if="isLoading" message="Loading amazing actors..." size="large" />

                <!-- Empty State -->
                <EmptyState v-else-if="discoveredActors.length === 0" 
                    title="No actors found"
                    description="Try adjusting your search terms" 
                    icon="🎭" 
                    @reset="handleResetFilters" 
                />

                <!-- Actors Grid -->
                <div v-else class="actor-meta-grid">
                    <div class="actor-item-grid">
                        <ActorItem v-for="item in discoveredActors" 
                            :key="item.id" 
                            :name="item.name" 
                            :image="item.profile_path" 
                            :popularity="item.popularity" 
                            :actorId="item.id" 
                            :known-for="item.known_for_department"
                        />
                    </div>

                    <!-- Load More Button -->
                    <LoadMoreButton 
                        :current-page="pageNumber" 
                        :total-pages="totalPage" 
                        :is-loading="isLoadingMore"
                        item-type="Actors" 
                        @load-more="handleLoadMoreActors" 
                    />
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
import ActorItem from '../components/layout/ActorItem.vue';
import Hero from '../containers/Hero.vue';
import ResultsHeader from '../components/layout/ResultsHeader.vue';
import LoadingState from '../containers/LoadingState.vue';
import EmptyState from '../containers/EmptyState.vue';
import LoadMoreButton from '../components/layout/LoadMoreButton.vue';
import { useActor, Actor } from '../composables/useActor';
import debounce from 'lodash.debounce';

export default defineComponent({
    name: 'Actors',
    components: {
        BaseHeader,
        BaseFooter,
        ActorItem,
        Hero,
        ResultsHeader,
        LoadingState,
        EmptyState,
        LoadMoreButton
    },
    setup() {
        const pageNumber = ref<number>(1);
        const sortBy = ref<string>('popularity.desc');
        const totalPage = ref<number>(1);
        const isLoading = ref<boolean>(false);
        const isLoadingMore = ref<boolean>(false);
        const currentSearchTerm = ref<string>('');

        const actorSortOptions = [
            { value: 'popularity.desc', label: 'Most Popular' },
            { value: 'popularity.asc', label: 'Least Popular' },
            { value: 'name.asc', label: 'A-Z' },
            { value: 'name.desc', label: 'Z-A' }
        ];

        const mainUrl = computed(() => {
            const baseUrl = "https://api.themoviedb.org/3/person/popular";
            return `${baseUrl}?language=en-US`;
        });

        const computedFetchUrl = computed(() => {
            return `${mainUrl.value}&page=${pageNumber.value}`;
        });

        const discoveredActors = ref<Actor[]>([]);
        const { fetchTopActors } = useActor();

        const handleFetchTopActors = async () => {
            isLoading.value = true;
            try {
                const { data } = await fetchTopActors(mainUrl.value);
                totalPage.value = data.value?.total_pages ?? 0;
                discoveredActors.value = data.value?.results ?? [];
            } finally {
                isLoading.value = false;
            }
        };

        const handleLoadMoreActors = async () => {
            if (pageNumber.value < totalPage.value) {
                isLoadingMore.value = true;
                pageNumber.value += 1;
                try {
                    const url = currentSearchTerm.value ?
                        `https://api.themoviedb.org/3/search/person?query=${currentSearchTerm.value}&language=en-US&page=${pageNumber.value}` :
                        computedFetchUrl.value;
                    const { data } = await fetchTopActors(url);
                    discoveredActors.value = [...discoveredActors.value, ...data.value?.results ?? []];
                } finally {
                    isLoadingMore.value = false;
                }
            }
        };

        const handleSortChange = async (newSortValue: string) => {
            sortBy.value = newSortValue;
            pageNumber.value = 1;
            if (currentSearchTerm.value) {
                currentSearchTerm.value = '';
            }
            await handleFetchTopActors();
        };

        const handleResetFilters = async () => {
            currentSearchTerm.value = '';
            sortBy.value = 'popularity.desc';
            pageNumber.value = 1;
            await handleFetchTopActors();
        };

        const searchActors = async (searchUrl: string) => {
            isLoading.value = true;
            try {
                const { data } = await fetchTopActors(searchUrl);
                totalPage.value = data.value?.total_pages ?? 0;
                discoveredActors.value = data.value?.results ?? [];
            } finally {
                isLoading.value = false;
            }
        };

        const handleSearchActors = debounce(async (searchValue: string) => {
            pageNumber.value = 1;

            if (searchValue === '') {
                currentSearchTerm.value = '';
                await handleFetchTopActors();
                return;
            }

            currentSearchTerm.value = searchValue;
            const searchUrl = `https://api.themoviedb.org/3/search/person?query=${searchValue}&language=en-US&page=1`;
            await searchActors(searchUrl);
        }, 500);

        const getResultsTitle = (): string => {
            if (currentSearchTerm.value) {
                return `Search Results for "${currentSearchTerm.value}"`;
            }
            return 'Popular Actors';
        };

        onMounted(() => {
            handleFetchTopActors();
        });

        return {
            discoveredActors,
            totalPage,
            pageNumber,
            sortBy,
            isLoading,
            isLoadingMore,
            actorSortOptions,
            handleLoadMoreActors,
            handleSearchActors,
            handleSortChange,
            handleResetFilters,
            getResultsTitle
        };
    }
});
</script>

<style scoped lang="scss">
.actor-meta-grid {
    margin-top: 2rem;
}

.actor-item-grid {
    align-items: start;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }

    @media (max-width: 992px) {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1.5rem;
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1.25rem;
    }

    @media (max-width: 576px) {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
    }

    @media (max-width: 480px) {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }
}

@media (max-width: 576px) {
    .container {
        padding: 0 1rem;
    }
}
</style>