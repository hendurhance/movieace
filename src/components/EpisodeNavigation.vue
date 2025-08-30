<template>
  <div class="episode-navigation">
    <!-- Navigation Header -->
    <div class="nav-header">
      <div class="season-info">
        <h3>
          <TvIcon />
          Season {{ currentSeason }}
        </h3>
        <span class="episode-count">{{ seasonEpisodes.length }} episodes</span>
      </div>
      
      <!-- Quick Episode Controls -->
      <div class="episode-controls">
        <button 
          class="control-btn" 
          @click="previousEpisode" 
          :disabled="!canGoPrevious"
          title="Previous Episode"
        >
          <ArrowLeft />
        </button>
        
        <div class="current-episode">
          Episode {{ currentEpisode }}
        </div>
        
        <button 
          class="control-btn" 
          @click="nextEpisode" 
          :disabled="!canGoNext"
          title="Next Episode"
        >
          <ArrowRight />
        </button>
      </div>
    </div>

    <!-- Season Selection -->
    <div class="season-selection">
      <label>Season</label>
      <div class="season-dropdown">
        <select v-model="selectedSeason" @change="onSeasonChange">
          <option v-for="season in availableSeasons" :key="season.id" :value="season.season_number">
            Season {{ season.season_number }} ({{ season.episode_count || 0 }} episodes)
          </option>
        </select>
        <ChevronDown class="dropdown-icon" />
      </div>
    </div>

    <!-- Episodes Grid -->
    <div class="episodes-section">
      <div class="episodes-header">
        <h4>Episodes</h4>
        <button class="view-toggle" @click="toggleViewMode">
          <GridIcon v-if="viewMode === 'list'" />
          <ListIcon v-else />
          {{ viewMode === 'grid' ? 'List View' : 'Grid View' }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingEpisodes" class="episodes-loading">
        <div class="spinner"></div>
        <p>Loading episodes...</p>
      </div>

      <!-- Episodes Display -->
      <div v-else :class="['episodes-container', viewMode]">
        <div
          v-for="episode in seasonEpisodes"
          :key="episode.id"
          :class="['episode-card', { active: currentEpisode === episode.episode_number }]"
          @click="selectEpisode(episode.episode_number)"
        >
          <div class="episode-number">{{ episode.episode_number }}</div>
          
          <div class="episode-content">
            <div class="episode-title">{{ episode.name || `Episode ${episode.episode_number}` }}</div>
            <div class="episode-meta">
              <span v-if="episode.air_date" class="air-date">
                <ClockIcon />
                {{ formatDate(episode.air_date) }}
              </span>
              <span v-if="episode.runtime" class="runtime">
                {{ episode.runtime }}min
              </span>
              <span v-if="episode.vote_average" class="rating">
                <StarIcon />
                {{ episode.vote_average.toFixed(1) }}
              </span>
            </div>
            <p v-if="episode.overview && viewMode === 'list'" class="episode-overview">
              {{ truncateText(episode.overview, 120) }}
            </p>
          </div>

          <div class="episode-actions">
            <div v-if="currentEpisode === episode.episode_number" class="playing-indicator">
              <PlayIcon />
              Playing
            </div>
            <button v-else class="play-btn" title="Play Episode">
              <PlayCircleIcon />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Keyboard Shortcuts Help -->
    <div class="shortcuts-hint" v-if="showShortcuts">
      <p>
        <strong>Keyboard Shortcuts:</strong> 
        ← Previous Episode | → Next Episode | Space Play/Pause | Esc Close
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onUnmounted, PropType } from 'vue';

// Import icons
import TvIcon from './svg/outline/tv.vue';
import ArrowLeft from './svg/outline/arrow-left.vue';
import ArrowRight from './svg/outline/arrow-right.vue';
import ChevronDown from './svg/outline/chevron-down.vue';
import GridIcon from './svg/outline/grid.vue';
import ListIcon from './svg/outline/list.vue';
import ClockIcon from './svg/outline/clock.vue';
import StarIcon from './svg/solid/star.vue';
import PlayIcon from './svg/outline/play.vue';
import PlayCircleIcon from './svg/outline/play-circle.vue';

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  air_date?: string;
  runtime?: number;
  vote_average?: number;
}

interface Season {
  id: number;
  season_number: number;
  episode_count?: number;
}

