<template>
  <header class="stream-header">
    <div class="header-content">
      <!-- Back Navigation -->
      <button class="back-button" @click="goBack">
        <ArrowLeftLong />
        <span class="back-text">{{ backText }}</span>
      </button>
      
      <!-- Title Section -->
      <div class="title-section">
        <h1 v-if="title" class="stream-title">{{ title }}</h1>
        <div v-else class="title-loading">
          <div class="loading-shimmer"></div>
        </div>
      </div>
      
      <!-- Action Slot -->
      <div class="header-actions">
        <slot></slot>
      </div>
    </div>
    
    <!-- Progress Bar (optional) -->
    <div v-if="showProgress" class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ArrowLeftLong from './svg/outline/arrow-left-long.vue';

export default defineComponent({
  name: 'StreamHeader',
  components: {
    ArrowLeftLong
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    backText: {
      type: String,
      default: 'Back'
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0,
      validator: (value: number) => value >= 0 && value <= 100
    }
  },
  emits: ['back-click'],
  setup(_props, { emit }) {
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
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(
    180deg, 
    rgba(15, 16, 22, 0.95) 0%, 
    rgba(15, 16, 22, 0.8) 50%, 
    rgba(15, 16, 22, 0.6) 100%
  );
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
    min-height: 70px;

    .back-button {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      color: #e1e1e1;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 0.95rem;
      font-weight: 500;
      white-space: nowrap;

      &:hover {
        background: rgba(255, 82, 82, 0.1);
        border-color: rgba(255, 82, 82, 0.3);
        color: #ff5252;
        transform: translateX(-2px);
      }

      svg {
        width: 20px;
        height: 20px;
        margin-right: 0.75rem;
        transition: transform 0.3s;
      }

      &:hover svg {
        transform: translateX(-2px);
      }

      .back-text {
        font-weight: 500;
      }
    }

    .title-section {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 2rem;

      .stream-title {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #fff;
        text-align: center;
        line-height: 1.3;
        background: linear-gradient(135deg, #fff 0%, #e1e1e1 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        max-width: 600px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @media (max-width: 768px) {
          font-size: 1.375rem;
        }
      }

      .title-loading {
        display: flex;
        align-items: center;
        justify-content: center;

        .loading-shimmer {
          width: 300px;
          height: 32px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          border-radius: 8px;
          animation: shimmer 2s infinite;

          @media (max-width: 768px) {
            width: 200px;
            height: 28px;
          }
        }
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  }

  .progress-bar {
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff5252 0%, #ff7979 100%);
      transition: width 0.3s ease;
      border-radius: 0 2px 2px 0;
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: -300px 0;
  }
  100% {
    background-position: 300px 0;
  }
}

// Mobile optimizations
@media (max-width: 768px) {
  .stream-header {
    .header-content {
      padding: 1rem;
      gap: 0.5rem;

      .back-button {
        padding: 0.625rem 1rem;
        font-size: 0.875rem;

        .back-text {
          display: none;
        }

        svg {
          margin-right: 0;
          width: 18px;
          height: 18px;
        }
      }

      .title-section {
        margin: 0 1rem;
      }
    }
  }
}

@media (max-width: 480px) {
  .stream-header {
    .header-content {
      padding: 0.875rem;

      .title-section {
        margin: 0 0.5rem;

        .stream-title {
          font-size: 1.25rem;
          max-width: 200px;
        }
      }
    }
  }
}

// Dark mode enhancement
@media (prefers-color-scheme: dark) {
  .stream-header {
    background: linear-gradient(
      180deg, 
      rgba(8, 9, 13, 0.98) 0%, 
      rgba(8, 9, 13, 0.85) 50%, 
      rgba(8, 9, 13, 0.7) 100%
    );
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .stream-header .header-content .back-button,
  .stream-header .progress-bar .progress-fill,
  .loading-shimmer {
    transition: none;
    animation: none;
  }
}
</style>