<template>
  <div class="video-container">
    <!-- Overlay to prevent unwanted clicks -->
    <div 
      class="click-shield" 
      v-if="showClickShield"
      @click="handleShieldClick"
      @touchstart="handleShieldClick"
    >
      <div class="shield-message">
        <p>Click protection enabled</p>
        <button @click.stop="toggleClickShield" class="toggle-btn">
          {{ showClickShield ? 'Disable Protection' : 'Enable Protection' }}
        </button>
      </div>
    </div>

    <iframe 
      v-if="embedUrl" 
      :src="sanitizedUrl" 
      allow="fullscreen" 
      allowfullscreen 
      frameborder="0" 
      class="ad-free-iframe"
      ref="videoIframe"
      :sandbox="sandboxAttributes"
      @load="handleIframeLoad"
      referrerpolicy="no-referrer"
    ></iframe>
    
    <div class="loading-placeholder" v-else>
      <div class="spinner"></div>
      <p>Loading video player...</p>
    </div>

    <!-- Controls overlay -->
    <div class="controls-overlay">
      <button @click="toggleClickShield" class="control-btn">
        <span v-if="showClickShield">🛡️</span>
        <span v-else>🔓</span>
      </button>
      <button @click="openInNewWindow" class="control-btn" title="Open in new window">
        🔗
      </button>
      <button @click="refreshIframe" class="control-btn" title="Refresh">
        🔄
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VideoPlayer',
  props: {
    embedUrl: {
      type: String,
      default: ''
    },
    enableClickProtection: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showClickShield: this.enableClickProtection,
      isIframeLoaded: false,
      clickAttempts: 0
    };
  },
  computed: {
    sanitizedUrl(): string {
      if (!this.embedUrl) return '';
      
      try {
        const url = new URL(this.embedUrl);
        
        // Add parameters to disable autoplay and other unwanted behaviors
        url.searchParams.set('autoplay', '0');
        url.searchParams.set('rel', '0'); // YouTube specific
        url.searchParams.set('modestbranding', '1'); // YouTube specific
        url.searchParams.set('controls', '1');
        
        // Remove potentially harmful parameters
        const harmfulParams = ['redirect', 'popup', 'ad', 'sponsor'];
        harmfulParams.forEach(param => url.searchParams.delete(param));
        
        return url.toString();
      } catch (e) {
        console.warn('Invalid URL provided:', this.embedUrl);
        return this.embedUrl;
      }
    },
    sandboxAttributes(): string {
      // Restrictive sandbox that still allows video playback
      return 'allow-scripts allow-same-origin allow-presentation allow-fullscreen';
    }
  },
  methods: {
    handleShieldClick(event: Event) {
      event.preventDefault();
      event.stopPropagation();
      
      this.clickAttempts++;
      console.log(`Blocked click attempt #${this.clickAttempts}`);
      
      // Show a brief feedback
      this.showClickFeedback();
    },

    showClickFeedback() {
      const shield = document.querySelector('.click-shield') as HTMLElement;
      if (shield) {
        shield.style.backgroundColor = 'rgba(255, 82, 82, 0.3)';
        setTimeout(() => {
          shield.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        }, 200);
      }
    },

    toggleClickShield() {
      this.showClickShield = !this.showClickShield;
    },

    handleIframeLoad() {
      this.isIframeLoaded = true;
      
      // Try to prevent navigation changes
      const iframe = this.$refs.videoIframe as HTMLIFrameElement;
      if (iframe) {
        // Monitor for navigation attempts
        this.monitorIframeNavigation(iframe);
      }
    },

    monitorIframeNavigation(iframe: HTMLIFrameElement) {
      const originalSrc = iframe.src;
      
      // Check for src changes periodically
      const navigationChecker = setInterval(() => {
        if (iframe.src !== originalSrc && iframe.src !== this.sanitizedUrl) {
          console.log('Navigation attempt detected, restoring original URL');
          iframe.src = this.sanitizedUrl;
        }
      }, 1000);

      // Clean up after 30 seconds
      setTimeout(() => {
        clearInterval(navigationChecker);
      }, 30000);
    },

    openInNewWindow() {
      if (this.embedUrl) {
        // Open in a new window with specific features to control behavior
        const windowFeatures = 'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no';
        window.open(this.embedUrl, '_blank', windowFeatures);
      }
    },

    refreshIframe() {
      const iframe = this.$refs.videoIframe as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src; // Force reload
      }
    },

    // Additional security method to prevent window.open hijacking
    preventWindowHijacking() {
      // Override window.open for the iframe context if possible
      if (window.frames.length > 0) {
        try {
          window.frames[0].open = () => {
            console.log('Blocked window.open attempt');
            return null;
          };
        } catch (e) {
          // Cross-origin restrictions will prevent this
          console.log('Cannot override window.open due to same-origin policy');
        }
      }
    }
  },

  mounted() {
    // Prevent right-click context menu on the iframe area
    const container = this.$el as HTMLElement;
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Prevent drag and drop
    container.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    // Monitor for suspicious activities
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('Page hidden - potential popup attempt blocked');
      }
    });
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
  border-radius: 8px;
  overflow: hidden;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
  }

  .click-shield {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 10;
    cursor: not-allowed;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;

    .shield-message {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      backdrop-filter: blur(4px);

      p {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
      }

      .toggle-btn {
        background: #ff5252;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: background-color 0.2s ease;

        &:hover {
          background: #d32f2f;
        }
      }
    }
  }

  .controls-overlay {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 0.5rem;
    z-index: 15;

    .control-btn {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      padding: 0.5rem;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);

      &:hover {
        background: rgba(0, 0, 0, 0.9);
        transform: scale(1.1);
      }
    }
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
    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top: 4px solid #ff5252;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.7;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  // Disable text selection
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  // Disable highlighting
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}</style>