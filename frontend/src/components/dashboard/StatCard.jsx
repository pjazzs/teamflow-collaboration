export default function StatCard({
  label,
  value,
  change,
  detail,
  icon: Icon,
  tone,
}) {
  const tones = {
    violet: "bg-violet-50 text-violet-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon size={18} />
        </span>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <p className="heading-font text-[28px] font-extrabold text-slate-900">
          {value}
        </p>

        <span className="mb-1 rounded-md bg-emerald-50 px-1.5 py-1 text-[10px] font-bold text-emerald-600">
          {change}
        </span>
      </div>

      <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
    </div>
  );
}
