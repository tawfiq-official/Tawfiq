import React, { useMemo } from "react";
import { format, startOfMonth, getDaysInMonth } from "date-fns";
import { PRAYERS } from "@/lib/prayerUtils";

export default function MissedOpportunity({ logs }) {
  const stats = useMemo(() => {
    const now = new Date();
    const monthKey = format(now, "yyyy-MM");
    const dayOfMonth = now.getDate();
    const ml = logs.filter((l) => !l.is_exempt && l.date.startsWith(monthKey));

    const potential = dayOfMonth * 5;
    let completed = 0,
      missed = 0;
    ml.forEach((l) =>
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (!s || s === "none") return;
        if (s !== "missed") completed++;
        else missed++;
      }),
    );
    const unlogged = potential - completed - missed;
    const completionPct =
      potential > 0 ? Math.round((completed / potential) * 100) : 0;

    return {
      potential,
      completed,
      missed,
      unlogged,
      completionPct,
      month: format(now, "MMMM"),
    };
  }, [logs]);

  const { potential, completed, missed, completionPct, month } = stats;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Missed Opportunity
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        {month} — awareness without guilt
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Potential", value: potential, color: "text-foreground" },
          { label: "Completed", value: completed, color: "text-green-600" },
          {
            label: "Missed",
            value: missed,
            color: missed > 0 ? "text-red-500" : "text-muted-foreground",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-secondary rounded-xl py-3 text-center">
            <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-secondary rounded-xl px-3 py-2.5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Month completion</span>
          <span className="font-bold text-foreground tabular-nums">
            {completionPct}%
          </span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${completionPct >= 80 ? "bg-green-500" : completionPct >= 60 ? "bg-amber-400" : "bg-red-400"}`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
