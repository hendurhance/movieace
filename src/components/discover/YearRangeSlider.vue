<template>
    <div class="range">
        <header class="range__head">
            <p class="eyebrow range__label">{{ label }}</p>
            <p class="range__display meta" aria-live="polite">
                <span>{{ localMin }}</span>
                <span class="range__dash" aria-hidden="true">–</span>
                <span>{{ localMax }}</span>
            </p>
        </header>

        <div
            class="range__track"
            ref="trackEl"
            @pointerdown="onTrackPointerDown"
        >
            <div class="range__rail" aria-hidden="true" />
            <div class="range__fill" :style="fillStyle" aria-hidden="true" />

            <button
                type="button"
                class="range__handle range__handle--min"
                :style="{ left: `${minPct}%` }"
                :aria-label="`Minimum ${label.toLowerCase()}`"
                :aria-valuemin="min"
                :aria-valuemax="localMax"
                :aria-valuenow="localMin"
                role="slider"
                @keydown="onKey('min', $event)"
                @pointerdown.stop="startDrag('min', $event)"
            >
                <span class="range__grip" aria-hidden="true" />
            </button>

            <button
                type="button"
                class="range__handle range__handle--max"
                :style="{ left: `${maxPct}%` }"
                :aria-label="`Maximum ${label.toLowerCase()}`"
                :aria-valuemin="localMin"
                :aria-valuemax="max"
                :aria-valuenow="localMax"
                role="slider"
                @keydown="onKey('max', $event)"
                @pointerdown.stop="startDrag('max', $event)"
            >
                <span class="range__grip" aria-hidden="true" />
            </button>
        </div>

        <div class="range__ticks" aria-hidden="true">
            <span>{{ min }}</span>
            <span>{{ max }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, PropType, ref, watch } from 'vue';

export default defineComponent({
    name: 'YearRangeSlider',
    props: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        modelValue: {
            type: Array as unknown as PropType<[number, number]>,
            required: true
        },
        label: { type: String, default: 'Year range' },
        step: { type: Number, default: 1 }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const trackEl = ref<HTMLElement | null>(null);
        const localMin = ref(props.modelValue[0] ?? props.min);
        const localMax = ref(props.modelValue[1] ?? props.max);

        watch(
            () => props.modelValue,
            ([lo, hi]) => {
                if (lo !== localMin.value) localMin.value = lo;
                if (hi !== localMax.value) localMax.value = hi;
            }
        );

        const span = computed(() => Math.max(1, props.max - props.min));
        const minPct = computed(() => ((localMin.value - props.min) / span.value) * 100);
        const maxPct = computed(() => ((localMax.value - props.min) / span.value) * 100);

        const fillStyle = computed(() => ({
            left: `${minPct.value}%`,
            right: `${100 - maxPct.value}%`
        }));

        const commit = () => {
            emit('update:modelValue', [localMin.value, localMax.value] as [number, number]);
        };

        const clamp = (n: number, lo: number, hi: number) =>
            Math.min(Math.max(n, lo), hi);

        const valueFromPointer = (clientX: number) => {
            if (!trackEl.value) return props.min;
            const rect = trackEl.value.getBoundingClientRect();
            const pct = clamp((clientX - rect.left) / rect.width, 0, 1);
            const raw = props.min + pct * span.value;
            return Math.round(raw / props.step) * props.step;
        };

        let dragging: 'min' | 'max' | null = null;

        const onPointerMove = (e: PointerEvent) => {
            if (!dragging) return;
            const next = valueFromPointer(e.clientX);
            if (dragging === 'min') {
                localMin.value = clamp(next, props.min, localMax.value - props.step);
            } else {
                localMax.value = clamp(next, localMin.value + props.step, props.max);
            }
        };

        const onPointerUp = () => {
            if (!dragging) return;
            dragging = null;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            commit();
        };

        const startDrag = (which: 'min' | 'max', e: PointerEvent) => {
            (e.currentTarget as HTMLElement)?.focus();
            dragging = which;
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        };

        const onTrackPointerDown = (e: PointerEvent) => {
            const v = valueFromPointer(e.clientX);
            const distToMin = Math.abs(v - localMin.value);
            const distToMax = Math.abs(v - localMax.value);
            const which: 'min' | 'max' = distToMin <= distToMax ? 'min' : 'max';
            if (which === 'min') {
                localMin.value = clamp(v, props.min, localMax.value - props.step);
            } else {
                localMax.value = clamp(v, localMin.value + props.step, props.max);
            }
            commit();
            startDrag(which, e);
        };

        const onKey = (which: 'min' | 'max', e: KeyboardEvent) => {
            const big = props.step * 5;
            let delta = 0;
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = props.step;
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -props.step;
            else if (e.key === 'PageUp') delta = big;
            else if (e.key === 'PageDown') delta = -big;
            else if (e.key === 'Home') {
                if (which === 'min') localMin.value = props.min;
                else localMax.value = localMin.value + props.step;
                e.preventDefault();
                commit();
                return;
            } else if (e.key === 'End') {
                if (which === 'max') localMax.value = props.max;
                else localMin.value = localMax.value - props.step;
                e.preventDefault();
                commit();
                return;
            } else return;

            e.preventDefault();
            if (which === 'min') {
                localMin.value = clamp(localMin.value + delta, props.min, localMax.value - props.step);
            } else {
                localMax.value = clamp(localMax.value + delta, localMin.value + props.step, props.max);
            }
            commit();
        };

        onBeforeUnmount(() => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        });

        return {
            trackEl,
            localMin,
            localMax,
            minPct,
            maxPct,
            fillStyle,
            startDrag,
            onTrackPointerDown,
            onKey
        };
    }
});
</script>

<style lang="scss" scoped>
.range {
    display: grid;
    gap: var(--s-3);

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-3);
    }

    &__label {
        color: var(--bone-400);
        margin: 0;
    }

    &__display {
        font-family: var(--font-mono);
        color: var(--bone-50);
        display: inline-flex;
        gap: 0.35rem;
        align-items: baseline;
    }

    &__dash { color: var(--bone-500); }

    &__track {
        position: relative;
        height: 28px;
        cursor: pointer;
        touch-action: none;
    }

    &__rail {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--rule-strong);
        border-radius: 1px;
        transform: translateY(-50%);
        pointer-events: none;
    }

    &__fill {
        position: absolute;
        top: 50%;
        height: 2px;
        background: var(--ember);
        transform: translateY(-50%);
        pointer-events: none;
    }

    &__handle {
        position: absolute;
        top: 50%;
        width: 22px;
        height: 22px;
        background: var(--bone-50);
        border: 0;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        cursor: grab;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
        transition:
            transform var(--dur-fast) var(--ease-out),
            box-shadow var(--dur-fast) var(--ease-out);

        &:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.08); }

        &:focus-visible {
            outline: none;
            box-shadow:
                0 2px 8px rgba(0, 0, 0, 0.45),
                0 0 0 3px var(--ember-glow);
        }
    }

    &__grip {
        position: absolute;
        inset: 50% 50% auto auto;
        width: 8px;
        height: 8px;
        background: var(--ember);
        border-radius: 50%;
        transform: translate(50%, -50%);
        pointer-events: none;
    }

    &__ticks {
        display: flex;
        justify-content: space-between;
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        color: var(--bone-400);
    }
}

@media (prefers-reduced-motion: reduce) {
    .range__handle { transition: none; }
}
</style>
