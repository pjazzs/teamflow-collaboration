import {
  CheckCircle2,
  CirclePlus,
  MessageCircle,
  Pencil,
  Trash2,
  Activity as ActivityIcon,
} from "lucide-react";

const icons = {
  "project-created": CirclePlus,
  "project-updated": Pencil,
  "project-deleted": Trash2,
  "task-created": CirclePlus,
  "task-updated": Pencil,
  "task-completed": CheckCircle2,
  "task-deleted": Trash2,
  "comment-created": MessageCircle,
  "comment-deleted": MessageCircle,
};

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
];

const getInitials = (name = "Team member") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

const formatTime = (date) => {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "Unknown time";
  }

  const difference = Math.max(0, Date.now() - timestamp);

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getActivityContext = (item) => {
  const projectName = item.project?.name || item.metadata?.projectName || "";

  const taskName =
    item.task?.title ||
    (item.entityType === "task" ? item.entityName : "") ||
    (item.entityType === "comment" ? item.entityName : "");

  if (projectName && taskName) {
    return `${projectName} · ${taskName}`;
  }

  return projectName || taskName || item.entityName || "Workspace";
};

export default function ActivityFeed({
  activities = [],
  loading = false,
  error = "",
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Recent activity</h3>

          <p className="mt-0.5 text-[11px] text-slate-400">
            What's happening across your team
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 px-5">
        {loading && (
          <div className="py-8 text-center text-xs text-slate-400">
            Loading recent activity...
          </div>
        )}

        {!loading && error && (
          <div className="py-8 text-center text-xs text-red-500">{error}</div>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="py-8 text-center">
            <ActivityIcon size={25} className="mx-auto text-slate-300" />

            <p className="mt-2 text-xs font-semibold text-slate-600">
              No activity yet
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Project, task, and comment updates will appear here.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          activities.map((item, index) => {
            const Icon = icons[item.action] || ActivityIcon;
            const actorName = item.actorName || "Team member";
            const context = getActivityContext(item);

            return (
              <div key={item._id} className="flex gap-3 py-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                    avatarColors[index % avatarColors.length]
                  }`}
                >
                  {getInitials(actorName)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] leading-4.5 text-slate-600">
                    {item.description}
                  </p>

                  <p className="mt-1 truncate text-[10px] text-slate-400">
                    {context} · {formatTime(item.createdAt)}
                  </p>
                </div>

                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  <Icon size={12} />
                </span>
              </div>
            );
          })}
      </div>
    </section>
  );
}
