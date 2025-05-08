<template>
  <div class="stream-container">
    <div class="stream-header">
      <div class="back-button" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Back to movie</span>
      </div>
      <h1 v-if="movie">{{ movie.title }}</h1>
      <div class="placeholder" v-else>Loading...</div>
    </div>

    <div class="video-container">
      <iframe v-if="currentEmbedUrl" :src="currentEmbedUrl" allow="fullscreen" allowfullscreen frameborder="0"></iframe>
      <div class="loading-placeholder" v-else>
        <div class="spinner"></div>
        <p>Loading video player...</p>
      </div>
    </div>

    <div class="server-selection">
      <h3>Select Server</h3>
      <div class="server-buttons">
        <button v-for="(server, index) in availableServers" :key="index" :class="{ active: currentStreamData.currentServer === index }"
          @click="changeServer(index)">
          {{ server.name }}
        </button>
      </div>
    </div>
    <Disclaimer />
    <div class="movie-info" v-if="movie">
      <div class="movie-poster">
        <div class="rating-number">{{ movie?.vote_average }}</div>
        <img :src="getMovieImageUrl(movie as unknown as Movie).poster" :alt="movie?.title" loading="lazy" />
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
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMovies, MovieDetails } from '../composables/useMovies';
import { getMovieImageUrl } from '../utils/useWebImage';
import { Movie } from '../composables/useHighlights';
import { currentStreamData, getPreferredStreamData, savePreferredServer, getServers, buildStreamUrl } from '../composables/useStream';
import Disclaimer from '../components/layout/Disclaimer.vue';
export default defineComponent({
  name: 'StreamMovie',
  components:{
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

    onMounted(() => {
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
      error
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

.server-selection {
  padding: 1.5rem 2rem;

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

  .server-selection .server-buttons button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .movie-info h2 {
    font-size: 1.5rem;
  }

  .back-button span {
    display: none;
  }
}
</style>