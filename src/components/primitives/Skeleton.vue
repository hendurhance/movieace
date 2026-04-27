<template>
    <span
        class="lm-skeleton"
        :class="[`lm-skeleton--${shape}`, { 'lm-skeleton--block': block }]"
        :style="style"
        aria-hidden="true"
    />
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'LmSkeleton',
    props: {
        width: { type: [Number, String], default: null },
        height: { type: [Number, String], default: null },
        radius: { type: [Number, String], default: null },
        shape: {
            type: String as PropType<'rect' | 'circle' | 'text' | 'poster' | 'keyart'>,
            default: 'rect'
        },
        block: { type: Boolean, default: false }
    },
    setup(props) {
        const px = (v: number | string | null) =>
            v === null ? undefined : typeof v === 'number' ? `${v}px` : v;

        const style = computed(() => ({
            width: px(props.width),
            height: px(props.height),
            borderRadius: px(props.radius)
        }));

        return { style };
    }
});
</script>

<style lang="scss" scoped>
.lm-skeleton {
    display: inline-block;
    background:
        linear-gradient(
            90deg,
            var(--ink-700) 0%,
            var(--ink-600) 50%,
            var(--ink-700) 100%
        );
    background-size: 200% 100%;
    animation: lm-shimmer 1.6s var(--ease-in-out) infinite;
    border-radius: var(--r-sm);

    &--block {
        display: block;
        width: 100%;
    }

    &--circle {
        border-radius: 50%;
        aspect-ratio: 1;
    }

    &--text {
        height: 0.9em;
        border-radius: 2px;
        vertical-align: middle;
    }

    &--poster {
        display: block;
        width: 100%;
        aspect-ratio: 2 / 3;
        border-radius: var(--r-md);
    }

    &--keyart {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: var(--r-md);
    }
}

@keyframes lm-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
    .lm-skeleton {
        animation: none;
        background: var(--ink-700);
    }
}
</style>
