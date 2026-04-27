<template>
    <div class="actor-page">
        <SiteHeader />

        <main id="main" role="main">
            <!-- Loading -->
            <div v-if="isLoading" class="actor-page__loading container-lm">
                <div class="actor-page__loading-portrait" aria-hidden="true" />
                <div class="actor-page__loading-body">
                    <div class="actor-page__loading-line actor-page__loading-line--eyebrow" />
                    <div class="actor-page__loading-line actor-page__loading-line--title" />
                    <div class="actor-page__loading-line" />
                    <div class="actor-page__loading-line" />
                    <div class="actor-page__loading-line actor-page__loading-line--short" />
                </div>
            </div>

            <!-- Error -->
            <div v-else-if="hasError || !actorDetails" class="actor-page__error container-lm">
                <p class="eyebrow">No file on record</p>
                <h1 class="actor-page__error-title display">{{ errorMessage || 'We can’t find that person.' }}</h1>
                <p class="actor-page__error-desc">
                    The dossier may have been pulled. Try the roster, or head back to the
                    library.
                </p>
                <div class="actor-page__error-actions">
                    <button class="actor-page__error-btn primary" @click="retryFetch">Try again</button>
                    <router-link class="actor-page__error-btn" to="/actors">See the roster</router-link>
                </div>
            </div>

            <template v-else>
                <!-- Masthead -->
                <section ref="mastheadRef" class="actor-page__masthead">
                    <div
                        v-if="actorDetails.profile_path"
                        class="actor-page__bloom"
                        :style="{ backgroundImage: `url(${useWebImage(actorDetails.profile_path, 'large')})` }"
                        aria-hidden="true"
                    />
                    <div class="actor-page__bloom-veil" aria-hidden="true" />

                    <div class="container-lm actor-page__masthead-grid">
                        <div class="actor-page__portrait">
                            <img
                                v-if="actorDetails.profile_path"
                                :src="useWebImage(actorDetails.profile_path, 'large')"
                                :alt="actorDetails.name"
                                loading="eager"
                                fetchpriority="high"
                                class="actor-page__portrait-img"
                            />
                            <div v-else class="actor-page__portrait-empty">
                                <span class="display">{{ initials }}</span>
                            </div>
                        </div>

                        <div class="actor-page__intro">
                            <p class="eyebrow actor-page__eyebrow">
                                {{ actorDetails.known_for_department || 'Talent' }}
                                <span v-if="totalCredits"> · {{ totalCredits }} credits</span>
                            </p>
                            <h1 class="actor-page__name display" data-reveal>{{ actorDetails.name }}</h1>

                            <ul class="actor-page__meta meta">
                                <li v-if="actorDetails.birthday">
                                    <span class="actor-page__meta-key">Born</span>
                                    {{ formatDate(actorDetails.birthday) }}
                                </li>
                                <li v-if="actorDetails.deathday">
                                    <span class="actor-page__meta-key">Died</span>
                                    {{ formatDate(actorDetails.deathday) }}
                                </li>
                                <li v-if="age && !actorDetails.deathday">
                                    <span class="actor-page__meta-key">Age</span>
                                    {{ age }}
                                </li>
                                <li v-if="actorDetails.place_of_birth">
                                    <span class="actor-page__meta-key">From</span>
                                    {{ actorDetails.place_of_birth }}
                                </li>
                            </ul>

                            <div class="actor-page__actions">
                                <a
                                    v-if="actorDetails.imdb_id"
                                    class="actor-page__action actor-page__action--ember"
                                    :href="`https://www.imdb.com/name/${actorDetails.imdb_id}`"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    View on IMDb
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                                        <path d="M14 5h5v5M19 5l-9 9M5 5h6v2H7v10h10v-4h2v6H5z" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </a>
                                <a
                                    v-if="actorDetails.homepage"
                                    class="actor-page__action"
                                    :href="actorDetails.homepage"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    Official site
                                </a>
                                <button
                                    class="actor-page__action actor-page__action--ghost"
                                    @click="copyLink"
                                >
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Biography -->
                <section v-if="hasBiography" class="actor-page__bio container-lm">
                    <p class="eyebrow actor-page__section-eyebrow">Biography</p>
                    <div class="actor-page__bio-body" :class="{ 'is-collapsed': !showFullBio && bioIsLong }">
                        <p
                            v-for="(para, idx) in bioParagraphs"
                            :key="`p-${idx}`"
                            :class="['actor-page__bio-para', { 'actor-page__bio-para--lead': idx === 0 }]"
                        >{{ para }}</p>
                    </div>
                    <button
                        v-if="bioIsLong"
                        type="button"
                        class="actor-page__bio-toggle"
                        @click="toggleFullBio"
                    >
                        {{ showFullBio ? 'Read less' : 'Read full biography' }}
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"
                             :style="{ transform: showFullBio ? 'rotate(180deg)' : 'none' }">
                            <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </section>

                <section v-else class="actor-page__bio actor-page__bio--empty container-lm">
                    <p class="eyebrow actor-page__section-eyebrow">Biography</p>
                    <p class="actor-page__bio-empty">
                        No biography filed for {{ actorDetails.name }} yet.
                    </p>
                </section>

                <!-- Known For -->
                <section v-if="knownFor.length" class="actor-page__known container-lm">
                    <header class="actor-page__section-head">
                        <p class="eyebrow actor-page__section-eyebrow">Known for</p>
                        <h2 class="actor-page__section-title">The work people remember.</h2>
                    </header>
                    <div class="actor-page__known-grid">
                        <KeyartTile
                            v-for="item in knownFor"
                            :key="`k-${item.media_type}-${item.id}`"
                            :id="item.id"
                            :type="item.media_type === 'tv' ? 'tv' : 'movie'"
                            :title="getTitle(item)"
                            :backdrop-path="item.backdrop_path"
                            :poster-path="item.poster_path"
                            :rating="item.vote_average || 0"
                            :release-date="item.release_date || item.first_air_date || ''"
                            :eyebrow="item.character ? `as ${item.character}` : ''"
                        />
                    </div>
                </section>

                <!-- Filmography by decade -->
                <section v-if="decadeGroups.length" class="actor-page__filmo container-lm">
                    <header class="actor-page__section-head">
                        <p class="eyebrow actor-page__section-eyebrow">The full credit roll</p>
                        <h2 class="actor-page__section-title">Filmography</h2>

                        <div class="actor-page__filmo-tabs">
                            <button
                                v-for="kind in filmoTabs"
                                :key="kind.value"
                                type="button"
                                class="actor-page__filmo-tab"
                                :class="{ 'is-active': filmoFilter === kind.value }"
                                @click="filmoFilter = kind.value"
                            >
                                {{ kind.label }}
                                <span class="actor-page__filmo-count">{{ kind.count }}</span>
                            </button>
                        </div>
                    </header>

                    <div
                        v-for="group in decadeGroups"
                        :key="group.decade"
                        class="actor-page__decade"
                    >
                        <div class="actor-page__decade-head">
                            <span class="display actor-page__decade-label">{{ group.decade }}</span>
                            <span class="meta">{{ group.items.length }} title{{ group.items.length === 1 ? '' : 's' }}</span>
                        </div>

                        <div class="actor-page__decade-grid">
                            <article
                                v-for="item in group.items"
                                :key="`f-${item.media_type}-${item.id}-${item.credit_id || ''}`"
                                class="filmo-card"
                            >
                                <router-link
                                    :to="item.media_type === 'tv' ? `/tv-show/${item.id}` : `/movie/${item.id}`"
                                    class="filmo-card__link"
                                    :aria-label="getTitle(item)"
                                >
                                    <div class="filmo-card__poster">
                                        <img
                                            v-if="item.poster_path"
                                            :src="useWebImage(item.poster_path, 'small')"
                                            :alt="getTitle(item)"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div v-else class="filmo-card__poster-empty">
                                            <span class="display">{{ getTitle(item)[0]?.toUpperCase() ?? '·' }}</span>
                                        </div>
                                        <span
                                            v-if="item.media_type === 'tv'"
                                            class="filmo-card__badge"
                                        >Series</span>
                                    </div>

                                    <div class="filmo-card__body">
                                        <p class="meta filmo-card__year">{{ getYear(item) || '—' }}</p>
                                        <h3 class="filmo-card__title">{{ getTitle(item) }}</h3>
                                        <p v-if="item.character" class="filmo-card__role">as {{ item.character }}</p>
                                        <p v-if="item.vote_average" class="filmo-card__rating meta">
                                            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true">
                                                <path d="m12 2 3 7 7 .6-5.3 4.7 1.6 7L12 17.7 5.7 21.3l1.6-7L2 9.6 9 9z"/>
                                            </svg>
                                            {{ item.vote_average.toFixed(1) }}
                                        </p>
                                    </div>
                                </router-link>
                            </article>
                        </div>
                    </div>
                </section>

                <!-- Photos -->
                <section v-if="profiles.length" class="actor-page__photos container-lm">
                    <header class="actor-page__section-head">
                        <p class="eyebrow actor-page__section-eyebrow">Contact sheet</p>
                        <h2 class="actor-page__section-title">{{ profiles.length }} photo{{ profiles.length === 1 ? '' : 's' }}</h2>
                    </header>

                    <div class="actor-page__photos-grid">
                        <a
                            v-for="(photo, idx) in profiles.slice(0, 12)"
                            :key="`ph-${idx}`"
                            :href="`https://image.tmdb.org/t/p/original${photo.file_path}`"
                            target="_blank"
                            rel="noopener"
                            class="actor-page__photo"
                            :aria-label="`Photo ${idx + 1}`"
                        >
                            <img
                                :src="useWebImage(photo.file_path, 'medium')"
                                :alt="`Photo ${idx + 1} of ${actorDetails.name}`"
                                loading="lazy"
                                decoding="async"
                            />
                        </a>
                    </div>
                </section>

                <!-- Aliases -->
                <section
                    v-if="actorDetails.also_known_as && actorDetails.also_known_as.length"
                    class="actor-page__aliases container-lm"
                >
                    <p class="eyebrow actor-page__section-eyebrow">Also known as</p>
                    <ul class="actor-page__alias-list">
                        <li v-for="(name, idx) in actorDetails.also_known_as.slice(0, 8)" :key="`alias-${idx}`">
                            {{ name }}
                        </li>
                    </ul>
                </section>
            </template>
        </main>

        <SiteFooter />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SiteHeader from '../components/navigation/SiteHeader.vue';
