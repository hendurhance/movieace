<template>
    <LmRail
        :title="title"
        :eyebrow="eyebrow"
        :description="description"
        :more-to="moreTo"
        density="poster"
    >
        <template v-for="item in items" :key="`mx-${item.kind}-${item.id}`">
            <PersonCard
                v-if="item.kind === 'person'"
                :id="item.id"
                :name="item.name"
                :profile-path="item.profilePath ?? null"
                :role="item.role ?? ''"
                :department="item.department ?? ''"
            />
            <PosterCard
                v-else
                :id="item.id"
                :type="item.kind"
                :title="item.title"
                :poster-path="item.posterPath"
                :rating="item.rating ?? 0"
                :release-date="item.releaseDate ?? ''"
                :genre-ids="item.genreIds ?? []"
                :adult="item.adult ?? false"
            />
        </template>
    </LmRail>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import LmRail from './Rail.vue';
import PosterCard from '../cards/PosterCard.vue';
import PersonCard from '../cards/PersonCard.vue';

export type MixedItem =
    | {
          kind: 'movie' | 'tv';
          id: number | string;
          title: string;
          posterPath: string | null;
          rating?: number;
          releaseDate?: string;
          genreIds?: number[];
          adult?: boolean;
      }
    | {
          kind: 'person';
          id: number | string;
          name: string;
          profilePath?: string | null;
          role?: string;
          department?: string;
      };

export default defineComponent({
    name: 'MixedRail',
    components: { LmRail, PosterCard, PersonCard },
    props: {
        items: { type: Array as PropType<MixedItem[]>, required: true },
        title: { type: String, required: true },
        eyebrow: { type: String, default: '' },
        description: { type: String, default: '' },
        moreTo: { type: [String, Object], default: null }
    }
});
</script>
