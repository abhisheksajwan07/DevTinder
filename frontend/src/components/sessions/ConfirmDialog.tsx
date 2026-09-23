import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-[24px] border border-[#e9e5df] bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start gap-3 mb-4">
          <div className="grid size-10 place-items-center rounded-2xl bg-red-50 border border-red-100 shrink-0">
            <AlertTriangle className="size-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#242322]">{title}</h3>
            <p className="mt-1 text-xs text-[#77736e] leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-[#e4ded5] py-3 text-sm font-semibold text-[#55504b] transition hover:bg-[#f7f5f2]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
