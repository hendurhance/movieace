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
import { installAntiInspect, uninstallAntiInspect } from './composables/useAntiInspect';

onMounted(() => {
    bindCommandPaletteHotkey();
    startReveal();
    installAntiInspect();
});

onBeforeUnmount(() => {
    stopReveal();
    uninstallAntiInspect();
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

// ── Anti-inspect: global selection / drag prevention ────────────────────────
// Suppresses casual "Save image / Copy / Drag to desktop" gestures. Inputs and
// textareas remain selectable so search and forms still work.
html, body {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
}

input, textarea, [contenteditable="true"] {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
}

img {
    -webkit-user-drag: none;
    user-drag: none;
    -webkit-touch-callout: none;
}

// ── Anti-inspect: DevTools lock overlay ─────────────────────────────────────
body.lm-locked {
    overflow: hidden;

    .app-stage {
        filter: blur(14px) saturate(0.6);
        pointer-events: none;
        user-select: none;
    }
}

.lm-lock-overlay {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: grid;
    place-items: center;
    background: rgba(11, 10, 8, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: var(--s-5);
    text-align: center;

    &__panel {
        max-width: 420px;
        padding: var(--s-7) var(--s-6);
        background: var(--ink-850);
        border: 1px solid var(--rule-strong);
        border-radius: var(--r-md);
        box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.7);
    }

    &__eyebrow {
        font-family: var(--font-mono);
        font-size: 0.72rem;
        letter-spacing: var(--ls-micro);
        text-transform: uppercase;
        color: var(--ember);
        margin: 0 0 var(--s-2);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.6rem, 3vw, 2rem);
        line-height: 1.1;
        letter-spacing: var(--ls-tight);
        color: var(--bone-50);
        margin: 0 0 var(--s-3);
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
    }

    &__copy {
        margin: 0;
        color: var(--bone-300);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        line-height: var(--lh-base);
    }
}
</style>
