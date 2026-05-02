<template>
    <span class="lm-pill" :class="[`lm-pill--${tone}`, `lm-pill--${size}`]">
        <slot name="leading" />
        <slot />
    </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

type Tone = 'neutral' | 'ember' | 'gold' | 'danger' | 'success';
type Size = 'sm' | 'md';

export default defineComponent({
    name: 'LmPill',
    props: {
        tone: { type: String as PropType<Tone>, default: 'neutral' },
        size: { type: String as PropType<Size>, default: 'sm' }
    }
});
</script>

<style lang="scss" scoped>
.lm-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--s-1);
    font-family: var(--font-mono);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: var(--ls-wide);
    border-radius: var(--r-pill);
    white-space: nowrap;

    &--sm {
        padding: 0.2rem 0.6rem;
        font-size: 0.6875rem; // 11
    }

    &--md {
        padding: 0.35rem 0.8rem;
        font-size: var(--fs-xs);
    }

    &--neutral {
        color: var(--bone-200);
        background: var(--surface-tint);
        box-shadow: inset 0 0 0 1px var(--rule);
    }

    &--ember {
        color: var(--ember);
        background: rgba(255, 90, 31, 0.12);
        box-shadow: inset 0 0 0 1px rgba(255, 90, 31, 0.3);
    }

    &--gold {
        color: var(--gold-leaf);
        background: var(--gold-leaf-soft);
        box-shadow: inset 0 0 0 1px rgba(201, 167, 106, 0.3);
    }

    &--danger {
        color: var(--danger);
        background: rgba(201, 78, 61, 0.12);
        box-shadow: inset 0 0 0 1px rgba(201, 78, 61, 0.3);
    }

    &--success {
        color: var(--success);
        background: rgba(107, 163, 104, 0.12);
        box-shadow: inset 0 0 0 1px rgba(107, 163, 104, 0.3);
    }

    :slotted(svg) {
        width: 12px;
        height: 12px;
    }
}
</style>
