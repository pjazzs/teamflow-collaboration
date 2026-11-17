import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ListTodo,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import StatCard from "../components/dashboard/StatCard";
import ProjectCard from "../components/dashboard/ProjectCard";
import TaskTable from "../components/dashboard/TaskTable";
import ActivityFeed from "../components/dashboard/ActivityFeed";

import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";
import useActivities from "../hooks/useActivities";
import useAuth from "../context/useAuth";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  const greeting = getGreeting();

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();

  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
  } = useActivities(5);

  const loading = projectsLoading || tasksLoading;
  const error = projectsError || tasksError;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress",
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "completed",
  ).length;

  const activeProjects = projects.filter(
    (project) => project.status !== "completed",
  );

  const projectCards = activeProjects.map((project) => {
    const projectTasks = tasks.filter(
      (task) => task.project?._id === project._id,
    );

    const completed = projectTasks.filter(
      (task) => task.status === "completed",
    ).length;

    const total = projectTasks.length;

    return {
      ...project,
      totalTasks: total,
      completedTasks: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full min-w-0 space-y-7">
      {/* Welcome section */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="text-xs font-medium text-violet-600">{formattedDate}</p>

          <h1 className="heading-font mt-1 wrap-break-word text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[30px]">
            {greeting}, {firstName} ✦
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? "Here's what's happening with your team today."
              : "Here's what's happening with your projects and tasks today."}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
          >
            <Plus size={16} />
            Create project
          </button>
        )}
      </section>

      {/* Loading and error states */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          Loading your workspace data...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Statistics */}
          <section className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total projects"
              value={projects.length}
              detail={
                isAdmin
                  ? "Projects in your workspace"
                  : "Projects assigned to you"
              }
              icon={BriefcaseBusiness}
              tone="violet"
            />

            <StatCard
              label="Completed projects"
              value={completedProjects}
              detail="Successfully completed"
              icon={CheckCircle2}
              tone="emerald"
            />

            <StatCard
              label="Tasks completed"
              value={completedTasks}
              detail={`Out of ${tasks.length} total tasks`}
              icon={CheckCircle2}
              tone="blue"
            />

            <StatCard
              label="Tasks in progress"
              value={inProgressTasks}
              detail={isAdmin ? "Across all projects" : "Your assigned tasks"}
              icon={ListTodo}
              tone="orange"
            />
          </section>

          {/* Active projects */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="heading-font text-base font-extrabold text-slate-900">
                  Active projects
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {isAdmin
                    ? "A snapshot of what your team is working on"
                    : "A snapshot of your assigned projects"}
                </p>
              </div>

              <Link
                to="/projects"
                className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700"
              >
                All projects
                <ArrowRight size={13} />
              </Link>
            </div>

            {projectCards.length > 0 ? (
              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projectCards.slice(0, 3).map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <BriefcaseBusiness
                  className="mx-auto text-slate-300"
                  size={30}
                />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No active projects yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {isAdmin
                    ? "Create your first project to get started."
                    : "Your assigned projects will appear here."}
                </p>
              </div>
            )}
          </section>

          {/* Tasks and activity */}
          <section className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.85fr)]">
            <div className="min-w-0">
              <TaskTable tasks={tasks.slice(0, 5)} />
            </div>

            <div className="min-w-0">
              <ActivityFeed
                activities={activities}
                loading={activitiesLoading}
                error={activitiesError}
              />
            </div>
          </section>

          {/* Progress banner */}
          <section className="flex flex-col gap-3 rounded-2xl bg-linear-to-r from-violet-700 to-indigo-600 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold">
                A little progress goes a long way.
              </p>

              <p className="mt-1 text-xs text-violet-100">
                {isAdmin
                  ? `Your team has completed ${completedTasks} tasks so far. Keep the momentum going.`
                  : `You've completed ${completedTasks} assigned tasks so far. Keep the momentum going.`}
              </p>
            </div>

            <Link
              to="/tasks"
              className="flex items-center gap-2 self-start rounded-lg bg-white/15 px-3 py-2 text-[11px] font-semibold transition hover:bg-white/25 sm:self-auto"
            >
              View team progress
              <ArrowUpRight size={14} />
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