export default defineComponent({
  name: 'EpisodeNavigation',
  components: {
    TvIcon,
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    GridIcon,
    ListIcon,
    ClockIcon,
    StarIcon,
    PlayIcon,
    PlayCircleIcon
  },
  props: {
    availableSeasons: {
      type: Array as PropType<Season[]>,
      required: true
    },
    seasonEpisodes: {
      type: Array as PropType<Episode[]>,
      required: true
    },
    currentSeason: {
      type: Number,
      required: true
    },
    currentEpisode: {
      type: Number,
      required: true
    },
    isLoadingEpisodes: {
      type: Boolean,
      default: false
    }
  },
  emits: ['season-change', 'episode-change'],
  setup(props, { emit }) {
    const selectedSeason = ref(props.currentSeason);
    const viewMode = ref<'grid' | 'list'>('grid');
    const showShortcuts = ref(false);

    const canGoPrevious = computed(() => {
      if (props.currentEpisode > 1) return true;
      if (props.currentSeason > 1) {
        const prevSeason = props.availableSeasons.find(s => s.season_number === props.currentSeason - 1);
        return prevSeason !== undefined;
      }
      return false;
    });

    const canGoNext = computed(() => {
      if (props.currentEpisode < props.seasonEpisodes.length) return true;
      const nextSeason = props.availableSeasons.find(s => s.season_number === props.currentSeason + 1);
      return nextSeason !== undefined;
    });

    const onSeasonChange = () => {
      emit('season-change', selectedSeason.value);
    };

    const selectEpisode = (episodeNumber: number) => {
      emit('episode-change', episodeNumber);
    };

    const previousEpisode = () => {
      if (props.currentEpisode > 1) {
        emit('episode-change', props.currentEpisode - 1);
      } else if (props.currentSeason > 1) {
        const prevSeason = props.currentSeason - 1;
        emit('season-change', prevSeason);
        // Will set to last episode of previous season
      }
    };

    const nextEpisode = () => {
      if (props.currentEpisode < props.seasonEpisodes.length) {
        emit('episode-change', props.currentEpisode + 1);
      } else {
        const nextSeason = props.availableSeasons.find(s => s.season_number === props.currentSeason + 1);
        if (nextSeason) {
          emit('season-change', nextSeason.season_number);
          // Will set to episode 1 of next season
        }
      }
    };

    const toggleViewMode = () => {
      viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
      localStorage.setItem('episodeViewMode', viewMode.value);
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };

    const truncateText = (text: string, length: number): string => {
      if (text.length <= length) return text;
      return text.substring(0, length).trim() + '...';
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return;
      }

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          if (canGoPrevious.value) previousEpisode();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (canGoNext.value) nextEpisode();
          break;
        case 'KeyH':
          event.preventDefault();
          showShortcuts.value = !showShortcuts.value;
          break;
      }
    };

    // Watch for prop changes
    watch(() => props.currentSeason, (newSeason) => {
      selectedSeason.value = newSeason;
    });

    // Load saved view mode
    onMounted(() => {
      const savedViewMode = localStorage.getItem('episodeViewMode') as 'grid' | 'list';
      if (savedViewMode) {
        viewMode.value = savedViewMode;
      }
      
      document.addEventListener('keydown', handleKeyPress);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyPress);
    });

    return {
      selectedSeason,
      viewMode,
      showShortcuts,
      canGoPrevious,
      canGoNext,
      onSeasonChange,
      selectEpisode,
      previousEpisode,
      nextEpisode,
      toggleViewMode,
      formatDate,
      truncateText
    };
  }
});
</script>

