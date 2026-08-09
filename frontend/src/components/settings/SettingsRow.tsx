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
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#f0ece6] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#242322]">{label}</p>
        {description && (
          <p className="text-xs text-[#77736e] mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
