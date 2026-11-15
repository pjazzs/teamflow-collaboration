import { CalendarDays, MoreHorizontal } from "lucide-react";

const colors = {
  violet: {
    icon: "bg-violet-100 text-violet-700",
    bar: "bg-violet-500",
  },
  blue: {
    icon: "bg-blue-100 text-blue-700",
    bar: "bg-blue-500",
  },
  orange: {
    icon: "bg-orange-100 text-orange-700",
    bar: "bg-orange-500",
  },
};

const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700",
  "bg-emerald-100 text-emerald-700",
];

export default function ProjectCard({ project }) {
  const theme = colors[project.color];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-extrabold ${theme.icon}`}
        >
          {project.initials}
        </div>

        <button
          aria-label={`More options for ${project.name}`}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-bold text-slate-800">{project.name}</h3>

        <p className="mt-1 min-h-[34px] text-[11px] leading-[17px] text-slate-400">
          {project.description}
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
          className={`h-full rounded-full ${theme.bar}`}
          style={{ width: `${project.progress}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex -space-x-2">
          {project.members.slice(0, 4).map((member, index) => (
            <span
              key={member + index}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold ${avatarColors[index]}`}
            >
              {member}
            </span>
          ))}

          {project.extra > 0 && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-500">
              +{project.extra}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <CalendarDays size={12} />
          {project.due}
        </div>
      </div>
    </article>
  );
}
