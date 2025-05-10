<template>
  <div class="stream-container">
    <StreamHeader
      :title="movie?.title"
      back-text="Back to movie"
      @back-click="goBack"
    >
      <WatchParty
        :is-loading="watchPartyData.isLoading"
        :error="watchPartyData.error"
        :response="watchPartyData.response"
        :show-modal="showWatchPartyModal"
        @toggle-modal="toggleWatchPartyModal"
        @start-party="startWatchParty"
        @quality-change="setWatchPartyQuality"
      />
    </StreamHeader>

    <VideoPlayer :embedUrl="currentEmbedUrl" />

    <ServerSelection
      :servers="availableServers"
      :active-server-index="currentStreamData.currentServer"
      @server-change="changeServer"
    />

    <Disclaimer />

    <div class="movie-info" v-if="movie">
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
import {
  watchPartyData,
  fetchWatchPartyMovieData,
  openWatchParty,
  resetWatchPartyData,
  setWatchPartyQuality,
} from '../composables/useWatchParty';
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
    const showWatchPartyModal = ref<boolean>(false);

    const availableServers = computed(() => getServers('movie'));

    const currentEmbedUrl = computed(() => {
      if (!movieId.value) return '';
      return buildStreamUrl(
        movieId.value,
        'movie',
        currentStreamData.value.currentServer
      );
    });

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

        const preferredData = getPreferredStreamData(movieId.value, 'movie');
        if (!preferredData) {
          savePreferredServer(movieId.value, 0, 'movie');
          getPreferredStreamData(movieId.value, 'movie');
        }
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
    };

    const goBack = () => {
      router.push(`/movie/${movieId.value}`);
    };

    const toggleWatchPartyModal = async () => {
      if (!showWatchPartyModal.value && movie.value) {
        await fetchWatchPartyMovieData(movie.value);
      }
      showWatchPartyModal.value = !showWatchPartyModal.value;
    };

    const startWatchParty = () => {
      openWatchParty();
      showWatchPartyModal.value = false;
    };

    watch(
      () => route.params.id,
      (newId, oldId) => {
        if (newId !== oldId) {
          movieId.value = newId as string;
          resetWatchPartyData();
          loadMovieDetails();
        }
      }
    );

    onMounted(() => {
      resetWatchPartyData();
      loadMovieDetails();
    });

    return {
      movie,
      currentEmbedUrl,
      availableServers,
      changeServer,
      goBack,
      getMovieImageUrl,
      currentStreamData,
      isLoading,
      error,
      watchPartyData,
      showWatchPartyModal,
      toggleWatchPartyModal,
      startWatchParty,
      setWatchPartyQuality
    };
  }
});
</script>

<style lang="scss" scoped>
.stream-container {
  width: 100%;
  min-height: 100vh;
  background-color: #0f1016;
  color: #fff;
  padding-bottom: 2rem;
}

.movie-info {
  margin-top: 3rem;
  padding: 1rem 2rem;
  max-width: 960px;
  display: flex;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }

  .movie-poster {
    position: relative;
    width: 200px;
    height: 300px;
    margin-right: 1.5rem;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }

    .rating-number {
      position: absolute;
      top: 10px;
      left: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 1rem;
    }
  }

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

  @media (max-width: 768px) {
    h2 {
      font-size: 1.5rem;
    }
  }
}
</style>