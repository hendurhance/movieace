<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          @click="removeToast(toast.id)"
        >
          <div class="toast-icon">
            <CheckCircleIcon v-if="toast.type === 'success'" />
            <AlertTriangleIcon v-else-if="toast.type === 'error'" />
            <AlertTriangleIcon v-else-if="toast.type === 'warning'" />
            <InfoIcon v-else />
          </div>
          <div class="toast-content">
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button class="toast-close" @click.stop="removeToast(toast.id)">
            <XIcon />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useToast } from '../composables/useToast';
import CheckCircleIcon from './svg/outline/check-circle.vue';
import AlertTriangleIcon from './svg/outline/alert-triangle.vue';
import XIcon from './svg/outline/x.vue';
import UsersIcon from './svg/outline/users.vue';

const InfoIcon = UsersIcon;

export default defineComponent({
  name: 'Toast',
  components: {
    CheckCircleIcon,
    AlertTriangleIcon,
    XIcon,
    InfoIcon,
  },
  setup() {
    const { toasts, removeToast } = useToast();

    return {
      toasts,
      removeToast
    };
  }
});
</script>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(31, 33, 48, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  min-width: 300px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  &.toast-success {
    border-left: 4px solid #4caf50;
    .toast-icon svg {
      color: #4caf50;
    }
  }

  &.toast-error {
    border-left: 4px solid #ef4444;
    .toast-icon svg {
      color: #ef4444;
    }
  }

  &.toast-warning {
    border-left: 4px solid #f59e0b;
    .toast-icon svg {
      color: #f59e0b;
    }
  }

  &.toast-info {
    border-left: 4px solid #3b82f6;
    .toast-icon svg {
      color: #3b82f6;
    }
  }
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;

  svg {
    width: 20px;
    height: 20px;
  }
}

.toast-content {
  flex: 1;

  .toast-message {
    margin: 0;
    color: #e1e1e1;
    font-size: 0.875rem;
    line-height: 1.4;
    font-weight: 500;
  }
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-top: -0.125rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

// Toast animations
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

// Mobile responsive
@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .toast-list {
    max-width: none;
  }

  .toast {
    min-width: auto;
    padding: 0.875rem 1rem;

    .toast-message {
      font-size: 0.8rem;
    }
  }
}
</style>