<template>
  <div class="video-container">
    <!-- Video Player -->
    <div class="player-wrapper" :class="{ 'has-error': hasError }">
      <iframe
        v-if="embedUrl && !hasError"
        ref="playerIframe"
        :src="embedUrl"
        allow="fullscreen; encrypted-media; picture-in-picture"
        allowfullscreen
        frameborder="0"
        :title="playerTitle"
        @load="onPlayerLoad"
        @error="onPlayerError"
      ></iframe>

      <!-- Loading State -->
      <div v-if="isLoading && !hasError" class="loading-state">
        <div class="skeleton-player">
          <div class="skeleton-video"></div>
          <div class="skeleton-controls">
            <div class="skeleton-control skeleton-play"></div>
            <div class="skeleton-control skeleton-progress"></div>
            <div class="skeleton-control skeleton-time"></div>
            <div class="skeleton-control skeleton-volume"></div>
            <div class="skeleton-control skeleton-fullscreen"></div>
          </div>
        </div>
        <div class="loading-overlay">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">{{ loadingText }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="hasError" class="error-state">
        <div class="error-icon">
          <AlertTriangleIcon />
        </div>
        <h3 class="error-title">Video Unavailable</h3>
        <p class="error-message">{{ errorMessage }}</p>
        <button class="retry-button" @click="retryLoad">
          <RefreshIcon />
          Try Again
        </button>
      </div>

      <!-- Player Overlay (for additional controls) -->
      <div v-if="!isLoading && !hasError" class="player-overlay">
        <div class="overlay-controls">
          <button 
            class="fullscreen-button" 
            @click="toggleFullscreen"
            :title="'Fullscreen'"
          >
            <FullscreenIcon />
          </button>
        </div>
      </div>
    </div>

    <!-- Player Info -->
    <div v-if="showInfo" class="player-info">
      <div class="player-stats">
        <span class="quality-indicator">{{ quality || 'Auto' }}</span>
        <span class="status-indicator" :class="statusClass">{{ statusText }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import AlertTriangleIcon from './svg/outline/alert-triangle.vue';
import PlayIcon from './svg/outline/play.vue';
import ZoomInIcon from './svg/outline/zoom-in.vue';

export default defineComponent({
  name: 'VideoPlayer',
  components: {
    AlertTriangleIcon,
    PlayIcon,
    RefreshIcon: PlayIcon, // Using play icon as refresh substitute
    FullscreenIcon: ZoomInIcon, // Using zoom-in icon as fullscreen substitute
  },
  props: {
    embedUrl: {
      type: String,
      default: ''
    },
    playerTitle: {
      type: String,
      default: 'Video Player'
    },
    quality: {
      type: String,
      default: 'Auto'
    },
    showInfo: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const playerIframe = ref<HTMLIFrameElement | null>(null);
    const isLoading = ref(true);
    const hasError = ref(false);
    const errorMessage = ref('');
    
    const loadingMessages = [
      'Loading video player...',
      'Preparing video stream...',
      'Initializing player...',
      'Almost ready...'
    ];
    
    const loadingText = ref(loadingMessages[0]);
    let loadingInterval: NodeJS.Timeout | null = null;
    let loadingMessageIndex = 0;

    const statusText = computed(() => {
      if (hasError.value) return 'Error';
      if (isLoading.value) return 'Loading';
      return 'Ready';
    });

    const statusClass = computed(() => {
      if (hasError.value) return 'error';
      if (isLoading.value) return 'loading';
      return 'ready';
    });

    // Cycle through loading messages
    const startLoadingAnimation = () => {
      loadingInterval = setInterval(() => {
        loadingMessageIndex = (loadingMessageIndex + 1) % loadingMessages.length;
        loadingText.value = loadingMessages[loadingMessageIndex];
      }, 2000);
    };

    const stopLoadingAnimation = () => {
      if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
      }
    };

    const onPlayerLoad = () => {
      setTimeout(() => {
        isLoading.value = false;
        hasError.value = false;
        stopLoadingAnimation();
      }, 1000); // Small delay to show the loading state
    };

    const onPlayerError = () => {
      isLoading.value = false;
      hasError.value = true;
      errorMessage.value = 'Failed to load video. Please check your connection or try again later.';
      stopLoadingAnimation();
    };

    const retryLoad = () => {
      hasError.value = false;
      errorMessage.value = '';
      isLoading.value = true;
      startLoadingAnimation();
      
      // Force iframe reload
      if (playerIframe.value) {
        const currentSrc = playerIframe.value.src;
        playerIframe.value.src = '';
        setTimeout(() => {
          if (playerIframe.value) {
            playerIframe.value.src = currentSrc;
          }
        }, 100);
      }
    };

    const toggleFullscreen = () => {
      const container = document.querySelector('.video-container');
      if (!container) return;

      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if ((container as any).msRequestFullscreen) {
          (container as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    };

    // Watch for embedUrl changes
    watch(() => props.embedUrl, (newUrl, oldUrl) => {
      if (newUrl !== oldUrl && newUrl) {
        isLoading.value = true;
        hasError.value = false;
        startLoadingAnimation();
      }
    });

    // Initialize loading animation when component mounts
    onMounted(() => {
      if (props.embedUrl) {
        startLoadingAnimation();
        // Set a fallback timeout for loading
        setTimeout(() => {
          if (isLoading.value) {
            onPlayerLoad();
          }
        }, 15000); // 15 second timeout
      } else {
        isLoading.value = false;
      }
    });

    return {
      playerIframe,
      isLoading,
      hasError,
      errorMessage,
      loadingText,
      statusText,
      statusClass,
      onPlayerLoad,
      onPlayerError,
      retryLoad,
      toggleFullscreen,
    };
  },
});
</script>

<style lang="scss" scoped>
.video-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.player-wrapper {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; // 16:9 aspect ratio
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  
  &.has-error {
    background: linear-gradient(135deg, #2a1a1a 0%, #3d2d2d 100%);
  }

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
  }
}

// Loading State
.loading-state {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.skeleton-player {
  width: 100%;
  height: 100%;
  position: relative;
  
  .skeleton-video {
    width: 100%;
    height: calc(100% - 60px);
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite ease-in-out;
    border-radius: 8px;
  }
  
  .skeleton-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 1rem;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    
    .skeleton-control {
      background: linear-gradient(90deg, #3a3a3a 25%, #4a4a4a 50%, #3a3a3a 75%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite ease-in-out;
      border-radius: 4px;
      
      &.skeleton-play {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      
      &.skeleton-progress {
        flex: 1;
        height: 6px;
        border-radius: 3px;
      }
      
      &.skeleton-time {
        width: 60px;
        height: 20px;
      }
      
      &.skeleton-volume {
        width: 30px;
        height: 30px;
      }
      
      &.skeleton-fullscreen {
        width: 30px;
        height: 30px;
      }
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;

  .spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1.5s linear infinite;

    &:nth-child(1) {
      border-top-color: #ff5252;
      animation-delay: 0s;
    }

    &:nth-child(2) {
      border-right-color: #ff7979;
      animation-delay: 0.3s;
    }

    &:nth-child(3) {
      border-bottom-color: #fdcb6e;
      animation-delay: 0.6s;
    }
  }
}

.loading-text {
  color: #e1e1e1;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  animation: pulse 2s infinite ease-in-out;
}

// Error State
.error-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 2rem;
  max-width: 400px;

  .error-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #ff5252 0%, #ff7979 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 8px 24px rgba(255, 82, 82, 0.3);

    svg {
      width: 40px;
      height: 40px;
      color: #fff;
    }
  }

  .error-title {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
  }

  .error-message {
    color: #b0b0b0;
    font-size: 1rem;
    line-height: 1.5;
    margin: 0 0 2rem 0;
  }

  .retry-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #ff5252 0%, #ff7979 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 82, 82, 0.4);
    }

    &:active {
      transform: translateY(0);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
}

// Player Overlay
.player-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .overlay-controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
    pointer-events: auto;
    
    .fullscreen-button {
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      opacity: 0;
      animation: fadeInDelay 0.5s ease 2s forwards;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
}

// Player Info
.player-info {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(31, 33, 48, 0.95) 0%, rgba(44, 47, 69, 0.95) 100%);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  .player-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;

    .quality-indicator {
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      color: #fff;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-indicator {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.loading {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #fff;
      }

      &.ready {
        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        color: #fff;
      }

      &.error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: #fff;
      }
    }
  }
}

// Animations
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes fadeInDelay {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .player-overlay .overlay-controls {
    top: 0.5rem;
    right: 0.5rem;
    
    .fullscreen-button {
      width: 36px;
      height: 36px;
      
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
  
  .error-state {
    padding: 1.5rem;
    
    .error-icon {
      width: 64px;
      height: 64px;
      
      svg {
        width: 32px;
        height: 32px;
      }
    }
    
    .error-title {
      font-size: 1.25rem;
    }
  }
  
  .loading-spinner {
    width: 60px;
    height: 60px;
  }
  
  .loading-text {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .video-container {
    border-radius: 8px;
  }
  
  .skeleton-player .skeleton-controls {
    height: 50px;
    padding: 0 0.75rem;
    gap: 0.75rem;
    
    .skeleton-control.skeleton-play {
      width: 32px;
      height: 32px;
    }
    
    .skeleton-control.skeleton-time {
      width: 50px;
    }
  }
}

// Dark mode enhancements
@media (prefers-color-scheme: dark) {
  .video-container {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  }
}
</style>