import { ref } from 'vue';
import useAxios from './useAxios';
import type { MovieVideo } from './useMovies';

export interface TrailerVideo {
    id: string;
    key: string;
    name: string;
    type: string;
    site: string;
    size: number;
    official: boolean;
}

const listCache = new Map<string, TrailerVideo[]>();

const TYPE_PRIORITY: Record<string, number> = {
    Trailer: 0,
    Teaser: 1,
    Clip: 2,
    Featurette: 3,
    'Behind the Scenes': 4,
    Opening_Credits: 5
};

const ALLOWED_TYPES = new Set(Object.keys(TYPE_PRIORITY));

const sortVideos = (videos: MovieVideo[]): TrailerVideo[] => {
    return videos
        .filter(v => v.site === 'YouTube' && ALLOWED_TYPES.has(v.type))
        .map(v => ({
            id: v.id,
            key: v.key,
            name: v.name,
            type: v.type,
            site: v.site,
            size: v.size,
            official: !!(v as MovieVideo & { official?: boolean }).official
        }))
        .sort((a, b) => {
            const aO = a.official ? 0 : 1;
            const bO = b.official ? 0 : 1;
            if (aO !== bO) return aO - bO;
            const aT = TYPE_PRIORITY[a.type] ?? 99;
            const bT = TYPE_PRIORITY[b.type] ?? 99;
            if (aT !== bT) return aT - bT;
            return (b.size ?? 0) - (a.size ?? 0);
        });
};

export const fetchTrailerVideos = async (
    id: number | string,
    type: 'movie' | 'tv'
): Promise<TrailerVideo[]> => {
    const cacheKey = `${type}-${id}`;
    if (listCache.has(cacheKey)) return listCache.get(cacheKey)!;

    try {
        const res = await useAxios().get(
            `https://api.themoviedb.org/3/${type}/${id}/videos?language=en-US`
        );
        const results = (res.data?.results ?? []) as MovieVideo[];
        const sorted = sortVideos(results);
        listCache.set(cacheKey, sorted);
        return sorted;
    } catch {
        listCache.set(cacheKey, []);
        return [];
    }
};

export const fetchTrailerKey = async (
    id: number | string,
    type: 'movie' | 'tv'
): Promise<string | null> => {
    const list = await fetchTrailerVideos(id, type);
    return list[0]?.key ?? null;
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
        iv_load_policy: '3',
        disablekb: '1',
        cc_load_policy: '0',
        fs: '0'
    };
    if (loop) params.playlist = key;
    if (jsApi) params.enablejsapi = '1';
    if (origin) params.origin = origin;
    const search = new URLSearchParams(params).toString();
    return `https://www.youtube-nocookie.com/embed/${key}?${search}`;
};
