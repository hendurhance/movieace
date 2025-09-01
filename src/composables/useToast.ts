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
const recentToasts = new Map<string, number>(); // Track recent toast messages to prevent duplicates

export function useToast() {
  const addToast = (message: string, type: Toast['type'] = 'info', duration = 5000): string => {
    // Prevent duplicate toasts within 1 second
    const now = Date.now();
    const lastToastTime = recentToasts.get(message);
    if (lastToastTime && (now - lastToastTime) < 1000) {
      return ''; // Return empty string for duplicate
    }
    
    recentToasts.set(message, now);
    
    // Clean up old entries from recentToasts map to prevent memory leaks
    for (const [msg, time] of recentToasts.entries()) {
      if (now - time > 5000) { // Remove entries older than 5 seconds
        recentToasts.delete(msg);
      }
    }
    
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