<style lang="scss" scoped>
.episode-navigation {
  background: linear-gradient(135deg, rgba(31, 33, 48, 0.95) 0%, rgba(44, 47, 69, 0.9) 100%);
  border-radius: 16px;
  margin: 1.5rem 2rem;
  padding: 2rem;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: slideInUp 0.6s ease-out;

  .nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .season-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      h3 {
        display: flex;
        align-items: center;
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #fff;

        svg {
          margin-right: 0.75rem;
          width: 24px;
          height: 24px;
          color: #ff5252;
        }
      }

      .episode-count {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.375rem 0.875rem;
        border-radius: 20px;
        font-size: 0.875rem;
        color: #b0b0b0;
      }
    }

    .episode-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .control-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 50%;
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;

        &:hover:not(:disabled) {
          background: rgba(255, 82, 82, 0.2);
          transform: scale(1.05);
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        svg {
          width: 18px;
          height: 18px;
        }
      }

      .current-episode {
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #ff5252 0%, #ff7979 100%);
        border-radius: 20px;
        font-weight: 600;
        color: #fff;
        font-size: 0.875rem;
      }
    }
  }

  .season-selection {
    margin-bottom: 2rem;

    label {
      display: block;
      margin-bottom: 0.75rem;
      font-weight: 500;
      color: #e1e1e1;
      font-size: 1rem;
    }

    .season-dropdown {
      position: relative;

      select {
        width: 100%;
        max-width: 400px;
        padding: 0.875rem 3rem 0.875rem 1rem;
        background: rgba(31, 33, 48, 0.8);
        color: #fff;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        font-size: 1rem;
        cursor: pointer;
        appearance: none;
        transition: all 0.3s;

        &:focus {
          outline: none;
          border-color: #ff5252;
          box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.1);
        }

        option {
          background: #1f2130;
          color: #fff;
          padding: 0.5rem;
        }
      }

      .dropdown-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        color: #9ca3af;
        pointer-events: none;
      }
    }
  }

  .episodes-section {
    .episodes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h4 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #fff;
      }

      .view-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 8px;
        color: #e1e1e1;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }

    .episodes-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #b0b0b0;

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top: 3px solid #ff5252;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }
    }

    .episodes-container {
      &.grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;

        .episode-card {
          flex-direction: column;
          text-align: center;
          padding: 1.25rem 1rem;
          min-height: 180px;
          justify-content: space-between;

          .episode-number {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            width: 60px;
            height: 60px;
            align-self: center;
          }

          .episode-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .episode-title {
              font-size: 0.925rem;
              margin-bottom: 0.75rem;
              font-weight: 600;
              line-height: 1.3;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .episode-meta {
              justify-content: center;
              flex-wrap: wrap;
              gap: 0.5rem;
              font-size: 0.8rem;
            }

            .episode-overview {
              display: none;
            }
          }

          .episode-actions {
            margin-top: 1rem;

            .playing-indicator {
              font-size: 0.8rem;
              padding: 0.375rem 0.75rem;
            }

            .play-btn {
              width: 36px;
              height: 36px;

              svg {
                width: 16px;
                height: 16px;
              }
            }
          }
        }
      }

      &.list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .episode-card {
          padding: 1.25rem;

          .episode-content {
            flex: 1;
            margin: 0 1rem;
          }
        }
      }
    }

    .episode-card {
      display: flex;
      align-items: center;
      background: rgba(31, 33, 48, 0.6);
      border: 2px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.02) 50%, transparent 70%);
        transform: translateX(-100%);
        transition: transform 0.6s;
      }

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 82, 82, 0.3);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);

        &::before {
          transform: translateX(100%);
        }
      }

      &.active {
        background: linear-gradient(135deg, rgba(255, 82, 82, 0.15) 0%, rgba(255, 82, 82, 0.08) 100%);
        border-color: #ff5252;
        box-shadow: 0 4px 20px rgba(255, 82, 82, 0.2);

        .episode-number {
          background: linear-gradient(135deg, #ff5252 0%, #ff7979 100%);
          color: #fff;
        }
      }

      .episode-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        font-weight: 700;
        font-size: 1.125rem;
        color: #fff;
        flex-shrink: 0;
        transition: all 0.3s;
      }

      .episode-content {
        .episode-title {
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .episode-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
          color: #9ca3af;
          font-size: 0.875rem;

          .air-date,
          .runtime,
          .rating {
            display: flex;
            align-items: center;
            gap: 0.25rem;

            svg {
              width: 12px;
              height: 12px;
            }
          }
        }

        .episode-overview {
          color: #b0b0b0;
          line-height: 1.5;
          font-size: 0.875rem;
          margin: 0;
        }
      }

      .episode-actions {
        .playing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 82, 82, 0.15);
          color: #ff5252;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;

          svg {
            width: 16px;
            height: 16px;
          }
        }

        .play-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 82, 82, 0.2);
            transform: scale(1.1);
          }

          svg {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
  }

  .shortcuts-hint {
    margin-top: 1.5rem;
    padding: 1rem;
    background: rgba(74, 144, 226, 0.1);
    border: 1px solid rgba(74, 144, 226, 0.2);
    border-radius: 8px;

    p {
      margin: 0;
      font-size: 0.875rem;
      color: #94a3b8;
      line-height: 1.5;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Force 2-column grid on mobile */
@media (max-width: 768px) {
  .episode-navigation .episodes-container.grid {
    grid-template-columns: 1fr 1fr !important;
    grid-auto-columns: 1fr !important;
  }
}

@media (max-width: 768px) {
  .episode-navigation {
    margin: 1rem;
    padding: 1.5rem;

    .nav-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;

      .season-info {
        h3 {
          font-size: 1.25rem;
        }
      }

      .episode-controls {
        align-self: center;
      }
    }

    .episodes-container {
      &.grid {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 0.75rem !important;
        max-width: 100% !important;

        .episode-card {
          display: block !important;
          width: 100% !important;
          max-width: none !important;
          flex: none !important;
          padding: 1rem 0.75rem;
          min-height: 140px;

          .episode-number {
            width: 40px;
            height: 40px;
            font-size: 1.125rem;
            margin-bottom: 0.75rem;
          }

          .episode-content {
            .episode-title {
              font-size: 0.8rem;
              line-height: 1.2;
              margin-bottom: 0.5rem;
            }

            .episode-meta {
              font-size: 0.7rem;
              gap: 0.375rem;
            }
          }

          .episode-actions {
            margin-top: 0.75rem;

            .playing-indicator {
              font-size: 0.7rem;
              padding: 0.25rem 0.5rem;
            }

            .play-btn {
              width: 28px;
              height: 28px;

              svg {
                width: 12px;
                height: 12px;
              }
            }
          }
        }
      }

      &.list {
        .episode-card {
          padding: 1rem;

          .episode-content {
            margin: 0 0.75rem;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .episode-navigation {
    .episodes-container.grid {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 0.5rem !important;

      .episode-card {
        display: block !important;
        width: 100% !important;
        min-height: 120px;
        padding: 0.75rem 0.5rem;

        .episode-number {
          width: 36px;
          height: 36px;
          font-size: 1rem;
        }

        .episode-content .episode-title {
          font-size: 0.75rem;
          -webkit-line-clamp: 2;
          line-clamp: 2;
        }

        .episode-actions .play-btn {
          width: 24px;
          height: 24px;

          svg {
            width: 10px;
            height: 10px;
          }
        }
      }
    }
  }
}
</style>
