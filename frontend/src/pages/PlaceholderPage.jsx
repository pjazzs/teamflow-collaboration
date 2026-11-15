import { Construction } from "lucide-react";

export default function PlaceholderPage({ title, description }) {
  return (
    <section className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        <Construction size={25} />
      </div>

      <h1 className="heading-font mt-5 text-xl font-extrabold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>

      <span className="mt-5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
        Coming in a future phase
      </span>
    </section>
  );
}
