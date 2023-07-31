<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <Hero 
                    :title="'Discovered Results'"
                    :subtitle="'Find your favorite actors, movies, tv shows and explore new ones'"
                    :search="true" 
                    :searchPlaceholder="'Search for an actor, movie or tv show'"
                />
            </div>
            <div class="container">
                <SearchResults :type="'movie'" />
            </div>
            <div class="container">
                <SearchResults :type="'tv'" />
            </div>
            <div class="container">
                <CastWrapper :title="'Actor Results'" />
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import Hero from '../containers/Hero.vue';
import 'swiper/css';
import SearchResults from '../containers/SearchResults.vue';
import CastWrapper from '../containers/CastWrapper.vue';
export default defineComponent({
    name: 'Search',
    components: {
    BaseHeader,
    BaseFooter,
    Hero,
    SearchResults,
    CastWrapper
},
    setup() {
        return {

        }
    }
});
</script>

<style lang="scss" scoped>

</style>