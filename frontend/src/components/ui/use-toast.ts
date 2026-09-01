import { useEffect, useState } from "react";

type ToastVariant = "default" | "destructive";

export type ToastData = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToastData }
  | { type: "DISMISS_TOAST"; toastId?: string };

const listeners: Array<(toasts: ToastData[]) => void> = [];
let memoryState: ToastData[] = [];

function dispatch(action: ToastAction) {
  memoryState =
    action.type === "ADD_TOAST"
      ? [action.toast, ...memoryState].slice(0, 3)
      : action.toastId
        ? memoryState.filter((toast) => toast.id !== action.toastId)
        : [];

  listeners.forEach((listener) => listener(memoryState));
}

export function toast({ title, description, variant = "default" }: Omit<ToastData, "id">) {
  const id = crypto.randomUUID();
  dispatch({ type: "ADD_TOAST", toast: { id, title, description, variant } });
  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>(memoryState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index >= 0) listeners.splice(index, 1);
    };
  }, []);

  return { toasts, dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }) };
}
