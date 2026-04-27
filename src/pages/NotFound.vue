<template>
    <main class="not-found" id="main">
        <span class="not-found__bloom" aria-hidden="true" />

        <div class="not-found__inner">
            <p class="eyebrow not-found__eyebrow">Reel · 404</p>

            <h1 class="not-found__title">
                <span class="not-found__digits" aria-hidden="true">404</span>
                <span class="not-found__line">The print didn't make it to the projector.</span>
            </h1>

            <p class="not-found__copy">
                The frame you're after isn't in this reel. It may have moved, the URL
                might be misspelled, or the splice came undone somewhere along the way.
            </p>

            <div class="not-found__actions">
                <router-link to="/" class="not-found__cta">
                    Back to the marquee
                </router-link>
                <router-link to="/movies" class="not-found__alt">
                    Browse movies instead
                </router-link>
            </div>

            <p class="meta not-found__stamp">
                <span aria-hidden="true">●</span>
                Code 404 · frame skipped
            </p>
        </div>
    </main>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
    name: 'NotFound',
    setup() {
        onMounted(() => {
            document.title = '404 · Movieace';
        });
    }
});
</script>

<style scoped lang="scss">
.not-found {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: var(--s-6) var(--s-4);
    background: var(--ink-900);
    color: var(--bone-50);
    isolation: isolate;
    overflow: hidden;

    @media (min-width: 768px) {
        padding: var(--s-9) var(--s-6);
    }

    &__bloom {
        position: absolute;
        inset: -20% -10%;
        z-index: -1;
        background:
            radial-gradient(ellipse at 30% 20%, rgba(255, 90, 31, 0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 80%, rgba(201, 167, 106, 0.12) 0%, transparent 55%),
            radial-gradient(ellipse at center, var(--ink-850) 0%, var(--ink-900) 70%);
        filter: blur(20px);
        opacity: 0.9;
        pointer-events: none;
    }

    &__inner {
        position: relative;
        max-width: 640px;
        text-align: center;
        display: grid;
        gap: var(--s-4);
        animation: notFoundFade var(--dur-slow) var(--ease-out);
    }

    &__eyebrow {
        color: var(--ember);
        justify-self: center;
    }

    &__title {
        margin: 0;
        display: grid;
        gap: var(--s-2);
        font-family: var(--font-display);
        font-weight: 500;
        line-height: var(--lh-tight);
        letter-spacing: var(--ls-tight);
        color: var(--bone-50);
    }

    &__digits {
        font-size: clamp(5rem, 18vw, var(--fs-display));
        font-weight: 600;
        background: linear-gradient(135deg, var(--ember) 0%, var(--gold-leaf) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 24px 60px rgba(255, 90, 31, 0.18);
    }

    &__line {
        font-size: clamp(var(--fs-lg), 3.5vw, var(--fs-2xl));
        font-style: italic;
        color: var(--bone-100);
        max-width: 22ch;
        justify-self: center;
    }

    &__copy {
        margin: 0 auto;
        max-width: 48ch;
        color: var(--bone-200);
        line-height: var(--lh-base);
        font-size: var(--fs-base);
    }

    &__actions {
        display: inline-flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--s-3);
        margin-top: var(--s-2);
    }

    &__cta {
        display: inline-flex;
        align-items: center;
        padding: 0.85rem 1.6rem;
        background: var(--ember);
        color: var(--ink-900);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 600;
        text-decoration: none;
        border-radius: var(--r-pill);
        box-shadow: 0 12px 32px rgba(255, 90, 31, 0.35);
        transition:
            background-color var(--dur-fast) var(--ease-out),
            transform var(--dur-fast) var(--ease-out),
            box-shadow var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--ember-600);
            transform: translateY(-2px);
            box-shadow: 0 16px 40px rgba(255, 90, 31, 0.45);
        }

        &:focus-visible {
            outline: 2px solid var(--bone-50);
            outline-offset: 2px;
        }
    }

    &__alt {
        display: inline-flex;
        align-items: center;
        padding: 0.85rem 1.4rem;
        background: var(--surface-tint);
        color: var(--bone-100);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 500;
        text-decoration: none;
        border-radius: var(--r-pill);
        box-shadow: inset 0 0 0 1px var(--rule);
        transition:
            background-color var(--dur-fast) var(--ease-out),
            box-shadow var(--dur-fast) var(--ease-out),
            color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--ink-700);
            box-shadow: inset 0 0 0 1px var(--rule-strong);
            color: var(--bone-50);
        }

        &:focus-visible {
            outline: 2px solid var(--ember);
            outline-offset: 2px;
        }
    }

    &__stamp {
        margin-top: var(--s-4);
        color: var(--bone-400);
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        letter-spacing: var(--ls-micro);
        text-transform: uppercase;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        justify-self: center;

        > span {
            color: var(--ember);
            font-size: 0.6rem;
        }
    }
}

@keyframes notFoundFade {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .not-found__inner { animation: none; }
    .not-found__cta:hover,
    .not-found__alt:hover { transform: none; }
}
</style>
