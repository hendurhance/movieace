import { ref } from 'vue';
import useAxios from './useAxios';
import type { MovieVideo } from './useMovies';

const cache = new Map<string, string | null>();

const TYPE_PRIORITY: Record<string, number> = {
    Trailer: 0,
    Teaser: 1,
    Clip: 2,
    Featurette: 3,
    Opening_Credits: 4
};

const pickBest = (videos: MovieVideo[]): MovieVideo | null => {
    const yt = videos.filter(v => v.site === 'YouTube');
    if (!yt.length) return null;
    return yt
        .slice()
        .sort((a, b) => {
            const aOfficial = (a as MovieVideo & { official?: boolean }).official ? 0 : 1;
            const bOfficial = (b as MovieVideo & { official?: boolean }).official ? 0 : 1;
            if (aOfficial !== bOfficial) return aOfficial - bOfficial;
            const aT = TYPE_PRIORITY[a.type] ?? 99;
            const bT = TYPE_PRIORITY[b.type] ?? 99;
            if (aT !== bT) return aT - bT;
            return (b.size ?? 0) - (a.size ?? 0);
        })[0] ?? null;
};

export const fetchTrailerKey = async (
    id: number | string,
    type: 'movie' | 'tv'
): Promise<string | null> => {
    const key = `${type}-${id}`;
    if (cache.has(key)) return cache.get(key) ?? null;

    try {
        const res = await useAxios().get(
            `https://api.themoviedb.org/3/${type}/${id}/videos?language=en-US`
        );
        const results = (res.data?.results ?? []) as MovieVideo[];
        const best = pickBest(results);
        const ytKey = best?.key ?? null;
        cache.set(key, ytKey);
        return ytKey;
    } catch {
        cache.set(key, null);
        return null;
    }
};

export const useTrailer = () => {
    const trailerKey = ref<string | null>(null);
    const loading = ref(false);

    const load = async (id: number | string, type: 'movie' | 'tv') => {
        loading.value = true;
        trailerKey.value = await fetchTrailerKey(id, type);
        loading.value = false;
        return trailerKey.value;
    };

    return { trailerKey, loading, load };
};

export const buildTrailerEmbed = (
    key: string,
    opts: {
        muted?: boolean;
        autoplay?: boolean;
        controls?: boolean;
        loop?: boolean;
        jsApi?: boolean;
        origin?: string;
    } = {}
): string => {
    const {
        muted = true,
        autoplay = true,
        controls = false,
        loop = true,
        jsApi = false,
        origin
    } = opts;
    const params: Record<string, string> = {
        autoplay: autoplay ? '1' : '0',
        mute: muted ? '1' : '0',
        controls: controls ? '1' : '0',
        modestbranding: '1',
        rel: '0',
        playsinline: '1',
        loop: loop ? '1' : '0',
        playlist: loop ? key : '',
        iv_load_policy: '3',
        disablekb: '1',
        cc_load_policy: '0',
        fs: '0'
    };
    if (jsApi) params.enablejsapi = '1';
    if (origin) params.origin = origin;
    const search = new URLSearchParams(params).toString();
    return `https://www.youtube-nocookie.com/embed/${key}?${search}`;
};
