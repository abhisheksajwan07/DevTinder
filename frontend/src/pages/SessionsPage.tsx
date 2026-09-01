import { useState } from "react";
import { Shield, LogOut } from "lucide-react";
import ConfirmDialog from "../components/sessions/ConfirmDialog";
import SessionCard from "../components/sessions/SessionCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveSessions, revokeOtherSessions, revokeSession } from "../services/session.api";

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const { data: sessionList = [], isLoading, isError } = useQuery({ queryKey: ["sessions"], queryFn: getActiveSessions });
  const revokeMutation = useMutation({ mutationFn: revokeSession, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }) });
  const revokeAllMutation = useMutation({ mutationFn: revokeOtherSessions, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }) });
  const [confirmAction, setConfirmAction] = useState<null | {
    type: "revoke" | "all";
    sessionId?: string;
  }>(null);
  const [revokedIds, setRevokedIds] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRevoke = (id: string) => {
    revokeMutation.mutate(id);
    setConfirmAction(null);
    setSuccessMsg("Session revoke requested.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleRevokeAll = () => {
    revokeAllMutation.mutate();
    setConfirmAction(null);
    setSuccessMsg("All other sessions signed out.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  if (isLoading) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-[#77736e]">Loading sessions…</div>;
  if (isError) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-red-600">Could not load active sessions.</div>;

  return (
    <>
      {confirmAction && (
        <ConfirmDialog
          title={
            confirmAction.type === "revoke"
              ? "Revoke Session?"
              : "Sign Out All Devices?"
          }
          description={
            confirmAction.type === "revoke"
              ? "This will immediately sign out this device. If it's a device you don't recognize, change your password after revoking."
              : "This will sign you out from all other devices. Your current session will remain active."
          }
          confirmLabel={
            confirmAction.type === "revoke" ? "Revoke Session" : "Sign Out All"
          }
          onConfirm={() => {
            if (confirmAction.type === "revoke" && confirmAction.sessionId) {
              handleRevoke(confirmAction.sessionId);
            } else {
              handleRevokeAll();
            }
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="size-5 text-orange-500" />
            <h1 className="text-xl font-bold text-[#242322]">Active Sessions</h1>
          </div>
          <p className="text-xs text-[#77736e]">
            Manage where your DevTinder account is currently signed in. Revoke
            access for any device you don't recognize.
          </p>
        </div>

        {/* Success Toast */}
        {successMsg && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {successMsg}
          </div>
        )}

        {/* Bulk Action */}
        {sessionList.filter((s) => !s.isCurrent).length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmAction({ type: "all" })}
            className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
          >
            <LogOut className="size-3.5" />
            Sign out all other devices
          </button>
        )}

        {/* Session Cards */}
        <div className="space-y-3">
          {sessionList.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={(id) =>
                setConfirmAction({ type: "revoke", sessionId: id })
              }
            />
          ))}
        </div>

        {/* Empty State */}
        {sessionList.length === 0 && (
          <div className="text-center py-16">
            <Shield className="size-10 text-[#d4cec6] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#242322]">
              No active sessions
            </h3>
            <p className="mt-1.5 text-sm text-[#77736e]">
              All other sessions have been signed out.
            </p>
          </div>
        )}

        {/* Security Tips */}
        <div className="mt-7 rounded-[24px] border border-[#e9e5df] bg-[#f7f5f2] p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-3">
            Security Tips
          </p>
          <ul className="space-y-2 text-xs text-[#55504b]">
            {[
              "Always sign out on shared or public computers",
              "Revoke sessions you don't recognize immediately",
              "Use a strong, unique password for your account",
              "Enable GitHub's two-factor authentication",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-0.5 size-1.5 rounded-full bg-orange-500 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
