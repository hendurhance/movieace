import { ref } from 'vue';

// ============================================================================
// useCommandPalette — app-wide state + hotkey (⌘K / Ctrl+K) for the palette.
// Mounted once via App.vue so any page can trigger `openPalette()` manually.
// ============================================================================

export const paletteOpen = ref(false);

export const openPalette = () => {
  paletteOpen.value = true;
};

export const closePalette = () => {
  paletteOpen.value = false;
};

export const togglePalette = () => {
  paletteOpen.value = !paletteOpen.value;
};

/**
 * Registers a single global listener. Idempotent — safe to call multiple
 * times if the module is re-imported. Call from App.vue's onMounted.
 */
let bound = false;

export const bindCommandPaletteHotkey = () => {
  if (bound || typeof window === 'undefined') return;
  bound = true;

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // ⌘K (mac) / Ctrl+K (everywhere else)
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      togglePalette();
      return;
    }

    // Forward-slash opens palette unless typing in an input/textarea
    if (e.key === '/' && !paletteOpen.value) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable;
      if (!isEditable) {
        e.preventDefault();
        openPalette();
      }
    }
  });
};
