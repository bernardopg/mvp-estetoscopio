import { ToastType } from "@/components/Toast";

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

let toastContext: ToastContextType | null = null;

export const setToastContext = (context: ToastContextType) => {
  toastContext = context;
};

export const showToast = (type: ToastType, title: string, message?: string, duration?: number) => {
  if (!toastContext) {
    console.warn("Toast context not found. Make sure ToastProvider is wrapping your component.");
    return;
  }

  toastContext.showToast(type, title, message, duration);
};

export const showSuccessToast = (title: string, message?: string, duration?: number) => {
  showToast("success", title, message, duration);
};

export const showErrorToast = (title: string, message?: string, duration?: number) => {
  showToast("error", title, message, duration);
};

export const showInfoToast = (title: string, message?: string, duration?: number) => {
  showToast("info", title, message, duration);
};

export const showWarningToast = (title: string, message?: string, duration?: number) => {
  showToast("warning", title, message, duration);
};
