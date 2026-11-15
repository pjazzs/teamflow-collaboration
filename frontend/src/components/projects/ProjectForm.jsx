import { useState } from "react";
import { X } from "lucide-react";

const initialValues = {
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  startDate: "",
  dueDate: "",
  color: "#6366f1",
};

const toDateInput = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
};

export default function ProjectForm({
  project,
  onClose,
  onSubmit,
  submitting,
}) {
  const [formData, setFormData] = useState(() => ({
    ...initialValues,
    ...(project
      ? {
          name: project.name || "",
          description: project.description || "",
          status: project.status || "planning",
          priority: project.priority || "medium",
          startDate: toDateInput(project.startDate),
          dueDate: toDateInput(project.dueDate),
          color: project.color || "#6366f1",
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

    if (
      formData.startDate &&
      formData.dueDate &&
      formData.dueDate < formData.startDate
    ) {
      setFormError("The due date cannot be earlier than the start date.");
      return;
    }

    const result = await onSubmit({
      ...formData,
      startDate: formData.startDate || null,
      dueDate: formData.dueDate || null,
    });

    if (!result.success) {
      setFormError(result.error || "Unable to save this project.");
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
              {project ? "Edit project" : "Create a project"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {project
                ? "Update your project information."
                : "Add a new project to your workspace."}
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
            <label className={labelClass} htmlFor="project-name">
              Project name *
            </label>
            <input
              id="project-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={fieldClass}
              placeholder="e.g. Website redesign"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="project-description">
              Description
            </label>
            <textarea
              id="project-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${fieldClass} min-h-24 resize-y`}
              placeholder="What is this project about?"
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="project-status">
                Status
              </label>
              <select
                id="project-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On hold</option>
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="project-priority">
                Priority
              </label>
              <select
                id="project-priority"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="project-start-date">
                Start date
              </label>
              <input
                id="project-start-date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="project-due-date">
                Due date
              </label>
              <input
                id="project-due-date"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="project-color">
              Project color
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                id="project-color"
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
              />
              <span className="text-xs text-slate-400">
                Choose a color to identify this project.
              </span>
            </div>
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
              disabled={submitting}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : project
                  ? "Save changes"
                  : "Create project"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
