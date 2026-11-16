import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  ListTodo,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import useTasks from "../hooks/useTasks";
import useProjects from "../hooks/useProjects";
import TaskForm from "../components/tasks/TaskForm";

const statusStyles = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-50 text-blue-700",
  review: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
};

const priorityStyles = {
  low: "text-slate-500",
  medium: "text-amber-600",
  high: "text-rose-600",
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
    month: "short",
    year: "numeric",
  });
};

export default function Tasks() {
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedCreate = searchParams.get("create") === "task";

  const loading = tasksLoading || projectsLoading;
  const error = pageError || tasksError || projectsError;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const taskProjectId = task.project?._id || task.project || "";

      const matchesProject =
        projectFilter === "all" || taskProjectId === projectFilter;

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return (
        matchesSearch && matchesProject && matchesStatus && matchesPriority
      );
    });
  }, [tasks, search, projectFilter, statusFilter, priorityFilter]);

  const completedCount = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "in-progress",
  ).length;

  const pendingCount = tasks.filter((task) => task.status === "todo").length;

  const openCreateForm = () => {
    clearCreateRequest();
    setSelectedTask(null);
    setPageError("");
    setShowForm(true);
  };
  const openEditForm = (task) => {
    setSelectedTask(task);
    setPageError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (submitting) return;

    setShowForm(false);
    setSelectedTask(null);
    clearCreateRequest();
  };

  const handleSubmit = async (taskData) => {
    setSubmitting(true);
    setPageError("");

    const result = selectedTask
      ? await updateTask(selectedTask._id, taskData)
      : await createTask(taskData);

    setSubmitting(false);

    if (result.success) {
      setShowForm(false);
      setSelectedTask(null);
      clearCreateRequest();
    }

    return result;
  };

  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`,
    );

    if (!confirmed) return;

    setPageError("");

    const result = await deleteTask(task._id);

    if (!result.success) {
      setPageError(result.error || "Unable to delete this task.");
    }
  };

  const handleStatusChange = async (task, status) => {
    setPageError("");

    const result = await updateTask(task._id, { status });

    if (!result.success) {
      setPageError(result.error || "Unable to update task status.");
    }
  };
  const clearCreateRequest = () => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("create");
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-violet-600">
            Workspace overview
          </p>

          <h1 className="heading-font mt-1 text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[30px]">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and track tasks across your projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          disabled={projects.length === 0 || projectsLoading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Create task
        </button>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">To do</p>
            <ListTodo size={18} className="text-slate-400" />
          </div>

          <p className="heading-font mt-3 text-2xl font-extrabold text-slate-900">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">In progress</p>
            <Clock3 size={18} className="text-blue-500" />
          </div>

          <p className="heading-font mt-3 text-2xl font-extrabold text-blue-600">
            {inProgressCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Completed</p>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>

          <p className="heading-font mt-3 text-2xl font-extrabold text-emerald-600">
            {completedCount}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-400"
          >
            <option value="all">All projects</option>

            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-400"
          >
            <option value="all">All statuses</option>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="review">In review</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-400"
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
        </div>
      </section>

      {/* Errors */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Task table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading tasks...
        </div>
      ) : filteredTasks.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">All tasks</h2>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Manage your workspace tasks
              </p>
            </div>

            <span className="text-[11px] font-semibold text-violet-600">
              {filteredTasks.length} tasks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 text-left">
              <thead>
                <tr className="bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Task</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Due date</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="transition hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <Link
                          to={`/tasks/${task._id}`}
                          className="text-xs font-semibold text-slate-700 transition hover:text-violet-600"
                        >
                          {task.title}
                        </Link>

                        {task.description && (
                          <p className="mt-1 max-w-55 truncate text-[10px] text-slate-400">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-[11px] text-slate-500">
                        {task.project?.name || "Unknown project"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-slate-500">
                        <CalendarDays size={12} />
                        {formatDate(task.dueDate)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`text-[11px] font-semibold ${
                          priorityStyles[task.priority] || "text-slate-500"
                        }`}
                      >
                        ● {formatLabel(task.priority)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <select
                        aria-label={`Change status for ${task.title}`}
                        value={task.status}
                        onChange={(event) =>
                          handleStatusChange(task, event.target.value)
                        }
                        className={`rounded-md border-0 px-2 py-1 text-[10px] font-semibold outline-none ${
                          statusStyles[task.status] || statusStyles.todo
                        }`}
                      >
                        <option value="todo">To do</option>
                        <option value="in-progress">In progress</option>
                        <option value="review">In review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(task)}
                          aria-label={`Edit ${task.title}`}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(task)}
                          aria-label={`Delete ${task.title}`}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <ListTodo size={26} />
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-800">
            {search ||
            projectFilter !== "all" ||
            statusFilter !== "all" ||
            priorityFilter !== "all"
              ? "No matching tasks"
              : "No tasks yet"}
          </h2>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
            {search ||
            projectFilter !== "all" ||
            statusFilter !== "all" ||
            priorityFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Create your first task to start tracking your team's work."}
          </p>

          {!search &&
            projectFilter === "all" &&
            statusFilter === "all" &&
            priorityFilter === "all" &&
            projects.length > 0 && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
              >
                <Plus size={15} />
                Create task
              </button>
            )}
        </section>
      )}

      {/* Create/Edit modal */}
      {(showForm || (requestedCreate && projects.length > 0)) && (
        <TaskForm
          key={selectedTask?._id || "new-task"}
          task={selectedTask}
          projects={projects}
          onClose={closeForm}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
