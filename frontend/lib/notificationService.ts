// lib/notificationService.ts
import { toast, ToastOptions } from "react-toastify";

type NotificationType = "info" | "success" | "error" | "warning" | "default";

export const notify = (
  message: string,
  type: NotificationType = "default",
  options?: ToastOptions
) => {
  toast(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
    ...options,
  });
};
