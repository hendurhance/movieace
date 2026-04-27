<template>
    <section v-if="reviews.length" class="reviews" :aria-label="ariaLabel">
        <header class="reviews__head">
            <p v-if="eyebrow" class="eyebrow reviews__eyebrow">{{ eyebrow }}</p>
            <h2 class="reviews__title display">{{ title }}</h2>
        </header>

        <ul class="reviews__list" role="list">
            <li v-for="r in reviews" :key="r.id" class="reviews__item">
                <blockquote class="reviews__quote">
                    <span class="reviews__mark" aria-hidden="true">“</span>
                    <p class="reviews__body">{{ excerpt(r.content) }}</p>
                </blockquote>
                <footer class="reviews__attr">
                    <span class="reviews__author">{{ r.author }}</span>
                    <span v-if="r.created_at" class="reviews__date">{{ formatDate(r.created_at) }}</span>
                    <a
                        v-if="r.url"
                        :href="r.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="reviews__link"
                    >
                        Read full review
                        <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M14 4h6v6M20 4L10 14" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </footer>
            </li>
        </ul>
    </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export interface ReviewEntry {
    id: string;
    author: string;
    content: string;
    created_at?: string;
    url?: string;
}

export default defineComponent({
    name: 'ReviewsPullQuote',
    props: {
        reviews: { type: Array as PropType<ReviewEntry[]>, required: true },
        title: { type: String, default: 'Pressed into print' },
        eyebrow: { type: String, default: 'The Critics' },
        maxLength: { type: Number, default: 360 },
        ariaLabel: { type: String, default: 'Critical reviews' }
    },
    setup(props) {
        const excerpt = (text: string) => {
            if (!text) return '';
            const clean = text.replace(/\s+/g, ' ').trim();
            if (clean.length <= props.maxLength) return clean;
            const slice = clean.slice(0, props.maxLength);
            const lastSpace = slice.lastIndexOf(' ');
            return `${slice.slice(0, lastSpace > 0 ? lastSpace : props.maxLength)}…`;
        };

        const formatDate = (iso: string) => {
            try {
                const d = new Date(iso);
                return d.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            } catch { return ''; }
        };

        return { excerpt, formatDate };
    }
});
</script>

<style lang="scss" scoped>
.reviews {
    &__head {
        margin-bottom: var(--s-6);
        max-width: 68ch;
    }

    &__eyebrow {
        color: var(--ember);
        margin: 0 0 var(--s-2);
    }

    &__title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.6rem, 3vw, 2.4rem);
        line-height: 1.05;
        letter-spacing: -0.01em;
        color: var(--bone-50);
        margin: 0;
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
    }

    &__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: var(--s-6);
        grid-template-columns: 1fr;

        @media (min-width: 860px) {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--s-6) var(--s-7);
        }
    }

    &__item {
        position: relative;
        padding: var(--s-5) var(--s-6);
        background: var(--surface-tint);
        border-left: 2px solid var(--ember);
        border-radius: 0 var(--r-md) var(--r-md) 0;
        display: grid;
        gap: var(--s-4);
    }

    &__quote {
        margin: 0;
        position: relative;
    }

    &__mark {
        position: absolute;
        top: -0.55em;
        left: -0.15em;
        font-family: var(--font-display);
        font-size: 3.6rem;
        color: var(--ember);
        line-height: 1;
        font-variation-settings: 'opsz' 144;
        pointer-events: none;
        opacity: 0.75;
    }

    &__body {
        margin: 0;
        font-family: var(--font-display);
        font-style: italic;
        font-size: var(--fs-lg);
        line-height: 1.55;
        color: var(--bone-100);
        letter-spacing: -0.005em;
    }

    &__attr {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--s-2) var(--s-4);
        padding-top: var(--s-3);
        border-top: 1px solid var(--rule);
        font-family: var(--font-ui);
        font-size: var(--fs-xs);
    }

    &__author {
        color: var(--bone-50);
        font-weight: 600;
        letter-spacing: var(--ls-snug);
    }

    &__date {
        font-family: var(--font-mono);
        color: var(--bone-400);
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    &__link {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        color: var(--bone-200);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition:
            color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out);

        &:hover, &:focus-visible {
            color: var(--ember);
            border-color: currentColor;
        }
    }
}
</style>
