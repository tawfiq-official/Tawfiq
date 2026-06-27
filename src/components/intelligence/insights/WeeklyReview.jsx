import React, { useMemo } from "react";
import { PRAYERS, PRAYER_NAMES, getDayScore } from "@/lib/prayerUtils";
import { format, subDays, startOfWeek } from "date-fns";

export default function WeeklyReview({ logs }) {
  const stats = useMemo(() => {
    const weekStart = format(
      startOfWeek(new Date(), { weekStartsOn: 1 }),
      "yyyy-MM-dd",
    );
    const weekLogs = logs.filter((l) => l.date >= weekStart && !l.is_exempt);
    if (weekLogs.length === 0) return null;

    let onTime = 0,
      late = 0,
      missed = 0,
      total = 0,
      jamaahCount = 0;
    const prayerOnTime = {};
    PRAYERS.forEach((p) => {
      prayerOnTime[p] = 0;
    });

    weekLogs.forEach((l) => {
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (!s || s === "none") return;
        total++;
        if (s === "on_time") {
          onTime++;
          prayerOnTime[p]++;
        } else if (s === "late") late++;
        else if (s === "missed") missed++;
        if (l.jamaah?.[p]) jamaahCount++;
      });
    });

    const sorted = PRAYERS.map((p) => ({ p, count: prayerOnTime[p] })).sort(
      (a, b) => b.count - a.count,
    );
    const best = sorted[0];
    const weak = sorted[sorted.length - 1];
    const onTimePct = total > 0 ? Math.round((onTime / total) * 100) : 0;
    const jamaahPct = onTime > 0 ? Math.round((jamaahCount / onTime) * 100) : 0;

    return {
      onTime,
      late,
      missed,
      total,
      onTimePct,
      jamaahPct,
      best: PRAYER_NAMES[best.p],
      weak: PRAYER_NAMES[weak.p],
    };
  }, [logs]);

  if (!stats)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No prayers logged this week yet.
        </p>
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        This Week
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          {
            label: "Completed",
            value: `${stats.onTime + stats.late}/${stats.total}`,
          },
          { label: "On Time", value: `${stats.onTimePct}%` },
          { label: "Late", value: stats.late },
          { label: "Missed", value: stats.missed },
          { label: "Jama'ah", value: `${stats.jamaahPct}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-secondary rounded-xl px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 text-xs">
        <div className="flex-1 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
          <p className="text-muted-foreground">Best Prayer</p>
          <p className="font-bold text-green-700 dark:text-green-400 mt-0.5">
            {stats.best}
          </p>
        </div>
        <div className="flex-1 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
          <p className="text-muted-foreground">Needs Work</p>
          <p className="font-bold text-red-600 dark:text-red-400 mt-0.5">
            {stats.weak}
          </p>
        </div>
      </div>
    </div>
  );
}
