import { Bell, ChevronDown, Menu, Plus, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../context/useAuth";

const titles = {
  "/": "Overview",
  "/projects": "Projects",
  "/tasks": "My tasks",
  "/team": "Team members",
  "/activity": "Activity",
  "/settings": "Settings",
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function Topbar({ onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const pageTitle =
    titles[location.pathname] ||
    (location.pathname.startsWith("/tasks/") ? "Task details" : "Workspace");

  return (
    <header className="sticky top-0 z-20 flex h-19 w-full min-w-0 items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:gap-4 sm:px-6 lg:px-9">
      {/* Left section */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="heading-font truncate text-lg font-bold text-slate-900">
            {pageTitle}
          </h1>

          <p className="hidden text-[11px] text-slate-400 sm:block">
            Your team's workspace
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <label className="hidden h-10 w-56 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 2xl:flex">
          <Search size={16} className="shrink-0 text-slate-400" />

          <input
            placeholder="Search anything..."
            className="min-w-0 w-full bg-transparent text-xs outline-none"
          />
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <Bell size={17} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        <div className="hidden shrink-0 items-center gap-2 text-xs font-semibold text-slate-600 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">
            {getInitials(user?.name)}
          </span>

          <span className="max-w-28 truncate">{user?.name || "User"}</span>

          <ChevronDown size={14} />
        </div>

        <button
          type="button"
          onClick={() => navigate("/tasks?create=task")}
          className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-2.5 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 sm:gap-2 sm:px-4"
        >
          <Plus size={16} />

          <span className="hidden sm:inline">Create new</span>
        </button>
      </div>
    </header>
  );
}
