import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useToast, type ToastData } from "./use-toast";

export function ToastProvider({ children }: { children: ReactNode }) {
  return <ToastPrimitive.Provider swipeDirection="right">{children}</ToastPrimitive.Provider>;
}

export function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  return (
    <ToastPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      className={`group pointer-events-auto relative flex w-full items-start justify-between gap-4 overflow-hidden rounded-2xl border p-4 pr-8 shadow-lg transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full ${
        toast.variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-[#e9e5df] bg-white text-[#242322]"
      }`}
    >
      <div className="grid gap-1">
        {toast.title && <ToastPrimitive.Title className="text-sm font-semibold">{toast.title}</ToastPrimitive.Title>}
        {toast.description && (
          <ToastPrimitive.Description className="text-xs text-[#77736e]">
            {toast.description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close className="absolute right-3 top-3 rounded-md p-1 text-[#88827c] opacity-0 transition-opacity hover:text-[#242322] focus:opacity-100 group-hover:opacity-100">
        <X className="size-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map((item) => (
        <Toast
          key={item.id}
          toast={item}
          onDismiss={() => dismiss(item.id)}
        />
      ))}
      <ToastPrimitive.Viewport className="fixed right-0 top-0 z-100 flex w-full max-w-105 flex-col gap-3 p-4 outline-none sm:bottom-0 sm:top-auto" />
    </ToastProvider>
  );
}
