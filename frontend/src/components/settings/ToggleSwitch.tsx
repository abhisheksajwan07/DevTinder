interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function ToggleSwitch({ enabled, onToggle }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors ${
        enabled ? "border-orange-500 bg-orange-500" : "border-[#d4cec6] bg-[#e9e5df]"
      }`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
