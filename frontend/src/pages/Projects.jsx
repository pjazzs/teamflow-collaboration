import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  FolderPlus,
  Plus,
  Search,
  Trash2,
  Users,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

import useProjects from "../hooks/useProjects";
import useAuth from "../context/useAuth";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectMembersModal from "../components/projects/ProjectMembersModal";

const statusStyles = {
  planning: "bg-violet-50 text-violet-700",
  "in-progress": "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  "on-hold": "bg-amber-50 text-amber-700",
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

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function Projects() {
  const { user: currentUser } = useAuth();

  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    updateProjectMembers,
  } = useProjects();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectForMembers, setProjectForMembers] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingMembers, setSavingMembers] = useState(false);
  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        (project.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const openCreateForm = () => {
    setSelectedProject(null);
    setPageError("");
    setPageSuccess("");
    setShowForm(true);
  };

  const openEditForm = (project) => {
    setSelectedProject(project);
    setPageError("");
    setPageSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setShowForm(false);
    setSelectedProject(null);
  };

  const handleSubmit = async (projectData) => {
    setSubmitting(true);
    setPageError("");
    setPageSuccess("");

    const result = selectedProject
      ? await updateProject(selectedProject._id, projectData)
      : await createProject(projectData);

    setSubmitting(false);

    if (result.success) {
      setShowForm(false);
      setSelectedProject(null);
    }

    return result;
  };

  const openMembersModal = (project) => {
    setPageError("");
    setPageSuccess("");
    setProjectForMembers(project);
  };

  const closeMembersModal = () => {
    if (savingMembers) return;
    setProjectForMembers(null);
  };

  const handleSaveMembers = async (memberIds) => {
    if (!projectForMembers || savingMembers) return;

    setSavingMembers(true);
    setPageError("");
    setPageSuccess("");

    const result = await updateProjectMembers(projectForMembers._id, memberIds);

    setSavingMembers(false);

    if (result.success) {
      setProjectForMembers(null);
      setPageSuccess(
        `Team members for "${projectForMembers.name}" were updated successfully.`,
      );
    } else {
      setPageError(result.error || "Unable to update project members.");
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This will also permanently delete all tasks belonging to this project.`,
    );

    if (!confirmed) return;

    setPageError("");
    setPageSuccess("");

    const result = await deleteProject(project._id);

    if (!result.success) {
      setPageError(result.error || "Unable to delete this project.");
    }
  };

  const activeCount = projects.filter(
    (project) =>
      project.status === "planning" || project.status === "in-progress",
  ).length;

  const completedCount = projects.filter(
    (project) => project.status === "completed",
  ).length;

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-violet-600">
            Workspace overview
          </p>

          <h1 className="heading-font mt-1 text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[30px]">
            Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize, track, and manage your team's projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
        >
          <Plus size={16} />
          Create project
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium text-slate-500">Total projects</p>
          <p className="heading-font mt-3 text-2xl font-extrabold text-slate-900">
            {projects.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium text-slate-500">Active projects</p>
          <p className="heading-font mt-3 text-2xl font-extrabold text-blue-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium text-slate-500">
            Completed projects
          </p>
          <p className="heading-font mt-3 text-2xl font-extrabold text-emerald-600">
            {completedCount}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-xs outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-400"
          >
            <option value="all">All statuses</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On hold</option>
          </select>
        </div>
      </section>

      {(error || pageError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {pageError || error}
        </div>
      )}

      {pageSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {pageSuccess}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading projects...
        </div>
      ) : filteredProjects.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const members = project.members || [];

            return (
              <article
                key={project._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${project.color || "#6366f1"}18`,
                      color: project.color || "#6366f1",
                    }}
                  >
                    <BriefcaseBusiness size={19} />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditForm(project)}
                      aria-label={`Edit ${project.name}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(project)}
                      aria-label={`Delete ${project.name}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-800">
                      <Link
                        to={`/projects/${project._id}`}
                        className="transition-colors hover:text-violet-600"
                      >
                        {project.name}
                      </Link>
                    </h2>

                    <span
                      className={`rounded-md px-2 py-1 text-[9px] font-semibold ${
                        statusStyles[project.status] || statusStyles.planning
                      }`}
                    >
                      {formatLabel(project.status)}
                    </span>
                  </div>

                  <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400">
                        Project team
                      </p>

                      <div className="mt-2 flex items-center">
                        {members.length > 0 ? (
                          <div className="flex items-center -space-x-2">
                            {members.slice(0, 4).map((member) => (
                              <div
                                key={member._id}
                                title={`${member.name} (${member.role})`}
                                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-100 text-[9px] font-bold text-violet-700"
                              >
                                {getInitials(member.name)}
                              </div>
                            ))}

                            {members.length > 4 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-600">
                                +{members.length - 4}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            No members assigned
                          </span>
                        )}

                        {members.length > 0 && (
                          <span className="ml-2 text-[10px] text-slate-500">
                            {members.length}{" "}
                            {members.length === 1 ? "member" : "members"}
                          </span>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => openMembersModal(project)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-200 px-2.5 py-2 text-[10px] font-semibold text-violet-700 transition hover:bg-violet-50"
                      >
                        {members.length > 0 ? (
                          <Users size={13} />
                        ) : (
                          <UserPlus size={13} />
                        )}
                        Manage
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-[10px] text-slate-400">Priority</p>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        priorityStyles[project.priority] || "text-slate-500"
                      }`}
                    >
                      {formatLabel(project.priority)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Due date</p>
                    <p className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-slate-600">
                      <CalendarDays size={13} />
                      {formatDate(project.dueDate)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <FolderPlus size={26} />
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-800">
            {search || statusFilter !== "all"
              ? "No matching projects"
              : "No projects yet"}
          </h2>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
            {search || statusFilter !== "all"
              ? "Try changing your search or status filter."
              : "Create your first project to start organizing your team's work."}
          </p>

          {!search && statusFilter === "all" && (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
            >
              <Plus size={15} />
              Create project
            </button>
          )}
        </section>
      )}

      {showForm && (
        <ProjectForm
          key={selectedProject?._id || "new-project"}
          project={selectedProject}
          onClose={closeForm}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {projectForMembers && (
        <ProjectMembersModal
          project={projectForMembers}
          onClose={closeMembersModal}
          onSave={handleSaveMembers}
          submitting={savingMembers}
        />
      )}
    </div>
  );
}
