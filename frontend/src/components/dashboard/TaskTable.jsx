import { Clock3, MoreHorizontal } from "lucide-react";

const statusStyles = {
  "In progress": "bg-blue-50 text-blue-700",
  "In review": "bg-amber-50 text-amber-700",
  "To do": "bg-slate-100 text-slate-600",
  Completed: "bg-emerald-50 text-emerald-700",
};

const priorityStyles = {
  High: "text-rose-600",
  Medium: "text-amber-600",
  Low: "text-slate-400",
};

export default function TaskTable({ tasks }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">My tasks</h3>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Keep track of what needs your attention
          </p>
        </div>

        <button className="text-[11px] font-semibold text-violet-600">
          View all →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[610px] text-left">
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
            {tasks.map((task) => (
              <tr key={task.id} className="transition hover:bg-slate-50/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-[9px] font-bold text-violet-700">
                      {task.initials}
                    </span>

                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {task.title}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {task.project}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock3 size={12} />
                    {task.due}
                  </span>
                </td>

                <td
                  className={`px-4 py-3.5 text-[11px] font-semibold ${priorityStyles[task.priority]}`}
                >
                  ● {task.priority}
                </td>

                <td className="px-4 py-3.5">
                  <span
                    className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${statusStyles[task.status]}`}
                  >
                    {task.status}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
