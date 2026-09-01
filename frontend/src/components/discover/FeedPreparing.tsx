import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

const PREPARATION_STEPS = [
  "Analyzing your tech stack & experience...",
  "Generating 1024-dimensional profile embedding...",
  "Querying vector database for developer matches...",
  "Calculating cosine similarity & compatibility...",
  "Finalizing your developer deck...",
];

interface FeedPreparingProps {
  isDataReady?: boolean;
  onFinish?: () => void;
}

export default function FeedPreparing({
  isDataReady = false,
  onFinish,
}: FeedPreparingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isDataReadyRef = useRef(isDataReady);
  isDataReadyRef.current = isDataReady;

  useEffect(() => {
    // Step progression timer: ~750ms per step
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        // If not at the last step yet, continue to next step
        if (prev < PREPARATION_STEPS.length - 1) {
          return prev + 1;
        }

        // If at the last step, check if data is ready
        if (isDataReadyRef.current) {
          clearInterval(interval);
          // Small delay on 100% completed state before revealing feed
          setTimeout(() => {
            onFinish?.();
          }, 600);
          return PREPARATION_STEPS.length;
        }

        // If backend still waiting (e.g. 503), hold on last step
        return prev;
      });
    }, 750);

    return () => clearInterval(interval);
  }, [onFinish]);

  // When data becomes ready ,being already at the last step
  useEffect(() => {
    if (isDataReady && currentStep >= PREPARATION_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(PREPARATION_STEPS.length);
        setTimeout(() => {
          onFinish?.();
        }, 600);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDataReady, currentStep, onFinish]);

  return (
    <div className="flex flex-col items-center justify-center min-h-112.5 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#e9e5df] bg-white p-8 shadow-xl shadow-orange-500/5 transition-all">
        {/* Animated Header Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-11 items-center justify-center rounded-2xl `bg-linear-to-br from-amber-400 via-orange-500 to-rose-500 shadow-md shadow-orange-200">
            <Sparkles className="size-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-[#242322]">Finding Your Match</h3>
            <p className="text-xs text-[#77736e]">AI Vector Matchmaking</p>
          </div>
        </div>

        {/* Step-by-Step Thinking Checklist */}
        <div className="space-y-3.5">
          {PREPARATION_STEPS.map((step, index) => {
            const isDone = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                  isPending ? "opacity-30" : "opacity-100"
                }`}
              >
                {/* Status Indicator */}
                {isDone ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="size-4 text-orange-500 animate-spin shrink-0" />
                ) : (
                  <div className="size-4 rounded-full border border-[#d4cec6] shrink-0" />
                )}

                {/* Step Label */}
                <span
                  className={`font-medium ${
                    isCurrent
                      ? "text-orange-600 font-semibold"
                      : isDone
                        ? "text-[#242322]"
                        : "text-[#88827c]"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-8">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0ece6]">
            <div
              className="h-full `bg-linear-to-r from-amber-400 to-orange-500 transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(
                  100,
                  ((Math.min(currentStep, PREPARATION_STEPS.length - 1) + 1) /
                    PREPARATION_STEPS.length) *
                    100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
