import { Clock3, MoreHorizontal } from "lucide-react";

const statusStyles = {
  "in-progress": "bg-blue-50 text-blue-700",
  review: "bg-amber-50 text-amber-700",
  todo: "bg-slate-100 text-slate-600",
  completed: "bg-emerald-50 text-emerald-700",
};

const priorityStyles = {
  high: "text-rose-600",
  medium: "text-amber-600",
  low: "text-slate-400",
};

const formatDate = (date) => {
  if (!date) return "No due date";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
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

const formatLabel = (value = "") => {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function TaskTable({ tasks = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Recent tasks</h3>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Keep track of what needs your attention
          </p>
        </div>

        <span className="text-[11px] font-semibold text-violet-600">
          {tasks.length} tasks
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-152.5 text-left">
          <thead>
            <tr className="bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3">Task</th>
              <th className="px-4 py-3">Due date</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const projectName = task.project?.name || "Unknown project";

                return (
                  <tr
                    key={task._id}
                    className="transition hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-[9px] font-bold text-violet-700">
                          {getInitials(projectName)}
                        </span>

                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            {task.title}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {projectName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Clock3 size={12} />
                        {formatDate(task.dueDate)}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-3.5 text-[11px] font-semibold ${
                        priorityStyles[task.priority] || "text-slate-400"
                      }`}
                    >
                      ● {formatLabel(task.priority)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${
                          statusStyles[task.status] || statusStyles.todo
                        }`}
                      >
                        {formatLabel(task.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        aria-label={`More options for ${task.title}`}
                        className="text-slate-300 hover:text-slate-600"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-10 text-center text-xs text-slate-400"
                >
                  No tasks found. Create a task to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
