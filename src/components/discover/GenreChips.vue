<template>
    <div class="genre-chips" :class="{ 'genre-chips--loading': loading }">
        <header v-if="label || $slots.header" class="genre-chips__head">
            <slot name="header">
                <p class="eyebrow genre-chips__label">{{ label }}</p>
            </slot>

            <button
                v-if="showClear && modelValue.length"
                type="button"
                class="genre-chips__clear"
                @click="clearAll"
                aria-label="Clear selected genres"
            >
                Clear
                <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/>
                </svg>
            </button>
        </header>

        <ul class="genre-chips__list" role="list">
            <li v-for="g in genres" :key="g.id">
                <LmChip
                    :active="isActive(g.id)"
                    size="sm"
                    @toggle="toggle(g.id)"
                >
                    {{ g.name }}
                </LmChip>
            </li>
        </ul>

        <p v-if="!genres.length && !loading" class="genre-chips__empty meta">
            No genres filed yet.
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import LmChip from '../primitives/Chip.vue';
import type { Genre } from '../../composables/useGenreLookup';

export default defineComponent({
    name: 'GenreChips',
    components: { LmChip },
    props: {
        genres: { type: Array as PropType<Genre[]>, required: true },
        modelValue: { type: Array as PropType<number[]>, default: () => [] },
        label: { type: String, default: 'Genres' },
        showClear: { type: Boolean, default: true },
        loading: { type: Boolean, default: false }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const isActive = (id: number) => props.modelValue.includes(id);

        const toggle = (id: number) => {
            const next = props.modelValue.includes(id)
                ? props.modelValue.filter(g => g !== id)
                : [...props.modelValue, id];
            emit('update:modelValue', next);
        };

        const clearAll = () => emit('update:modelValue', []);

        return { isActive, toggle, clearAll };
    }
});
</script>

<style lang="scss" scoped>
.genre-chips {
    display: grid;
    gap: var(--s-3);

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-3);
    }

    &__label {
        color: var(--bone-400);
        margin: 0;
    }

    &__clear {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--bone-300);
        padding: 0.25rem 0.65rem;
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        transition:
            color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out);

        &:hover, &:focus-visible {
            color: var(--ember);
            border-color: currentColor;
        }
    }

    &__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-2);
    }

    &__empty {
        color: var(--bone-400);
        font-style: italic;
    }

    &--loading {
        opacity: 0.5;
        pointer-events: none;
    }
}
</style>
