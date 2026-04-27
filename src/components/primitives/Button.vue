<template>
    <component
        :is="tag"
        :to="to"
        :href="href"
        :type="isButton ? type : undefined"
        :disabled="isButton ? disabled : undefined"
        :aria-busy="loading || undefined"
        class="lm-btn"
        :class="[
            `lm-btn--${variant}`,
            `lm-btn--${size}`,
            { 'lm-btn--icon-only': iconOnly, 'lm-btn--block': block, 'is-loading': loading }
        ]"
        @click="handleClick"
    >
        <span v-if="loading" class="lm-btn__spinner" aria-hidden="true" />
        <span class="lm-btn__content" :class="{ 'is-hidden': loading }">
            <slot name="leading" />
            <slot />
            <slot name="trailing" />
        </span>
    </component>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export default defineComponent({
    name: 'LmButton',
    props: {
        variant: { type: String as PropType<Variant>, default: 'primary' },
        size: { type: String as PropType<Size>, default: 'md' },
        type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
        to: { type: [String, Object], default: null },
        href: { type: String, default: null },
        disabled: { type: Boolean, default: false },
        loading: { type: Boolean, default: false },
        iconOnly: { type: Boolean, default: false },
        block: { type: Boolean, default: false }
    },
    emits: ['click'],
    setup(props, { emit }) {
        const tag = computed(() => {
            if (props.to) return 'router-link';
            if (props.href) return 'a';
            return 'button';
        });

        const isButton = computed(() => tag.value === 'button');

        const handleClick = (e: MouseEvent) => {
            if (props.disabled || props.loading) {
                e.preventDefault();
                return;
            }
            emit('click', e);
        };

        return { tag, isButton, handleClick };
    }
});
</script>

<style lang="scss" scoped>
.lm-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-2);
    font-family: var(--font-ui);
    font-weight: 600;
    letter-spacing: var(--ls-snug);
    text-decoration: none;
    white-space: nowrap;
    border-radius: var(--r-pill);
    cursor: pointer;
    transition:
        background-color var(--dur-fast) var(--ease-out),
        color var(--dur-fast) var(--ease-out),
        border-color var(--dur-fast) var(--ease-out),
        transform var(--dur-fast) var(--ease-out),
        box-shadow var(--dur-base) var(--ease-out);

    &:disabled,
    &[aria-disabled='true'] {
        opacity: 0.45;
        cursor: not-allowed;
    }

    &:not(:disabled):active {
        transform: translateY(1px) scale(0.98);
    }

    // ── Sizes ────────────────────────────────────────────────────────────
    &--sm {
        padding: 0.5rem 1rem;
        font-size: var(--fs-sm);
        min-height: 36px;
    }
    &--md {
        padding: 0.75rem 1.5rem;
        font-size: var(--fs-base);
        min-height: 44px;
    }
    &--lg {
        padding: 1rem 2rem;
        font-size: var(--fs-base);
        min-height: 52px;
    }

    &--icon-only {
        padding: 0;
        aspect-ratio: 1;

        &.lm-btn--sm { width: 36px; }
        &.lm-btn--md { width: 44px; }
        &.lm-btn--lg { width: 52px; }
    }

    &--block {
        display: flex;
        width: 100%;
    }

    // ── Variants ─────────────────────────────────────────────────────────
    &--primary {
        background: var(--ember);
        color: var(--ink-900);
        box-shadow: 0 8px 24px rgba(255, 90, 31, 0.28);

        &:not(:disabled):hover {
            background: var(--ember-600);
            box-shadow: 0 12px 32px rgba(255, 90, 31, 0.38);
            transform: translateY(-1px);
        }
    }

    &--secondary {
        background: var(--bone-50);
        color: var(--ink-900);

        &:not(:disabled):hover {
            background: var(--bone-100);
            transform: translateY(-1px);
        }
    }

    &--ghost {
        background: transparent;
        color: var(--bone-50);

        &:not(:disabled):hover {
            background: var(--surface-tint);
        }
    }

    &--outline {
        background: transparent;
        color: var(--bone-50);
        box-shadow: inset 0 0 0 1px var(--rule-strong);

        &:not(:disabled):hover {
            background: var(--surface-tint);
            box-shadow: inset 0 0 0 1px var(--bone-400);
        }
    }

    &--danger {
        background: var(--danger);
        color: var(--bone-50);

        &:not(:disabled):hover {
            filter: brightness(1.08);
            transform: translateY(-1px);
        }
    }

    // ── Loading ──────────────────────────────────────────────────────────
    &__content {
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        transition: opacity var(--dur-fast) var(--ease-out);

        &.is-hidden {
            opacity: 0;
        }
    }

    &__spinner {
        position: absolute;
        width: 16px;
        height: 16px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: lm-btn-spin 640ms linear infinite;
    }

    :slotted(svg) {
        width: 1.125em;
        height: 1.125em;
        flex: 0 0 auto;
    }
}

@keyframes lm-btn-spin {
    to { transform: rotate(360deg); }
}
</style>
