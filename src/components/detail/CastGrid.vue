<template>
    <section v-if="visibleCasts.length" class="cast-grid" :aria-label="title">
        <header class="cast-grid__head">
            <p v-if="eyebrow" class="eyebrow cast-grid__eyebrow">{{ eyebrow }}</p>
            <h2 class="cast-grid__title display">{{ title }}</h2>
            <p v-if="description" class="cast-grid__desc">{{ description }}</p>
        </header>

        <ul class="cast-grid__list" role="list">
            <li v-for="c in visibleCasts" :key="c.id" class="cast-grid__item">
                <PersonCard
                    :id="c.id"
                    :name="c.name"
                    :profile-path="c.profile_path"
                    :role="c.character"
                    :department="c.known_for_department || ''"
                />
            </li>
        </ul>
    </section>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import PersonCard from '../cards/PersonCard.vue';
import type { Cast } from '../../composables/useMovies';

export default defineComponent({
    name: 'CastGrid',
    components: { PersonCard },
    props: {
        casts: { type: Array as PropType<Cast[]>, default: () => [] },
        title: { type: String, default: 'The Cast' },
        eyebrow: { type: String, default: 'Players' },
        description: { type: String, default: '' },
        limit: { type: Number, default: 12 }
    },
    setup(props) {
        const visibleCasts = computed(() => {
            const list = (props.casts || []).slice();
            list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            return list.slice(0, props.limit);
        });
        return { visibleCasts };
    }
});
</script>

<style lang="scss" scoped>
.cast-grid {
    &__head {
        margin-bottom: var(--s-6);
        max-width: 68ch;
    }

    &__eyebrow {
        color: var(--ember);
        margin: 0 0 var(--s-2);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.6rem, 3vw, 2.4rem);
        line-height: 1.05;
        letter-spacing: -0.01em;
        color: var(--bone-50);
        margin: 0;
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
    }

    &__desc {
        margin-top: var(--s-3);
        color: var(--bone-300);
        font-family: var(--font-ui);
        line-height: 1.55;
    }

    &__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
        gap: var(--s-6) var(--s-5);

        @media (min-width: 720px) {
            grid-template-columns: repeat(auto-fill, minmax(144px, 1fr));
        }
    }

    &__item {
        min-width: 0;
    }
}
</style>
