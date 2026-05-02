<template>
    <span class="lm-tooltip" :class="[`lm-tooltip--${placement}`]">
        <slot />
        <span v-if="label" class="lm-tooltip__bubble" role="tooltip">
            {{ label }}
        </span>
    </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'LmTooltip',
    props: {
        label: { type: String, default: '' },
        placement: {
            type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
            default: 'top'
        }
    }
});
</script>

<style lang="scss" scoped>
.lm-tooltip {
    position: relative;
    display: inline-flex;

    &__bubble {
        position: absolute;
        z-index: var(--z-drawer);
        padding: 0.4rem 0.75rem;
        background: var(--ink-700);
        color: var(--bone-50);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        text-transform: uppercase;
        letter-spacing: var(--ls-wide);
        white-space: nowrap;
        border-radius: var(--r-sm);
        box-shadow: var(--shadow-md);
        pointer-events: none;
        opacity: 0;
        transform: translate(var(--tt-x, -50%), var(--tt-y, -4px));
        transition:
            opacity var(--dur-fast) var(--ease-out) 80ms,
            transform var(--dur-fast) var(--ease-out) 80ms;
    }

    &:hover > &__bubble,
    &:focus-within > &__bubble {
        opacity: 1;
        --tt-y: -8px;
    }

    &--top > &__bubble {
        bottom: calc(100% + 6px);
        left: 50%;
        --tt-x: -50%;
    }

    &--bottom > &__bubble {
        top: calc(100% + 6px);
        left: 50%;
        --tt-x: -50%;
        --tt-y: 4px;
        &:hover, &:focus-within { --tt-y: 8px; }
    }

    &--left > &__bubble {
        right: calc(100% + 6px);
        top: 50%;
        --tt-x: -4px;
        --tt-y: -50%;
    }

    &--right > &__bubble {
        left: calc(100% + 6px);
        top: 50%;
        --tt-x: 4px;
        --tt-y: -50%;
    }
}
</style>
