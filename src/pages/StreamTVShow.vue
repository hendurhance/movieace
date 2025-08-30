<template>
  <div class="stream-container">
    <StreamHeader
      :title="show?.name"
      back-text="Back to show"
      @back-click="goBack"
    >
      <WatchParty
        :media-data="mediaData"
        :enable-sync="true"
        @sync-request="handleSyncRequest"
        @media-change="handleMediaChange"
      />
    </StreamHeader>

    <VideoPlayer 
      :embedUrl="currentEmbedUrl"
      :enable-watch-party="isWatchPartyActive"
      :member-count="memberCount"
      @player-event="handlePlayerEvent"
      @sync-request="handleSyncRequest"
    />

    <div class="stream-controls">
      <ServerSelection
        :servers="availableServers"
        :active-server-index="currentStreamData.currentServer"
        @server-change="changeServer"
      />

      <EpisodeNavigation
        :available-seasons="availableSeasons"
        :season-episodes="seasonEpisodes"
        :current-season="currentSeason"
        :current-episode="currentEpisode"
        :is-loading-episodes="isLoadingEpisodes"
        @season-change="onSeasonChange"
        @episode-change="changeEpisode"
      />
    </div>

    <Disclaimer />

    <div class="episode-info" v-if="currentEpisodeDetails">
      <div class="episode-info-container">
        <div class="movie-poster" v-if="show">
          <img
            :src="getMovieImageUrl(show).poster"
            :alt="show?.name"
            loading="lazy"
          />
          <div class="rating">
            {{ currentEpisodeDetails.vote_average ? currentEpisodeDetails.vote_average.toFixed(1) : '0.0' }}
          </div>
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
import {
  currentStreamData,
  getPreferredStreamData,
  saveLastWatchedMetaData,
  savePreferredServer,
  getServers,
  buildStreamUrl,
} from '../composables/useStream';
import { useWatchPartySync, type MediaInfo, type SyncEvent } from '../composables/useWatchPartySync';
import StreamHeader from '../components/StreamHeader.vue';
import ServerSelection from '../components/ServerSelection.vue';
import VideoPlayer from '../components/VideoPlayer.vue';
import WatchParty from '../components/WatchParty.vue';
import Disclaimer from '../components/layout/Disclaimer.vue';
import EpisodeNavigation from '../components/EpisodeNavigation.vue';

