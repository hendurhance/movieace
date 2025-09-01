import { ref } from 'vue';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  timestamp: Date;
}

const toasts = ref<Toast[]>([]);
let toastIdCounter = 0;

export function useToast() {
  const addToast = (message: string, type: Toast['type'] = 'info', duration = 5000): string => {
    const id = `toast-${++toastIdCounter}`;
    const toast: Toast = {
      id,
      message,
      type,
      duration,
      timestamp: new Date()
    };

    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAllToasts = () => {
    toasts.value.splice(0);
  };

  return {
    toasts: toasts,
    addToast,
    removeToast,
    clearAllToasts
  };
}