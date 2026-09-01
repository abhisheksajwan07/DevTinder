import { Check, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ConnectionProfile from "./ConnectionProfile";
import type { ConnectionRequest } from "../../types/connection-request";

type RequestCardProps = {
  request: ConnectionRequest;
  isPending: boolean;
  isError: boolean;
  onAccept: (targetProfileId: string) => void;
  onReject: (targetProfileId: string) => void;
};

export default function RequestCard({
  request,
  isPending,
  isError,
  onAccept,
  onReject,
}: RequestCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  // Shake animation when the API call fails (rollback)
  useEffect(() => {
    if (!isError || !cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { x: 0 },
      {
        x: 8,
        duration: 0.07,
        ease: "power1.inOut",
        repeat: 5,
        yoyo: true,
        onComplete: () => gsap.set(cardRef.current!, { x: 0 }),
      }
    );
  }, [isError]);

  return (
    <div
      ref={cardRef}
      className="rounded-[24px] border bg-white p-5 shadow-xs will-change-transform transition-colors duration-300"
      style={{ borderColor: isError ? "#f87171" : "#fed7aa" }}
    >
      <ConnectionProfile profile={request.profile} />
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => navigate(`/app/profile/${request.profile.username}`)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e4ded5] px-3 py-1.5 text-xs font-semibold text-[#55504b] hover:border-orange-300 hover:bg-orange-50 transition"
        >
          <User className="size-3.5" /> Profile
        </button>
        <button
          disabled={isPending}
          onClick={() => onReject(request.profile.id)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e4ded5] px-3 py-1.5 text-xs font-semibold text-[#77716b] hover:border-red-300 hover:bg-red-50 disabled:opacity-50 transition"
        >
          <X className="size-3.5" /> Reject
        </button>
        <button
          disabled={isPending}
          onClick={() => onAccept(request.profile.id)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition"
        >
          <Check className="size-3.5" /> Accept
        </button>
      </div>
    </div>
  );
}
