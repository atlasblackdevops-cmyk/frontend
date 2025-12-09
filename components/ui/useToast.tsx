import { useEffect, useRef, useState } from "react";
import { Notification, Portal } from "@mantine/core";

type ToastColor = "green" | "red" | "yellow" | "blue" | "gray";

interface ToastState {
  message: string;
  color?: ToastColor;
}

function ToastContainer({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  return (
    <Portal>
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 2000 }}>
        <Notification
          color={toast.color ?? "blue"}
          withCloseButton
          onClose={onClose}
        >
          {toast.message}
        </Notification>
      </div>
    </Portal>
  );
}

export function useToast(timeoutMs = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  };

  const showToast = (message: string, color: ToastColor = "green") => {
    hideToast();
    setToast({ message, color });
    timerRef.current = setTimeout(hideToast, timeoutMs);
  };

  useEffect(() => hideToast, []);

  const Toast = () => <ToastContainer toast={toast} onClose={hideToast} />;

  return { showToast, hideToast, Toast };
}

