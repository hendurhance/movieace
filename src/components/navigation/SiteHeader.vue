<template>
    <header class="site-header" :class="{ 'is-scrolled': scrolled }">
        <div class="container-lm site-header__inner">
            <router-link to="/" class="site-header__logo" aria-label="Movieace home">
                <span class="site-header__mark">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                        <path
                            fill="currentColor"
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M0 6.7V5.3C0 3.9.56 2.55 1.55 1.55A5.3 5.3 0 0 1 5.3 0h3.67L5.62 6.7H0Zm10.84-6.7h6.5L13.99 6.7H7.49L10.84 0Zm8.36.02A5.3 5.3 0 0 1 22.45 1.55 5.3 5.3 0 0 1 24 5.3v1.4h-8.13L19.2.02ZM24 8.37V18.7a5.3 5.3 0 0 1-5.3 5.3H5.3A5.3 5.3 0 0 1 0 18.7V8.37h24Zm-13.85 3.33a1 1 0 0 0-1.38.03 1 1 0 0 0-.32.93v5.95a1 1 0 0 0 .32.92 1 1 0 0 0 1.38.03l5.52-2.97a1 1 0 0 0 .73-1.23 1 1 0 0 0-.73-1.23l-5.52-2.97Z"
                        />
                    </svg>
                </span>
                <span class="site-header__wordmark">
                    <span class="site-header__name">Movieace</span>
                    <span class="site-header__kicker eyebrow">A Cinema Periodical</span>
                </span>
            </router-link>

            <nav class="site-header__nav" aria-label="Primary">
                <router-link
                    v-for="item in primaryNav"
                    :key="item.path"
                    :to="item.path"
                    class="site-header__link"
                    :class="{ 'is-active': isActive(item) }"
                >
                    {{ item.label }}
                </router-link>
            </nav>

            <div class="site-header__actions">
                <button
                    class="site-header__search"
                    type="button"
                    aria-label="Open search (⌘K)"
                    @click="openPalette"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span class="site-header__search-label">Search</span>
                    <kbd class="site-header__search-kbd">{{ modKey }}K</kbd>
                </button>

                <router-link
                    to="/watchlist"
                    class="site-header__icon-btn"
                    aria-label="Watchlist"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </router-link>

                <button
                    class="site-header__icon-btn site-header__menu"
                    type="button"
                    aria-label="Open menu"
                    @click="drawerOpen = true"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                </button>
            </div>
        </div>

        <LmDrawer v-model="drawerOpen" side="right" title="Movieace">
            <nav class="site-header__drawer-nav" aria-label="Mobile">
                <router-link
                    v-for="item in primaryNav"
                    :key="item.path"
                    :to="item.path"
                    class="site-header__drawer-link"
                    :class="{ 'is-active': isActive(item) }"
                    @click="drawerOpen = false"
                >
                    <span class="eyebrow site-header__drawer-num">0{{ item.num }}</span>
                    <span class="site-header__drawer-label">{{ item.label }}</span>
                </router-link>

                <button class="site-header__drawer-link site-header__drawer-search" @click="openFromDrawer">
                    <span class="eyebrow site-header__drawer-num">✦</span>
                    <span class="site-header__drawer-label">Search &amp; Jump</span>
                </button>
            </nav>
        </LmDrawer>
    </header>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';
import LmDrawer from '../primitives/Drawer.vue';
import { openPalette } from '../../composables/useCommandPalette';

interface NavItem {
    label: string;
    path: string;
    match: (p: string) => boolean;
    num: number;
}

const primaryNav: NavItem[] = [
    { label: 'Home', path: '/', match: p => p === '/', num: 1 },
    {
        label: 'Movies',
        path: '/movies',
        match: p => p === '/movies' || p.startsWith('/movie/'),
        num: 2
    },
    {
        label: 'Shows',
        path: '/tv-shows',
        match: p => p === '/tv-shows' || p === '/tv' || p.startsWith('/tv-show/') || p.startsWith('/tv/'),
        num: 3
    },
    {
        label: 'Actors',
        path: '/actors',
        match: p => p === '/actors' || p.startsWith('/actor/'),
        num: 4
    },
    { label: 'Watchlist', path: '/watchlist', match: p => p === '/watchlist', num: 5 }
];

export default defineComponent({
    name: 'SiteHeader',
    components: { LmDrawer },
    setup() {
        const route = useRoute();
        const scrolled = ref(false);
        const drawerOpen = ref(false);

        const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);
        const modKey = isMac ? '⌘' : 'Ctrl+';

        const isActive = (item: NavItem) => item.match(route.path);

        const onScroll = () => {
            scrolled.value = window.scrollY > 24;
        };

        const openFromDrawer = () => {
            drawerOpen.value = false;
            openPalette();
        };

        onMounted(() => {
            onScroll();
            window.addEventListener('scroll', onScroll, { passive: true });
        });

        onBeforeUnmount(() => {
            window.removeEventListener('scroll', onScroll);
        });

        return {
            primaryNav,
            scrolled,
            drawerOpen,
            modKey,
            isActive,
            openPalette,
            openFromDrawer
        };
    }
});
</script>

