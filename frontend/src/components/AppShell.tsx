import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { currentUser } from "../mock-data";
import {
  Compass,
  Heart,
  MessageCircle,
  Monitor,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
} from "lucide-react";
import {socket} from 

const navItems = [
  { to: "/app/discover", label: "Discover", icon: Compass },
  { to: "/app/matches", label: "Matches", icon: Heart },
  { to: "/app/chat", label: "Messages", icon: MessageCircle, badge: 2 },
  { to: "/app/sessions", label: "Sessions", icon: Monitor },
  { to: "/app/profile", label: "My Profile", icon: User },
];

export default function AppShell() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[#e9e5df] bg-white fixed top-0 bottom-0 left-0 z-40">
        {/* Brand */}
        <Link
          to="/app/discover"
          className="flex items-center gap-2.5 h-16 px-5 border-b border-[#f0ece6]"
        >
          <div className="grid size-8 place-items-center rounded-xl bg-[#ee7100] text-white shadow-sm shadow-orange-500/30">
            <img src="/dev-tinder.svg" alt="DevTinder" className="size-4.5" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[#242322]">
            DevTinder
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-[#55504b] hover:bg-[#f7f5f2] hover:text-[#242322]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`size-4.5 shrink-0 ${
                      isActive
                        ? "text-orange-500"
                        : "text-[#88827c] group-hover:text-[#55504b]"
                    }`}
                  />
                  <span className="flex-1">{label}</span>
                  {badge ? (
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-orange-500 px-1 font-mono text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-[#f0ece6] p-3 space-y-0.5">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-[#55504b] hover:bg-[#f7f5f2]"
              }`
            }
          >
            <Settings className="size-4.5 text-[#88827c]" />
            Settings
          </NavLink>

          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#55504b] hover:bg-[#f7f5f2] transition-colors"
          >
            <div
              className="size-7 rounded-lg grid place-items-center text-white font-bold text-xs shrink-0"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.avatar}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-[#242322] truncate">
                {currentUser.name}
              </p>
              <p className="font-mono text-[10px] text-[#88827c] truncate">
                @{currentUser.username}
              </p>
            </div>
            <ChevronRight className="size-3.5 text-[#c0b9b1] shrink-0" />
          </button>

          {showUserMenu && (
            <div className="mt-1 rounded-xl border border-[#e9e5df] bg-white shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e9e5df] bg-white/90 backdrop-blur-md px-4">
          <Link to="/app/discover" className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-[#ee7100] text-white shadow-xs">
              <img src="/dev-tinder.svg" alt="DevTinder" className="size-4" />
            </div>
            <span className="text-sm font-bold text-[#242322]">DevTinder</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-8 items-center justify-center rounded-full border border-[#e9e5df] bg-white text-[#55504b] transition hover:bg-[#f7f5f2]"
            >
              <Bell className="size-4" />
              {currentUser.notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-orange-500 font-mono text-[9px] font-bold text-white">
                  {currentUser.notificationCount}
                </span>
              )}
            </button>
            <Link
              to="/app/profile"
              className="size-8 rounded-full grid place-items-center text-white font-bold text-xs"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.avatar}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>

        {/* ── Mobile Bottom Nav ──────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#e9e5df] bg-white/95 backdrop-blur-md">
          <div className="grid grid-cols-5 h-16">
            {navItems.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    isActive ? "text-orange-500" : "text-[#88827c]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon
                        className={`size-5 ${isActive ? "text-orange-500" : ""}`}
                      />
                      {badge ? (
                        <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-orange-500 font-mono text-[9px] font-bold text-white">
                          {badge}
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        isActive ? "text-orange-500" : "text-[#88827c]"
                      }`}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
