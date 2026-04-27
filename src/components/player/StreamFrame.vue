<template>
    <div ref="rootRef" class="stream-frame" :class="{ 'is-loading': isLoading, 'has-error': hasError }">
        <div
            v-if="ambientImage"
            class="stream-frame__bloom"
            :style="{ backgroundImage: `url(${ambientImage})` }"
            aria-hidden="true"
        />

        <div class="stream-frame__stage">
            <div class="stream-frame__player">
                <iframe
                    v-if="embedUrl && !hasError"
                    ref="frameEl"
                    :src="embedUrl"
                    :title="title"
                    class="stream-frame__iframe"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowfullscreen
                    frameborder="0"
                    @load="onLoad"
                    @error="onError"
                />

                <div v-if="isLoading && !hasError" class="stream-frame__loading" role="status" aria-live="polite">
                    <div class="stream-frame__skeleton" aria-hidden="true" />
                    <div class="stream-frame__loader">
                        <div class="stream-frame__spinner" aria-hidden="true" />
                        <p class="meta">{{ loadingLabel }}</p>
                    </div>
                </div>

                <div v-if="hasError" class="stream-frame__error" role="alert">
                    <p class="eyebrow">Reel jam</p>
                    <h3>The frame didn't catch.</h3>
                    <p class="stream-frame__error-message">
                        Try a different server below, or reload this projector.
                    </p>
                    <button type="button" class="stream-frame__retry" @click="retry">Reload</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { useWebImage } from '../../utils/useWebImage';
import { useAmbientColor } from '../../composables/useAmbientColor';

export default defineComponent({
    name: 'StreamFrame',
    props: {
        embedUrl: { type: String, default: '' },
        title: { type: String, default: 'Stream' },
        backdropPath: { type: String, default: '' },
        posterPath: { type: String, default: '' }
    },
    setup(props) {
        const rootRef = ref<HTMLElement | null>(null);
        const frameEl = ref<HTMLIFrameElement | null>(null);
        const isLoading = ref(true);
        const hasError = ref(false);

        const ambientPath = computed(() => props.backdropPath || props.posterPath || null);
        useAmbientColor(ambientPath, rootRef);

        const loadingMessages = [
            'Threading the reel…',
            'Cueing the projector…',
            'Striking the print…',
            'Rolling film…'
        ];
        const loadingLabel = ref(loadingMessages[0]);
        let messageTimer: ReturnType<typeof setInterval> | null = null;

        const startMessages = () => {
            let i = 0;
            messageTimer = setInterval(() => {
                i = (i + 1) % loadingMessages.length;
                loadingLabel.value = loadingMessages[i];
            }, 2200);
        };

        const stopMessages = () => {
            if (messageTimer) {
                clearInterval(messageTimer);
                messageTimer = null;
            }
        };

        const ambientImage = ref<string>('');
        const computeAmbient = () => {
            const path = props.backdropPath || props.posterPath;
            ambientImage.value = path ? useWebImage(path, 'large') : '';
        };

        const onLoad = () => {
            window.setTimeout(() => {
                isLoading.value = false;
                hasError.value = false;
                stopMessages();
            }, 600);
        };

        const onError = () => {
            isLoading.value = false;
            hasError.value = true;
            stopMessages();
        };

        const retry = () => {
            hasError.value = false;
            isLoading.value = true;
            startMessages();
            if (frameEl.value && props.embedUrl) {
                const src = frameEl.value.src;
                frameEl.value.src = '';
                window.setTimeout(() => {
                    if (frameEl.value) frameEl.value.src = src;
                }, 80);
            }
        };

        watch(
            () => props.embedUrl,
            (next, prev) => {
                if (next && next !== prev) {
                    isLoading.value = true;
                    hasError.value = false;
                    startMessages();
                }
            }
        );

        watch(
            () => [props.backdropPath, props.posterPath],
            () => computeAmbient(),
            { immediate: true }
        );

        onMounted(() => {
            startMessages();
            window.setTimeout(() => {
                if (isLoading.value) onLoad();
            }, 15000);
        });

        onUnmounted(() => {
            stopMessages();
        });

        return {
            rootRef,
            frameEl,
            isLoading,
            hasError,
            loadingLabel,
            ambientImage,
            onLoad,
            onError,
            retry
        };
    }
});
</script>

<style lang="scss" scoped>
.stream-frame {
    position: relative;
    width: 100%;
    isolation: isolate;

    &__bloom {
        position: absolute;
        inset: -10% -5%;
        width: fit-content;
        background-size: cover;
        background-position: center;
        filter: blur(80px) saturate(1.4) brightness(0.55);
        opacity: 0.55;
        z-index: -1;
        pointer-events: none;

        &::after {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(
                ellipse at center,
                transparent 0%,
                var(--ink-900) 78%
            );
        }
    }

    &__stage {
        position: relative;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: var(--s-5) var(--s-4);

        @media (min-width: 768px) {
            padding: var(--s-6) var(--s-5);
        }
    }

    &__player {
        position: relative;
        aspect-ratio: 16 / 9;
        background: #000;
        border-radius: var(--r-lg);
        overflow: hidden;
        box-shadow:
            0 32px 80px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(var(--ambient), 0.18),
            0 0 0 1px var(--rule);
        transition: box-shadow var(--dur-slow) var(--ease-out);
    }

    &__iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }

    &__loading {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: var(--ink-900);
    }

    &__skeleton {
        position: absolute;
        inset: 0;
        background:
            linear-gradient(
                100deg,
                rgba(255, 255, 255, 0) 30%,
                rgba(255, 255, 255, 0.04) 50%,
                rgba(255, 255, 255, 0) 70%
            ) var(--ink-800);
        background-size: 220% 100%;
        animation: streamFrameShimmer 2.4s infinite ease-in-out;
    }

    &__loader {
        position: relative;
        z-index: 1;
        display: grid;
        gap: var(--s-3);
        justify-items: center;
        color: var(--bone-200);
    }

    &__spinner {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2px solid var(--rule-strong);
        border-top-color: var(--ember);
        animation: streamFrameSpin 1.1s linear infinite;
    }

    &__error {
        position: absolute;
        inset: 0;
        display: grid;
        place-content: center;
        gap: var(--s-3);
        text-align: center;
        padding: var(--s-6);
        background: var(--ink-900);

        h3 {
            font-family: var(--font-display);
            font-size: var(--fs-2xl);
            color: var(--bone-50);
            margin: 0;
            letter-spacing: var(--ls-tight);
        }
    }

    &__error-message {
        color: var(--bone-200);
        max-width: 360px;
        margin: 0 auto;
    }

    &__retry {
        margin-top: var(--s-2);
        padding: 0.65rem 1.4rem;
        background: var(--ember);
        color: var(--ink-900);
        border: 0;
        border-radius: var(--r-pill);
        font-family: var(--font-ui);
        font-weight: 600;
        cursor: pointer;
        transition:
            background-color var(--dur-fast) var(--ease-out),
            transform var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--ember-600);
            transform: translateY(-1px);
        }
    }
}

@keyframes streamFrameShimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

@keyframes streamFrameSpin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .stream-frame__skeleton,
    .stream-frame__spinner {
        animation: none;
    }
}
</style>
