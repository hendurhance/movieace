import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { fetchTrailerKey, buildTrailerEmbed } from './useTrailer';

interface UseTrailerEmbedOptions {
    id: Ref<number | string>;
    type: Ref<'movie' | 'tv'>;
    rootEl?: Ref<HTMLElement | null>;
    dwellMs?: number;
    blockTimeoutMs?: number;
}

export function useTrailerEmbed(opts: UseTrailerEmbedOptions) {
    const dwellMs = opts.dwellMs ?? 2000;
    const blockTimeoutMs = opts.blockTimeoutMs ?? 6000;
    const embedOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    const iframeRef = ref<HTMLIFrameElement | null>(null);
    const trailerKey = ref<string | null>(null);
    const trailerActive = ref(false);
    const trailerLive = ref(false);
    const trailerBlocked = ref(false);

    const userPaused = ref(false);
    const userMuted = useStorage<boolean>('lm:trailer:muted', true);

    const docHidden = ref(
        typeof document !== 'undefined' && document.visibilityState === 'hidden'
    );
    const offscreen = ref(false);
    const reduceMotion = ref(
        typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    const trailerSrc = computed(() =>
        trailerKey.value
            ? buildTrailerEmbed(trailerKey.value, {
                  muted: true,
                  autoplay: true,
                  controls: false,
                  loop: true,
                  jsApi: true,
                  origin: embedOrigin
              })
            : ''
    );

    const trailerVisible = computed(
        () => trailerActive.value && !trailerBlocked.value
    );

    const shouldPlay = computed(
        () =>
            trailerLive.value &&
            !userPaused.value &&
            !docHidden.value &&
            !offscreen.value
    );

    let dwellTimer: number | null = null;
    let blockTimer: number | null = null;
    let messageHandler: ((e: MessageEvent) => void) | null = null;
    let visibilityHandler: (() => void) | null = null;
    let mq: MediaQueryList | null = null;
    let mqHandler: ((e: MediaQueryListEvent) => void) | null = null;
    let observer: IntersectionObserver | null = null;
    let observedEl: HTMLElement | null = null;

    const clearDwell = () => {
        if (dwellTimer !== null) {
            window.clearTimeout(dwellTimer);
            dwellTimer = null;
        }
    };

    const clearBlockTimer = () => {
        if (blockTimer !== null) {
            window.clearTimeout(blockTimer);
            blockTimer = null;
        }
    };

    const detachMessageListener = () => {
        if (messageHandler) {
            window.removeEventListener('message', messageHandler);
            messageHandler = null;
        }
    };

    const post = (msg: object) => {
        const win = iframeRef.value?.contentWindow;
        if (!win) return;
        win.postMessage(JSON.stringify(msg), '*');
    };

    const command = (func: string) => post({ event: 'command', func, args: [] });

    const applyMute = () => {
        if (userMuted.value) command('mute');
        else command('unMute');
    };

    const togglePause = () => {
        userPaused.value = !userPaused.value;
    };

    const toggleMute = () => {
        userMuted.value = !userMuted.value;
        applyMute();
    };

    const handleYouTubeMessage = (e: MessageEvent) => {
        const win = iframeRef.value?.contentWindow;
        if (!win || e.source !== win) return;
        const origin = e.origin || '';
        if (!origin.includes('youtube.com') && !origin.includes('youtube-nocookie.com')) return;
        let data: any = e.data;
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch { return; }
        }
        if (!data || typeof data !== 'object') return;
        if (data.event === 'onError') {
            trailerBlocked.value = true;
            return;
        }
        if (data.event === 'infoDelivery' && data.info && typeof data.info.playerState === 'number') {
            const state = data.info.playerState;
            if (state === 1) {
                clearBlockTimer();
                if (!trailerLive.value) {
                    trailerLive.value = true;
                    applyMute();
                }
            }
        }
    };

    const onIframeLoad = () => {
        const win = iframeRef.value?.contentWindow;
        if (!win) return;
        win.postMessage(
            JSON.stringify({ event: 'listening', id: 'trailer', channel: 'widget' }),
            '*'
        );
        clearBlockTimer();
        blockTimer = window.setTimeout(() => {
            if (!trailerLive.value) trailerBlocked.value = true;
        }, blockTimeoutMs);
    };

    const resetTrailer = () => {
        clearDwell();
        clearBlockTimer();
        detachMessageListener();
        trailerActive.value = false;
        trailerLive.value = false;
        trailerBlocked.value = false;
        trailerKey.value = null;
        userPaused.value = false;
    };

    const scheduleTrailer = async () => {
        if (reduceMotion.value) return;
        const id = opts.id.value;
        if (!id) return;

        const key = await fetchTrailerKey(id, opts.type.value);
        if (!key) return;

        clearDwell();
        dwellTimer = window.setTimeout(() => {
            detachMessageListener();
            messageHandler = handleYouTubeMessage;
            window.addEventListener('message', messageHandler);
            trailerKey.value = key;
            trailerActive.value = true;
        }, dwellMs);
    };

    if (typeof document !== 'undefined') {
        visibilityHandler = () => {
            docHidden.value = document.visibilityState === 'hidden';
        };
        document.addEventListener('visibilitychange', visibilityHandler);
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
        mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        mqHandler = (e) => {
            reduceMotion.value = e.matches;
        };
        mq.addEventListener('change', mqHandler);
    }

    const attachObserver = (el: HTMLElement) => {
        if (typeof IntersectionObserver === 'undefined') return;
        observer = new IntersectionObserver(
            ([entry]) => {
                offscreen.value = !entry.isIntersecting;
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        observedEl = el;
    };

    const detachObserver = () => {
        if (observer && observedEl) observer.unobserve(observedEl);
        observer?.disconnect();
        observer = null;
        observedEl = null;
    };

    if (opts.rootEl) {
        watch(
            () => opts.rootEl!.value,
            (el) => {
                detachObserver();
                if (el) attachObserver(el);
                else offscreen.value = false;
            },
            { immediate: true }
        );
    }

    watch(
        shouldPlay,
        (val, prev) => {
            if (!trailerLive.value) return;
            if (val === prev) return;
            if (val) command('playVideo');
            else command('pauseVideo');
        }
    );

    watch(
        () => opts.id.value,
        () => {
            resetTrailer();
            scheduleTrailer();
        },
        { immediate: true }
    );

    watch(reduceMotion, (val) => {
        if (val) {
            resetTrailer();
        } else if (!trailerActive.value) {
            scheduleTrailer();
        }
    });

    onBeforeUnmount(() => {
        clearDwell();
        clearBlockTimer();
        detachMessageListener();
        detachObserver();
        if (visibilityHandler) {
            document.removeEventListener('visibilitychange', visibilityHandler);
            visibilityHandler = null;
        }
        if (mq && mqHandler) {
            mq.removeEventListener('change', mqHandler);
            mq = null;
            mqHandler = null;
        }
    });

    return {
        iframeRef,
        trailerVisible,
        trailerLive,
        trailerSrc,
        userPaused,
        userMuted,
        onIframeLoad,
        togglePause,
        toggleMute
    };
}
