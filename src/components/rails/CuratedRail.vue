<template>
    <LmRail
        :title="title"
        :eyebrow="eyebrow"
        :description="description"
        :more-to="moreTo"
        density="poster"
    >
        <PosterCard
            v-for="item in items"
            :key="`curated-${item.type ?? defaultType}-${item.id}`"
            :id="item.id"
            :type="item.type ?? defaultType"
            :title="item.title"
            :poster-path="item.posterPath"
            :rating="item.rating"
            :release-date="item.releaseDate"
            :genre-ids="item.genreIds ?? []"
            :adult="item.adult ?? false"
        />
    </LmRail>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import LmRail from './Rail.vue';
import PosterCard from '../cards/PosterCard.vue';

export interface CuratedItem {
    id: number | string;
    title: string;
    posterPath: string | null;
    rating?: number;
    releaseDate?: string;
    genreIds?: number[];
    adult?: boolean;
    type?: 'movie' | 'tv';
}

export default defineComponent({
    name: 'CuratedRail',
    components: { LmRail, PosterCard },
    props: {
        items: { type: Array as PropType<CuratedItem[]>, required: true },
        title: { type: String, required: true },
        eyebrow: { type: String, default: '' },
        description: { type: String, default: '' },
        moreTo: { type: [String, Object], default: null },
        defaultType: { type: String as PropType<'movie' | 'tv'>, default: 'movie' }
    }
});
</script>

<style scoped>
/* no local styles — Rail + PosterCard handle presentation */
</style>
