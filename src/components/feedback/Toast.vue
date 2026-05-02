<template>
  <Teleport to="body">
    <div class="toast-root" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="toast" tag="ul" class="toast-stack">
        <li
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
          role="status"
        >
          <span class="toast__rule" aria-hidden="true" />

          <span class="toast__icon" aria-hidden="true">
            <CheckCircleIcon v-if="toast.type === 'success'" />
            <AlertTriangleIcon v-else-if="toast.type === 'error'" />
            <AlertTriangleIcon v-else-if="toast.type === 'warning'" />
            <InfoIcon v-else />
          </span>

          <p class="toast__message">{{ toast.message }}</p>

          <button
            type="button"
            class="toast__close"
            aria-label="Dismiss"
            @click="removeToast(toast.id)"
          >
            <XIcon />
          </button>
        </li>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useToast } from '../../composables/useToast';
import CheckCircleIcon from '../svg/outline/check-circle.vue';
import AlertTriangleIcon from '../svg/outline/alert-triangle.vue';
import InfoIcon from '../svg/outline/info.vue';
import XIcon from '../svg/outline/x.vue';

export default defineComponent({
    name: 'Toast',
    components: { CheckCircleIcon, AlertTriangleIcon, InfoIcon, XIcon },
    setup() {
        const { toasts, removeToast } = useToast();
        return { toasts, removeToast };
    }
});
</script>

<style scoped lang="scss">
.toast-root {
    position: fixed;
    top: clamp(var(--s-4), 4vh, var(--s-6));
    right: clamp(var(--s-4), 3vw, var(--s-6));
    z-index: var(--z-toast);
    pointer-events: none;
    display: flex;
    flex-direction: column;
}

.toast-stack {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    max-width: 420px;
}

.toast {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: start;
    gap: var(--s-3);
    padding: var(--s-4) var(--s-5);
    padding-left: calc(var(--s-5) + 3px);

    background: rgba(19, 17, 14, 0.92);
    border: 1px solid var(--rule);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(14px) saturate(1.1);
    -webkit-backdrop-filter: blur(14px) saturate(1.1);

    color: var(--bone-100);
    font-family: var(--font-ui);
    font-size: var(--fs-sm);
    line-height: 1.45;

    pointer-events: auto;
    overflow: hidden;
    transition:
        transform var(--dur-base) var(--ease-out),
        box-shadow var(--dur-base) var(--ease-out),
        border-color var(--dur-base) var(--ease-out);

    &:hover {
        transform: translateY(-1px);
        border-color: var(--rule-strong);
        box-shadow: var(--shadow-lg);
    }
}

.toast__rule {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--ember);
}

.toast--success .toast__rule { background: var(--success); }
.toast--success .toast__icon  { color: var(--success); }

.toast--error   .toast__rule { background: var(--danger); }
.toast--error   .toast__icon { color: var(--danger); }

.toast--warning .toast__rule { background: var(--warn); }
.toast--warning .toast__icon { color: var(--warn); }

.toast--info    .toast__rule { background: var(--ember); }
.toast--info    .toast__icon { color: var(--ember); }

.toast__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
        width: 18px;
        height: 18px;
    }
}

.toast__message {
    margin: 0;
    color: var(--bone-100);
    font-weight: 500;
    text-wrap: pretty;
    overflow-wrap: anywhere;
}

.toast__close {
    flex-shrink: 0;
    background: transparent;
    border: 0;
    padding: 2px;
    margin: -2px -4px 0 0;
    border-radius: var(--r-sm);
    color: var(--bone-400);
    cursor: pointer;
    transition:
        color var(--dur-fast) var(--ease-out),
        background var(--dur-fast) var(--ease-out);

    &:hover,
    &:focus-visible {
        color: var(--bone-50);
        background: var(--surface-tint-hover);
    }

    svg {
        width: 14px;
        height: 14px;
    }
}

// ── Motion ────────────────────────────────────────────────────────────────
.toast-enter-active,
.toast-leave-active {
    transition:
        opacity var(--dur-base) var(--ease-out),
        transform var(--dur-base) var(--ease-out);
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(24px) scale(0.98);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(24px) scale(0.98);
}

.toast-leave-active {
    position: absolute;
}

@media (prefers-reduced-motion: reduce) {
    .toast { transition: none; }
    .toast:hover { transform: none; }
    .toast-enter-from,
    .toast-leave-to {
        transform: none;
    }
}

// ── Mobile ────────────────────────────────────────────────────────────────
@media (max-width: 640px) {
    .toast-root {
        top: var(--s-3);
        right: var(--s-3);
        left: var(--s-3);
    }
    .toast-stack {
        max-width: none;
    }
    .toast {
        padding: var(--s-3) var(--s-4);
        padding-left: calc(var(--s-4) + 3px);
        font-size: var(--fs-xs);
    }
}
</style>
