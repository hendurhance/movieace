import { ref, watch } from 'vue';
import { useWebImage } from '../utils/useWebImage';

// ============================================================================
// useAmbientColor — extract a saturated dominant color from a TMDB backdrop
// or poster, cache it per-path in sessionStorage, and expose it as an RGB
// tuple `r, g, b` suitable for `rgba(var(--ambient), …)`.
//
// Strategy: load a small (w300) image with CORS, downscale onto a 32×32 canvas,
// average the inner pixels weighted by saturation (so grey/black/white pixels
// don't dominate). Falls back to the LUMIÈRE ember when extraction fails or
// when the user is on a locked-down browser.
// ============================================================================

const FALLBACK = '255, 90, 31'; // ember
const CACHE_PREFIX = 'lm:ambient:';
const memoryCache = new Map<string, string>();

interface ExtractOptions {
    minSaturation?: number;
    maxBrightness?: number;
    minBrightness?: number;
}

const readSession = (key: string): string | null => {
    try {
        return sessionStorage.getItem(CACHE_PREFIX + key);
    } catch {
        return null;
    }
};

const writeSession = (key: string, value: string): void => {
    try {
        sessionStorage.setItem(CACHE_PREFIX + key, value);
    } catch {
        /* quota — ignore */
    }
};

const sampleImage = (img: HTMLImageElement, opts: ExtractOptions): string => {
    const W = 32;
    const H = 32;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return FALLBACK;

    ctx.drawImage(img, 0, 0, W, H);

    let data: Uint8ClampedArray;
    try {
        data = ctx.getImageData(0, 0, W, H).data;
    } catch {
        return FALLBACK; // CORS taint
    }

    const minSat = opts.minSaturation ?? 0.18;
    const maxV = opts.maxBrightness ?? 0.95;
    const minV = opts.minBrightness ?? 0.18;

    let r = 0;
    let g = 0;
    let b = 0;
    let weightSum = 0;

    for (let i = 0; i < data.length; i += 4) {
        const R = data[i];
        const G = data[i + 1];
        const B = data[i + 2];
        const A = data[i + 3];
        if (A < 200) continue;

        const max = Math.max(R, G, B);
        const min = Math.min(R, G, B);
        const v = max / 255;
        if (v < minV || v > maxV) continue;

        const sat = max === 0 ? 0 : (max - min) / max;
        if (sat < minSat) continue;

        const weight = sat * sat * v;
        r += R * weight;
        g += G * weight;
        b += B * weight;
        weightSum += weight;
    }

    if (weightSum === 0) {
        // Pass two — looser thresholds (mostly grayscale image)
        for (let i = 0; i < data.length; i += 4) {
            const R = data[i];
            const G = data[i + 1];
            const B = data[i + 2];
            r += R;
            g += G;
            b += B;
            weightSum += 1;
        }
    }

    if (weightSum === 0) return FALLBACK;

    const fr = Math.round(r / weightSum);
    const fg = Math.round(g / weightSum);
    const fb = Math.round(b / weightSum);
    return `${fr}, ${fg}, ${fb}`;
};

export const extractAmbientColor = (path: string | null | undefined): Promise<string> => {
    if (!path) return Promise.resolve(FALLBACK);

    const cached = memoryCache.get(path);
    if (cached) return Promise.resolve(cached);

    const stored = readSession(path);
    if (stored) {
        memoryCache.set(path, stored);
        return Promise.resolve(stored);
    }

    return new Promise<string>(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => {
            const value = sampleImage(img, {});
            memoryCache.set(path, value);
            writeSession(path, value);
            resolve(value);
        };
        img.onerror = () => {
            memoryCache.set(path, FALLBACK);
            resolve(FALLBACK);
        };
        img.src = useWebImage(path, 'small');
    });
};

const setOnTarget = (target: HTMLElement | null, value: string) => {
    if (!target) return;
    target.style.setProperty('--ambient', value);
};

const clearOnTarget = (target: HTMLElement | null) => {
    if (!target) return;
    target.style.removeProperty('--ambient');
};

/**
 * Reactive helper: pass a path ref + an optional element ref. The ambient
 * color is extracted, cached, and written to that element as a CSS variable.
 * If no element is provided, the value is written to `:root`.
 */
export const useAmbientColor = (
    pathRef: { value: string | null | undefined },
    targetRef?: { value: HTMLElement | null }
) => {
    const ambient = ref<string>(FALLBACK);

    const apply = (value: string) => {
        ambient.value = value;
        const el = targetRef?.value ?? document.documentElement;
        setOnTarget(el, value);
    };

    const reset = () => {
        ambient.value = FALLBACK;
        const el = targetRef?.value ?? null;
        if (el) clearOnTarget(el);
        else document.documentElement.style.setProperty('--ambient', FALLBACK);
    };

    watch(
        () => pathRef.value,
        async path => {
            if (!path) {
                reset();
                return;
            }
            const value = await extractAmbientColor(path);
            // Make sure the path didn't change while we were waiting.
            if (path === pathRef.value) apply(value);
        },
        { immediate: true }
    );

    return { ambient, reset };
};
