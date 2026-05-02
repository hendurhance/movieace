<template>
    <Teleport to="body">
        <Transition name="lm-dialog">
            <div
                v-if="modelValue"
                class="lm-dialog"
                :class="[`lm-dialog--${size}`]"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
                @click.self="handleBackdrop"
                @keydown.esc="handleClose"
            >
                <div class="lm-dialog__panel" ref="panel" tabindex="-1">
                    <header v-if="title || $slots.header" class="lm-dialog__header">
                        <slot name="header">
                            <h3 :id="titleId" class="lm-dialog__title">{{ title }}</h3>
                        </slot>
                        <button
                            v-if="dismissible"
                            class="lm-dialog__close"
                            aria-label="Close dialog"
                            @click="handleClose"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </header>

                    <div class="lm-dialog__body">
                        <slot />
                    </div>

                    <footer v-if="$slots.footer" class="lm-dialog__footer">
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
    name: 'LmDialog',
    props: {
        modelValue: { type: Boolean, required: true },
        title: { type: String, default: '' },
        size: { type: String as PropType<'sm' | 'md' | 'lg' | 'xl'>, default: 'md' },
        dismissible: { type: Boolean, default: true },
        dismissOnBackdrop: { type: Boolean, default: true }
    },
    emits: ['update:modelValue', 'close'],
    setup(props, { emit }) {
        const panel = ref<HTMLElement | null>(null);
        const titleId = `lm-dialog-${++uid}`;
        let prevFocus: HTMLElement | null = null;

        const handleClose = () => {
            if (!props.dismissible) return;
            emit('update:modelValue', false);
            emit('close');
        };

        const handleBackdrop = () => {
            if (!props.dismissOnBackdrop) return;
            handleClose();
        };

        const trap = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !panel.value) return;
            const focusables = panel.value.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        watch(
            () => props.modelValue,
            async open => {
                if (open) {
                    prevFocus = document.activeElement as HTMLElement;
                    document.body.style.overflow = 'hidden';
                    document.addEventListener('keydown', trap);
                    await nextTick();
                    panel.value?.focus();
                } else {
                    document.body.style.overflow = '';
                    document.removeEventListener('keydown', trap);
                    prevFocus?.focus();
                }
            }
        );

        onBeforeUnmount(() => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', trap);
        });

        return { panel, titleId, handleClose, handleBackdrop };
    }
});
</script>

<style lang="scss" scoped>
.lm-dialog {
    position: fixed;
    inset: 0;
    z-index: var(--z-dialog);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--s-4);
    background: var(--overlay-scrim);
    backdrop-filter: blur(12px);

    &__panel {
        position: relative;
        width: 100%;
        background: var(--ink-800);
        border: 1px solid var(--rule);
        border-radius: var(--r-lg);
        box-shadow: var(--shadow-lg);
        max-height: calc(100vh - var(--s-8));
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    &--sm .lm-dialog__panel { max-width: 400px; }
    &--md .lm-dialog__panel { max-width: 560px; }
    &--lg .lm-dialog__panel { max-width: 800px; }
    &--xl .lm-dialog__panel { max-width: 1100px; }

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-4);
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
        overflow: auto;
    }

    &__footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--s-3);
        padding: var(--s-5) var(--s-6);
        border-top: 1px solid var(--rule);
        background: var(--ink-850);
    }
}

// Transitions
.lm-dialog-enter-active,
.lm-dialog-leave-active {
    transition: opacity var(--dur-base) var(--ease-out);

    .lm-dialog__panel {
        transition:
            transform var(--dur-base) var(--ease-out),
            opacity var(--dur-base) var(--ease-out);
    }
}

.lm-dialog-enter-from,
.lm-dialog-leave-to {
    opacity: 0;

    .lm-dialog__panel {
        opacity: 0;
        transform: translateY(16px) scale(0.98);
    }
}
</style>
