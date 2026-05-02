// ============================================================================
// useAntiInspect — production-only anti-inspection guard.
//
// Wires up the typical "streaming site" deterrents:
//   - Right-click context menu disabled
//   - DevTools keyboard shortcuts blocked (F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U, Ctrl/Cmd+S)
//   - DevTools detection via window inner/outer size delta
//   - `debugger` trap on a recurring interval (freezes execution while DevTools is open)
//   - console.* muted + periodic console.clear()
//   - text selection / drag / copy events suppressed
//
// Only runs when `import.meta.env.PROD` is true so dev experience stays usable.
// This is *deterrence*, not security — anyone determined can still bypass it
// by disabling JS, using a proxy, or pulling the bundle directly.
// ============================================================================

const THRESHOLD = 160;
const TICK_MS = 1000;
const NOOP = () => {};

let installed = false;
let intervalId: number | null = null;
let listeners: Array<{ target: EventTarget; type: string; handler: any; opts?: any }> = [];

const shouldGuard = () => {
    if (typeof import.meta === 'undefined') return false;
    const env = (import.meta as any).env ?? {};
    if (env.PROD === true) return true;
    // Dev override — set VITE_ANTI_INSPECT=1 in .env to test the guard while
    // running `yarn dev`. Any truthy value enables it.
    const flag = env.VITE_ANTI_INSPECT;
    return flag === true || flag === 'true' || flag === '1' || flag === 1;
};

const swallow = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
};

const isBlockedKey = (e: KeyboardEvent): boolean => {
    if (e.key === 'F12') return true;
    const meta = e.ctrlKey || e.metaKey;
    if (!meta) return false;
    const k = (e.key || '').toUpperCase();
    if (e.shiftKey && (k === 'I' || k === 'J' || k === 'C')) return true;
    if (k === 'U') return true;
    if (k === 'S') return true;
    return false;
};

const onKeyDown = (e: KeyboardEvent) => {
    if (isBlockedKey(e)) {
        e.preventDefault();
        e.stopPropagation();
    }
};

const lockScreen = () => {
    if (typeof document === 'undefined') return;
    if (document.body.classList.contains('lm-locked')) return;
    document.body.classList.add('lm-locked');

    const overlay = document.createElement('div');
    overlay.className = 'lm-lock-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.innerHTML = `
        <div class="lm-lock-overlay__panel">
            <p class="lm-lock-overlay__eyebrow">Closed Set</p>
            <h2 class="lm-lock-overlay__title">Inspection paused</h2>
            <p class="lm-lock-overlay__copy">
                Developer tools were detected. Close them and reload to continue.
            </p>
        </div>
    `;
    document.body.appendChild(overlay);
};

const unlockScreen = () => {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('lm-locked');
    document.querySelectorAll('.lm-lock-overlay').forEach(n => n.remove());
};

let wasOpen = false;
const detectDevTools = () => {
    const widthDelta = window.outerWidth - window.innerWidth;
    const heightDelta = window.outerHeight - window.innerHeight;
    const open = widthDelta > THRESHOLD || heightDelta > THRESHOLD;
    if (open && !wasOpen) {
        wasOpen = true;
        lockScreen();
    } else if (!open && wasOpen) {
        wasOpen = false;
        unlockScreen();
    }
};

// Toggling a `debugger` line every tick freezes execution as long as DevTools
// is open. With DevTools closed, the V8/JSCore engine treats it as a no-op.
const debuggerTrap = () => {
    // eslint-disable-next-line no-debugger
    debugger;
};

const muteConsole = () => {
    if (typeof console === 'undefined') return;
    const methods: Array<keyof Console> = [
        'log', 'info', 'warn', 'error', 'debug', 'trace',
        'table', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd'
    ];
    methods.forEach(m => {
        try { (console as any)[m] = NOOP; } catch { /* ignore */ }
    });
};

const addListener = (target: EventTarget, type: string, handler: any, opts?: any) => {
    target.addEventListener(type, handler, opts);
    listeners.push({ target, type, handler, opts });
};

export function installAntiInspect() {
    if (installed) return;
    if (typeof window === 'undefined') return;
    if (!shouldGuard()) return;
    installed = true;

    addListener(document, 'contextmenu', swallow);
    addListener(document, 'keydown', onKeyDown, { capture: true });
    addListener(document, 'selectstart', swallow);
    addListener(document, 'copy', swallow);
    addListener(document, 'cut', swallow);
    addListener(document, 'dragstart', swallow);

    muteConsole();

    intervalId = window.setInterval(() => {
        try { console.clear(); } catch { /* ignore */ }
        detectDevTools();
        debuggerTrap();
    }, TICK_MS);
}

export function uninstallAntiInspect() {
    if (!installed) return;
    installed = false;

    if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
    }
    listeners.forEach(({ target, type, handler, opts }) => {
        target.removeEventListener(type, handler, opts);
    });
    listeners = [];
    unlockScreen();
}
