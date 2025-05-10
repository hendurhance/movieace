<template>
  <div class="stream-header">
    <div class="back-button" @click="goBack">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{{ backText }}</span>
    </div>
    <h1 v-if="title">{{ title }}</h1>
    <div class="placeholder" v-else>Loading...</div>
    
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'StreamHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    backText: {
      type: String,
      default: 'Back'
    }
  },
  emits: ['back-click'],
  setup(props, { emit }) {
    const goBack = () => {
      emit('back-click');
    };

    return {
      goBack
    };
  }
});
</script>

<style lang="scss" scoped>
.stream-header {
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  position: relative;

  h1 {
    margin: 0 auto;
    font-size: 1.5rem;
    font-weight: 500;
  }

  .back-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #e1e1e1;
    transition: color 0.2s;

    &:hover {
      color: #ff5252;
    }

    svg {
      margin-right: 0.5rem;
    }
  }

  .placeholder {
    margin: 0 auto;
    font-size: 1.5rem;
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .stream-header {
    h1 {
      font-size: 1.25rem;
    }

    .back-button span {
      display: none;
    }
  }
}
</style>