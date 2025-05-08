<template>
    <div class="stream-container">
        <div class="stream-header">
            <div class="back-button" @click="goBack">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Back to show</span>
            </div>
            <h1 v-if="show && show.name">{{ show.name }}</h1>
            <div class="placeholder" v-else>Loading...</div>
        </div>

        <div class="video-container">
            <iframe v-if="currentEmbedUrl" :src="currentEmbedUrl" allow="fullscreen" allowfullscreen
                frameborder="0"></iframe>
            <div class="loading-placeholder" v-else>
                <div class="spinner"></div>
                <p>Loading video player...</p>
            </div>
        </div>

        <div class="stream-controls">
            <div class="server-selection">
                <h3>Select Server</h3>
                <div class="server-buttons">
                    <button v-for="(server, index) in servers" :key="index" :class="{ active: currentServer === index }"
                        @click="changeServer(index)">
                        {{ server.name }}
                    </button>
                </div>
            </div>

            <div class="episode-navigation">
                <div class="season-selector">
                    <h3>Season</h3>
                    <div class="season-dropdown">
                        <select v-model="selectedSeason" @change="onSeasonChange">
                            <option v-for="season in availableSeasons" :key="season.id" :value="season.season_number">
                                Season {{ season.season_number }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="episode-selector">
                    <h3>Episodes</h3>
                    <div class="episodes-grid">
                        <button v-for="episode in seasonEpisodes" :key="episode.id"
                            :class="{ active: currentEpisode === episode.episode_number }"
                            @click="changeEpisode(episode.episode_number)">
                            {{ episode.episode_number }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="episode-info" v-if="currentEpisodeDetails">
            <h2>{{ currentEpisodeDetails.name }}</h2>
            <div class="info-details">
                <span>S{{ currentSeason }}:E{{ currentEpisode }}</span>
                <span v-if="currentEpisodeDetails.air_date">{{ formatDate(currentEpisodeDetails.air_date) }}</span>
                <span v-if="currentEpisodeDetails.vote_average">Rating: {{ currentEpisodeDetails.vote_average.toFixed(1)
                    }}/10</span>
            </div>
            <p class="overview">{{ currentEpisodeDetails.overview }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTvShows, TVShowDetails } from '../composables/useTvShows';

export default defineComponent({
    name: 'StreamTVShow',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const showId = ref(route.params.id as string);
        const show = ref<TVShowDetails | null>(null);
        const currentSeason = ref(parseInt(route.params.season as string) || 1);
        const currentEpisode = ref(parseInt(route.params.episode as string) || 1);
        const selectedSeason = ref(currentSeason.value);
        const seasons = ref<any[]>([]);
        const seasonEpisodes = ref<any[]>([]);
        const currentEpisodeDetails = ref<any | null>(null);
        const { fetchTvShow, fetchTvShowBySeason } = useTvShows();
        const currentServer = ref(0);
        const externalId = ref('');

        const servers = [
            { name: 'VidSrc CC', urlTemplate: 'https://vidsrc.cc/v2/embed/tv/{externalId}/{season}/{episode}' },
            { name: 'VidSrc XYZ', urlTemplate: 'https://vidsrc.xyz/embed/tv?tmdb={externalId}&season={season}&episode={episode}' },
            { name: 'VidSrc In', urlTemplate: 'https://vidsrc.in/embed/tv?tmdb={externalId}&season={season}&episode={episode}' },
            { name: 'MultiEmbed', urlTemplate: 'https://multiembed.mov/?video_id={externalId}&tmdb=1&s={season}&e={episode}' },
            { name: 'Embed.su', urlTemplate: 'https://embed.su/embed/tv/{externalId}/{season}/{episode}' },
            { name: 'Vidlink', urlTemplate: 'https://vidlink.pro/tv/{externalId}/{season}/{episode}' },
            { name: 'AutoEmbed', urlTemplate: 'https://player.autoembed.cc/embed/tv/{externalId}/{season}/{episode}' },
            { name: 'VidFast', urlTemplate: 'https://vidfast.pro/tv/{externalId}/{season}/{episode}' },
            { name: '111Movies', urlTemplate: 'https://111movies.com/tv/{externalId}/{season}/{episode}' },
            { name: 'Vidora', urlTemplate: 'https://vidora.su/tv/{externalId}/{season}/{episode}?autoplay=true' },
            { name: 'Smashy', urlTemplate: 'https://player.smashy.stream/tv/{externalId}?s={season}&e={episode}' }
        ];

        const currentEmbedUrl = computed(() => {
            if (!externalId.value) return '';

            return servers[currentServer.value].urlTemplate
                .replace('{externalId}', externalId.value)
                .replace('{season}', currentSeason.value.toString())
                .replace('{episode}', currentEpisode.value.toString());
        });

        console.log('currentEmbedUrl', currentEmbedUrl.value);

        const availableSeasons = computed(() => {
            if (!seasons.value) return [];
            return seasons.value.filter(season => season.season_number > 0);
        });

        const loadShowDetails = async () => {
            try {
                const { data } = await fetchTvShow(showId.value);
                if (data.value) {
                    show.value = data.value;
                    seasons.value = data.value.seasons || [];

                    if (show.value?.name) {
                        document.title = `Stream ${show.value.name} S${currentSeason.value}:E${currentEpisode.value}`;
                    }
                    externalId.value = showId.value;

                    await loadSeasonDetails();
                }
            } catch (error) {
                console.error('Error loading show details:', error);
            }
        };

        const loadSeasonDetails = async () => {
            try {
                const { data } = await fetchTvShowBySeason(showId.value, currentSeason.value);
                if (data.value && data.value.episodes) {
                    seasonEpisodes.value = data.value.episodes;

                    currentEpisodeDetails.value = seasonEpisodes.value.find(
                        ep => ep.episode_number === currentEpisode.value
                    ) || null;
                }
            } catch (error) {
                console.error('Error loading season details:', error);
            }
        };

        const onSeasonChange = async () => {
            currentSeason.value = selectedSeason.value;
            currentEpisode.value = 1;

            router.replace({
                name: 'StreamTVShow',
                params: {
                    id: showId.value,
                    season: currentSeason.value.toString(),
                    episode: currentEpisode.value.toString()
                }
            });

            await loadSeasonDetails();
        };

        const changeEpisode = (episodeNumber: number) => {
            currentEpisode.value = episodeNumber;

            currentEpisodeDetails.value = seasonEpisodes.value.find(
                ep => ep.episode_number === episodeNumber
            ) || null;

            router.replace({
                name: 'StreamTVShow',
                params: {
                    id: showId.value,
                    season: currentSeason.value.toString(),
                    episode: currentEpisode.value.toString()
                }
            });

            if (show.value?.name) {
                document.title = `Stream ${show.value.name} S${currentSeason.value}:E${currentEpisode.value}`;
            }
        };

        const changeServer = (serverIndex: number) => {
            currentServer.value = serverIndex;
        };

        const goBack = () => {
            router.push(`/tv-show/${showId.value}?season=${currentSeason.value}&episode=${currentEpisode.value}`);
        };

        const formatDate = (dateString: string) => {
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        };

        watch(
            () => route.params,
            (newParams) => {
                if (newParams.season && newParams.episode) {
                    currentSeason.value = parseInt(newParams.season as string);
                    selectedSeason.value = currentSeason.value;
                    currentEpisode.value = parseInt(newParams.episode as string);
                    loadSeasonDetails();
                }
            }
        );

        onMounted(() => {
            loadShowDetails();
        });

        return {
            show,
            currentEmbedUrl,
            servers,
            currentServer,
            currentSeason,
            currentEpisode,
            selectedSeason,
            availableSeasons,
            seasonEpisodes,
            currentEpisodeDetails,
            changeServer,
            changeEpisode,
            onSeasonChange,
            goBack,
            formatDate
        };
    }
});
</script>

<style lang="scss" scoped>
.stream-container {
    width: 100%;
    min-height: 100vh;
    background-color: #081b27;
    color: #fff;
    padding-bottom: 2rem;
}

.stream-header {
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    position: relative;

    h1 {
        margin: 0 auto;
        font-size: 1.5rem;
        font-weight: 500;
    }

    .back-button {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: #e1e1e1;
        transition: color 0.2s;

        &:hover {
            color: #ff5252;
        }

        svg {
            margin-right: 0.5rem;
        }
    }

    .placeholder {
        margin: 0 auto;
        font-size: 1.5rem;
        opacity: 0.7;
    }
}

.video-container {
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
    position: relative;
    background-color: #000;

    iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .loading-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #e1e1e1;

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top: 4px solid #ff5252;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
    }
}

