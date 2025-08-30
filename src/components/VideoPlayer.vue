<template>
  <div class="video-container">
    <iframe
      v-if="embedUrl"
      ref="playerIframe"
      :src="embedUrl"
      allow="fullscreen"
      allowfullscreen
      frameborder="0"
    ></iframe>
    <div class="loading-placeholder" v-else>
      <div class="spinner"></div>
      <p>Loading video player...</p>
    </div>
    
    <!-- Watch Party Status Overlay -->
    <div v-if="isWatchPartyActive" class="watch-party-overlay">
      <div class="sync-indicator" :class="{ syncing: isSyncing }">
        <div class="pulse-dot"></div>
        <span>{{ memberCount }} {{ memberCount === 1 ? 'viewer' : 'viewers' }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';

interface PlayerEvent {
  type: 'play' | 'pause' | 'seek' | 'loaded' | 'error' | 'timeupdate';
  currentTime?: number;
  duration?: number;
  data?: any;
}

export default defineComponent({
  name: 'VideoPlayer',
  props: {
    embedUrl: {
      type: String,
      default: ''
    },
    enableWatchParty: {
      type: Boolean,
      default: false
    },
    memberCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['player-event', 'sync-request'],
  setup(props, { emit }) {
    const playerIframe = ref<HTMLIFrameElement | null>(null);
    const isSyncing = ref(false);
    const lastEventTime = ref(0);
    const eventDebounceTime = 500; // 500ms debounce to prevent spam
    
    const isWatchPartyActive = ref(false);
    
    // Handle iframe messages from the video player
    const handlePlayerMessage = (event: MessageEvent) => {
      // Only process messages from our iframe
      if (playerIframe.value && event.source !== playerIframe.value.contentWindow) {
        return;
      }
      
      console.log('VideoPlayer received message:', event);
      
      let eventData: PlayerEvent | null = null;
      
      try {
        // Handle both string and object messages
        if (typeof event.data === 'string') {
          try {
            eventData = JSON.parse(event.data);
          } catch {
            // If parsing fails, treat as raw string event
            eventData = { type: event.data as any };
          }
        } else if (typeof event.data === 'object' && event.data !== null) {
          eventData = event.data as PlayerEvent;
        }
        
        if (!eventData) return;
        
        console.log('Processed event data:', eventData);
        
        // Emit to parent component
        emit('player-event', eventData);
        
        // Handle watch party sync if enabled
        if (props.enableWatchParty && shouldSyncEvent(eventData)) {
          const now = Date.now();
          
          // Debounce rapid events
          if (now - lastEventTime.value < eventDebounceTime) {
            return;
          }
          
          lastEventTime.value = now;
          
          console.log('Emitting sync request for event:', eventData.type);
          emit('sync-request', {
            eventType: eventData.type,
            eventData: {
              currentTime: eventData.currentTime || 0,
              duration: eventData.duration,
              timestamp: now,
              ...eventData.data
            }
          });
        }
        
      } catch (error) {
        console.error('Error processing player message:', error);
      }
    };
    
    // Determine if an event should trigger sync
    const shouldSyncEvent = (eventData: PlayerEvent): boolean => {
      const syncEvents = ['play', 'pause', 'seek'];
      return syncEvents.includes(eventData.type);
    };
    
    // Handle sync commands from watch party
    const handleSyncCommand = (command: { type: string; data: any }) => {
      if (!playerIframe.value?.contentWindow) {
        console.warn('Cannot send sync command - iframe not ready');
        return;
      }
      
      isSyncing.value = true;
      
      console.log('Sending sync command to player:', command);
      
      try {
        // Send command to iframe
        playerIframe.value.contentWindow.postMessage(
          JSON.stringify(command),
          '*'
        );
        
        // Clear syncing indicator after delay
        setTimeout(() => {
          isSyncing.value = false;
        }, 1000);
        
      } catch (error) {
        console.error('Error sending sync command:', error);
        isSyncing.value = false;
      }
    };
    
    // Watch for member count changes to show/hide overlay
    watch(() => props.memberCount, (newCount) => {
      isWatchPartyActive.value = newCount > 1;
    });
    
    // Watch for watch party enable/disable
    watch(() => props.enableWatchParty, (enabled) => {
      if (enabled && props.memberCount > 1) {
        isWatchPartyActive.value = true;
      } else if (!enabled) {
        isWatchPartyActive.value = false;
      }
    });
    
    onMounted(() => {
      // Add message listener
      window.addEventListener('message', handlePlayerMessage);
      
      // Expose sync handler for parent component
      (window as any).syncVideoPlayer = handleSyncCommand;
      
      // Set initial watch party state
      isWatchPartyActive.value = props.enableWatchParty && props.memberCount > 1;
    });
    
    onUnmounted(() => {
      // Remove message listener
      window.removeEventListener('message', handlePlayerMessage);
      
      // Cleanup global handler
      delete (window as any).syncVideoPlayer;
    });
    
    return {
      playerIframe,
      isSyncing,
      isWatchPartyActive,
      handleSyncCommand
    };
  }
});
</script>

<style lang="scss" scoped>
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

  .watch-party-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    pointer-events: none;

    .sync-indicator {
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #fff;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;

      &.syncing {
        background: rgba(255, 82, 82, 0.2);
        border-color: rgba(255, 82, 82, 0.3);
        
        .pulse-dot {
          background: #ff5252;
          animation: syncPulse 1s ease-in-out infinite;
        }
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #4caf50;
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      }

      span {
        white-space: nowrap;
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

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.8);
    }
  }

  @keyframes syncPulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2);
    }
  }
}

@media (max-width: 768px) {
  .video-container {
    .watch-party-overlay {
      top: 0.5rem;
      right: 0.5rem;
      
      .sync-indicator {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        
        .pulse-dot {
          width: 6px;
          height: 6px;
        }
      }
    }
  }
}
</style>