<template>
  <div>
    <!-- Share Screen Button -->
    <button 
      class="share-screen-button" 
      @click="openShareScreen"
      type="button"
      title="Share Screen"
      aria-label="Open share screen in new tab"
    >
      <ShareIcon />
      <span class="button-text">Share Screen</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// Import icons
import ShareIcon from './svg/outline/share.vue';

export default defineComponent({
  name: 'ShareScreen',
  components: {
    ShareIcon,
  },
  setup() {
    function openShareScreen() {
      window.open('https://watchparty-buiu.onrender.com/', '_blank');
    }

    return {
      openShareScreen,
    };
  },
});
</script>

<style scoped lang="scss">
.share-screen-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  color: #2196f3;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-height: 44px; // Better touch targets

  &:hover {
    background: rgba(33, 150, 243, 0.2);
    border-color: rgba(33, 150, 243, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.98);
    background: rgba(33, 150, 243, 0.25);
  }

  &:focus-visible {
    outline: 2px solid #2196f3;
    outline-offset: 2px;
  }

  // Remove hover effects on touch devices
  @media (hover: none) and (pointer: coarse) {
    &:hover {
      transform: none;
      background: rgba(33, 150, 243, 0.1);
      border-color: rgba(33, 150, 243, 0.3);
      box-shadow: none;
    }
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .button-text {
    font-weight: 500;
  }

  // Mobile responsive adjustments
  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    border-radius: 10px;
    gap: 0.375rem;

    .button-text {
      display: none; // Hide text on mobile, controlled by parent
    }
    
    svg {
      margin-right: 0;
      width: 20px;
      height: 20px;
    }
  }

  @media (max-width: 640px) {
    padding: 0.5rem;
    min-width: 44px;
    justify-content: center;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