import SiteFooter from '../components/navigation/SiteFooter.vue';
import KeyartTile from '../components/cards/KeyartTile.vue';
import { useActor, ActorDetails, ActorImages } from '../composables/useActor';
import { useWebImage } from '../utils/useWebImage';
import { useToast } from '../composables/useToast';
import { useAmbientColor } from '../composables/useAmbientColor';

interface CreditItem {
    id: number;
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    character?: string;
    media_type: 'movie' | 'tv' | string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    popularity?: number;
    credit_id?: string;
}

type FilmoFilter = 'all' | 'movie' | 'tv';

export default defineComponent({
    name: 'Actor',
    components: { SiteHeader, SiteFooter, KeyartTile },
    setup() {
        const route = useRoute();
        const { fetchActorDetails, fetchActorImages, fetchCombinedCredits } = useActor();
        const { addToast } = useToast();

        const actorId = computed(() => String(route.params.id || ''));
        const actorDetails = ref<ActorDetails | undefined>();
        const actorImages = ref<ActorImages | undefined>();
        const credits = ref<CreditItem[]>([]);

        const isLoading = ref(true);
        const hasError = ref(false);
        const errorMessage = ref('');
        const showFullBio = ref(false);

        const filmoFilter = ref<FilmoFilter>('all');

        const mastheadRef = ref<HTMLElement | null>(null);
        const ambientPath = computed(() => actorDetails.value?.profile_path ?? null);
        useAmbientColor(ambientPath, mastheadRef);

        const fetchAll = async () => {
            const id = Number(actorId.value);
            if (!Number.isFinite(id)) {
                hasError.value = true;
                errorMessage.value = 'Invalid person id.';
                isLoading.value = false;
                return;
            }

            isLoading.value = true;
            hasError.value = false;
            errorMessage.value = '';
            actorDetails.value = undefined;
            actorImages.value = undefined;
            credits.value = [];
            showFullBio.value = false;
            filmoFilter.value = 'all';

            try {
                const detailsRes = await fetchActorDetails(id);
                if (!detailsRes.data.value) {
                    throw new Error('Could not load this person.');
                }
                actorDetails.value = detailsRes.data.value;

                const [imagesRes, creditsRes] = await Promise.all([
                    fetchActorImages(id),
                    fetchCombinedCredits(id)
                ]);

                actorImages.value = imagesRes.data.value;
                const cast = (creditsRes.data.value?.cast ?? []) as CreditItem[];
                credits.value = cast.filter(c => c.media_type === 'movie' || c.media_type === 'tv');

                document.title = actorDetails.value
                    ? `${actorDetails.value.name} — Movieace`
                    : 'People — Movieace';
            } catch (e: any) {
                hasError.value = true;
                errorMessage.value = e?.message || 'Could not load this person.';
            } finally {
                isLoading.value = false;
            }
        };

        const retryFetch = () => fetchAll();

        const toggleFullBio = () => {
            showFullBio.value = !showFullBio.value;
        };

        const formatDate = (date: string): string => {
            try {
                return new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch {
                return date;
            }
        };

        const age = computed(() => {
            const d = actorDetails.value;
            if (!d?.birthday) return null;
            const end = d.deathday ? new Date(d.deathday) : new Date();
            const birth = new Date(d.birthday);
            if (Number.isNaN(birth.getTime())) return null;
            let years = end.getFullYear() - birth.getFullYear();
            const m = end.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) years--;
            return years;
        });

        const initials = computed(() => {
            if (!actorDetails.value?.name) return '·';
            return actorDetails.value.name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(n => n[0]?.toUpperCase() ?? '')
                .join('');
        });

        const totalCredits = computed(() => credits.value.length);

        const profiles = computed(() => actorImages.value?.profiles ?? []);

        // ── Biography ──────────────────────────────────────────────────────
        const hasBiography = computed(() => Boolean(actorDetails.value?.biography?.trim()));

        const bioParagraphs = computed(() => {
            const raw = actorDetails.value?.biography ?? '';
            if (!raw.trim()) return [] as string[];
            return raw
                .split(/\n\s*\n/g)
                .map(p => p.trim())
                .filter(Boolean);
        });

        const bioIsLong = computed(() => {
            const raw = actorDetails.value?.biography ?? '';
            return raw.length > 540;
        });

        // ── Known For ──────────────────────────────────────────────────────
        const knownFor = computed<CreditItem[]>(() => {
            const base = credits.value
                .filter(c => c.poster_path || c.backdrop_path)
                .slice()
                .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

            const seen = new Set<string>();
            const out: CreditItem[] = [];
            for (const item of base) {
                const key = `${item.media_type}-${item.id}`;
                if (seen.has(key)) continue;
                seen.add(key);
                out.push(item);
                if (out.length >= 4) break;
            }
            return out;
        });

        // ── Filmography ────────────────────────────────────────────────────
        const filteredCredits = computed<CreditItem[]>(() => {
            const f = filmoFilter.value;
            const list = credits.value.slice().sort((a, b) => {
                const da = parseDateMs(a);
                const db = parseDateMs(b);
                return db - da;
            });
            if (f === 'all') return list;
            return list.filter(c => c.media_type === f);
        });

        const decadeGroups = computed(() => {
            const map = new Map<string, CreditItem[]>();
            for (const item of filteredCredits.value) {
                const decade = decadeForCredit(item);
                if (!map.has(decade)) map.set(decade, []);
                map.get(decade)!.push(item);
            }
            const labels = Array.from(map.keys()).sort((a, b) => {
                if (a === 'Undated') return 1;
                if (b === 'Undated') return -1;
                return parseInt(b, 10) - parseInt(a, 10);
            });
            return labels.map(decade => ({ decade, items: map.get(decade)! }));
        });

        const filmoTabs = computed(() => {
            const movieCount = credits.value.filter(c => c.media_type === 'movie').length;
            const tvCount = credits.value.filter(c => c.media_type === 'tv').length;
            return [
                { value: 'all' as FilmoFilter, label: 'All', count: credits.value.length },
                { value: 'movie' as FilmoFilter, label: 'Movies', count: movieCount },
                { value: 'tv' as FilmoFilter, label: 'Television', count: tvCount }
            ];
        });

        // ── Helpers ────────────────────────────────────────────────────────
        const getTitle = (c: CreditItem) =>
            c.title || c.name || c.original_title || c.original_name || 'Untitled';

        const getYear = (c: CreditItem) => {
            const d = c.release_date || c.first_air_date;
            if (!d) return '';
            const y = new Date(d).getFullYear();
            return Number.isFinite(y) ? String(y) : '';
        };

        const copyLink = async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                addToast('Link copied to clipboard', 'success', 2400);
            } catch {
                addToast('Could not copy link', 'error', 2400);
            }
        };

        watch(actorId, () => {
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
            fetchAll();
        });

        onMounted(() => {
            window.scrollTo(0, 0);
            fetchAll();
        });

        return {
            mastheadRef,
            actorDetails,
            isLoading,
            hasError,
            errorMessage,
            retryFetch,
            useWebImage,
            initials,
            age,
            totalCredits,
            profiles,
            hasBiography,
            bioParagraphs,
            bioIsLong,
            showFullBio,
            toggleFullBio,
            knownFor,
            decadeGroups,
            filmoTabs,
            filmoFilter,
            getTitle,
            getYear,
            formatDate,
            copyLink
        };
    }
});

