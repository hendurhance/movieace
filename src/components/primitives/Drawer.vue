<template>
    <Teleport to="body">
        <Transition name="lm-drawer">
            <div
                v-if="modelValue"
                class="lm-drawer"
                :class="[`lm-drawer--${side}`]"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
                @click.self="handleBackdrop"
                @keydown.esc="handleClose"
            >
                <div class="lm-drawer__panel" ref="panel" tabindex="-1">
                    <header v-if="title || $slots.header" class="lm-drawer__header">
                        <slot name="header">
                            <h3 :id="titleId" class="lm-drawer__title">{{ title }}</h3>
                        </slot>
                        <button
                            v-if="dismissible"
                            class="lm-drawer__close"
                            aria-label="Close drawer"
                            @click="handleClose"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </header>

                    <div class="lm-drawer__body">
                        <slot />
                    </div>

                    <footer v-if="$slots.footer" class="lm-drawer__footer">
                        <slot name="footer" />
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts">
import { defineComponent, nextTick, onBeforeUnmount, PropType, ref, watch } from 'vue';

let uid = 0;

export default defineComponent({
    name: 'LmDrawer',
    props: {
        modelValue: { type: Boolean, required: true },
        title: { type: String, default: '' },
        side: { type: String as PropType<'left' | 'right'>, default: 'right' },
        dismissible: { type: Boolean, default: true }
    },
    emits: ['update:modelValue', 'close'],
    setup(props, { emit }) {
        const panel = ref<HTMLElement | null>(null);
        const titleId = `lm-drawer-${++uid}`;
        let prevFocus: HTMLElement | null = null;

        const handleClose = () => {
            if (!props.dismissible) return;
            emit('update:modelValue', false);
            emit('close');
        };

        const handleBackdrop = () => handleClose();

        watch(
            () => props.modelValue,
            async open => {
                if (open) {
                    prevFocus = document.activeElement as HTMLElement;
                    document.body.style.overflow = 'hidden';
                    await nextTick();
                    panel.value?.focus();
                } else {
                    document.body.style.overflow = '';
                    prevFocus?.focus();
                }
            }
        );

        onBeforeUnmount(() => {
            document.body.style.overflow = '';
        });

        return { panel, titleId, handleClose, handleBackdrop };
    }
});
</script>

<style lang="scss" scoped>
.lm-drawer {
    position: fixed;
    inset: 0;
    z-index: var(--z-drawer);
    background: var(--overlay-scrim);
    backdrop-filter: blur(8px);
    display: flex;

    &--left { justify-content: flex-start; }
    &--right { justify-content: flex-end; }

    &__panel {
        position: relative;
        width: 100%;
        max-width: 420px;
        height: 100%;
        background: var(--ink-800);
        border-inline: 1px solid var(--rule);
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
    }

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--s-5) var(--s-6);
        border-bottom: 1px solid var(--rule);
    }

    &__title {
        font-family: var(--font-display);
        font-size: var(--fs-xl);
        font-weight: 500;
        margin: 0;
    }

    &__close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: var(--r-pill);
        color: var(--bone-200);
        transition: background-color var(--dur-fast), color var(--dur-fast);

        svg { width: 18px; height: 18px; }

        &:hover {
            background: var(--surface-tint);
            color: var(--bone-50);
        }
    }

    &__body {
        padding: var(--s-6);
        overflow-y: auto;
        flex: 1;
    }

    &__footer {
        padding: var(--s-5) var(--s-6);
        border-top: 1px solid var(--rule);
        background: var(--ink-850);
    }
}

// Transitions
.lm-drawer-enter-active,
.lm-drawer-leave-active {
    transition: opacity var(--dur-base) var(--ease-out);

    .lm-drawer__panel {
        transition: transform var(--dur-base) var(--ease-out);
    }
}

.lm-drawer-enter-from,
.lm-drawer-leave-to {
    opacity: 0;
}

.lm-drawer--right.lm-drawer-enter-from .lm-drawer__panel,
.lm-drawer--right.lm-drawer-leave-to .lm-drawer__panel {
    transform: translateX(100%);
}

.lm-drawer--left.lm-drawer-enter-from .lm-drawer__panel,
.lm-drawer--left.lm-drawer-leave-to .lm-drawer__panel {
    transform: translateX(-100%);
}
</style>
