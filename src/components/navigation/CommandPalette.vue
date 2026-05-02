<template>
    <Teleport to="body">
        <Transition name="lm-palette">
            <div
                v-if="paletteOpen"
                class="lm-palette"
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                @click.self="close"
                @keydown.esc="close"
            >
                <div class="lm-palette__shell" ref="shell">
                    <div class="lm-palette__input-row">
                        <svg class="lm-palette__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            ref="input"
                            v-model="q"
                            type="text"
                            class="lm-palette__input"
                            placeholder="Search movies, shows, people — or jump to a page"
                            autocomplete="off"
                            spellcheck="false"
                            @keydown="onKey"
                        />
                        <kbd class="lm-palette__esc">ESC</kbd>
                    </div>

                    <div class="lm-palette__list" ref="list" role="listbox">
                        <!-- Search action (shown when user has typed something) -->
                        <div v-if="q.trim()" class="lm-palette__group">
                            <div class="lm-palette__group-label eyebrow">Search</div>
                            <button
                                class="lm-palette__item"
                                :class="{ 'is-active': activeIdx === 0 }"
                                role="option"
                                :aria-selected="activeIdx === 0"
                                @mouseenter="activeIdx = 0"
                                @click="runSearch"
                            >
                                <span class="lm-palette__item-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                </span>
                                <span class="lm-palette__item-label">
                                    Search for <em>&ldquo;{{ q.trim() }}&rdquo;</em>
                                </span>
                                <span class="lm-palette__item-hint meta">↵</span>
                            </button>
                        </div>

                        <!-- Recent searches -->
                        <div
                            v-if="!q.trim() && searchHistory.length"
                            class="lm-palette__group"
                        >
                            <div class="lm-palette__group-label eyebrow">Recent</div>
                            <button
                                v-for="(term, i) in searchHistory.slice(0, 5)"
                                :key="`r-${term}`"
                                class="lm-palette__item"
                                :class="{ 'is-active': activeIdx === i }"
                                role="option"
                                :aria-selected="activeIdx === i"
                                @mouseenter="activeIdx = i"
                                @click="runRecent(term)"
                            >
                                <span class="lm-palette__item-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="M12 7v5l3 2" />
                                    </svg>
                                </span>
                                <span class="lm-palette__item-label">{{ term }}</span>
                            </button>
                        </div>

                        <!-- Jump to -->
                        <div class="lm-palette__group">
                            <div class="lm-palette__group-label eyebrow">Jump to</div>
                            <button
                                v-for="(item, i) in filteredJump"
                                :key="item.path"
                                class="lm-palette__item"
                                :class="{ 'is-active': activeIdx === jumpOffset + i }"
                                role="option"
                                :aria-selected="activeIdx === jumpOffset + i"
                                @mouseenter="activeIdx = jumpOffset + i"
                                @click="goTo(item.path)"
                            >
                                <span class="lm-palette__item-icon" v-html="item.icon" />
                                <span class="lm-palette__item-label">{{ item.label }}</span>
                                <span class="lm-palette__item-hint meta">{{ item.hint }}</span>
                            </button>
                        </div>

                        <div v-if="!hasAnyResult" class="lm-palette__empty">
                            No matches. Press <kbd>↵</kbd> to search TMDB for
                            <em>&ldquo;{{ q.trim() }}&rdquo;</em>
                        </div>
                    </div>

                    <footer class="lm-palette__footer">
                        <span class="meta">
                            <kbd>↑</kbd><kbd>↓</kbd> Navigate
                        </span>
                        <span class="meta"><kbd>↵</kbd> Select</span>
                        <span class="meta"><kbd>ESC</kbd> Close</span>
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { paletteOpen, closePalette } from '../../composables/useCommandPalette';
import { searchHistory, addSearchTerm } from '../../composables/useHistory';

interface JumpItem {
    label: string;
    path: string;
    hint: string;
    icon: string; // inline svg string
}

