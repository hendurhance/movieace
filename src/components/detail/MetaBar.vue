<template>
    <dl class="metabar meta" :aria-label="ariaLabel">
        <template v-for="item in visibleItems" :key="item.label">
            <div class="metabar__entry">
                <dt class="metabar__label">{{ item.label }}</dt>
                <dd class="metabar__value" :class="{ 'metabar__value--accent': item.accent }">
                    <template v-if="item.href">
                        <a :href="item.href" target="_blank" rel="noopener noreferrer" class="metabar__link">
                            {{ item.value }}
                            <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="M14 4h6v6M20 4L10 14M5 5h4M5 19h14v-8" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                    </template>
                    <template v-else>
                        {{ item.value }}
                    </template>
                </dd>
            </div>
        </template>
    </dl>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

export interface MetaEntry {
    label: string;
    value: string | number | null | undefined;
    href?: string;
    accent?: boolean;
}

export default defineComponent({
    name: 'MetaBar',
    props: {
        items: { type: Array as PropType<MetaEntry[]>, required: true },
        ariaLabel: { type: String, default: 'Title metadata' }
    },
    setup(props) {
        const visibleItems = computed(() =>
            (props.items ?? []).filter(
                i => i && i.value !== null && i.value !== undefined && i.value !== ''
            )
        );
        return { visibleItems };
    }
});
</script>

<style lang="scss" scoped>
.metabar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--s-5) var(--s-6);
    padding: var(--s-5) 0;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    margin: 0;

    &__entry {
        display: flex;
        flex-direction: column;
        gap: var(--s-1);
        min-width: 0;
    }

    &__label {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: var(--bone-400);
        margin: 0;
    }

    &__value {
        font-family: var(--font-ui);
        font-size: var(--fs-base);
        color: var(--bone-50);
        margin: 0;
        line-height: 1.35;
        overflow-wrap: break-word;

        &--accent {
            color: var(--gold-leaf);
        }
    }

    &__link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: inherit;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition:
            color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out);

        &:hover, &:focus-visible {
            color: var(--ember);
            border-color: currentColor;
        }

        svg {
            opacity: 0.7;
        }
    }
}
</style>
