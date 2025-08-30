<template>
  <div class="stream-container">
    <StreamHeader
      :title="movie?.title"
      back-text="Back to movie"
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
    </div>

    <Disclaimer />

    <div class="movie-info" v-if="movie">
      <div class="movie-info-container">
        <div class="movie-poster">
          <div class="rating-number">{{ movie?.vote_average?.toFixed(1) || '0.0' }}</div>
          <img
            :src="getMovieImageUrl(movie).poster"
            :alt="movie?.title"
            loading="lazy"
          />
        </div>
        <div class="movie-sub-texts">
          <h2>{{ movie.title }}</h2>
          <div class="info-details">
            <span v-if="movie.release_date">{{ new Date(movie.release_date).getFullYear() }}</span>
            <span v-if="movie.runtime">{{ Math.floor(movie.runtime / 60) }}h {{ movie.runtime % 60 }}m</span>
            <span v-if="movie.vote_average">Rating: {{ movie.vote_average.toFixed(1) }}/10</span>
          </div>
          <p class="overview">{{ movie.overview }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMovies, MovieDetails } from '../composables/useMovies';
import { getMovieImageUrl } from '../utils/useWebImage';
import {
  currentStreamData,
  getPreferredStreamData,
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

export default defineComponent({
  name: 'StreamMovie',
  components: {
    StreamHeader,
    ServerSelection,
    VideoPlayer,
    WatchParty,
    Disclaimer
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const movieId = ref<string>(route.params.id as string);
    const movie = ref<MovieDetails | null>(null);
    const { fetchMovie } = useMovies();
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    // Watch Party Sync
    const {
      isConnected,
      memberCount,
      setCurrentMedia,
    } = useWatchPartySync();

    const availableServers = computed(() => getServers('movie'));
    
    const isWatchPartyActive = computed(() => isConnected.value && memberCount.value > 1);

    const currentEmbedUrl = computed(() => {
      if (!movieId.value) return '';
      return buildStreamUrl(
        movieId.value,
        'movie',
        currentStreamData.value.currentServer
      );
    });

    // Create media data for watch party
    const mediaData = computed((): MediaInfo | null => {
      if (!movie.value) return null;
      
      return {
        type: 'movie',
        id: movie.value.id,
        title: movie.value.title,
        streamUrl: currentEmbedUrl.value,
        posterUrl: getMovieImageUrl(movie.value).poster,
        year: movie.value.release_date ? new Date(movie.value.release_date).getFullYear() : undefined
      };
    });

    // Handle player events (from iframe messages)
    const handlePlayerEvent = (event: any) => {
      console.log('StreamMovie received player event:', event);
      // Additional handling if needed
    };

    // Handle sync requests (from watch party or player)
    const handleSyncRequest = (syncData: SyncEvent) => {
      console.log('StreamMovie handling sync request:', syncData);
      // The sync is handled automatically by the WatchPartySync composable
    };

    // Handle media changes from watch party
    const handleMediaChange = (newMediaData: MediaInfo) => {
      console.log('Media changed in watch party:', newMediaData);
      setCurrentMedia(newMediaData);
    };

    const loadMovieDetails = async () => {
      if (!movieId.value) {
        error.value = 'Invalid movie ID';
        return;
      }

      isLoading.value = true;
      error.value = null;

      try {
        const { data } = await fetchMovie(movieId.value);
        if (!data.value) {
          throw new Error('No movie data received');
        }

        movie.value = data.value;
        if (movie.value?.title) {
          document.title = `Stream ${movie.value.title}`;
        }

        // Set up preferred server
        const preferredData = getPreferredStreamData(movieId.value, 'movie');
        if (!preferredData) {
          savePreferredServer(movieId.value, 0, 'movie');
          getPreferredStreamData(movieId.value, 'movie');
        }

        // Update media data in watch party system when movie loads
        setTimeout(() => {
          if (mediaData.value) {
            setCurrentMedia(mediaData.value);
          }
        }, 100);

      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to load movie details';
        console.error('Error loading movie details:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const changeServer = (serverIndex: number) => {
      if (serverIndex < 0 || serverIndex >= availableServers.value.length) {
        console.warn('Invalid server index');
        return;
      }
      
      savePreferredServer(movieId.value, serverIndex, 'movie');
      getPreferredStreamData(movieId.value, 'movie');
      
      // Update media data when server changes
      setTimeout(() => {
        if (mediaData.value) {
          setCurrentMedia(mediaData.value);
        }
      }, 100);
    };

    const goBack = () => {
      router.push(`/movie/${movieId.value}`);
    };

    watch(
      () => route.params.id,
      (newId, oldId) => {
        if (newId !== oldId) {
          movieId.value = newId as string;
          loadMovieDetails();
        }
      }
    );

    // Watch for embed URL changes and update media data
    watch(currentEmbedUrl, () => {
      if (mediaData.value) {
        setCurrentMedia(mediaData.value);
      }
    });

    onMounted(() => {
      loadMovieDetails();
    });

    return {
      movie,
      mediaData,
      currentEmbedUrl,
      availableServers,
      isWatchPartyActive,
      memberCount,
      changeServer,
      goBack,
      getMovieImageUrl,
      currentStreamData,
      isLoading,
      error,
      handlePlayerEvent,
      handleSyncRequest,
      handleMediaChange
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

.movie-info {
  width: 100%;
  padding: 3rem 0;
  background: linear-gradient(135deg, rgba(31, 33, 48, 0.3) 0%, rgba(44, 47, 69, 0.2) 100%);
  margin-top: 2rem;

  .movie-info-container {
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

    .rating-number {
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

  .movie-sub-texts {
    display: flex;
    flex-direction: column;
    justify-content: center;

    h2 {
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

    .info-details {
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

      span {
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

        &:first-child::before {
          content: '📅';
          font-size: 0.875rem;
        }

        &:nth-child(2)::before {
          content: '⏱️';
          font-size: 0.875rem;
        }

        &:last-child::before {
          content: '⭐';
          font-size: 0.875rem;
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

  .movie-info {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #fff;
  }

  .movie-sub-texts h2 {
    background: #fff;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

// Focus management for keyboard navigation
.stream-controls :focus-visible,
.movie-info :focus-visible {
  outline: 2px solid #ff5252;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>