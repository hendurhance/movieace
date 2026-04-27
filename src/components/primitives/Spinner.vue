<template>
    <span
        class="lm-spinner"
        :class="[`lm-spinner--${size}`, `lm-spinner--${tone}`]"
        role="status"
        :aria-label="label"
    >
        <span class="sr-only">{{ label }}</span>
    </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'LmSpinner',
    props: {
        size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
        tone: { type: String as PropType<'ember' | 'bone' | 'current'>, default: 'ember' },
        label: { type: String, default: 'Loading' }
    }
});
</script>

<style lang="scss" scoped>
.lm-spinner {
    display: inline-block;
    border-style: solid;
    border-color: currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: lm-spin 680ms linear infinite;

    &--sm { width: 14px; height: 14px; border-width: 2px; }
    &--md { width: 22px; height: 22px; border-width: 2px; }
    &--lg { width: 36px; height: 36px; border-width: 3px; }

    &--ember   { color: var(--ember); }
    &--bone    { color: var(--bone-50); }
    &--current { color: currentColor; }
}

@keyframes lm-spin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .lm-spinner {
        animation-duration: 2s;
    }
}
</style>
