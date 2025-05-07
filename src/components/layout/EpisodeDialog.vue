<template>
  <div class="episode-dialog" v-if="showDialog">
    <div class="episode-dialog-overlay" @click="closeDialog"></div>
    <div class="episode-dialog-content">
      <div class="episode-dialog-inner">
        <div class="episode-dialog-header">
          <h2>Season {{ seasonNumber }}</h2>
          <button class="episode-dialog-close" @click="closeDialog" aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="episode-dialog-body">
          <div class="episode-poster">
            <img :src="useWebImage(poster)" alt="Season Poster" loading="lazy" />
            <div class="season-info">
              <span class="info-badge">{{ episodes.length }} Episodes</span>
            </div>
          </div>
          <div class="episodes-container">
            <h3>Episodes</h3>
            <div class="episodes-list" ref="episodesList">
              <div v-for="episode in episodes" :key="episode.id" class="episode-item"
                :class="{ highlighted: highlightedEpisodeId === episode.id }"
                :ref="el => setHighlightedElement(el, episode.id)">
                <div class="episode-details">
                  <span class="episode-number">{{ episode.episode_number }}</span>
                  <span class="episode-name">{{ episode.name }}</span>
                </div>
                <button class="watch-button" @click="watchEpisode(episode)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Watch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted, watch, ref, nextTick, ComponentPublicInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { Episode } from '../../composables/useTvShows';
import { useWebImage } from '../../utils/useWebImage';

