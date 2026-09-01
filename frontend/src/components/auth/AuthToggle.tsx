export type AuthMode = "signin" | "signup";

interface AuthToggleProps {
  mode: AuthMode;
  onSelectMode: (mode: AuthMode) => void;
}

export default function AuthToggle({ mode, onSelectMode }: AuthToggleProps) {
  return (
    <div className="flex justify-end">
      <div className="inline-flex rounded-2xl bg-[#e6e1d7] p-1 shadow-inner">
        <button
       
          onClick={() => onSelectMode("signin")}
          className={`rounded-xl px-5 py-2 text-xs font-semibold transition-all ${
            mode === "signin"
              ? "bg-white text-[#242322] shadow-sm"
              : "text-[#77716b] hover:text-[#242322]"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => onSelectMode("signup")}
          className={`rounded-xl px-5 py-2 text-xs font-semibold transition-all ${
            mode === "signup"
              ? "bg-white text-[#242322] shadow-sm"
              : "text-[#77716b] hover:text-[#242322]"
          }`}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
