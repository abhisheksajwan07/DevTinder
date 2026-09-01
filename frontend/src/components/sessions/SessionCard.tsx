import type { Session } from "../../types/session";
import { Smartphone, Laptop, Monitor, MapPin, Clock, X } from "lucide-react";

interface SessionCardProps {
  session: Session;
  onRevoke: (id: string) => void;
}

function DeviceIcon({ device }: { device: string }) {
  if (
    device.toLowerCase().includes("iphone") ||
    device.toLowerCase().includes("android") ||
    device.toLowerCase().includes("phone")
  ) {
    return <Smartphone className="size-5 text-[#77736e]" />;
  }
  if (
    device.toLowerCase().includes("macbook") ||
    device.toLowerCase().includes("windows")
  ) {
    return <Laptop className="size-5 text-[#77736e]" />;
  }
  return <Monitor className="size-5 text-[#77736e]" />;
}

export default function SessionCard({ session, onRevoke }: SessionCardProps) {
  return (
    <div
      className={`rounded-[24px] border bg-white p-5 shadow-xs transition ${
        session.isCurrent
          ? "border-orange-300 bg-orange-50/30"
          : "border-[#e9e5df]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#e9e5df] bg-[#f7f5f2] shadow-xs">
          <DeviceIcon device={session.deviceType || "unknown"} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#242322]">
          {session.deviceType || "Unknown device"}
                </h3>
                {session.isCurrent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-[#77736e] mt-0.5">
                {session.browser || "Unknown browser"} · {session.os || "Unknown OS"}
              </p>
            </div>

            {!session.isCurrent && (
              <button
                type="button"
                onClick={() => onRevoke(session.id)}
                className="shrink-0 flex items-center gap-1.5 rounded-xl border border-[#e4ded5] bg-white px-3 py-1.5 text-xs font-semibold text-[#77716b] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <X className="size-3.5" />
                Revoke
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[#77736e]">
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-[#88827c]" />
              {[session.city, session.country].filter(Boolean).join(", ") || "Location unavailable"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-[#88827c]" />
              {session.isCurrent ? (
                <span className="font-semibold text-emerald-600">
                  ● Active now
                </span>
              ) : (
                `Last active ${session.lastUsedAt ? new Date(session.lastUsedAt).toLocaleString() : "unknown"}`
              )}
            </span>
            <span className="font-mono text-[#88827c]">
              Since {new Date(session.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
