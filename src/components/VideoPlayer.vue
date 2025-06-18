<template>
  <div class="video-container">
    <iframe
      v-if="embedUrl"
      ref="iframeRef"
      :src="embedUrl"
      allow="fullscreen"
      allowfullscreen
      frameborder="0"
      referrerpolicy="no-referrer"
    ></iframe>
    <div class="loading-placeholder" v-else>
      <div class="spinner"></div>
      <p>Loading video player...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'VideoPlayer',
  props: {
    embedUrl: {
      type: String,
      default: ''
    }
  },
  setup() {
    const iframeRef = ref<HTMLIFrameElement | null>(null);

    onMounted(() => {
      const iframe = iframeRef.value;
      if (!iframe) return;

      const removeAds = () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc) return;
          const adSelectors = [
            'iframe[src*="ads"]',
            '[id*="ad" i]',
            '[class*="ad" i]',
            '[href*="adservice" i]'
          ];
          adSelectors.forEach(sel => {
            doc.querySelectorAll(sel).forEach(el => el.remove());
          });
        } catch {
          // cross-origin, cannot remove
        }
      };

      const disablePopups = () => {
        try {
          const win = iframe.contentWindow as any;
          if (!win) return;
          const noop = () => null;
          if (typeof win.open === 'function') win.open = noop;
          if (typeof win.alert === 'function') win.alert = noop;
          if (typeof win.confirm === 'function') win.confirm = noop;
          if (typeof win.prompt === 'function') win.prompt = noop;
        } catch {
          // cross-origin, cannot override
        }
      };

      iframe.addEventListener('load', () => {
        disablePopups();
        removeAds();
        setInterval(removeAds, 2000);
      });
    });

    return { iframeRef };
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

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>