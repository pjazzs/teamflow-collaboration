import { Bell, ChevronDown, Menu, Plus, Search } from "lucide-react";

import { useLocation } from "react-router-dom";

const titles = {
  "/": "Overview",
  "/projects": "Projects",
  "/tasks": "My tasks",
  "/team": "Team members",
  "/activity": "Activity",
  "/settings": "Settings",
};

export default function Topbar({ onMenu }) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-9">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="heading-font text-lg font-bold text-slate-900">
            {titles[location.pathname] || "Workspace"}
          </h1>

          <p className="hidden text-[11px] text-slate-400 sm:block">
            Your team's workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <label className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
          <Search size={16} className="text-slate-400" />

          <input
            placeholder="Search anything..."
            className="w-full bg-transparent text-xs outline-none"
          />
        </label>

        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        <button className="hidden items-center gap-2 text-xs font-semibold text-slate-600 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">
            PO
          </span>
          Progress
          <ChevronDown size={14} />
        </button>

        <button className="flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-3 text-xs font-semibold text-white shadow-md shadow-violet-200 hover:bg-violet-700 sm:px-4">
          <Plus size={16} />
          <span className="hidden sm:inline">Create new</span>
        </button>
      </div>
    </header>
  );
}