const JUMP: JumpItem[] = [
    {
        label: 'Home',
        path: '/',
        hint: 'G H',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 11 12 3l9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>'
    },
    {
        label: 'Movies',
        path: '/movies',
        hint: 'G M',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 14h4M17 9h4M17 14h4"/></svg>'
    },
    {
        label: 'TV Shows',
        path: '/tv-shows',
        hint: 'G T',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="m8 3 4 3 4-3"/></svg>'
    },
    {
        label: 'Actors',
        path: '/actors',
        hint: 'G A',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
    },
    {
        label: 'Watchlist',
        path: '/watchlist',
        hint: 'G W',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'
    },
    {
        label: 'Search',
        path: '/search',
        hint: 'G S',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'
    }
];

export default defineComponent({
    name: 'CommandPalette',
    setup() {
        const router = useRouter();
        const q = ref('');
        const activeIdx = ref(0);
        const input = ref<HTMLInputElement | null>(null);
        const list = ref<HTMLElement | null>(null);
        const shell = ref<HTMLElement | null>(null);

        const filteredJump = computed(() => {
            const needle = q.value.trim().toLowerCase();
            if (!needle) return JUMP;
            return JUMP.filter(j =>
                j.label.toLowerCase().includes(needle) || j.path.includes(needle)
            );
        });

        // Rows: [search?] + [recent*] + [jump*]
        const jumpOffset = computed(() => {
            if (q.value.trim()) return 1;
            return searchHistory.value.length ? Math.min(5, searchHistory.value.length) : 0;
        });

        const rowCount = computed(() => {
            const searchRow = q.value.trim() ? 1 : 0;
            const recent = q.value.trim() ? 0 : Math.min(5, searchHistory.value.length);
            return searchRow + recent + filteredJump.value.length;
        });

        const hasAnyResult = computed(() => rowCount.value > 0);

        const close = () => {
            closePalette();
        };

        const runSearch = () => {
            const term = q.value.trim();
            if (!term) return;
            addSearchTerm(term);
            router.push({ name: 'Search', query: { search: term } });
            close();
        };

        const runRecent = (term: string) => {
            q.value = term;
            runSearch();
        };

        const goTo = (path: string) => {
            router.push(path);
            close();
        };

        const onEnter = () => {
            // Dispatch based on active row.
            if (q.value.trim() && activeIdx.value === 0) {
                runSearch();
                return;
            }
            const jumpIdx = activeIdx.value - jumpOffset.value;
            if (jumpIdx >= 0 && jumpIdx < filteredJump.value.length) {
                goTo(filteredJump.value[jumpIdx].path);
                return;
            }
            const recentIdx = activeIdx.value;
            if (!q.value.trim() && recentIdx < searchHistory.value.length) {
                runRecent(searchHistory.value[recentIdx]);
                return;
            }
            if (q.value.trim()) runSearch();
        };

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIdx.value = (activeIdx.value + 1) % Math.max(1, rowCount.value);
                scrollActiveIntoView();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIdx.value =
                    (activeIdx.value - 1 + Math.max(1, rowCount.value)) %
                    Math.max(1, rowCount.value);
                scrollActiveIntoView();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onEnter();
            }
        };

        const scrollActiveIntoView = () => {
            nextTick(() => {
                const el = list.value?.querySelector<HTMLElement>('.is-active');
                el?.scrollIntoView({ block: 'nearest' });
            });
        };

        watch(paletteOpen, async open => {
            if (open) {
                q.value = '';
                activeIdx.value = 0;
                await nextTick();
                input.value?.focus();
            }
        });

        watch(q, () => {
            activeIdx.value = 0;
        });

        return {
            paletteOpen,
            q,
            activeIdx,
            jumpOffset,
            filteredJump,
            hasAnyResult,
            searchHistory,
            input,
            list,
            shell,
            close,
            onKey,
            runSearch,
            runRecent,
            goTo
        };
    }
});
</script>

