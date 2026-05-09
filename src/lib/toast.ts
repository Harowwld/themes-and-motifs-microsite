'use client';

import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toast = {
  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      ...options,
      duration: options?.duration ?? 5000,
      style: {
        background: '#fff1f3',
        border: '1px solid rgba(180, 35, 24, 0.2)',
        color: '#b42318',
      },
    });
  },

  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      ...options,
      duration: options?.duration ?? 3000,
      style: {
        background: '#ecfdf3',
        border: '1px solid rgba(2, 122, 72, 0.2)',
        color: '#027a48',
      },
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      ...options,
      duration: options?.duration ?? 4000,
      style: {
        background: '#fff7ed',
        border: '1px solid rgba(193, 122, 78, 0.3)',
        color: '#6e4f33',
      },
    });
  },

  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      ...options,
      duration: options?.duration ?? 4000,
      style: {
        background: '#eff6ff',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: '#1d4ed8',
      },
    });
  },

  custom: (message: string, options?: ToastOptions) => {
    sonnerToast(message, {
      ...options,
      duration: options?.duration ?? 4000,
    });
  },
};

export default toast;
