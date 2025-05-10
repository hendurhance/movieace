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

      <!-- Watch Party Button -->
      <div class="watch-party-button" @click="toggleWatchPartyModal" :class="{ disabled: watchPartyData.isLoading }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
          <rect x="3" y="6" width="12" height="12" rx="2" ry="2" />
          <circle cx="8" cy="12" r="4" />
          <path d="M18 22l-3-3m0 0l-3 3m3-3v-5" />
        </svg>
        <span>Watch Party</span>
      </div>
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
        <button v-for="(server, index) in availableServers" :key="index"
          :class="{ active: currentStreamData.currentServer === index }" @click="changeServer(index)">
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

    <!-- Watch Party Modal -->
    <div class="watch-party-modal" v-if="showWatchPartyModal" @click.self="toggleWatchPartyModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Start Watch Party</h2>
          <button class="close-button" @click="toggleWatchPartyModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="watchPartyData.isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Checking availability...</p>
          </div>

          <div v-else-if="watchPartyData.error" class="error-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{{ watchPartyData.error }}</p>
          </div>

          <div v-else-if="watchPartyData.response" class="success-state">
            <div class="movie-confirmation">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3>{{ watchPartyData.response.title }}</h3>
            </div>

            <div class="quality-selection">
              <label for="quality">Select Quality:</label>
              <select id="quality" v-model="watchPartyData.selectedQuality">
                <option v-for="quality in watchPartyData.response.available_qualities" :key="quality" :value="quality">
                  {{ quality }}
                </option>
              </select>
            </div>

            <div class="subtitle-info" v-if="watchPartyData.response.has_subtitles">
              <p>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="16 3 21 3 21 8 16 8 16 3"></polygon>
                  <polygon points="8 3 3 3 3 8 8 8 8 3"></polygon>
                  <polygon points="3 21 3 16 8 16 8 21 3 21"></polygon>
                  <polygon points="21 16 16 16 16 21 21 21 21 16"></polygon>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Subtitles available ({{ watchPartyData.response.subtitles.length }} languages)
              </p>
            </div>

            <button class="start-party-button" @click="startWatchParty">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M10 8l6 4-6 4V8z"></path>
              </svg>
              Start Watch Party
            </button>
          </div>
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
import { Movie } from '../composables/useHighlights';
import {
  currentStreamData,
  getPreferredStreamData,
  savePreferredServer,
  getServers,
  buildStreamUrl,
} from '../composables/useStream';
import {
  watchPartyData,
  fetchWatchPartyData,
  openWatchParty,
  resetWatchPartyData,
} from '../composables/useWatchParty';
import Disclaimer from '../components/layout/Disclaimer.vue';

export default defineComponent({
  name: 'StreamMovie',
  components: {
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

    onMounted(() => {
      resetWatchPartyData();
    });

    // Watch for changes in route params to reset watch party data
    watch(() => route.params.id, (newId, oldId) => {
      if (newId !== oldId) {
        movieId.value = newId as string;
        resetWatchPartyData();
        loadMovieDetails();
      }
    });

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
        await fetchWatchPartyData(movie.value);
      }
      showWatchPartyModal.value = !showWatchPartyModal.value;
    };

    const startWatchParty = () => {
      openWatchParty();
      showWatchPartyModal.value = false;
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
      error,
      watchPartyData,
      showWatchPartyModal,
      toggleWatchPartyModal,
      startWatchParty
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

  .watch-party-button {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #ff5252;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: auto;

    &:hover {
      background-color: #ff3333;
      transform: translateY(-2px);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;

      &:hover {
        background-color: #ff5252;
        transform: none;
      }
    }

    svg {
      margin-right: 0.5rem;
    }

    span {
      font-weight: 500;
    }
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

/* Watch Party Modal Styles */
.watch-party-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    background-color: #1a1b26;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    overflow: hidden;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #fff;
      }

      .close-button {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 5px;

        &:hover {
          color: #fff;
        }
      }
    }

    .modal-body {
      padding: 2rem;

      .loading-state,
      .error-state,
      .success-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        min-height: 200px;
        justify-content: center;

        p {
          margin-top: 1rem;
          color: #e1e1e1;
          font-size: 1.1rem;
        }
      }

      .error-state svg {
        color: #ff5252;
        margin-bottom: 1rem;
      }

      .success-state {
        .movie-confirmation {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;

          svg {
            color: #4CAF50;
            margin-bottom: 1rem;
          }

          h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0;
          }
        }

        .quality-selection {
          margin-bottom: 1.5rem;
          width: 100%;

          label {
            display: block;
            margin-bottom: 0.5rem;
            color: #e1e1e1;
            font-weight: 500;
          }

          select {
            width: 100%;
            padding: 0.75rem;
            border-radius: 6px;
            background-color: #252632;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 1rem;
            outline: none;
            cursor: pointer;

            &:focus {
              border-color: #ff5252;
            }

            option {
              background-color: #252632;
            }
          }
        }

        .subtitle-info {
          margin-bottom: 1.5rem;
          width: 100%;

          p {
            display: flex;
            align-items: center;
            color: #4CAF50;

            svg {
              margin-right: 0.5rem;
            }
          }
        }

        .start-party-button {
          width: 100%;
          padding: 1rem;
          background-color: #ff5252;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.2s;

          &:hover {
            background-color: #ff3333;
            transform: translateY(-2px);
          }

          svg {
            margin-right: 0.5rem;
          }
        }
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
  .stream-header {
    h1 {
      font-size: 1.25rem;
    }

    .watch-party-button span {
      display: none;
    }
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

  .watch-party-modal .modal-content {
    width: 95%;
  }
}
</style>