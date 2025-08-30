<template>
    <div class="disclaimer-container">
        <div class="disclaimer-header">
            <div class="disclaimer-icon">
                <InfoIcon :fill="'#ffffff'"/>
            </div>
            <h3>Important Notice</h3>
        </div>
        <div class="disclaimer-content">
            <div class="notice-item">
                <div class="notice-bullet">🎬</div>
                <p>
                    MovieAce does not host, store, or provide any video content. Our service simply embeds and 
                    indexes media that is already publicly available on third-party platforms.
                </p>
            </div>
            <div class="notice-item">
                <div class="notice-bullet">⚖️</div>
                <p>
                    All copyrighted content belongs to their rightful owners. If you believe content accessible via our service 
                    infringes your copyright, please contact the source website directly.
                </p>
            </div>
            <div class="notice-item">
                <div class="notice-bullet">🔗</div>
                <p>
                    We have no control over and do not assume responsibility for the content, privacy policies, 
                    or practices of any third-party websites or sources.
                </p>
            </div>
        </div>
        <div class="disclaimer-footer">
            <span class="footer-text">By using this service, you acknowledge and accept these terms.</span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InfoIcon from '../svg/solid/info.vue';

export default defineComponent({
name: 'Disclaimer',
components: {
    InfoIcon
}
});
</script>

<style lang="scss" scoped>
.disclaimer-container {
  background: linear-gradient(135deg, rgba(31, 33, 48, 0.95) 0%, rgba(44, 47, 69, 0.9) 100%);
  border-radius: 16px;
  margin: 2rem auto;
  max-width: 1200px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    margin: 1.5rem 1rem;
    border-radius: 12px;
  }

  .disclaimer-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    @media (max-width: 768px) {
      padding: 1.5rem 1.5rem 1rem;
      flex-direction: column;
      text-align: center;
      gap: 0.75rem;
    }

    .disclaimer-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #4EB5FF 0%, #3b9cdb 100%);
      border-radius: 12px;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(78, 181, 255, 0.3);

      svg {
        width: 24px;
        height: 24px;
        color: #fff;
      }
    }

    h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #fff 0%, #e1e1e1 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      @media (max-width: 768px) {
        font-size: 1.25rem;
      }
    }
  }

  .disclaimer-content {
    padding: 2rem;

    @media (max-width: 768px) {
      padding: 1.5rem;
    }

    .notice-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      @media (max-width: 768px) {
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      .notice-bullet {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        font-size: 1rem;
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.1);

        @media (max-width: 768px) {
          width: 28px;
          height: 28px;
          font-size: 0.875rem;
        }
      }

      p {
        margin: 0;
        font-size: 1rem;
        line-height: 1.6;
        color: #c1c7d0;
        flex: 1;

        @media (max-width: 768px) {
          font-size: 0.9rem;
          line-height: 1.5;
        }
      }
    }
  }

  .disclaimer-footer {
    padding: 1.5rem 2rem;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.08);

    @media (max-width: 768px) {
      padding: 1.25rem 1.5rem;
      text-align: center;
    }

    .footer-text {
      font-size: 0.9rem;
      color: #4EB5FF;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &::before {
        content: '✓';
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        background: rgba(78, 181, 255, 0.2);
        border-radius: 50%;
        font-size: 0.75rem;
        color: #4EB5FF;
      }

      @media (max-width: 768px) {
        justify-content: center;
        font-size: 0.85rem;
      }
    }
  }
}

// Animation for better UX
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.disclaimer-container {
  animation: slideIn 0.6s ease-out;
}

// Dark mode enhancements
@media (prefers-color-scheme: dark) {
  .disclaimer-container {
    background: linear-gradient(135deg, rgba(15, 16, 22, 0.98) 0%, rgba(31, 33, 48, 0.95) 100%);
  }
}

// High contrast mode
@media (prefers-contrast: high) {
  .disclaimer-container {
    border: 2px solid #4EB5FF;
    background: rgba(0, 0, 0, 0.95);
  }

  .disclaimer-header h3 {
    color: #fff;
    background: none;
    -webkit-text-fill-color: #fff;
  }

  .disclaimer-content .notice-item p {
    color: #fff;
  }
}
</style>