export default defineComponent({
  name: 'StreamTVShow',
  components: {
    StreamHeader,
    ServerSelection,
    VideoPlayer,
    WatchParty,
    Disclaimer,
    EpisodeNavigation
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const showId = ref<string>(route.params.id as string);
    const show = ref<TVShowDetails | null>(null);
    const currentSeason = ref<number>(parseInt(route.params.season as string) || 1);
    const currentEpisode = ref<number>(parseInt(route.params.episode as string) || 1);
    const seasons = ref<TVShowSeasonDetails[]>([]);
    const seasonEpisodes = ref<Episode[]>([]);
    const currentEpisodeDetails = ref<Episode | null>(null);
    const { fetchTvShow, fetchTvShowBySeason } = useTvShows();
    const externalId = ref<string>('');
    const isLoading = ref<boolean>(false);
    const isLoadingEpisodes = ref<boolean>(false);
    const error = ref<string | null>(null);

    // Watch Party Sync
    const {
      isConnected,
      memberCount,
      setCurrentMedia,
    } = useWatchPartySync();

    const availableServers = computed(() => getServers('tv'));

    const isWatchPartyActive = computed(() => isConnected.value && memberCount.value > 1);

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

    // Create media data for watch party
    const mediaData = computed((): MediaInfo | null => {
      if (!show.value) return null;
      
      return {
        type: 'tv',
        id: show.value.id,
        title: show.value.name,
        season: currentSeason.value,
        episode: currentEpisode.value,
        streamUrl: currentEmbedUrl.value,
        posterUrl: getMovieImageUrl(show.value).poster,
        year: show.value.first_air_date ? new Date(show.value.first_air_date).getFullYear() : undefined
      };
    });

    const availableSeasons = computed(() => {
      return seasons.value.filter(season => season.season_number > 0);
    });

    // Handle player events (from iframe messages)
    const handlePlayerEvent = (event: any) => {
      console.log('StreamTVShow received player event:', event);
      // Additional handling if needed
    };

    // Handle sync requests (from watch party or player)
    const handleSyncRequest = (syncData: SyncEvent) => {
      console.log('StreamTVShow handling sync request:', syncData);
      // The sync is handled automatically by the WatchPartySync composable
    };

    // Handle media changes from watch party
    const handleMediaChange = (newMediaData: MediaInfo) => {
      console.log('Media changed in watch party:', newMediaData);
      setCurrentMedia(newMediaData);
    };

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
          currentEpisode.value = preferredData.episode > 0 ? preferredData.episode : 1;
        }

        await loadSeasonDetails();
        
        // Update media data in watch party system when show loads
        setTimeout(() => {
          if (mediaData.value) {
            setCurrentMedia(mediaData.value);
          }
        }, 100);
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

      isLoadingEpisodes.value = true;

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
        isLoadingEpisodes.value = false;
      }
    };

    const updateDocumentTitle = () => {
      if (show.value?.name) {
        document.title = `Stream ${show.value.name} S${currentSeason.value}:E${currentEpisode.value}`;
      }
    };

    const onSeasonChange = async (newSeason: number) => {
      if (currentSeason.value === newSeason) return;

      currentSeason.value = newSeason;
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

    // Watch for embed URL changes and update media data
    watch(
      [currentEmbedUrl, currentSeason, currentEpisode],
      () => {
        if (mediaData.value) {
          setCurrentMedia(mediaData.value);
        }
      }
    );

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
      mediaData,
      currentEmbedUrl,
      availableServers,
      currentSeason,
      currentEpisode,
      availableSeasons,
      seasonEpisodes,
      currentEpisodeDetails,
      isWatchPartyActive,
      memberCount,
      isLoading,
      isLoadingEpisodes,
      error,
      changeServer,
      changeEpisode,
      onSeasonChange,
      goBack,
      handlePlayerEvent,
      handleSyncRequest,
      handleMediaChange,
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
  background: linear-gradient(135deg, #0f1016 0%, #1a1b26 100%);
  color: #fff;
  padding-bottom: 2rem;
}

.stream-controls {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 1400px;
  margin: 0 auto;
}

.episode-info {
  width: 100%;
  padding: 3rem 0;
  background: linear-gradient(135deg, rgba(31, 33, 48, 0.3) 0%, rgba(44, 47, 69, 0.2) 100%);
  margin-top: 2rem;

  .episode-info-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 3rem;
    padding: 0 2rem;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 2rem;
      text-align: center;
    }

    @media (max-width: 768px) {
      padding: 0 1rem;
      gap: 1.5rem;
    }
  }

  .movie-poster {
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }

    .rating {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%);
      color: #fff;
      font-weight: 700;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      font-size: 1.25rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 0.375rem;

      &::before {
        content: '⭐';
        font-size: 0.875rem;
      }
    }
  }

  .episode-details {
    display: flex;
    flex-direction: column;
    justify-content: center;

    h1 {
      font-size: 2.75rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      color: #fff;
      line-height: 1.2;
      background: linear-gradient(135deg, #fff 0%, #e1e1e1 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

      @media (max-width: 768px) {
        font-size: 2rem;
      }

      @media (max-width: 480px) {
        font-size: 1.75rem;
      }
    }

    .info-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;
      font-size: 1rem;

      @media (max-width: 1024px) {
        justify-content: center;
      }

      @media (max-width: 480px) {
        gap: 1rem;
        font-size: 0.9rem;
      }

      .separator {
        color: rgba(255, 255, 255, 0.3);
        font-weight: 300;
      }

      .year,
      .runtime,
      .rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        color: #b0b0b0;
        background: rgba(255, 255, 255, 0.05);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        &::before {
          font-size: 0.875rem;
        }

        &.year::before {
          content: '📅';
        }

        &.runtime::before {
          content: '⏱️';
        }

        &.rating::before {
          content: '⭐';
        }
      }
    }

    .overview {
      font-size: 1.25rem;
      line-height: 1.7;
      color: #c1c7d0;
      margin: 0;
      max-width: 800px;

      @media (max-width: 1024px) {
        text-align: left;
        margin: 0 auto;
      }

      @media (max-width: 768px) {
        font-size: 1.125rem;
        line-height: 1.6;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }
  }
}

// Loading states
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 16, 22, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-content {
    text-align: center;
    color: #e1e1e1;

    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top: 4px solid #ff5252;
      animation: spin 1.5s linear infinite;
      margin: 0 auto 1rem;
    }

    p {
      font-size: 1.125rem;
      margin: 0;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Error states
.error-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #e74c3c;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.125rem;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  button {
    background: linear-gradient(135deg, #ff5252 0%, #ff7979 100%);
    color: #fff;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: linear-gradient(135deg, #ff3333 0%, #ff5252 100%);
      transform: translateY(-2px);
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .movie-poster,
  .loading-overlay .spinner,
  .error-state button {
    transition: none;
    animation: none;
  }
}

// High contrast mode
@media (prefers-contrast: high) {
  .stream-container {
    background: #000;
  }

  .episode-info {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #fff;
  }

  .episode-details h1 {
    background: #fff;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

// Focus management for keyboard navigation
.stream-controls :focus-visible,
.episode-info :focus-visible {
  outline: 2px solid #ff5252;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>