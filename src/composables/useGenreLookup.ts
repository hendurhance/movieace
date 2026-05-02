import useAxios from './useAxios';

// ============================================================================
// useGenreLookup — single source of truth for movie + tv genre dictionaries.
//
// Two access patterns:
//  • primeGenres() / genreName() / genreNames() — fire-and-forget priming on
//    page mount, then synchronous lookups inside cards & rails.
//  • getGenres(type) — async fetch returning the full list, for filter UIs
//    that need to render the catalogue itself (Movies / TVShows pages).
//
// Both share the same in-memory map and `genres-cache-<type>` localStorage
// keys, so a primed page makes the filter dropdown render instantly.
// ============================================================================

export interface Genre {
    id: number;
    name: string;
}

export type MediaType = 'movie' | 'tv';

const STORE_KEY = (t: MediaType) => `genres-cache-${t}`;
const map = new Map<MediaType, Genre[]>();
let primePromise: Promise<void> | null = null;

const readCache = (t: MediaType): Genre[] | null => {
    try {
        const raw = localStorage.getItem(STORE_KEY(t));
        return raw ? (JSON.parse(raw) as Genre[]) : null;
    } catch {
        return null;
    }
};

const writeCache = (t: MediaType, data: Genre[]): void => {
    try {
        localStorage.setItem(STORE_KEY(t), JSON.stringify(data));
    } catch {
        /* quota — ignore */
    }
};

const fetchType = async (t: MediaType): Promise<Genre[]> => {
    const cached = readCache(t);
    if (cached && cached.length) {
        map.set(t, cached);
        return cached;
    }
    const res = await useAxios().get(
        `https://api.themoviedb.org/3/genre/${t}/list`
    );
    const genres: Genre[] = res.data?.genres || [];
    writeCache(t, genres);
    map.set(t, genres);
    return genres;
};

/** Prime both dictionaries. Idempotent. Call once near app/page mount. */
export const primeGenres = (): Promise<void> => {
    if (primePromise) return primePromise;
    primePromise = (async () => {
        await Promise.all([fetchType('movie'), fetchType('tv')]);
    })();
    return primePromise;
};

/**
 * Async fetch of the full genre catalogue for one media type. Hits the
 * in-memory map first, then localStorage cache, then network. Use for
 * rendering filter chips/dropdowns; for card-level lookups use `genreName`.
 */
export const getGenres = (type: MediaType): Promise<Genre[]> => {
    const dict = map.get(type);
    if (dict?.length) return Promise.resolve(dict);
    return fetchType(type);
};

/**
 * Synchronous lookup. Returns labels for the first `max` matching genre ids.
 * If the dictionary hasn't been primed, returns [] — callers should await
 * `primeGenres()` up-front (typically in the parent page).
 */
export const genreNames = (
    ids: number[],
    type: MediaType = 'movie',
    max = 3
): string[] => {
    const dict = map.get(type);
    if (!dict || !ids?.length) return [];
    const names: string[] = [];
    for (const g of dict) {
        if (ids.includes(g.id)) {
            names.push(g.name);
            if (names.length >= max) break;
        }
    }
    return names;
};

/** Lookup a single genre name — for small UI chips. */
export const genreName = (
    id: number,
    type: MediaType = 'movie'
): string | null => {
    const dict = map.get(type);
    return dict?.find(g => g.id === id)?.name ?? null;
};

export const useGenreLookup = () => ({
    primeGenres,
    getGenres,
    genreNames,
    genreName
});