<style lang="scss" scoped>
.site-header {
    position: sticky;
    top: 0;
    z-index: var(--z-header);
    background: transparent;
    transition:
        background-color var(--dur-base) var(--ease-out),
        border-color var(--dur-base) var(--ease-out),
        backdrop-filter var(--dur-base) var(--ease-out);

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
            180deg,
            rgba(11, 10, 8, 0.9) 0%,
            rgba(11, 10, 8, 0) 100%
        );
        pointer-events: none;
        opacity: 1;
        transition: opacity var(--dur-base) var(--ease-out);
    }

    &.is-scrolled {
        background: rgba(11, 10, 8, 0.72);
        backdrop-filter: blur(14px) saturate(1.15);
        border-bottom: 1px solid var(--rule);

        &::before { opacity: 0; }
    }

    &__inner {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-5);
        padding-block: var(--s-3);
        min-height: 68px;
    }

    // ── Logo ─────────────────────────────────────────────────────────────
    &__logo {
        display: inline-flex;
        align-items: center;
        gap: var(--s-3);
        color: var(--bone-50);
    }

    &__mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: var(--ember);
        color: var(--ink-900);
        border-radius: var(--r-sm);
        box-shadow: 0 6px 20px rgba(255, 90, 31, 0.25);
    }

    &__wordmark {
        display: flex;
        flex-direction: column;
        line-height: 1;
    }

    &__name {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-lg);
        letter-spacing: var(--ls-tight);
        font-variation-settings: 'opsz' 72, 'SOFT' 40;
    }

    &__kicker {
        margin-top: 3px;
        color: var(--bone-400);
        font-size: 0.625rem;
    }

    // ── Nav links ────────────────────────────────────────────────────────
    &__nav {
        display: flex;
        gap: var(--s-1);

        @media (max-width: 860px) {
            display: none;
        }
    }

    &__link {
        position: relative;
        padding: var(--s-2) var(--s-4);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 500;
        color: var(--bone-300);
        letter-spacing: var(--ls-snug);
        border-radius: var(--r-pill);
        transition:
            color var(--dur-fast) var(--ease-out),
            background-color var(--dur-fast) var(--ease-out);

        &:hover {
            color: var(--bone-50);
            background: var(--surface-tint);
        }

        &.is-active {
            color: var(--bone-50);

            &::after {
                content: '';
                position: absolute;
                left: 50%;
                bottom: -2px;
                width: 6px;
                height: 6px;
                background: var(--ember);
                border-radius: 50%;
                transform: translateX(-50%);
                box-shadow: 0 0 12px var(--ember-glow);
            }
        }
    }

    // ── Actions ──────────────────────────────────────────────────────────
    &__actions {
        display: flex;
        align-items: center;
        gap: var(--s-2);
    }

    &__search {
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        padding: 0.5rem 0.75rem 0.5rem 0.65rem;
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        color: var(--bone-300);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        min-width: 220px;
        transition:
            background-color var(--dur-fast),
            border-color var(--dur-fast),
            color var(--dur-fast);

        svg { width: 16px; height: 16px; flex: 0 0 auto; }

        &:hover {
            background: var(--surface-tint-hover);
            border-color: var(--rule-strong);
            color: var(--bone-50);
        }

        @media (max-width: 1024px) {
            min-width: 0;
        }
    }

    &__search-label {
        flex: 1;
        text-align: left;

        @media (max-width: 1024px) {
            display: none;
        }
    }

    &__search-kbd {
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        padding: 0.1rem 0.4rem;
        background: var(--ink-700);
        border: 1px solid var(--rule);
        border-radius: var(--r-sm);
        color: var(--bone-300);

        @media (max-width: 1024px) {
            display: none;
        }
    }

    &__icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: var(--r-pill);
        color: var(--bone-200);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        transition:
            color var(--dur-fast),
            background-color var(--dur-fast),
            border-color var(--dur-fast);

        svg { width: 18px; height: 18px; }

        &:hover {
            color: var(--bone-50);
            background: var(--surface-tint-hover);
            border-color: var(--rule-strong);
        }
    }

    &__menu {
        display: none;

        @media (max-width: 860px) {
            display: inline-flex;
        }
    }

    // ── Drawer nav ───────────────────────────────────────────────────────
    &__drawer-nav {
        display: flex;
        flex-direction: column;
    }

    &__drawer-link {
        display: flex;
        align-items: center;
        gap: var(--s-4);
        padding: var(--s-4) var(--s-2);
        border-bottom: 1px solid var(--rule);
        color: var(--bone-200);
        font-family: var(--font-display);
        font-size: var(--fs-2xl);
        font-weight: 400;
        font-variation-settings: 'opsz' 72, 'SOFT' 40;
        text-align: left;
        width: 100%;
        transition: color var(--dur-fast), background-color var(--dur-fast);

        &:hover {
            color: var(--bone-50);
            background: var(--surface-tint);
        }

        &.is-active {
            color: var(--ember);
        }
    }

    &__drawer-num {
        color: var(--bone-500);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        min-width: 28px;
    }

    &__drawer-label {
        flex: 1;
    }

    &__drawer-search {
        color: var(--bone-50);
    }
}
</style>
