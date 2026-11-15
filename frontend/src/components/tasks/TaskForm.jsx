import { useState } from "react";
import { X } from "lucide-react";

const initialValues = {
  title: "",
  description: "",
  projectId: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
};

const toDateInput = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
};

export default function TaskForm({
  task,
  projects = [],
  onClose,
  onSubmit,
  submitting,
}) {
  const [formData, setFormData] = useState(() => ({
    ...initialValues,
    ...(task
      ? {
          title: task.title || "",
          description: task.description || "",
          projectId: task.project?._id || task.project || "",
          status: task.status || "todo",
          priority: task.priority || "medium",
          dueDate: toDateInput(task.dueDate),
        }
      : {}),
  }));

  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!formData.projectId) {
      setFormError("Please select a project for this task.");
      return;
    }

    const result = await onSubmit({
      ...formData,
      dueDate: formData.dueDate || null,
    });

    if (!result.success) {
      setFormError(result.error || "Unable to save this task.");
    }
  };

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

  const labelClass = "text-xs font-semibold text-slate-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {task ? "Edit task" : "Create a task"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {task
                ? "Update the task details."
                : "Add a new task to one of your projects."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close form"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
              {formError}
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="task-title">
              Task title *
            </label>

            <input
              id="task-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={fieldClass}
              placeholder="e.g. Design the dashboard"
              maxLength={150}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="task-description">
              Description
            </label>

            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${fieldClass} min-h-24 resize-y`}
              placeholder="Describe what needs to be done..."
              maxLength={2000}
              rows={3}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="task-project">
              Project *
            </label>

            <select
              id="task-project"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className={fieldClass}
              required
            >
              <option value="">Select a project</option>

              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>

            {projects.length === 0 && (
              <p className="mt-2 text-[11px] text-amber-600">
                You need to create a project before adding tasks.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="task-status">
                Status
              </label>

              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="review">In review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="task-priority">
                Priority
              </label>

              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="task-due-date">
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || projects.length === 0}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
