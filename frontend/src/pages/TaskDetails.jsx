import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  RotateCcw,
  Send,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import taskService from "../services/taskService";
import getApiErrorMessage from "../utils/getApiErrorMessage";
import useAuth from "../context/useAuth";
import CommentSection from "../components/tasks/CommentSection";

const statusStyles = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-50 text-blue-700",
  review: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
};

const formatLabel = (value = "") =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (date) => {
  if (!date) return "No due date";

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function TaskDetails() {
  const { taskId } = useParams();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadTask = async () => {
      try {
        const response = await taskService.getTask(taskId);

        if (!cancelled) {
          setTask(response.data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
          setTask(null);
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

  const handleStatusChange = async (newStatus) => {
    if (!task || updatingStatus) return;

    setUpdatingStatus(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await taskService.updateTaskStatus(task._id, newStatus);

      setTask(response.data);
      setActionSuccess(response.message || "Task status updated.");
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  const assignee =
    task.assignedTo && typeof task.assignedTo === "object"
      ? task.assignedTo
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/tasks"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
      >
        <ArrowLeft size={15} />
        Back to tasks
      </Link>

      {/* Task details */}
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

        {/* Description */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h2 className="text-xs font-bold text-slate-700">Description</h2>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-500">
            {task.description || "No description provided."}
          </p>
        </div>

        {/* Task metadata */}
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            Priority: <strong>{formatLabel(task.priority)}</strong>
          </span>

          <span className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            Created: <strong>{formatDate(task.createdAt)}</strong>
          </span>
        </div>

        {/* Assigned member */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-700">
            <UserRound size={15} />
            Assigned member
          </h2>

          {assignee ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                {getInitials(assignee.name)}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {assignee.name}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {assignee.email}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              This task has not been assigned to a member.
            </p>
          )}
        </div>
      </section>

      {/* Task workflow */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Task progress</h2>

            <p className="mt-1 text-xs text-slate-400">
              {isAdmin
                ? "Review and manage the task's progress."
                : "Update your progress and submit work for approval."}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
              statusStyles[task.status] || statusStyles.todo
            }`}
          >
            {formatLabel(task.status)}
          </span>
        </div>

        {actionError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600"
          >
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700"
          >
            {actionSuccess}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {task.status === "todo" && (
            <button
              type="button"
              onClick={() => handleStatusChange("in-progress")}
              disabled={updatingStatus}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Clock3 size={15} />
              {updatingStatus ? "Updating..." : "Start task"}
            </button>
          )}

          {task.status === "in-progress" && (
            <button
              type="button"
              onClick={() => handleStatusChange("review")}
              disabled={updatingStatus}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              <Send size={15} />
              {updatingStatus ? "Submitting..." : "Submit for review"}
            </button>
          )}

          {task.status === "review" && (
            <>
              {isAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("completed")}
                    disabled={updatingStatus}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} />
                    {updatingStatus ? "Approving..." : "Approve task"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange("in-progress")}
                    disabled={updatingStatus}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                  >
                    <RotateCcw size={15} />
                    Return for corrections
                  </button>
                </>
              ) : (
                <p className="text-xs font-medium text-amber-600">
                  Your task has been submitted and is awaiting admin approval.
                </p>
              )}
            </>
          )}

          {task.status === "completed" && (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <CheckCircle2 size={18} />
              Task completed and approved
            </div>
          )}
        </div>
      </section>

      {/* Existing comments */}
      <CommentSection taskId={task._id} />
    </div>
  );
}
