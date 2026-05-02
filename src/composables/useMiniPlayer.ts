import { computed, ref } from 'vue';

export interface MiniPlayerState {
    mediaId: string;
    mediaType: 'movie' | 'tv';
    title: string;
    embedUrl: string;
    posterPath?: string;
    backdropPath?: string;
    season?: number;
    episode?: number;
    routeName: string;
    routeParams: Record<string, string | number>;
}

const state = ref<MiniPlayerState | null>(null);
const visible = ref(false);

export const useMiniPlayer = () => {
    const setStream = (next: MiniPlayerState) => {
        state.value = next;
    };

    const updateRoute = (routeName: string, params: Record<string, string | number>) => {
        if (!state.value) return;
        state.value = { ...state.value, routeName, routeParams: params };
    };

    const show = () => {
        if (state.value) visible.value = true;
    };

    const hide = () => {
        visible.value = false;
    };

    const clear = () => {
        state.value = null;
        visible.value = false;
    };

    const isActive = computed(() => visible.value && state.value !== null);

    return {
        state,
        visible,
        isActive,
        setStream,
        updateRoute,
        show,
        hide,
        clear
    };
};
