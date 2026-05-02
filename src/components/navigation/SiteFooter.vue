<template>
    <footer class="site-footer">
        <div class="container-lm">
            <!-- Masthead / colophon line -->
            <div class="site-footer__masthead">
                <div class="site-footer__logo" aria-hidden="true">
                    <span class="site-footer__mark">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M0 6.7V5.3A5.3 5.3 0 0 1 5.3 0h3.67L5.62 6.7H0Zm10.84-6.7h6.5L13.99 6.7H7.49L10.84 0Zm8.36.02A5.3 5.3 0 0 1 24 5.3v1.4h-8.13L19.2.02ZM24 8.37V18.7a5.3 5.3 0 0 1-5.3 5.3H5.3A5.3 5.3 0 0 1 0 18.7V8.37h24Zm-13.85 3.33a1 1 0 0 0-1.38.03 1 1 0 0 0-.32.93v5.95a1 1 0 0 0 .32.92 1 1 0 0 0 1.38.03l5.52-2.97a1 1 0 0 0 .73-1.23 1 1 0 0 0-.73-1.23l-5.52-2.97Z"
                            />
                        </svg>
                    </span>
                    <span class="site-footer__wordmark">Movieace</span>
                </div>

                <div class="site-footer__issue">
                    <span class="eyebrow">Vol. {{ volume }}</span>
                    <span class="site-footer__sep" aria-hidden="true">·</span>
                    <span class="eyebrow">Issue {{ issue }}</span>
                    <span class="site-footer__sep" aria-hidden="true">·</span>
                    <span class="eyebrow">{{ month }} {{ year }}</span>
                </div>
            </div>

            <!-- Editorial statement -->
            <h2 class="site-footer__statement">
                <span class="site-footer__statement-lede">A cinema-first streaming journal</span>
                <span class="site-footer__statement-body">
                    Curating films &amp; shows with editorial intent
                    &mdash; <em>brought to you from the stacks</em>.
                </span>
            </h2>

            <hr class="hairline site-footer__rule" />

            <!-- Columns -->
            <div class="site-footer__cols">
                <nav
                    v-for="col in columns"
                    :key="col.title"
                    class="site-footer__col"
                    :aria-label="col.title"
                >
                    <h3 class="eyebrow site-footer__col-title">{{ col.title }}</h3>
                    <ul class="site-footer__list">
                        <li v-for="link in col.links" :key="link.label">
                            <component
                                :is="link.external ? 'a' : 'router-link'"
                                :to="!link.external ? link.href : undefined"
                                :href="link.external ? link.href : undefined"
                                :target="link.external ? '_blank' : undefined"
                                :rel="link.external ? 'noopener noreferrer' : undefined"
                                class="site-footer__link"
                            >
                                {{ link.label }}
                            </component>
                        </li>
                    </ul>
                </nav>

                <div class="site-footer__col site-footer__col--wide">
                    <h3 class="eyebrow site-footer__col-title">Colophon</h3>
                    <p class="site-footer__colophon">
                        Metadata &amp; artwork powered by
                        <a
                            href="https://www.themoviedb.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="site-footer__inline-link"
                        >TMDB</a>.
                        This product uses the TMDB API but is not endorsed or
                        certified by TMDB.
                    </p>
                    <p class="site-footer__colophon">
                        Streaming sources are provided by third-party embeds.
                        Movieace does not host, upload, or store any video
                        content.
                    </p>
                </div>
            </div>

            <hr class="hairline site-footer__rule" />

            <div class="site-footer__meta">
                <span class="meta">&copy; {{ year }} Movieace</span>
                <span class="site-footer__meta-divider" aria-hidden="true" />
                <span class="meta">
                    Crafted by
                    <a
                        href="https://github.com/hendurhance"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="site-footer__inline-link"
                    >Endurance</a>
                    &amp;
                    <a
                        href="https://github.com/classyrazy"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="site-footer__inline-link"
                    >Classydev</a>
                </span>
            </div>
        </div>
    </footer>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
}

interface FooterCol {
    title: string;
    links: FooterLink[];
}

const columns: FooterCol[] = [
    {
        title: 'Browse',
        links: [
            { label: 'Home', href: '/' },
            { label: 'Movies', href: '/movies' },
            { label: 'TV Shows', href: '/tv-shows' },
            { label: 'Actors', href: '/actors' },
            { label: 'Watchlist', href: '/watchlist' }
        ]
    },
    {
        title: 'About',
        links: [
            {
                label: 'Source (GitHub)',
                href: 'https://github.com/hendurhance/movieace',
                external: true
            },
            {
                label: 'Report an Issue',
                href: 'https://github.com/hendurhance/movieace/issues',
                external: true
            },
            {
                label: 'TMDB',
                href: 'https://www.themoviedb.org/',
                external: true
            }
        ]
    }
];