// ── Module-level helpers ─────────────────────────────────────────────────────
function parseDateMs(c: { release_date?: string; first_air_date?: string }): number {
    const d = c.release_date || c.first_air_date;
    if (!d) return 0;
    const t = new Date(d).getTime();
    return Number.isFinite(t) ? t : 0;
}

function decadeForCredit(c: { release_date?: string; first_air_date?: string }): string {
    const d = c.release_date || c.first_air_date;
    if (!d) return 'Undated';
    const y = new Date(d).getFullYear();
    if (!Number.isFinite(y)) return 'Undated';
    return `${Math.floor(y / 10) * 10}s`;
}
</script>

<style lang="scss" scoped>
.actor-page {
    position: relative;
    min-height: 100dvh;
    background: var(--ink-900);
    color: var(--bone-50);

    // ── Loading ──────────────────────────────────────────────────────────
    &__loading {
        display: grid;
        grid-template-columns: 360px 1fr;
        gap: var(--s-7);
        padding-block: clamp(var(--s-7), 8vw, var(--s-10));

        @media (max-width: 880px) {
            grid-template-columns: 1fr;
        }
    }

    &__loading-portrait {
        aspect-ratio: 2 / 3;
        border-radius: var(--r-lg);
        background: linear-gradient(
            90deg,
            var(--ink-700) 0%,
            var(--ink-600) 50%,
            var(--ink-700) 100%
        );
        background-size: 200% 100%;
        animation: actor-shimmer 1.6s linear infinite;
    }

    &__loading-body {
        display: grid;
        gap: var(--s-3);
        align-content: start;
        padding-top: var(--s-4);
    }

    &__loading-line {
        height: 14px;
        border-radius: var(--r-sm);
        background: var(--ink-700);

        &--eyebrow { width: 30%; height: 10px; }
        &--title { width: 60%; height: 28px; margin-bottom: var(--s-3); }
        &--short { width: 45%; }
    }

    @keyframes actor-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    // ── Error ────────────────────────────────────────────────────────────
    &__error {
        text-align: center;
        padding-block: clamp(var(--s-8), 10vw, var(--s-10));
        max-width: 640px;
    }

    &__error-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(2rem, 5vw, 3.5rem);
        color: var(--bone-50);
        margin: var(--s-3) 0 var(--s-4);
        font-variation-settings: 'opsz' 144;
    }

    &__error-desc {
        color: var(--bone-300);
        line-height: 1.6;
        margin: 0 auto var(--s-6);
        max-width: 50ch;
    }

    &__error-actions {
        display: inline-flex;
        gap: var(--s-3);
        flex-wrap: wrap;
        justify-content: center;
    }

    &__error-btn {
        all: unset;
        cursor: pointer;
        padding: 0.7rem var(--s-5);
        background: var(--surface-tint);
        color: var(--bone-100);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 500;
        text-decoration: none;
        transition:
            background-color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--surface-tint-hover);
            border-color: var(--rule-strong);
        }

        &.primary {
            background: var(--ember);
            color: var(--ink-900);
            border-color: var(--ember);
            font-weight: 600;

            &:hover { background: var(--ember-600); border-color: var(--ember-600); }
        }
    }

    // ── Masthead ─────────────────────────────────────────────────────────
    &__masthead {
        position: relative;
        isolation: isolate;
        padding-block: clamp(var(--s-7), 8vw, var(--s-10));
        overflow: hidden;
    }

    &__bloom {
        position: absolute;
        inset: 0;
        background-position: center 20%;
        background-size: cover;
        background-repeat: no-repeat;
        filter: blur(60px) saturate(1.1);
        opacity: 0.32;
        z-index: -2;
        transform: scale(1.15);
    }

    &__bloom-veil {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(circle at 30% 20%, rgba(var(--ambient), 0.16), transparent 60%),
            linear-gradient(180deg, transparent 30%, var(--ink-900) 100%);
        z-index: -1;
        pointer-events: none;
        transition: background var(--dur-slow) var(--ease-out);
    }

    &__masthead-grid {
        display: grid;
        grid-template-columns: minmax(280px, 360px) 1fr;
        gap: clamp(var(--s-5), 4vw, var(--s-7));
        align-items: end;

        @media (max-width: 880px) {
            grid-template-columns: 1fr;
            gap: var(--s-6);
        }
    }

    &__portrait {
        aspect-ratio: 2 / 3;
        border-radius: var(--r-lg);
        overflow: hidden;
        background: var(--ink-700);
        box-shadow: var(--shadow-lg);
        max-width: 360px;

        @media (max-width: 880px) {
            max-width: 280px;
            margin-inline: auto;
        }
    }

    &__portrait-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &__portrait-empty {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        background: radial-gradient(70% 70% at 50% 30%, var(--ink-600), var(--ink-800));
        color: var(--bone-400);
        font-size: clamp(3rem, 8cqi, 6rem);
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
    }

    &__intro {
        display: grid;
        gap: var(--s-3);
        align-content: end;
    }

    &__eyebrow {
        color: var(--ember);
        margin: 0;
    }

    &__name {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(2.4rem, 7vw, 5rem);
        line-height: 1;
        letter-spacing: var(--ls-tight);
        color: var(--bone-50);
        margin: var(--s-1) 0 0;
        font-variation-settings: 'opsz' 144, 'SOFT' 30;
    }

    &__meta {
        list-style: none;
        margin: var(--s-3) 0 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-3) var(--s-5);
        color: var(--bone-200);

        li {
            display: inline-flex;
            align-items: center;
            gap: var(--s-2);
        }
    }

    &__meta-key {
        color: var(--bone-500);
        text-transform: uppercase;
        letter-spacing: var(--ls-micro);
        font-size: 0.625rem;
    }

    &__actions {
        margin-top: var(--s-5);
        display: inline-flex;
        flex-wrap: wrap;
        gap: var(--s-3);
    }

    &__action {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        padding: 0.6rem var(--s-4);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        color: var(--bone-100);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 500;
        text-decoration: none;
        transition:
            background-color var(--dur-fast) var(--ease-out),
            border-color var(--dur-fast) var(--ease-out),
            color var(--dur-fast) var(--ease-out);

        &:hover {
            background: var(--surface-tint-hover);
            border-color: var(--rule-strong);
            color: var(--bone-50);
        }

        &--ember {
            background: var(--ember);
            color: var(--ink-900);
            border-color: var(--ember);
            font-weight: 600;

            &:hover {
                background: var(--ember-600);
                border-color: var(--ember-600);
                color: var(--ink-900);
            }
        }

        &--ghost {
            background: transparent;
        }
    }

    // ── Section primitives ───────────────────────────────────────────────
    &__bio,
    &__known,
    &__filmo,
    &__photos,
    &__aliases {
        padding-block: clamp(var(--s-7), 7vw, var(--s-9));
        border-top: 1px solid var(--rule);
    }

    &__section-eyebrow {
        color: var(--bone-400);
        margin: 0 0 var(--s-2);
    }

    &__section-head {
        margin-bottom: var(--s-6);
    }

    &__section-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.6rem, 3vw, 2.4rem);
        color: var(--bone-50);
        margin: 0;
        letter-spacing: var(--ls-tight);
    }

    // ── Biography ────────────────────────────────────────────────────────
    &__bio {
        max-width: 76ch;
        margin-inline: auto;
    }

    &__bio-body {
        position: relative;

        &.is-collapsed {
            max-height: 320px;
            overflow: hidden;
            mask-image: linear-gradient(180deg, #000 60%, transparent);
            -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent);
        }
    }

    &__bio-para {
        margin: 0 0 var(--s-4);
        color: var(--bone-200);
        font-family: var(--font-ui);
        font-size: var(--fs-base);
        line-height: 1.75;

        &--lead::first-letter {
            font-family: var(--font-display);
            font-size: 4.5rem;
            line-height: 0.85;
            float: left;
            margin: 0.2rem 0.6rem 0 0;
            color: var(--ember);
            font-weight: 500;
            font-variation-settings: 'opsz' 144, 'SOFT' 20;
        }
    }

    &__bio-empty {
        color: var(--bone-400);
        font-style: italic;
    }

    &__bio-toggle {
        all: unset;
        cursor: pointer;
        margin-top: var(--s-3);
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        color: var(--ember);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 600;
        letter-spacing: var(--ls-snug);

        svg { transition: transform var(--dur-fast) var(--ease-out); }
        &:hover { color: var(--ember-600); }
    }

    // ── Known For ────────────────────────────────────────────────────────
    &__known-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--s-5);
    }

    // ── Filmography ──────────────────────────────────────────────────────
    &__filmo-tabs {
        display: inline-flex;
        gap: var(--s-1);
        margin-top: var(--s-4);
        background: var(--surface-tint);
        border: 1px solid var(--rule);
        border-radius: var(--r-pill);
        padding: 0.25rem;
    }

    &__filmo-tab {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        padding: 0.5rem var(--s-4);
        border-radius: var(--r-pill);
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        color: var(--bone-300);
        transition: color var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out);

        &:hover { color: var(--bone-100); }

        &.is-active {
            color: var(--ink-900);
            background: var(--bone-50);
        }
    }

    &__filmo-count {
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        color: inherit;
        opacity: 0.7;
    }

    &__decade {
        margin-top: var(--s-7);

        &:first-of-type { margin-top: 0; }
    }

    &__decade-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--s-3);
        padding-bottom: var(--s-3);
        margin-bottom: var(--s-5);
        border-bottom: 1px solid var(--rule);
    }

    &__decade-label {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.6rem, 4vw, 2.6rem);
        color: var(--bone-50);
        line-height: 1;
        letter-spacing: var(--ls-tight);
        font-variation-settings: 'opsz' 144;
    }

    &__decade-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--s-5) var(--s-4);

        @media (max-width: 720px) {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
    }

    // ── Photos ───────────────────────────────────────────────────────────
    &__photos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: var(--s-3);
    }

    &__photo {
        display: block;
        aspect-ratio: 2 / 3;
        border-radius: var(--r-md);
        overflow: hidden;
        background: var(--ink-700);
        transition: transform var(--dur-fast) var(--ease-out);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform var(--dur-base) var(--ease-out);
        }

        &:hover img { transform: scale(1.06); }
    }

    // ── Aliases ──────────────────────────────────────────────────────────
    &__alias-list {
        list-style: none;
        margin: var(--s-3) 0 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: var(--s-2) var(--s-3);

        li {
            padding: 0.35rem var(--s-3);
            background: var(--surface-tint);
            border: 1px solid var(--rule);
            border-radius: var(--r-pill);
            font-family: var(--font-mono);
            font-size: var(--fs-xs);
            color: var(--bone-300);
        }
    }
}

