interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export default function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
          Step {step} of {totalSteps}
        </span>
        <span className="font-mono text-[10px] font-semibold text-orange-600">
          {Math.round((step / totalSteps) * 100)}% complete
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#e9e5df] overflow-hidden">
        <div
          className="h-full rounded-full bg-linear-to-r from-[#ee7100] to-amber-500 transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
