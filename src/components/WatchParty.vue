<template>
  <div>
    <div class="watch-party-button" @click="toggleWatchPartyModal" :class="{ disabled: isLoading }">
      <WatchPartyIcon stroke="currentColor" />
      <span>Watch Party</span>
    </div>

    <!-- Watch Party Modal -->
    <div class="watch-party-modal" v-if="showModal" @click.self="toggleWatchPartyModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Start Watch Party</h2>
          <button class="close-button" @click="toggleWatchPartyModal">
            <X stroke="currentColor" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Checking availability...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <Info stroke="currentColor" width="48" height="48" />
            <p>{{ error }}</p>
          </div>

          <div v-else-if="response" class="success-state">
            <div class="movie-confirmation">
              <CheckCircle stroke="currentColor" width="48" height="48" />
              <h3>{{ response.title }}</h3>
            </div>

            <div class="quality-selection">
              <label for="quality">Select Quality:</label>
              <select id="quality" v-model="selectedQuality">
                <option v-for="quality in response.available_qualities" :key="quality" :value="quality">
                  {{ quality }}
                </option>
              </select>
            </div>

            <div class="subtitle-info" v-if="response.has_subtitles">
              <p>
                <Subtitle stroke="currentColor" width="18" height="18" />
                Subtitles available ({{ response.subtitles.length }} languages)
              </p>

              <div class="subtitle-download">
                <label for="subtitle-select">Download Subtitle:</label>
                <div class="subtitle-select-container">
                  <select id="subtitle-select" v-model="selectedSubtitle">
                    <option value="">Select language</option>
                    <option v-for="subtitle in response.subtitles" :key="subtitle.file" :value="subtitle.file">
                      {{ subtitle.label }}
                    </option>
                  </select>
                  <a v-if="selectedSubtitle" :href="selectedSubtitle" download class="download-button subtitle">
                    <Download stroke="currentColor" width="18" height="18" />
                    Download
                  </a>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <button class="start-party-button" @click="startWatchParty">
                <PlayCircle stroke="currentColor" />
                Start Watch Party
              </button>

              <a v-if="currentStreamUrl" :href="currentStreamUrl" download class="download-button video">
                <Download stroke="currentColor" />
                Download Video
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import { WatchPartyResponse } from '../composables/useWatchParty';
import WatchPartyIcon from './svg/outline/watch-party.vue';
import X from './svg/outline/x.vue';
import Info from './svg/outline/info.vue';
import CheckCircle from './svg/outline/check-circle.vue';
import Subtitle from './svg/outline/subtitle.vue';
import Download from './svg/outline/download.vue';
import PlayCircle from './svg/outline/play-circle.vue';

export default defineComponent({
  name: 'WatchParty',
  components: {
    WatchPartyIcon,
    X,
    Info,
    CheckCircle,
    Subtitle,
    Download,
    PlayCircle
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: [String, null] as PropType<string | null>,
      default: null
    },
    response: {
      type: [Object, null] as PropType<WatchPartyResponse | null>,
      default: null
    },
    showModal: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-modal', 'start-party', 'quality-change'],
  setup(props, { emit }) {
    const selectedQuality = ref<string>('');
    const selectedSubtitle = ref<string>('');

    watch(() => props.response, (newResponse) => {
      if (newResponse?.available_qualities && newResponse.available_qualities.length > 0) {
        selectedQuality.value = newResponse.available_qualities[0];
        emit('quality-change', selectedQuality.value);
      }
    });

    watch(() => selectedQuality.value, (newQuality) => {
      emit('quality-change', newQuality);
    });

    const currentStreamUrl = computed(() => {
      if (!props.response?.streams || !selectedQuality.value) {
        return null;
      }
      return props.response.streams[selectedQuality.value] || null;
    });

    const toggleWatchPartyModal = () => {
      emit('toggle-modal');
    };

    const startWatchParty = () => {
      emit('start-party');
    };

    return {
      selectedQuality,
      selectedSubtitle,
      currentStreamUrl,
      toggleWatchPartyModal,
      startWatchParty
    };
  }
});
</script>

<style lang="scss" scoped>
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
            text-align: center;
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
            margin-bottom: 1rem;

            svg {
              margin-right: 0.5rem;
            }
          }

          .subtitle-download {
            margin-top: 0.75rem;

            label {
              display: block;
              margin-bottom: 0.5rem;
              color: #e1e1e1;
              font-weight: 500;
            }

            .subtitle-select-container {
              display: flex;
              gap: 0.5rem;

              a {
                background-color: #3a3c4e;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                color: #fff;
                font-size: 0.9rem;
                text-decoration: none;
                display: flex;
                align-items: center;
                transition: all 0.2s;

                &:hover {
                  background-color: #4a4c5e;
                }

                svg {
                  margin-right: 0.5rem;
                }
              }

              select {
                flex: 1;
                padding: 0.5rem;
                border-radius: 6px;
                background-color: #252632;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff;
                font-size: 0.9rem;
                outline: none;

                &:focus {
                  border-color: #ff5252;
                }

                option {
                  background-color: #252632;
                }
              }
            }
          }
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;

          .start-party-button,
          .download-button {
            width: 100%;
            padding: 0.75rem;
            border-radius: 6px;
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.2s;
            text-decoration: none;

            svg {
              margin-right: 0.5rem;
            }
          }

          .start-party-button {
            background-color: #ff5252;
            border: none;

            &:hover {
              background-color: #ff3333;
              transform: translateY(-2px);
            }
          }

          .download-button {
            background-color: #3a3c4e;
            border: none;

            &:hover {
              background-color: #4a4c5e;
            }

            &.subtitle {
              padding: 0.5rem;
              font-size: 0.9rem;
            }
          }
        }
      }
    }
  }
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #ff5252;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
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
  .watch-party-button span {
    display: none;
  }
}
</style>