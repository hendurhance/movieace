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
        <slot name="center"></slot>
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
    gap: 1rem;

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
      flex-shrink: 0;
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

      // Better touch feedback on mobile
      &:active {
        transform: translateX(-1px) scale(0.98);
        background: rgba(255, 82, 82, 0.15);
      }

      // Remove hover effects on touch devices
      @media (hover: none) and (pointer: coarse) {
        &:hover {
          transform: none;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: #e1e1e1;
        }
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
      margin: 0 1rem;
      min-width: 0; // Allow flex item to shrink below its content size

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
        max-width: 100%;
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
      gap: 0.75rem;
      flex-shrink: 0;

      // Ensure action buttons are properly sized
      :deep(.watch-party-button),
      :deep(.share-screen-button),
      :deep(button) {
        white-space: nowrap;
        min-height: 44px; // Better touch targets on mobile
        position: relative;
        
        // Add focus styles for keyboard navigation
        &:focus-visible {
          outline: 2px solid #ff5252;
          outline-offset: 2px;
          border-radius: 8px;
        }
      }

      // Add tooltips for icon-only buttons on mobile
      :deep(.watch-party-button),
      :deep(.share-screen-button) {
        &::after {
          content: attr(title);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          z-index: 1000;
          
          @media (max-width: 768px) {
            display: none; // Hide tooltips on mobile to avoid conflicts
          }
        }

        &:hover::after {
          opacity: 1;
          
          @media (hover: none) and (pointer: coarse) {
            opacity: 0;
          }
        }
      }
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
      padding: 0.875rem 1rem;
      gap: 0.75rem;
      min-height: 64px;

      .back-button {
        padding: 0.625rem 0.875rem;
        font-size: 0.875rem;
        border-radius: 10px;

        .back-text {
          display: none;
        }

        svg {
          margin-right: 0;
          width: 20px;
          height: 20px;
        }
      }

      .title-section {
        margin: 0 0.5rem;

        .stream-title {
          font-size: 1.375rem;
        }

        .title-loading .loading-shimmer {
          width: 180px;
          height: 26px;
        }
      }

      .header-actions {
        gap: 0.5rem;

        // Make action buttons more compact on mobile
        :deep(.watch-party-button),
        :deep(.share-screen-button) {
          padding: 0.625rem 0.875rem !important;
          font-size: 0.875rem !important;
          border-radius: 10px !important;
          
          span {
            display: none !important; // Hide text, show only icons
          }
          
          svg {
            margin-right: 0 !important;
            width: 20px !important;
            height: 20px !important;
          }
        }
      }
    }
  }
}

@media (max-width: 640px) {
  .stream-header {
    .header-content {
      padding: 0.875rem 1rem;
      gap: 0.75rem;
      min-height: 60px;

      .title-section {
        margin: 0 0.5rem;

        .stream-title {
          font-size: 1.125rem;
          // Ensure better truncation on small screens
          max-width: 100%;
        }

        .title-loading .loading-shimmer {
          width: 100px;
          height: 22px;
        }
      }

      .header-actions {
        gap: 0.375rem;

        :deep(.watch-party-button),
        :deep(.share-screen-button) {
          padding: 0.5rem !important;
          min-width: 44px !important;
          
          svg {
            width: 18px !important;
            height: 18px !important;
          }
        }
      }
    }
  }
}

// Very small screens - keep inline layout with truncation
@media (max-width: 480px) {
  .stream-header {
    .header-content {
      padding: 0.75rem;
      gap: 0.5rem;
      min-height: 56px;
      // Keep flex layout, don't wrap

      .back-button {
        flex: 0 0 auto;
        padding: 0.5rem;
        min-width: 40px;
        justify-content: center;

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .title-section {
        flex: 1;
        margin: 0;
        min-width: 0; // Allow shrinking
        justify-content: center;

        .stream-title {
          font-size: 1rem;
          text-align: center;
          max-width: 100%;
          // Ensure ellipsis works
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .title-loading .loading-shimmer {
          width: 80px;
          height: 20px;
        }
      }

      .header-actions {
        flex: 0 0 auto;
        gap: 0.25rem;

        :deep(.watch-party-button),
        :deep(.share-screen-button) {
          padding: 0.5rem !important;
          min-width: 40px !important;
          
          svg {
            width: 16px !important;
            height: 16px !important;
          }
        }
      }
    }
  }
}

// Landscape orientation on mobile
@media (max-width: 896px) and (orientation: landscape) {
  .stream-header {
    .header-content {
      min-height: 56px;
      padding: 0.625rem 1rem;

      .title-section .stream-title {
        font-size: 1.125rem;
      }

      .back-button,
      .header-actions :deep(button) {
        padding: 0.5rem 0.75rem;
      }
    }
  }
}

// Extra small screens (very narrow phones)
@media (max-width: 360px) {
  .stream-header {
    .header-content {
      padding: 0.625rem 0.5rem;
      gap: 0.375rem;

      .back-button {
        min-width: 36px;
        padding: 0.4rem;

        svg {
          width: 14px;
          height: 14px;
        }
      }

      .title-section {
        .stream-title {
          font-size: 0.875rem;
          // Very aggressive truncation for tiny screens
          max-width: 120px;
        }

        .title-loading .loading-shimmer {
          width: 60px;
          height: 18px;
        }
      }

      .header-actions {
        gap: 0.25rem;

        :deep(.watch-party-button),
        :deep(.share-screen-button) {
          padding: 0.4rem !important;
          min-width: 36px !important;
          
          svg {
            width: 14px !important;
            height: 14px !important;
          }
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