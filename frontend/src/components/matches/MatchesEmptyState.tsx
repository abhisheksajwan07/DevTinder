import { Sparkles } from "lucide-react";

type MatchesEmptyStateProps = {
  title: string;
  description: string;
  onDiscover: () => void;
};

export default function MatchesEmptyState({
  title,
  description,
  onDiscover,
}: MatchesEmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-[#e9e5df] bg-white px-6 py-16 text-center shadow-xs">
      <div className="mb-3 text-4xl">💌</div>
      <h3 className="text-base font-bold text-[#242322]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-[#77736e]">
        {description}
      </p>
      <button
        onClick={onDiscover}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#1a1918] px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 transition"
      >
        <Sparkles className="size-4" /> Discover Developers
      </button>
    </div>
  );
}
