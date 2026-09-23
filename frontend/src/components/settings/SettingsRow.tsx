import type { ReactNode } from "react";

interface SettingsRowProps {
  label: string;
  description?: string;
  action: ReactNode;
}

export default function SettingsRow({
  label,
  description,
  action,
}: SettingsRowProps) {
  return (
    <div className="flex flex-col items-stretch justify-between gap-2 border-b border-[#f0ece6] py-3 last:border-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex-1 min-w-0">
        <p className="break-words text-sm font-semibold text-[#242322]">
          {label}
        </p>
        {description && (
          <p className="break-words text-xs text-[#77736e] mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
