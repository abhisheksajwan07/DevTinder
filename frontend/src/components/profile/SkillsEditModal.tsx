import { currentUser } from "../../app/mock-data";
import { X } from "lucide-react";

interface SkillsEditModalProps {
  onClose: () => void;
}

export default function SkillsEditModal({ onClose }: SkillsEditModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] border border-[#e9e5df] bg-white shadow-2xl p-6">
        <h3 className="text-base font-bold text-[#242322] mb-1">Edit Skills</h3>
        <p className="text-xs text-[#77736e] mb-4">
          Editing skills will recompute your match scores.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {currentUser.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f5f2] border border-[#e9e5df] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#55504b]"
            >
              {skill}
              <button
                type="button"
                className="text-[#88827c] hover:text-red-500 transition"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-[#1a1918] py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Save Skills
        </button>
      </div>
    </div>
  );
}