export default defineComponent({
    name: 'SiteFooter',
    setup() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.toLocaleString('en-US', { month: 'long' });

        // Vol = years since 2024 (launch) + 1; Issue = week of year.
        const launch = 2024;
        const volume = computed(() =>
            String(year - launch + 1).padStart(2, '0')
        );

        const getWeek = (d: Date) => {
            const start = new Date(d.getFullYear(), 0, 1);
            const diff = (d.getTime() - start.getTime()) / 86400000;
            return Math.ceil((diff + start.getDay() + 1) / 7);
        };
        const issue = String(getWeek(now)).padStart(2, '0');

        return { year, month, volume, issue, columns };
    }
});
</script>

<style lang="scss" scoped>
.site-footer {
    position: relative;
    padding: var(--s-10) 0 var(--s-7);
    background: var(--ink-850);
    border-top: 1px solid var(--rule);
    color: var(--bone-200);
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
            80% 60% at 10% 0%,
            rgba(255, 90, 31, 0.06) 0%,
            transparent 60%
        );
        pointer-events: none;
    }

    &__masthead {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--s-4);
        margin-bottom: var(--s-6);
        flex-wrap: wrap;
    }

    &__logo {
        display: inline-flex;
        align-items: center;
        gap: var(--s-3);
    }

    &__mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: var(--ember);
        color: var(--ink-900);
        border-radius: var(--r-sm);
    }

    &__wordmark {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: var(--fs-xl);
        color: var(--bone-50);
        letter-spacing: var(--ls-tight);
        font-variation-settings: 'opsz' 72;
    }

    &__issue {
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        color: var(--bone-400);

        .eyebrow { color: var(--bone-400); }
    }

    &__sep {
        color: var(--bone-500);
    }

    &__statement {
        font-family: var(--font-display);
        font-weight: 400;
        font-size: clamp(var(--fs-3xl), 5vw, var(--fs-5xl));
        line-height: 0.98;
        letter-spacing: -0.025em;
        max-width: 22ch;
        color: var(--bone-50);
        margin: var(--s-5) 0 var(--s-7);
        font-variation-settings: 'opsz' 144, 'SOFT' 30;

        .site-footer__statement-lede {
            display: block;
        }

        .site-footer__statement-body {
            display: block;
            font-size: clamp(var(--fs-lg), 2.2vw, var(--fs-xl));
            color: var(--bone-300);
            max-width: 36ch;
            margin-top: var(--s-4);
            line-height: var(--lh-snug);
            letter-spacing: var(--ls-snug);

            em {
                font-style: italic;
                color: var(--ember);
                font-variation-settings: 'opsz' 144, 'SOFT' 80;
            }
        }
    }

    &__rule {
        margin: var(--s-6) 0 var(--s-6);
    }

    &__cols {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--s-6);

        @media (max-width: 960px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 560px) {
            grid-template-columns: 1fr;
            gap: var(--s-5);
        }
    }

    &__col {
        &--wide {
            grid-column: span 2;

            @media (max-width: 960px) {
                grid-column: span 2;
            }

            @media (max-width: 560px) {
                grid-column: span 1;
            }
        }
    }

    &__col-title {
        color: var(--bone-400);
        margin-bottom: var(--s-4);
    }

    &__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--s-2);
    }

    &__link {
        font-family: var(--font-ui);
        font-size: var(--fs-base);
        color: var(--bone-200);
        transition: color var(--dur-fast) var(--ease-out);
        letter-spacing: var(--ls-snug);

        &:hover {
            color: var(--ember);
        }
    }

    &__colophon {
        font-size: var(--fs-sm);
        color: var(--bone-300);
        line-height: var(--lh-base);
        max-width: 56ch;
        margin-bottom: var(--s-3);

        em {
            color: var(--bone-50);
            font-style: italic;
            font-family: var(--font-display);
            font-variation-settings: 'opsz' 144, 'SOFT' 80;
        }
    }

    &__inline-link {
        color: var(--bone-50);
        text-decoration: underline;
        text-decoration-color: var(--rule-strong);
        text-underline-offset: 3px;
        transition: color var(--dur-fast), text-decoration-color var(--dur-fast);

        &:hover {
            color: var(--ember);
            text-decoration-color: var(--ember);
        }
    }

    &__meta {
        display: flex;
        align-items: center;
        gap: var(--s-3);
        color: var(--bone-400);
        flex-wrap: wrap;

        a { color: inherit; }
    }

    &__meta-divider {
        width: 3px;
        height: 3px;
        background: var(--bone-500);
        border-radius: 50%;
    }
}
</style>
