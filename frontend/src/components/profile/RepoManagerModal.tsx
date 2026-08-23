import { useState } from "react";
import type { Repository } from "../../mock-data";
import { X, Check, Star } from "lucide-react";

interface RepoManagerModalProps {
  repos: Repository[];
  onClose: () => void;
  onSave: (selected: string[]) => void;
}

export default function RepoManagerModal({
  repos,
  onClose,
  onSave,
}: RepoManagerModalProps) {
  const [selected, setSelected] = useState<string[]>(
    repos.filter((r) => r.isFeatured).map((r) => r.id),
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-[28px] border border-[#e9e5df] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#f0ece6]">
          <div>
            <h3 className="text-base font-bold text-[#242322]">
              Manage Featured Repos
            </h3>
            <p className="font-mono text-[10px] text-[#88827c] mt-0.5">
              {selected.length}/3 selected · max 3
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e9e5df] p-2 text-[#77736e] hover:bg-[#f7f5f2] transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {repos.map((repo) => {
            const isSelected = selected.includes(repo.id);
            return (
              <button
                key={repo.id}
                type="button"
                onClick={() => toggle(repo.id)}
                disabled={!isSelected && selected.length >= 3}
                className={`w-full flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-orange-500 bg-orange-50"
                    : "border-[#e9e5df] bg-white hover:border-orange-300"
                } ${!isSelected && selected.length >= 3 ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition ${
                    isSelected
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-[#c8c2b8]"
                  }`}
                >
                  {isSelected && <Check className="size-3 stroke-3" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#242322] truncate">
                      {repo.name}
                    </p>
                    <span className="flex items-center gap-1 font-mono text-xs text-[#77736e] shrink-0">
                      <Star className="size-3 fill-amber-400 text-amber-500" />
                      {repo.stars}
                    </span>
                  </div>
                  <p className="text-xs text-[#77736e] mt-0.5">
                    {repo.description}
                  </p>
                  <span className="mt-1.5 inline-block rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#55504b]">
                    {repo.language}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-5 border-t border-[#f0ece6] flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#e4ded5] py-3 text-sm font-semibold text-[#55504b] transition hover:bg-[#f7f5f2]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(selected)}
            className="flex-1 rounded-2xl bg-[#1a1918] py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
