import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, FolderKanban } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import taskService from "../services/taskService";
import getApiErrorMessage from "../utils/getApiErrorMessage";
import CommentSection from "../components/tasks/CommentSection";

const statusStyles = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-50 text-blue-700",
  review: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
};

const formatLabel = (value = "") => {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "No due date";

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function TaskDetails() {
  const { taskId } = useParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadTask = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await taskService.getTask(taskId);

        if (!cancelled) {
          setTask(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTask();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Loading task...
      </div>
    );
  }

  if (error || !task) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-red-600">
          {error || "Task not found."}
        </p>

        <Link
          to="/tasks"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
        >
          <ArrowLeft size={14} />
          Back to tasks
        </Link>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/tasks"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
      >
        <ArrowLeft size={15} />
        Back to tasks
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-violet-600">Task details</p>

            <h1 className="heading-font mt-2 wrap-break-word text-2xl font-extrabold tracking-tight text-slate-900">
              {task.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <FolderKanban size={14} />
                {task.project?.name || "Unknown project"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                {formatDate(task.dueDate)}
              </span>
            </div>
          </div>

          <span
            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
              statusStyles[task.status] || statusStyles.todo
            }`}
          >
            {formatLabel(task.status)}
          </span>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h2 className="text-xs font-bold text-slate-700">Description</h2>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-500">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            Priority: <strong>{formatLabel(task.priority)}</strong>
          </span>

          <span className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            Created: <strong>{formatDate(task.createdAt)}</strong>
          </span>
        </div>
      </section>

      <CommentSection taskId={task._id} />
    </div>
  );
}
