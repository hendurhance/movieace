<template>
    <div class="lm-tabs" :class="[`lm-tabs--${variant}`]">
        <div
            ref="tablist"
            class="lm-tabs__list"
            role="tablist"
            :aria-label="ariaLabel"
            @keydown="onKeydown"
        >
            <button
                v-for="(tab, idx) in tabs"
                :key="tab.value"
                :ref="el => setTabRef(el as HTMLElement, idx)"
                role="tab"
                :aria-selected="tab.value === modelValue"
                :aria-controls="`panel-${tab.value}`"
                :id="`tab-${tab.value}`"
                :tabindex="tab.value === modelValue ? 0 : -1"
                class="lm-tabs__tab"
                :class="{ 'is-active': tab.value === modelValue }"
                @click="select(tab.value)"
            >
                <span v-if="tab.count !== undefined" class="lm-tabs__count">{{ tab.count }}</span>
                <span class="lm-tabs__label">{{ tab.label }}</span>
            </button>
            <span class="lm-tabs__indicator" :style="indicatorStyle" aria-hidden="true" />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, PropType, ref, watch } from 'vue';

export interface TabDef {
    label: string;
    value: string;
    count?: number;
}

export default defineComponent({
    name: 'LmTabs',
    props: {
        tabs: { type: Array as PropType<TabDef[]>, required: true },
        modelValue: { type: String, required: true },
        ariaLabel: { type: String, default: 'Tabs' },
        variant: { type: String as PropType<'underline' | 'pill'>, default: 'underline' }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const tablist = ref<HTMLElement | null>(null);
        const tabRefs = ref<HTMLElement[]>([]);
        const indicatorStyle = ref<Record<string, string>>({});

        const setTabRef = (el: HTMLElement | null, idx: number) => {
            if (el) tabRefs.value[idx] = el;
        };

        const activeIdx = computed(() =>
            props.tabs.findIndex(t => t.value === props.modelValue)
        );

        const updateIndicator = async () => {
            await nextTick();
            const el = tabRefs.value[activeIdx.value];
            if (!el || !tablist.value) return;
            const parentRect = tablist.value.getBoundingClientRect();
            const rect = el.getBoundingClientRect();
            indicatorStyle.value = {
                width: `${rect.width}px`,
                transform: `translateX(${rect.left - parentRect.left}px)`
            };
        };

        const select = (value: string) => emit('update:modelValue', value);

        const onKeydown = (e: KeyboardEvent) => {
            const last = props.tabs.length - 1;
            let next = activeIdx.value;
            if (e.key === 'ArrowRight') next = activeIdx.value === last ? 0 : activeIdx.value + 1;
            else if (e.key === 'ArrowLeft') next = activeIdx.value === 0 ? last : activeIdx.value - 1;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = last;
            else return;
            e.preventDefault();
            const nextTab = props.tabs[next];
            select(nextTab.value);
            nextTick(() => tabRefs.value[next]?.focus());
        };

        watch(() => props.modelValue, updateIndicator);
        watch(() => props.tabs.length, updateIndicator);
        onMounted(() => {
            updateIndicator();
            window.addEventListener('resize', updateIndicator);
        });

        return {
            tablist,
            tabRefs,
            setTabRef,
            indicatorStyle,
            select,
            onKeydown
        };
    }
});
</script>

<style lang="scss" scoped>
.lm-tabs {
    &__list {
        position: relative;
        display: inline-flex;
        gap: var(--s-2);
        padding: 0;
        border-bottom: 1px solid var(--rule);
    }

    &__tab {
        position: relative;
        padding: var(--s-3) var(--s-4);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 500;
        color: var(--bone-400);
        letter-spacing: var(--ls-snug);
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        transition: color var(--dur-fast) var(--ease-out);

        &:hover { color: var(--bone-200); }
        &.is-active { color: var(--bone-50); }
    }

    &__count {
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        color: var(--bone-400);
        background: var(--surface-tint);
        padding: 0.1rem 0.45rem;
        border-radius: var(--r-pill);
        .is-active & {
            color: var(--ember);
            background: rgba(255, 90, 31, 0.14);
        }
    }

    &__indicator {
        position: absolute;
        bottom: -1px;
        left: 0;
        height: 2px;
        background: var(--ember);
        border-radius: 1px;
        transition:
            transform var(--dur-base) var(--ease-out),
            width var(--dur-base) var(--ease-out);
    }

    // Pill variant
    &--pill {
        .lm-tabs__list {
            border: 0;
            background: var(--surface-tint);
            border-radius: var(--r-pill);
            padding: var(--s-1);
        }

        .lm-tabs__tab {
            padding: var(--s-2) var(--s-4);
            border-radius: var(--r-pill);
            &.is-active { color: var(--ink-900); }
        }

        .lm-tabs__indicator {
            top: var(--s-1);
            bottom: var(--s-1);
            height: auto;
            background: var(--bone-50);
            border-radius: var(--r-pill);
            z-index: -1;
        }
    }
}
</style>
