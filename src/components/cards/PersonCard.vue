<template>
    <article class="person-card">
        <router-link :to="routeTo" class="person-card__link" :aria-label="name">
            <div class="person-card__avatar">
                <img
                    v-if="imageUrl"
                    :src="imageUrl"
                    :alt="name"
                    loading="lazy"
                    decoding="async"
                />
                <div v-else class="person-card__initial">
                    <span>{{ initials }}</span>
                </div>
                <span class="person-card__ring" aria-hidden="true" />
            </div>

            <div class="person-card__body">
                <h4 class="person-card__name">{{ name }}</h4>
                <p v-if="role" class="person-card__role">{{ role }}</p>
                <p v-else-if="department" class="person-card__role">{{ department }}</p>
            </div>
        </router-link>
    </article>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { useWebImage } from '../../utils/useWebImage';

export default defineComponent({
    name: 'PersonCard',
    props: {
        id: { type: [Number, String], required: true },
        name: { type: String, required: true },
        profilePath: { type: String as PropType<string | null>, default: null },
        role: { type: String, default: '' },
        department: { type: String, default: '' }
    },
    setup(props) {
        const imageUrl = computed(() => {
            if (!props.profilePath) return '';
            return useWebImage(props.profilePath, 'small');
        });

        const initials = computed(() => {
            if (!props.name) return '·';
            return props.name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(n => n[0].toUpperCase())
                .join('');
        });

        const routeTo = computed(() => `/actor/${props.id}`);

        return { imageUrl, initials, routeTo };
    }
});
</script>

<style lang="scss" scoped>
.person-card {
    display: block;
    text-align: center;

    &__link {
        display: block;
        color: inherit;
        text-decoration: none;
    }

    &__avatar {
        position: relative;
        aspect-ratio: 1 / 1;
        width: 100%;
        border-radius: 50%;
        overflow: hidden;
        background: var(--ink-700);
        transition: transform var(--dur-base) var(--ease-out);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
            transition: transform var(--dur-slow) var(--ease-out);
        }
    }

    &__link:hover &__avatar,
    &__link:focus-visible &__avatar {
        transform: translateY(-4px);

        img { transform: scale(1.06); }
        .person-card__ring { opacity: 1; transform: scale(1); }
    }

    &__initial {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: var(--bone-300);
        background:
            radial-gradient(70% 70% at 50% 30%, var(--ink-600), var(--ink-800));
        font-family: var(--font-display);
        font-size: clamp(1.2rem, 4cqi, 3rem);
        font-weight: 500;
        font-variation-settings: 'opsz' 144, 'SOFT' 40;
        letter-spacing: -0.02em;
    }

    &__ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        box-shadow: inset 0 0 0 2px var(--ember);
        opacity: 0;
        transform: scale(0.94);
        transition:
            opacity var(--dur-base) var(--ease-out),
            transform var(--dur-base) var(--ease-out);
        pointer-events: none;
    }

    &__body {
        padding-top: var(--s-3);
    }

    &__name {
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 600;
        color: var(--bone-50);
        letter-spacing: var(--ls-snug);
        line-height: 1.25;
        transition: color var(--dur-fast) var(--ease-out);

        .person-card__link:hover & { color: var(--ember); }
    }

    &__role {
        font-family: var(--font-ui);
        font-size: var(--fs-xs);
        color: var(--bone-400);
        margin-top: 0.25rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .person-card {
        &__avatar, &__link:hover &__avatar, img { transition: none; transform: none !important; }
    }
}
</style>
