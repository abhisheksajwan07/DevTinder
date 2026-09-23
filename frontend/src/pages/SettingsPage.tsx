import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Github,
  Link as LinkIcon,
  LogOut,
  Monitor,
  Shield,
  User,
} from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { useGitHubConnectionStatus } from "../hooks/onboarding.hooks";
import SectionCard from "../components/settings/SectionCard";
import SettingsRow from "../components/settings/SettingsRow";
import { logoutCurrentSession } from "../services/session.api";

type Section = "account" | "connected" | "security";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("account");
  const user = useAuthStore((state) => state.user);
  const { data: githubStatus } = useGitHubConnectionStatus();
  const sections = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "connected" as const, label: "Connected Accounts", icon: LinkIcon },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  const connectGithub = () => {
    window.location.assign(
      `${import.meta.env.VITE_API_URL || "/v1"}/oauth/github/connect`,
    );
  };

  const handleLogout = async () => {
    await logoutCurrentSession();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#242322]">Settings</h1>
        <p className="mt-0.5 text-xs text-[#77736e]">
          Manage settings supported by the current backend.
        </p>
      </div>
      <div className="flex flex-col gap-5 sm:flex-row">
        <aside className="shrink-0 sm:w-48">
          <div className="rounded-[20px] border border-[#e9e5df] bg-white p-2 shadow-xs">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold ${activeSection === id ? "bg-orange-50 text-orange-600" : "text-[#55504b] hover:bg-[#f7f5f2]"}`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
            <div className="my-2 h-px bg-[#f0ece6]" />
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          {activeSection === "account" && (
            <SectionCard title="Account">
              <SettingsRow
                label="Email address"
                description={user?.email ?? "Unavailable"}
                action={
                  <span className="text-xs text-[#88827c]">Read only</span>
                }
              />
              <SettingsRow
                label="Profile"
                description="Manage your public developer profile"
                action={
                  <button
                    type="button"
                    onClick={() => navigate("/app/profile")}
                    className="text-xs font-semibold text-orange-600 hover:underline"
                  >
                    Open profile
                  </button>
                }
              />
            </SectionCard>
          )}

          {activeSection === "connected" && (
            <SectionCard title="Connected Accounts">
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#e9e5df] bg-[#f7f5f2] p-4 sm:flex-row sm:items-center">
                <Github className="size-6 shrink-0 text-[#242322]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#242322]">GitHub</p>
                  <p className="text-xs text-[#77736e]">
                    {githubStatus?.connected ? "Connected" : "Not connected"}
                  </p>
                </div>
                {githubStatus?.connected ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                    <Check className="size-3" />
                    Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={connectGithub}
                    className="rounded-2xl bg-[#1a1918] px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
                  >
                    Connect
                  </button>
                )}
              </div>
            </SectionCard>
          )}

          {activeSection === "security" && (
            <SectionCard title="Security">
              <SettingsRow
                label="Active sessions"
                description="Review devices signed into your account and revoke sessions."
                action={
                  <button
                    type="button"
                    onClick={() => navigate("/app/sessions")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline"
                  >
                    <Monitor className="size-3.5" />
                    Manage
                  </button>
                }
              />
              <p className="mt-4 rounded-2xl bg-[#f7f5f2] p-4 text-xs leading-relaxed text-[#77736e]">
                Password reset is available from the sign-in screen. Two-factor
                authentication and account deletion are not implemented by the
                current backend.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
