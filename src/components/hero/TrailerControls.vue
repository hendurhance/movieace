<template>
    <div v-if="visible" class="trailer-ctrl" aria-label="Trailer controls">
        <button
            type="button"
            class="trailer-ctrl__btn"
            :aria-label="paused ? 'Play trailer' : 'Pause trailer'"
            :aria-pressed="paused"
            @click="$emit('toggle-pause')"
        >
            <svg v-if="paused" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z"/>
            </svg>
        </button>

        <button
            type="button"
            class="trailer-ctrl__btn"
            :aria-label="muted ? 'Unmute trailer' : 'Mute trailer'"
            :aria-pressed="!muted"
            @click="$emit('toggle-mute')"
        >
            <svg v-if="muted" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none"/>
                <path d="m22 9-6 6M16 9l6 6"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none"/>
                <path d="M15.54 8.46a5 5 0 010 7.07"/>
                <path d="M19.07 4.93a10 10 0 010 14.14"/>
            </svg>
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'TrailerControls',
    props: {
        visible: { type: Boolean, default: false },
        paused: { type: Boolean, default: false },
        muted: { type: Boolean, default: true }
    },
    emits: ['toggle-pause', 'toggle-mute']
});
</script>

<style lang="scss" scoped>
.trailer-ctrl {
    position: absolute;
    top: clamp(var(--s-3), 2vw, var(--s-5));
    right: clamp(var(--s-3), 2vw, var(--s-5));
    z-index: 3;
    display: inline-flex;
    gap: var(--s-2);
    pointer-events: auto;

    &__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(11, 10, 8, 0.55);
        backdrop-filter: blur(8px);
        color: var(--bone-100);
        border: 1px solid rgba(245, 239, 228, 0.14);
        cursor: pointer;
        transition:
            background-color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            color var(--dur-fast) var(--ease-out);

        &:hover,
        &:focus-visible {
            background: rgba(11, 10, 8, 0.78);
            border-color: var(--ember);
            color: var(--ember);
        }

        svg { display: block; }
    }
}
</style>
