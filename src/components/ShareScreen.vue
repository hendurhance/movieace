<template>
  <div>
    <!-- Share Screen Button -->
    <div class="share-screen-button" @click="openShareScreen">
      <ShareIcon />
      <span>Share Screen</span>
    </div>
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
  transition: all 0.3s ease;

  &:hover {
    background: rgba(33, 150, 243, 0.2);
    border-color: rgba(33, 150, 243, 0.5);
    transform: translateY(-2px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
}
</style>