.stream-controls {
    padding: 1.5rem 2rem;
}

.server-selection {
    margin-bottom: 2rem;

    h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-weight: 500;
        font-size: 1.2rem;
    }

    .server-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;

        button {
            padding: 0.75rem 1.5rem;
            background-color: #1f2130;
            border: none;
            border-radius: 6px;
            color: #e1e1e1;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;

            &:hover {
                background-color: #2c2f45;
            }

            &.active {
                background-color: #ff5252;
                color: #fff;
            }
        }
    }
}

.episode-navigation {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 2rem;
    margin-top: 1.5rem;

    h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-weight: 500;
        font-size: 1.2rem;
    }

    .season-selector {
        .season-dropdown {
            position: relative;

            &::after {
                content: '';
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 6px solid #f1b722;
                pointer-events: none;
            }

            select {
                width: 100%;
                padding: 0.75rem;
                background-color: #1f2130;
                color: #fff;
                border: 1px solid #2c2f45;
                border-radius: 6px;
                font-size: 1rem;
                cursor: pointer;
                appearance: none;
                padding-right: 30px;

                &:focus {
                    outline: none;
                    border-color: #ff5252;
                }

                option {
                    background-color: #1f2130;
                    color: #fff;
                }
            }
        }
    }

    .episodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        gap: 0.75rem;

        button {
            padding: 0.75rem 0;
            background-color: #1f2130;
            border: none;
            border-radius: 6px;
            color: #e1e1e1;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            position: relative;

            &:hover {
                background-color: #2c2f45;
            }

            &.active {
                background-color: #f1b722;
                color: #040d13;
            }

            &::before {
                content: attr(title);
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(15, 16, 22, 0.9);
                color: #fff;
                text-align: center;
                padding: 5px 10px;
                border-radius: 6px;
                font-size: 0.75rem;
                white-space: nowrap;
                visibility: hidden;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
                z-index: 10;
            }

            &:hover::before {
                visibility: visible;
                opacity: 1;
            }
        }
    }
}

.episode-info {
    padding: 1rem 2rem;
    max-width: 960px;
    margin: 0 auto;

    h2 {
        margin-top: 0;
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }

    .info-details {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1rem;
        color: #b0b0b0;
        font-size: 0.95rem;
    }

    .overview {
        line-height: 1.6;
        color: #e1e1e1;
        margin-top: 1rem;
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .stream-header h1 {
        font-size: 1.25rem;
    }

    .episode-navigation {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .server-selection .server-buttons button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }

    .episodes-grid {
        grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    }

    .episode-info h2 {
        font-size: 1.5rem;
    }

    .back-button span {
        display: none;
    }
}
</style>