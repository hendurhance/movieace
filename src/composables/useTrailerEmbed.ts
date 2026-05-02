import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { fetchTrailerKey, buildTrailerEmbed } from './useTrailer';

interface UseTrailerEmbedOptions {
    id: Ref<number | string>;
    type: Ref<'movie' | 'tv'>;
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

    const userPaused = useStorage<boolean>('lm:trailer:paused', false);
    const userMuted = useStorage<boolean>('lm:trailer:muted', true);

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

    let dwellTimer: number | null = null;
    let blockTimer: number | null = null;
    let messageHandler: ((e: MessageEvent) => void) | null = null;

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

    const applyUserState = () => {
        if (userMuted.value) command('mute');
        else command('unMute');
        if (userPaused.value) command('pauseVideo');
        else command('playVideo');
    };

    const togglePause = () => {
        userPaused.value = !userPaused.value;
        if (userPaused.value) command('pauseVideo');
        else command('playVideo');
    };

    const toggleMute = () => {
        userMuted.value = !userMuted.value;
        if (userMuted.value) command('mute');
        else command('unMute');
    };

    const handleYouTubeMessage = (e: MessageEvent) => {
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
                    applyUserState();
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

    const prefersReducedMotion = () =>
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resetTrailer = () => {
        clearDwell();
        clearBlockTimer();
        detachMessageListener();
        trailerActive.value = false;
        trailerLive.value = false;
        trailerBlocked.value = false;
        trailerKey.value = null;
    };

    const scheduleTrailer = async () => {
        if (prefersReducedMotion()) return;
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

    watch(
        () => opts.id.value,
        () => {
            resetTrailer();
            scheduleTrailer();
        },
        { immediate: true }
    );

    onBeforeUnmount(() => {
        clearDwell();
        clearBlockTimer();
        detachMessageListener();
    });

    return {
        iframeRef,
        trailerVisible,
        trailerBlocked,
        trailerLive,
        trailerSrc,
        userPaused,
        userMuted,
        onIframeLoad,
        togglePause,
        toggleMute
    };
}
