import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, FolderKanban, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import projectService from "../services/projectService";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const formatLabel = (value = "") => {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "Not specified";

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await projectService.getProject(projectId);

        if (!cancelled) {
          setProject(response.data);
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

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-red-600">
          {error || "Project not found."}
        </p>

        <Link
          to="/projects"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
        >
          <ArrowLeft size={14} />
          Back to projects
        </Link>
      </section>
    );
  }

  const members = project.members || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
      >
        <ArrowLeft size={15} />
        Back to projects
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-violet-600">
              Project details
            </p>

            <h1 className="heading-font mt-2 wrap-break-word text-2xl font-extrabold tracking-tight text-slate-900">
              {project.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <FolderKanban size={14} />
                Project
              </span>

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                Due: {formatDate(project.dueDate)}
              </span>
            </div>
          </div>

          {project.status && (
            <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700">
              {formatLabel(project.status)}
            </span>
          )}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h2 className="text-xs font-bold text-slate-700">Description</h2>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-500">
            {project.description || "No description provided."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            Team members: <strong>{members.length}</strong>
          </span>

          <span className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            Created: <strong>{formatDate(project.createdAt)}</strong>
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Project team</h2>

            <p className="mt-1 text-xs text-slate-500">
              Members assigned to this project.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Users size={19} />
          </div>
        </div>

        {members.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
            <Users className="mx-auto text-slate-300" size={28} />

            <p className="mt-3 text-sm font-semibold text-slate-600">
              No team members assigned
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Assign members from the Projects page.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                  {getInitials(member.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {member.name}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {member.email}
                  </p>
                </div>

                <span className="shrink-0 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold capitalize text-slate-500">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
