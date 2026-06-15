import { create } from "zustand";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const DEFAULT_DURATION = 3000;

/**
 * Zustand store that manages a queue of toast notifications.
 * Supports auto-dismiss, stacking (max 3 visible), and optional action buttons.
 */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = crypto.randomUUID();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? DEFAULT_DURATION,
    };

    // Limit to 3 visible toasts — remove oldest if at capacity
    set((state) => {
      const updated = [...state.toasts, newToast];
      return { toasts: updated.length > 3 ? updated.slice(-3) : updated };
    });

    // Auto-dismiss after duration
    if ((newToast.duration ?? 0) > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration!);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));
