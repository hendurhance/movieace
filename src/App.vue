<template>
    <div class="app-stage">
        <a class="app-skip" href="#main">Skip to content</a>

        <span class="grain" aria-hidden="true" />

        <router-view v-slot="{ Component, route }">
            <Transition name="page" mode="out-in">
                <component :is="Component" :key="route.path" />
            </Transition>
        </router-view>

        <CommandPalette />
        <MiniPlayer />
        <Toast />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue';
import Toast from './components/feedback/Toast.vue';
import CommandPalette from './components/navigation/CommandPalette.vue';
import MiniPlayer from './components/player/MiniPlayer.vue';
import { bindCommandPaletteHotkey } from './composables/useCommandPalette';
import { startReveal, stopReveal } from './composables/useReveal';

onMounted(() => {
    bindCommandPaletteHotkey();
    startReveal();
});

onBeforeUnmount(() => {
    stopReveal();
});
</script>

<style lang="scss">
.app-stage {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    isolation: isolate;
}

// ── Skip-to-content link ─────────────────────────────────────────────────────
.app-skip {
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 10000;
    padding: 0.6rem 1rem;
    background: var(--ember);
    color: var(--ink-900);
    font-family: var(--font-ui);
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: var(--r-pill);
    text-decoration: none;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    transform: translateY(-200%);
    transition: transform var(--dur-base) var(--ease-out);

    &:focus,
    &:focus-visible {
        transform: translateY(0);
        outline: 2px solid var(--bone-50);
        outline-offset: 2px;
    }
}

// ── Global page transition ───────────────────────────────────────────────────
.page-enter-active,
.page-leave-active {
    transition:
        opacity var(--dur-base) var(--ease-out),
        transform var(--dur-base) var(--ease-out);
}

.page-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
    .page-enter-active,
    .page-leave-active {
        transition: opacity var(--dur-fast) linear;
    }
    .page-enter-from,
    .page-leave-to {
        transform: none;
    }
}

// ── Global focus-visible ring ────────────────────────────────────────────────
:focus-visible {
    outline: 2px solid var(--ember);
    outline-offset: 2px;
    border-radius: 2px;
}

// Inputs/selects in our pill controls already have focus borders — strip the
// double ring there to keep the editorial look clean.
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
    outline: none;
}
</style>
