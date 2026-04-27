<template>
    <section class="synopsis" :aria-label="ariaLabel">
        <p v-if="eyebrow" class="eyebrow synopsis__eyebrow">{{ eyebrow }}</p>

        <div class="synopsis__body">
            <p v-for="(para, idx) in paragraphs" :key="idx" class="synopsis__p" :class="{ 'synopsis__p--lead': idx === 0 }">
                <span v-if="idx === 0 && showDropCap" class="synopsis__dropcap">{{ firstLetter }}</span>
                {{ idx === 0 && showDropCap ? restOfFirst : para }}
            </p>

            <p v-if="!paragraphs.length" class="synopsis__empty meta">
                No synopsis filed for this title.
            </p>
        </div>
    </section>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: 'DropCapSynopsis',
    props: {
        body: { type: String, default: '' },
        eyebrow: { type: String, default: 'The Synopsis' },
        ariaLabel: { type: String, default: 'Synopsis' }
    },
    setup(props) {
        const paragraphs = computed(() =>
            (props.body || '')
                .split(/\n+/)
                .map(p => p.trim())
                .filter(Boolean)
        );

        const firstLetter = computed(() => paragraphs.value[0]?.[0] ?? '');
        const restOfFirst = computed(() => paragraphs.value[0]?.slice(1) ?? '');
        const showDropCap = computed(
            () => !!firstLetter.value && /[A-Za-z]/.test(firstLetter.value)
        );

        return { paragraphs, firstLetter, restOfFirst, showDropCap };
    }
});
</script>

<style lang="scss" scoped>
.synopsis {
    max-width: 68ch;
    color: var(--bone-50);

    &__eyebrow {
        color: var(--ember);
        margin: 0 0 var(--s-3);
    }

    &__body {
        font-family: var(--font-ui);
        line-height: 1.65;
        color: var(--bone-200);
    }

    &__p {
        margin: 0 0 var(--s-4);
        font-size: var(--fs-lg);

        &:last-child { margin-bottom: 0; }

        &--lead {
            font-size: var(--fs-lg);
            color: var(--bone-50);

            &::first-line {
                font-variant: small-caps;
                letter-spacing: 0.04em;
            }
        }
    }

    &__dropcap {
        float: left;
        font-family: var(--font-display);
        font-weight: 500;
        color: var(--ember);
        font-size: 4.75em;
        line-height: 0.85;
        padding: 0.1em 0.12em 0 0;
        margin-right: 0.05em;
        shape-outside: margin-box;
        font-variation-settings: 'opsz' 144, 'SOFT' 30;

        @media (max-width: 600px) {
            font-size: 4em;
        }
    }

    &__empty {
        color: var(--bone-400);
        font-style: italic;
    }
}
</style>
