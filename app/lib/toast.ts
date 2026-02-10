import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

export const toast = (message: string, type: ToastType = "success") => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastMessage = { id, message, type };
  toasts = [...toasts, newToast];
  notifyListeners();

  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

const removeToast = (id: string) => {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
};

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener(toasts));
};

export const useToasts = () => {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => {
      setCurrentToasts(newToasts);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return { toasts: currentToasts, removeToast };
};
