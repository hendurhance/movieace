<template>
    <component
        :is="tag"
        :type="isButton ? 'button' : undefined"
        :aria-pressed="toggleable ? active : undefined"
        class="lm-chip"
        :class="[{ 'is-active': active, 'is-disabled': disabled }, `lm-chip--${size}`]"
        :disabled="isButton ? disabled : undefined"
        @click="handleClick"
    >
        <slot name="leading" />
        <span class="lm-chip__label"><slot /></span>
        <slot name="trailing" />
    </component>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'LmChip',
    props: {
        active: { type: Boolean, default: false },
        toggleable: { type: Boolean, default: true },
        disabled: { type: Boolean, default: false },
        size: { type: String as PropType<'sm' | 'md'>, default: 'md' }
    },
    emits: ['click', 'toggle'],
    setup(props, { emit }) {
        const tag = computed(() => (props.toggleable ? 'button' : 'span'));
        const isButton = computed(() => tag.value === 'button');

        const handleClick = (e: MouseEvent) => {
            if (props.disabled) return;
            emit('click', e);
            if (props.toggleable) emit('toggle', !props.active);
        };

        return { tag, isButton, handleClick };
    }
});
</script>

<style lang="scss" scoped>
.lm-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    font-family: var(--font-ui);
    font-weight: 500;
    color: var(--bone-200);
    background: var(--surface-tint);
    border: 1px solid var(--rule);
    border-radius: var(--r-pill);
    cursor: pointer;
    transition:
        background-color var(--dur-fast) var(--ease-out),
        color var(--dur-fast) var(--ease-out),
        border-color var(--dur-fast) var(--ease-out);

    &--sm {
        padding: 0.25rem 0.75rem;
        font-size: var(--fs-xs);
        min-height: 28px;
    }

    &--md {
        padding: 0.5rem 1rem;
        font-size: var(--fs-sm);
        min-height: 36px;
    }

    &:not(.is-disabled):hover {
        color: var(--bone-50);
        background: var(--surface-tint-hover);
        border-color: var(--rule-strong);
    }

    &.is-active {
        color: var(--ink-900);
        background: var(--bone-50);
        border-color: var(--bone-50);

        &:hover {
            background: var(--bone-100);
            border-color: var(--bone-100);
        }
    }

    &.is-disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    :slotted(svg) {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
    }
}
</style>