// ── Filmography card ─────────────────────────────────────────────────────────
.filmo-card {
    display: block;

    &__link {
        display: block;
        color: inherit;
        text-decoration: none;
    }

    &__poster {
        position: relative;
        aspect-ratio: 2 / 3;
        border-radius: var(--r-md);
        overflow: hidden;
        background: var(--ink-700);
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.32);
        transition:
            transform var(--dur-base) var(--ease-out),
            box-shadow var(--dur-base) var(--ease-out);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform var(--dur-slow) var(--ease-out);
        }
    }

    &__link:hover &__poster {
        transform: translateY(-4px);
        box-shadow:
            var(--shadow-lg),
            0 0 0 1px rgba(255, 90, 31, 0.22);

        img { transform: scale(1.04); }
    }

    &__poster-empty {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        background: radial-gradient(70% 70% at 50% 30%, var(--ink-600), var(--ink-800));
        color: var(--bone-500);
        font-size: 2.5rem;
    }

    &__badge {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        padding: 0.15rem 0.5rem;
        background: rgba(11, 10, 8, 0.7);
        backdrop-filter: blur(6px);
        color: var(--bone-200);
        font-family: var(--font-mono);
        font-size: 0.625rem;
        text-transform: uppercase;
        letter-spacing: var(--ls-micro);
        border-radius: var(--r-sm);
    }

    &__body {
        padding-top: var(--s-3);
    }

    &__year {
        color: var(--bone-500);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        margin: 0 0 0.25rem;
    }

    &__title {
        margin: 0;
        font-family: var(--font-ui);
        font-size: var(--fs-sm);
        font-weight: 500;
        color: var(--bone-50);
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color var(--dur-fast) var(--ease-out);

        .filmo-card__link:hover & { color: var(--ember); }
    }

    &__role {
        margin: 0.3rem 0 0;
        font-family: var(--font-ui);
        font-size: var(--fs-xs);
        color: var(--bone-400);
        font-style: italic;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__rating {
        margin: 0.4rem 0 0;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--gold-leaf);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .actor-page__loading-portrait { animation: none; }
    .filmo-card__link:hover .filmo-card__poster { transform: none; }
    .filmo-card__link:hover img { transform: none; }
}
</style>
