<template>
  <div class="video-container">
    <iframe
      v-if="embedUrl"
      :src="embedUrl"
      sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
      allow="fullscreen"
      allowfullscreen
      frameborder="0"
    ></iframe>
    <div class="loading-placeholder" v-else>
      <div class="spinner"></div>
      <p>Loading video player...</p>
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
    }
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