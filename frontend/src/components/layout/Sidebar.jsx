import {
  Activity,
  BriefcaseBusiness,
  CheckSquare,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: BriefcaseBusiness },
  { to: "/tasks", label: "My tasks", icon: CheckSquare },
  { to: "/team", label: "Team members", icon: Users },
  { to: "/activity", label: "Activity", icon: Activity },
];

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-65 flex-col border-r border-slate-200 bg-white px-5 py-6 transition-transform duration-200 lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Zap size={21} fill="currentColor" />
          </div>

          <div>
            <h2 className="heading-font text-xl font-extrabold text-slate-900">
              teamflow
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              Workspace
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-9 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
            TF
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">TeamFlow</p>
            <p className="text-xs text-slate-500">Workspace</p>
          </div>

          <ChevronDown size={15} className="text-slate-400" />
        </div>
      </div>

      <p className="mb-3 mt-9 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Workspace
      </p>

      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="mb-5 rounded-2xl bg-violet-50 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-violet-600">
            <Zap size={16} />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            Make teamwork flow
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Bring your projects and people together in one place.
          </p>
        </div>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium ${
              isActive
                ? "bg-violet-50 text-violet-700"
                : "text-slate-500 hover:bg-slate-50"
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>

        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
            {getInitials(user?.name)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800">
              {user?.name}
            </p>
            <p className="text-[11px] capitalize text-slate-400">
              {user?.role || "Member"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