<style lang="scss" scoped>
.lm-palette {
    position: fixed;
    inset: 0;
    z-index: var(--z-command);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 14vh var(--s-4) var(--s-4);
    background: var(--overlay-scrim);
    backdrop-filter: blur(16px);

    &__shell {
        width: 100%;
        max-width: 640px;
        background: var(--ink-800);
        border: 1px solid var(--rule-strong);
        border-radius: var(--r-lg);
        box-shadow: var(--shadow-lg), 0 0 0 1px rgba(255, 90, 31, 0.05);
        display: flex;
        flex-direction: column;
        max-height: 72vh;
        overflow: hidden;
    }

    &__input-row {
        display: flex;
        align-items: center;
        gap: var(--s-3);
        padding: var(--s-4) var(--s-5);
        border-bottom: 1px solid var(--rule);
    }

    &__icon {
        width: 20px;
        height: 20px;
        color: var(--bone-400);
        flex: 0 0 auto;
    }

    &__input {
        flex: 1;
        background: transparent;
        border: 0;
        outline: 0;
        font-family: var(--font-ui);
        font-size: var(--fs-lg);
        font-weight: 400;
        letter-spacing: var(--ls-snug);
        color: var(--bone-50);

        &::placeholder {
            color: var(--bone-400);
        }
    }

    &__esc {
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        padding: 0.2rem 0.5rem;
        border: 1px solid var(--rule-strong);
        border-radius: var(--r-sm);
        color: var(--bone-400);
        background: var(--ink-700);
    }

    &__list {
        flex: 1;
        overflow-y: auto;
        padding: var(--s-2) 0;
    }

    &__group {
        padding: var(--s-2) 0;

        & + & {
            border-top: 1px solid var(--rule);
            margin-top: var(--s-2);
        }
    }

    &__group-label {
        padding: var(--s-2) var(--s-5);
        color: var(--bone-400);
    }

    &__item {
        display: flex;
        align-items: center;
        gap: var(--s-3);
        width: 100%;
        padding: var(--s-3) var(--s-5);
        background: transparent;
        text-align: left;
        color: var(--bone-200);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        transition: background-color var(--dur-fast), color var(--dur-fast);

        &.is-active {
            background: var(--surface-tint-hover);
            color: var(--bone-50);
        }

        em {
            color: var(--ember);
            font-style: italic;
            font-family: var(--font-display);
            font-weight: 500;
            font-variation-settings: 'opsz' 144, 'SOFT' 80;
        }
    }

    &__item-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: var(--r-sm);
        background: var(--ink-700);
        color: var(--bone-300);
        flex: 0 0 auto;

        :deep(svg) {
            width: 16px;
            height: 16px;
        }

        .is-active & {
            color: var(--ember);
            background: rgba(255, 90, 31, 0.12);
        }
    }

    &__item-label {
        flex: 1;
    }

    &__item-hint {
        color: var(--bone-400);
    }

    &__empty {
        padding: var(--s-5) var(--s-5) var(--s-6);
        color: var(--bone-400);
        font-size: var(--fs-sm);

        em {
            color: var(--ember);
            font-style: italic;
        }

        kbd {
            font-family: var(--font-mono);
            font-size: 0.75rem;
            padding: 0.15rem 0.4rem;
            background: var(--ink-700);
            border-radius: var(--r-sm);
        }
    }

    &__footer {
        display: flex;
        gap: var(--s-5);
        padding: var(--s-3) var(--s-5);
        border-top: 1px solid var(--rule);
        background: var(--ink-850);

        .meta {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;

            kbd {
                font-family: var(--font-mono);
                font-size: 0.6875rem;
                padding: 0.1rem 0.4rem;
                background: var(--ink-700);
                border: 1px solid var(--rule);
                border-radius: var(--r-sm);
                color: var(--bone-200);
            }
        }
    }
}

// ── Transition ─────────────────────────────────────────────────────────────
.lm-palette-enter-active,
.lm-palette-leave-active {
    transition: opacity var(--dur-base) var(--ease-out);

    .lm-palette__shell {
        transition:
            transform var(--dur-base) var(--ease-out),
            opacity var(--dur-base) var(--ease-out);
    }
}

.lm-palette-enter-from,
.lm-palette-leave-to {
    opacity: 0;

    .lm-palette__shell {
        opacity: 0;
        transform: translateY(-12px) scale(0.98);
    }
}
</style>
