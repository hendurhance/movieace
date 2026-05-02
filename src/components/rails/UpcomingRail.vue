<template>
    <LmRail
        :title="title"
        :eyebrow="eyebrow"
        :description="description"
        :more-to="moreTo"
        density="keyart"
    >
        <KeyartTile
            v-for="item in items"
            :key="`up-${item.type ?? defaultType}-${item.id}`"
            :id="item.id"
            :type="item.type ?? defaultType"
            :title="item.title"
            :backdrop-path="item.backdropPath"
            :poster-path="item.posterPath"
            :rating="item.rating ?? 0"
            :release-date="item.releaseDate ?? ''"
            :eyebrow="item.tag ?? airLabel(item)"
        />
    </LmRail>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import LmRail from './Rail.vue';
import KeyartTile from '../cards/KeyartTile.vue';

export interface UpcomingItem {
    id: number | string;
    title: string;
    backdropPath: string | null;
    posterPath?: string | null;
    rating?: number;
    releaseDate?: string;
    tag?: string;
    type?: 'movie' | 'tv';
}

export default defineComponent({
    name: 'UpcomingRail',
    components: { LmRail, KeyartTile },
    props: {
        items: { type: Array as PropType<UpcomingItem[]>, required: true },
        title: { type: String, default: 'Airing this week' },
        eyebrow: { type: String, default: 'On the schedule' },
        description: { type: String, default: '' },
        moreTo: { type: [String, Object], default: null },
        defaultType: { type: String as PropType<'movie' | 'tv'>, default: 'tv' }
    },
    setup() {
        const airLabel = (item: UpcomingItem) => {
            if (!item.releaseDate) return '';
            const d = new Date(item.releaseDate);
            const now = new Date();
            const diffDays = Math.round((d.getTime() - now.getTime()) / 86400000);
            if (diffDays <= 0) return 'Airing now';
            if (diffDays === 1) return 'Airs tomorrow';
            if (diffDays < 7) return `Airs in ${diffDays} days`;
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        };
        return { airLabel };
    }
});
</script>
