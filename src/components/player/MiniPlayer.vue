<template>
    <Teleport to="body">
        <Transition name="mini">
            <aside
                v-if="isActive && state"
                class="mini-player"
                role="complementary"
                aria-label="Mini player"
            >
                <div class="mini-player__frame">
                    <iframe
                        :src="state.embedUrl"
                        :title="state.title"
                        class="mini-player__iframe"
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        allowfullscreen
                        frameborder="0"
                    />
                    <div class="mini-player__veil" aria-hidden="true" />
                </div>

                <div class="mini-player__chrome">
                    <div class="mini-player__meta">
                        <p class="eyebrow">Now playing</p>
                        <h4 class="mini-player__title" :title="state.title">{{ state.title }}</h4>
                        <p v-if="subtitle" class="meta mini-player__sub">{{ subtitle }}</p>
                    </div>

                    <div class="mini-player__actions">
                        <button
                            type="button"
                            class="mini-player__btn"
                            aria-label="Return to full player"
                            @click="resume"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                                <path d="M4 4h6M4 4v6M4 4l7 7M20 20h-6M20 20v-6M20 20l-7-7" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            class="mini-player__btn mini-player__btn--close"
                            aria-label="Close mini player"
                            @click="dismiss"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                                <path d="M6 6l12 12M6 18L18 6" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>
        </Transition>
    </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMiniPlayer } from '../../composables/useMiniPlayer';

export default defineComponent({
    name: 'MiniPlayer',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const { state, isActive, show, hide, clear } = useMiniPlayer();

        const isWatchRoute = computed(() => {
            const name = String(route.name || '');
            return name === 'StreamMovie' || name === 'StreamTVShow';
        });

        watch(
            () => [isWatchRoute.value, state.value?.mediaId, state.value?.episode, state.value?.season],
            () => {
                if (!state.value) {
                    hide();
                    return;
                }
                if (isWatchRoute.value) hide();
                else show();
            },
            { immediate: true }
        );

        const subtitle = computed(() => {
            if (!state.value) return '';
            if (state.value.mediaType === 'tv' && state.value.season && state.value.episode) {
                return `S${state.value.season} · E${String(state.value.episode).padStart(2, '0')}`;
            }
            return 'Movie';
        });

        const resume = () => {
            if (!state.value) return;
            router.push({ name: state.value.routeName, params: state.value.routeParams });
        };

        const dismiss = () => clear();

        return {
            state,
            isActive,
            subtitle,
            resume,
            dismiss
        };
    }
});
</script>

<style lang="scss" scoped>
.mini-player {
    position: fixed;
    right: var(--s-4);
    bottom: var(--s-4);
    width: min(360px, 92vw);
    background: var(--ink-800);
    border-radius: var(--r-lg);
    overflow: hidden;
    box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.55),
        inset 0 0 0 1px var(--rule);
    z-index: var(--z-miniplayer);
    isolation: isolate;

    &__frame {
        position: relative;
        aspect-ratio: 16 / 9;
        background: #000;
    }

    &__iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }

    &__veil {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            180deg,
            transparent 60%,
            rgba(11, 10, 8, 0.6) 100%
        );
        pointer-events: none;
    }

    &__chrome {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-3);
        padding: var(--s-3) var(--s-4);
        background: var(--ink-800);
        border-top: 1px solid var(--rule);
    }

    &__meta {
        min-width: 0;
        display: grid;
        gap: 0.15rem;
    }

    &__title {
        margin: 0;
        font-family: var(--font-display);
        font-size: var(--fs-base);
        font-weight: 500;
        color: var(--bone-50);
        letter-spacing: var(--ls-tight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 220px;
    }

    &__sub {
        color: var(--bone-400);
    }

    &__actions {
        display: inline-flex;
        align-items: center;
        gap: var(--s-1);
        flex-shrink: 0;
    }

    &__btn {
        all: unset;
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        cursor: pointer;
        color: var(--bone-200);
        transition:
            background-color var(--dur-fast) var(--ease-out),
            color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--surface-tint);
            color: var(--bone-50);
        }

        &--close:hover {
            background: rgba(201, 78, 61, 0.15);
            color: var(--danger);
        }

        svg { width: 18px; height: 18px; }
    }

    @media (max-width: 540px) {
        right: var(--s-3);
        bottom: var(--s-3);
        width: min(320px, 92vw);
    }
}

.mini-enter-active,
.mini-leave-active {
    transition:
        transform var(--dur-base) var(--ease-out),
        opacity var(--dur-base) var(--ease-out);
}

.mini-enter-from,
.mini-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
}
</style>
