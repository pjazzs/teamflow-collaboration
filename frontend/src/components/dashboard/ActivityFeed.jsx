import {
  ArrowUpRight,
  MessageCircle,
  Check,
  Plus,
  MoveRight,
} from "lucide-react";

const icons = {
  completed: Check,
  "commented on": MessageCircle,
  "created a new task": Plus,
  moved: MoveRight,
};

const avatarColors = {
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

export default function ActivityFeed({ activities }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Recent activity</h3>

          <p className="mt-0.5 text-[11px] text-slate-400">
            What's happening across your team
          </p>
        </div>

        <button aria-label="View activity" className="text-violet-600">
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="divide-y divide-slate-100 px-5">
        {activities.map((item) => {
          const Icon = icons[item.action] || Check;

          return (
            <div key={item.id} className="flex gap-3 py-4">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${avatarColors[item.color]}`}
              >
                {item.initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] leading-[18px] text-slate-600">
                  <span className="font-bold text-slate-800">{item.name}</span>{" "}
                  {item.action}{" "}
                  <span className="font-semibold text-slate-700">
                    {item.target}
                  </span>
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {item.project} · {item.time}
                </p>
              </div>

              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                <Icon size={12} />
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
