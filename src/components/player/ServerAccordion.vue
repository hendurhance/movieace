<template>
    <section class="server-accordion" :class="{ 'is-open': open }">
        <button
            type="button"
            class="server-accordion__head"
            :aria-expanded="open"
            aria-controls="server-accordion-body"
            @click="open = !open"
        >
            <div class="server-accordion__heading">
                <p class="eyebrow">Projection</p>
                <h3 class="server-accordion__title">Server room</h3>
            </div>

            <div class="server-accordion__summary">
                <LmPill tone="ember" size="md">
                    <span class="server-accordion__dot" aria-hidden="true" />
                    {{ activeServerName }}
                </LmPill>
                <span class="meta server-accordion__count">{{ servers.length }} mirrors</span>
                <span class="server-accordion__chev" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </span>
            </div>
        </button>

        <div
            id="server-accordion-body"
            class="server-accordion__body"
            :hidden="!open"
        >
            <ul class="server-accordion__grid" role="listbox" aria-label="Available stream servers">
                <li v-for="(server, index) in servers" :key="server.name + index">
                    <button
                        type="button"
                        class="server-card"
                        :class="{
                            'is-active': activeServerIndex === index,
                            'is-loading': loadingIndex === index
                        }"
                        role="option"
                        :aria-selected="activeServerIndex === index"
                        :title="`${server.name} (server ${index + 1})`"
                        @click="select(index)"
                    >
                        <span class="server-card__index meta">{{ String(index + 1).padStart(2, '0') }}</span>
                        <span class="server-card__body">
                            <span class="server-card__name">{{ server.name }}</span>
                            <span class="server-card__hint meta">
                                {{ serverHint(index) }}
                            </span>
                        </span>
                        <span class="server-card__state" aria-hidden="true">
                            <span v-if="activeServerIndex === index" class="server-card__active">Live</span>
                            <span v-else-if="loadingIndex === index" class="server-card__pulse" />
                        </span>
                    </button>
                </li>
            </ul>

            <p class="server-accordion__tip meta">
                Switch mirrors if the server stutters or the movie/show won't load.
            </p>
        </div>
    </section>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import LmPill from '../primitives/Pill.vue';
import { Server } from '../../composables/useStream';

export default defineComponent({
    name: 'ServerAccordion',
    components: { LmPill },
    props: {
        servers: { type: Array as PropType<Server[]>, required: true },
        activeServerIndex: { type: Number, required: true }
    },
    emits: ['server-change'],
    setup(props, { emit }) {
        const open = useStorage<boolean>('lm:server-accordion:open', true);
        const loadingIndex = ref<number | null>(null);

        const activeServerName = computed(
            () => props.servers[props.activeServerIndex]?.name || 'Server'
        );

        const serverHint = (index: number) => {
            if (props.activeServerIndex === index) return 'Currently projecting';
            return `Mirror ${index + 1}`;
        };

        const select = (index: number) => {
            if (index === props.activeServerIndex) return;

            loadingIndex.value = index;
            emit('server-change', index);
            window.setTimeout(() => {
                loadingIndex.value = null;
            }, 1000);
        };

        return {
            open,
            loadingIndex,
            activeServerName,
            serverHint,
            select
        };
    }
});
</script>

<style lang="scss" scoped>
.server-accordion {
    background: var(--ink-800);
    border-radius: var(--r-lg);
    box-shadow: inset 0 0 0 1px var(--rule);
    overflow: hidden;

    &__head {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-4);
        width: 100%;
        padding: var(--s-4) var(--s-5);
        cursor: pointer;
        transition: background-color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--surface-tint);
        }

        &:focus-visible {
            outline: 2px solid var(--ember);
            outline-offset: -2px;
        }
    }

    &__heading {
        display: grid;
        gap: 0.15rem;
    }

    &__title {
        font-family: var(--font-display);
        font-size: var(--fs-xl);
        font-weight: 500;
        margin: 0;
        color: var(--bone-50);
        letter-spacing: var(--ls-tight);
    }

    &__summary {
        display: inline-flex;
        align-items: center;
        gap: var(--s-3);
    }

    &__count {
        color: var(--bone-400);

        @media (max-width: 540px) {
            display: none;
        }
    }

    &__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--ember);
        box-shadow: 0 0 8px var(--ember-glow);
    }

    &__chev {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        color: var(--bone-300);
        transition: transform var(--dur-base) var(--ease-out);

        svg { width: 18px; height: 18px; }
    }

    &.is-open &__chev {
        transform: rotate(180deg);
    }

    &__body {
        padding: 0 var(--s-5) var(--s-5);
        border-top: 1px solid var(--rule);
        animation: serverFade var(--dur-base) var(--ease-out);
    }

    &__grid {
        list-style: none;
        margin: var(--s-4) 0 0;
        padding: 0;
        display: grid;
        gap: var(--s-3);
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }

    &__tip {
        margin: var(--s-4) 0 0;
        color: var(--bone-400);
    }
}

.server-card {
    all: unset;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--s-3);
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    padding: var(--s-3) var(--s-4);
    background: var(--ink-700);
    border-radius: var(--r-md);
    box-shadow: inset 0 0 0 1px var(--rule);
    cursor: pointer;
    color: var(--bone-100);
    transition:
        background-color var(--dur-fast) var(--ease-out),
        box-shadow var(--dur-fast) var(--ease-out),
        transform var(--dur-fast) var(--ease-out);

    &:hover:not(.is-disabled):not(.is-active) {
        background: var(--ink-600);
        box-shadow: inset 0 0 0 1px var(--rule-strong);
        transform: translateY(-1px);
    }

    &:focus-visible {
        outline: 2px solid var(--ember);
        outline-offset: 2px;
    }

    &.is-active {
        background: linear-gradient(135deg, rgba(255, 90, 31, 0.14), rgba(255, 90, 31, 0.06));
        box-shadow:
            inset 0 0 0 1px rgba(255, 90, 31, 0.45),
            0 0 0 1px rgba(255, 90, 31, 0.12);
    }

    &.is-disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    &__index {
        color: var(--bone-400);
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
    }

    &__body {
        display: grid;
        gap: 0.15rem;
        min-width: 0;
    }

    &__name {
        font-family: var(--font-ui);
        font-weight: 600;
        color: var(--bone-50);
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        font-size: var(--fs-base);
    }

    &__wp {
        width: 14px;
        height: 14px;
        color: var(--gold-leaf);
    }

    &__hint {
        color: var(--bone-400);
    }

    &__state {
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
    }

    &__active {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: var(--ls-micro);
        color: var(--ember);
    }

    &__pulse {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid var(--rule-strong);
        border-top-color: var(--ember);
        animation: serverPulse 0.9s linear infinite;
    }
}

@keyframes serverFade {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes serverPulse {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .server-accordion__body,
    .server-card__pulse,
    .server-accordion__chev {
        animation: none;
        transition: none;
    }
}
</style>