export default defineComponent({
  name: 'EpisodeDialog',
  props: {
    episodes: {
      type: Array as PropType<Episode[]>,
      required: true,
    },
    showDialog: {
      type: Boolean,
      required: true,
    },
    seasonNumber: {
      type: Number,
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    showId: {
      type: [String, Number],
      required: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();

    const episodesList = ref<HTMLElement | null>(null);
    const highlightedElement = ref<HTMLElement | null>(null);
    const highlightedEpisodeId = ref<number | null>(null);

    function setHighlightedElement(
      el: Element | ComponentPublicInstance | null,
      episodeId: number
    ) {
      if (episodeId === highlightedEpisodeId.value && el instanceof HTMLElement) {
        highlightedElement.value = el;
      }
    }

    const scrollToEpisode = () => {
      if (highlightedElement.value) {
        nextTick(() => {
          highlightedElement.value!.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    };

    const findEpisodeIdByNumber = (episodeNumber: number): number | null => {
      const ep = props.episodes.find(e => e.episode_number === episodeNumber);
      return ep ? ep.id : null;
    };

    onMounted(() => {
      const seasonParam = route.query.season;
      const episodeParam = route.query.episode;

      if (seasonParam && Number(seasonParam) === props.seasonNumber) {
        emit('update:showDialog', true);

        if (episodeParam && props.episodes.some(ep => ep.episode_number === Number(episodeParam))) {
          highlightedEpisodeId.value = findEpisodeIdByNumber(Number(episodeParam));
          setTimeout(scrollToEpisode, 100);
        }
      }
    });

    watch(() => props.showDialog, newVal => {
      if (newVal) {
        router.push({
          query: {
            ...route.query,
            season: props.seasonNumber.toString(),
          },
        });

        const episodeParam = route.query.episode;
        if (episodeParam) {
          highlightedEpisodeId.value = findEpisodeIdByNumber(Number(episodeParam));
          setTimeout(scrollToEpisode, 100);
        }
      } else {
        const q = { ...route.query };
        delete q.season;
        delete q.episode;
        router.push({ query: q });
      }
    });

    watch(
      () => props.episodes,
      () => {
        const episodeParam = route.query.episode;
        if (episodeParam && props.episodes.length) {
          highlightedEpisodeId.value = findEpisodeIdByNumber(Number(episodeParam));
          setTimeout(scrollToEpisode, 100);
        }
      },
      { deep: true }
    );

    const closeDialog = () => {
      emit('update:showDialog', false);
    };

    const watchEpisode = (episode: Episode) => {
      router.push({
        query: {
          ...route.query,
          season: props.seasonNumber.toString(),
          episode: episode.episode_number.toString(),
        },
      });

      highlightedEpisodeId.value = episode.id;
      emit('watch-episode', {
        showId: props.showId,
        seasonNumber: props.seasonNumber,
        episodeNumber: episode.episode_number,
        episodeId: episode.id,
      });
    };

    return {
      episodesList,
      highlightedElement,
      highlightedEpisodeId,
      setHighlightedElement,
      closeDialog,
      watchEpisode,
      useWebImage,
    };
  },
});
</script>

<style scoped lang="scss">
.episode-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;

  .episode-dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(4, 13, 20, 0.85);
    backdrop-filter: blur(8px);
    cursor: pointer;
  }

  .episode-dialog-content {
    background-color: #040d13;
    border: 2px solid #0a2333;
    color: #fff;
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 101;
    width: 90%;
    max-width: 900px;
    max-height: 85vh;
    pointer-events: auto;
    animation: dialogFadeIn 0.3s ease-out;
    display: flex;
    flex-direction: column;

    @keyframes dialogFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .episode-dialog-inner {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;

      .episode-dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        h2 {
          font-size: 1.75rem;
          font-weight: 600;
          color: #f1b722;
          margin: 0;
        }

        .episode-dialog-close {
          background-color: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background-color: rgba(255, 255, 255, 0.2);
            transform: rotate(90deg);
          }
        }
      }

      .episode-dialog-body {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 1.5rem;
        overflow: hidden;
        flex: 1;
        height: calc(100% - 5rem);

        @media screen and (max-width: 768px) {
          grid-template-columns: 1fr 2fr;
        }

        @media screen and (max-width: 640px) {
          grid-template-columns: 1fr;
        }

        .episode-poster {
          position: relative;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          height: 40vh;
          max-height: 375px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .season-info {
            position: absolute;
            bottom: 1rem;
            left: 1rem;

            .info-badge {
              background-color: rgba(4, 13, 20, 0.8);
              color: #f1b722;
              padding: 0.5rem 1rem;
              border-radius: 2rem;
              backdrop-filter: blur(4px);
              font-size: 0.875rem;
              font-weight: 500;
            }
          }

          @media screen and (max-width: 768px) {
            height: 200px;
          }
        }

        .episodes-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;

          h3 {
            font-size: 1.25rem;
            font-weight: 500;
            margin-bottom: 1rem;
            color: rgba(255, 255, 255, 0.9);
          }

          .episodes-list {
            overflow-y: auto;
            padding-right: 0.5rem;
            max-height: calc(100% - 2.5rem);
            height: 100%;

            &::-webkit-scrollbar {
              width: 0.35rem;
            }

            @media screen and (max-width: 768px) {
              max-height: 300px;
            }

            @media screen and (max-width: 640px) {
              max-height: 200px;
            }

            &::-webkit-scrollbar {
              width: 0.35rem;
            }

            &::-webkit-scrollbar-track {
              background-color: rgba(8, 28, 40, 0.3);
              border-radius: 0.5rem;
            }

            &::-webkit-scrollbar-thumb {
              background-color: #f1b722;
              border-radius: 0.5rem;
            }

            .episode-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.875rem 1rem;
              background-color: rgba(8, 28, 40, 0.4);
              border-left: 3px solid #f1b722;
              border-radius: 0.5rem;
              margin-bottom: 0.75rem;
              transition: all 0.2s ease;

              &.highlighted {
                background-color: rgba(241, 183, 34, 0.2);
              }

              &:hover {
                background-color: rgba(8, 28, 40, 0.7);
                transform: translateX(2px);
              }

              .episode-details {
                display: flex;
                align-items: center;
                gap: 0.75rem;

                .episode-number {
                  background-color: #f1b722;
                  color: #040d13;
                  width: 28px;
                  height: 28px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 50%;
                  font-weight: 600;
                  font-size: 0.875rem;
                }

                .episode-name {
                  font-weight: 500;
                  white-space: normal;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
              }

              .watch-button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background-color: #f1b722;
                color: #040d13;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                  background-color: #fff;
                  transform: scale(1.05);
                }
              }
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: 640px) {
    .episode-dialog-content {
      width: 95%;
      max-height: 90vh;

      .episode-dialog-inner {
        padding: 1rem;

        .episode-dialog-header h2 {
          font-size: 1.5rem;
        }

        .episode-dialog-body {
          gap: 1rem;

          .episodes-container .episode-item {
            padding: 0.75rem;

            .episode-details .episode-name {
              font-size: 0.875rem;
            }

            .watch-button {
              padding: 0.4rem 0.75rem;
              font-size: 0.75rem;
            }
          }
        }
      }
    }
  }
}
</style>
