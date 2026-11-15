import { CalendarDays, MoreHorizontal } from "lucide-react";

const statusStyles = {
  planning: "bg-violet-50 text-violet-700",
  "in-progress": "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  "on-hold": "bg-amber-50 text-amber-700",
};

const formatDate = (date) => {
  if (!date) return "No due date";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
};

export default function ProjectCard({ project }) {
  const color = project.color || "#6366f1";
  const status = project.status || "planning";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-extrabold"
          style={{
            backgroundColor: `${color}18`,
            color,
          }}
        >
          {getInitials(project.name)}
        </div>

        <button
          aria-label={`More options for ${project.name}`}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800">{project.name}</h3>

          <span
            className={`rounded-md px-2 py-1 text-[9px] font-semibold ${
              statusStyles[status] || statusStyles.planning
            }`}
          >
            {status.replace("-", " ")}
          </span>
        </div>

        <p className="mt-1 min-h-8.5 text-[11px] leading-4.25 text-slate-400">
          {project.description || "No description provided."}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">Progress</span>

        <span className="text-xs font-bold text-slate-700">
          {project.progress}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${project.progress}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-[10px] text-slate-400">
          {project.completedTasks}/{project.totalTasks} tasks completed
        </span>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <CalendarDays size={12} />
          {formatDate(project.dueDate)}
        </div>
      </div>
    </article>
  );
}
