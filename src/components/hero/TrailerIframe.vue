<template>
    <iframe
        v-if="visible && src"
        :ref="onRef"
        class="trailer-iframe"
        :class="{ 'is-live': live }"
        :src="src"
        title="Trailer"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        aria-hidden="true"
        @load="$emit('load')"
    />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'TrailerIframe',
    props: {
        bindRef: {
            type: Function as PropType<(el: HTMLIFrameElement | null) => void>,
            required: true
        },
        src: { type: String, default: '' },
        visible: { type: Boolean, default: false },
        live: { type: Boolean, default: false }
    },
    emits: ['load'],
    setup(props) {
        const onRef = (el: unknown) => {
            props.bindRef((el as HTMLIFrameElement) ?? null);
        };
        return { onRef };
    }
});
</script>

<style lang="scss" scoped>
.trailer-iframe {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 177.77vh;
    height: 100vh;
    min-width: 100%;
    min-height: 56.25vw;
    transform: translate(-50%, -50%);
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--dur-slow) var(--ease-out);

    &.is-live { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
    .trailer-iframe { transition: none; }
}
</style>
