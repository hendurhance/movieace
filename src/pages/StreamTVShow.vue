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
            <button v-for="(server, index) in availableServers" :key="index" 
              :class="{ active: currentStreamData.currentServer === index }"
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

        <Disclaimer />
    <div class="episode-info" v-if="currentEpisodeDetails">
    <div class="episode-info-container">
      <div class="movie-poster" v-if="show">
        <img :src="getMovieImageUrl(show as unknown as TVShowDetails).poster" :alt="show?.name" loading="lazy" />
        <div class="rating">{{ currentEpisodeDetails.vote_average ? currentEpisodeDetails.vote_average.toFixed(1) : '0.0' }}</div>
      </div>
      <div class="episode-details">
        <h1>{{ currentEpisodeDetails.name }}</h1>
        <div class="info-bar">
          <span class="year">{{ new Date(currentEpisodeDetails.air_date).getFullYear() }}</span>
          <span class="separator">•</span>
          <span class="runtime">{{ Math.floor(currentEpisodeDetails.runtime / 60) }}h {{ currentEpisodeDetails.runtime % 60 }}m</span>
          <span class="separator">•</span>
          <span class="rating">Rating: {{ currentEpisodeDetails.vote_average ? currentEpisodeDetails.vote_average.toFixed(1) : '0.0' }}/10</span>
        </div>
        <p class="overview">{{ currentEpisodeDetails.overview }}</p>
      </div>
    </div>
  </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, watch, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useTvShows, TVShowDetails, Episode, TVShowSeasonDetails } from '../composables/useTvShows';
  import { getMovieImageUrl } from '../utils/useWebImage';
  import Disclaimer from '../components/layout/Disclaimer.vue';
  import { 
    currentStreamData, 
    getPreferredStreamData, 
    saveLastWatchedMetaData, 
    savePreferredServer,
    getServers,
    buildStreamUrl,
  } from '../composables/useStream';
  

  
  export default defineComponent({
    name: 'StreamTVShow',
    components: {
      Disclaimer
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const showId = ref<string>(route.params.id as string);
      const show = ref<TVShowDetails | null>(null);
      const currentSeason = ref<number>(parseInt(route.params.season as string) || 1);
      const currentEpisode = ref<number>(parseInt(route.params.episode as string) || 1);
      const selectedSeason = ref<number>(currentSeason.value);
      const seasons = ref<TVShowSeasonDetails[]>([]);
      const seasonEpisodes = ref<Episode[]>([]);
      const currentEpisodeDetails = ref<Episode | null>(null);
      const { fetchTvShow, fetchTvShowBySeason } = useTvShows();
      const externalId = ref<string>('');
      const isLoading = ref<boolean>(false);
      const error = ref<string | null>(null);
  
      const availableServers = computed(() => getServers('tv'));
  
      const currentEmbedUrl = computed(() => {
        if (!externalId.value) return '';
        return buildStreamUrl(
          externalId.value,
          'tv',
          currentStreamData.value.currentServer,
          currentSeason.value,
          currentEpisode.value
        );
      });
  
      const availableSeasons = computed(() => {
        return seasons.value.filter(season => season.season_number > 0);
      });
  
      const loadShowDetails = async () => {
        if (!showId.value) {
          error.value = 'Invalid show ID';
          return;
        }
  
        isLoading.value = true;
        error.value = null;
        
        try {
          const { data } = await fetchTvShow(showId.value);
          if (!data.value) {
            throw new Error('No show data received');
          }
  
          show.value = data.value;
          seasons.value = (data.value.seasons || []).map(season => ({
            ...season,
            _id: season.id.toString(),
            episodes: []
          }));
          externalId.value = showId.value;
  
          updateDocumentTitle();
          
          const preferredData = getPreferredStreamData(showId.value, 'tv');
          if (!preferredData) {
            savePreferredServer(showId.value, 0, 'tv');
          } else {
            currentSeason.value = preferredData.season > 0 ? preferredData.season : 1;
            selectedSeason.value = currentSeason.value;
            currentEpisode.value = preferredData.episode > 0 ? preferredData.episode : 1;
          }
  
          await loadSeasonDetails();
        } catch (err) {
          error.value = err instanceof Error ? err.message : 'Failed to load show details';
          console.error('Error loading show details:', err);
        } finally {
          isLoading.value = false;
        }
      };
  
      const loadSeasonDetails = async () => {
        if (!showId.value || currentSeason.value < 1) {
          error.value = 'Invalid show ID or season';
          return;
        }
  
        isLoading.value = true;
        
        try {
          const { data } = await fetchTvShowBySeason(showId.value, currentSeason.value);
          if (!data.value?.episodes) {
            throw new Error('No season data received');
          }
  
          seasonEpisodes.value = data.value.episodes;
          currentEpisodeDetails.value = seasonEpisodes.value.find(
            ep => ep.episode_number === currentEpisode.value
          ) || seasonEpisodes.value[0] || null;
  
          if (currentEpisodeDetails.value) {
            saveLastWatchedMetaData(showId.value, 'tv', {
              season: currentSeason.value,
              episode: currentEpisode.value
            });
          }
  
          updateDocumentTitle();
        } catch (err) {
          error.value = err instanceof Error ? err.message : 'Failed to load season details';
          console.error('Error loading season details:', err);
        } finally {
          isLoading.value = false;
        }
      };
  
      const updateDocumentTitle = () => {
        if (show.value?.name) {
          document.title = `Stream ${show.value.name} S${currentSeason.value}:E${currentEpisode.value}`;
        }
      };
  
      const onSeasonChange = async () => {
        if (currentSeason.value === selectedSeason.value) return;
  
        currentSeason.value = selectedSeason.value;
        currentEpisode.value = 1;
        
        await updateRouteAndSave();
        await loadSeasonDetails();
      };
  
      const changeEpisode = async (episodeNumber: number) => {
        if (episodeNumber < 1 || episodeNumber === currentEpisode.value) return;
  
        currentEpisode.value = episodeNumber;
        currentEpisodeDetails.value = seasonEpisodes.value.find(
          ep => ep.episode_number === episodeNumber
        ) || null;
  
        await updateRouteAndSave();
      };
  
      const updateRouteAndSave = async () => {
        try {
          await router.replace({
            name: 'StreamTVShow',
            params: {
              id: showId.value,
              season: currentSeason.value.toString(),
              episode: currentEpisode.value.toString()
            }
          });
  
          saveLastWatchedMetaData(showId.value, 'tv', {
            season: currentSeason.value,
            episode: currentEpisode.value
          });
  
          updateDocumentTitle();
        } catch (err) {
          console.error('Error updating route:', err);
        }
      };
  
      const changeServer = (serverIndex: number) => {
        savePreferredServer(showId.value, serverIndex, 'tv');
        getPreferredStreamData(showId.value, 'tv');
      };
  
      const goBack = () => {
        router.push(`/tv-show/${showId.value}?season=${currentSeason.value}&episode=${currentEpisode.value}`);
      };
  
      const formatDate = (dateString: string): string => {
        try {
          const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
          return new Date(dateString).toLocaleDateString(undefined, options);
        } catch {
          return dateString;
        }
      };
  
      watch(
        () => route.params,
        async (newParams) => {
          const newSeason = parseInt(newParams.season as string);
          const newEpisode = parseInt(newParams.episode as string);
  
          if (newParams.id !== showId.value) {
            showId.value = newParams.id as string;
            await loadShowDetails();
          } else if (newSeason !== currentSeason.value || newEpisode !== currentEpisode.value) {
            currentSeason.value = newSeason || 1;
            selectedSeason.value = currentSeason.value;
            currentEpisode.value = newEpisode || 1;
            await loadSeasonDetails();
          }
        },
        { deep: true }
      );
  
      onMounted(() => {
        loadShowDetails();
      });
  
      return {
        show,
        currentEmbedUrl,
        availableServers,
        currentSeason,
        currentEpisode,
        selectedSeason,
        availableSeasons,
        seasonEpisodes,
        currentEpisodeDetails,
        isLoading,
        error,
        changeServer,
        changeEpisode,
        onSeasonChange,
        goBack,
        formatDate,
        getMovieImageUrl,
        currentStreamData
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

    .movie-poster {
        margin-top: 2rem;
        position: relative;
        width: 100%;
        height: clamp(400px, 30vw, 600px);
        margin-right: 1.5rem;
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            border-radius: 8px;
            object-fit: cover;
        }
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
  width: 100%;
  padding: 2rem 0;
  
  .episode-info-container {
    max-width: 1200px;
    display: flex;
    gap: 2rem;
    padding: 0 1.5rem;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1.5rem;
    }
  }
  
  .movie-poster {
    position: relative;
    flex-shrink: 0;
    width: 300px;
    height: auto;
    overflow: hidden;
    border-radius: 8px;
    
    @media (max-width: 768px) {
      width: 200px;
    }
    
    img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }
    
    .rating {
      position: absolute;
      top: 10px;
      left: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      font-weight: 700;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 1.5rem;
    }
  }
  
  .episode-details {
    flex: 1;
    
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: #ffffff;
      line-height: 1.2;
      
      @media (max-width: 768px) {
        font-size: 1.75rem;
      }
    }
    
    .info-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      color: #b0b0b0;
      margin-bottom: 1.5rem;
      font-size: 1rem;
      
      .separator {
        color: #666;
      }
      
      .year, .runtime, .rating {
        font-weight: 500;
      }
    }
    
    .overview {
      font-size: 1.125rem;
      line-height: 1.6;
      color: #e1e1e1;
      margin: 0;
      max-width: 800px;
      
      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }
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