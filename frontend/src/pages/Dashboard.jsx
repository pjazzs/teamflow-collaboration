import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ListTodo,
  Plus,
  Users,
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import ProjectCard from "../components/dashboard/ProjectCard";
import TaskTable from "../components/dashboard/TaskTable";
import ActivityFeed from "../components/dashboard/ActivityFeed";

import { activities, projects, tasks } from "../data/mockData";

export default function Dashboard() {
  return (
    <div className="space-y-7">
      {/* Welcome section */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-violet-600">
            Sunday, November 15, 2026
          </p>

          <h1 className="heading-font mt-1 text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[30px]">
            Good evening, Progress ✦
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your team today.
          </p>
        </div>

        <button className="flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700">
          <Plus size={16} />
          Create project
        </button>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total projects"
          value="12"
          change="+2.5%"
          detail="Compared to last month"
          icon={BriefcaseBusiness}
          tone="violet"
        />

        <StatCard
          label="Tasks completed"
          value="48"
          change="+8.2%"
          detail="12 completed this week"
          icon={CheckCircle2}
          tone="emerald"
        />

        <StatCard
          label="Tasks in progress"
          value="16"
          change="+4.3%"
          detail="Across all active projects"
          icon={ListTodo}
          tone="blue"
        />

        <StatCard
          label="Team members"
          value="8"
          change="+1 new"
          detail="Working in this workspace"
          icon={Users}
          tone="orange"
        />
      </section>

      {/* Active projects */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="heading-font text-base font-extrabold text-slate-900">
              Active projects
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-400">
              A snapshot of what your team is working on
            </p>
          </div>

          <button className="flex items-center gap-1 text-[11px] font-semibold text-violet-600">
            All projects
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Tasks and activity */}
      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <TaskTable tasks={tasks} />

        <ActivityFeed activities={activities} />
      </section>

      {/* Progress banner */}
      <section className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-600 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold">
            A little progress goes a long way.
          </p>

          <p className="mt-1 text-xs text-violet-100">
            Your team has completed 48 tasks so far. Keep the momentum going.
          </p>
        </div>

        <button className="flex items-center gap-2 self-start rounded-lg bg-white/15 px-3 py-2 text-[11px] font-semibold transition hover:bg-white/25 sm:self-auto">
          View team progress
          <ArrowUpRight size={14} />
        </button>
      </section>
    </div>
  );
}
