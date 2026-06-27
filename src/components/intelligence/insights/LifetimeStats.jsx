import React, { useMemo } from "react";
import { PRAYERS, getDayScore } from "@/lib/prayerUtils";

export default function LifetimeStats({ logs }) {
  const stats = useMemo(() => {
    let total = 0,
      onTime = 0,
      jamaah = 0,
      perfectDays = 0;
    let run = 0,
      bestStreak = 0;

    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

    sorted.forEach((l) => {
      if (l.is_exempt) return;
      const score = getDayScore(l.prayers);
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (s === "on_time" || s === "late") total++;
        if (s === "on_time") onTime++;
        if (l.jamaah?.[p]) jamaah++;
      });
      if (score === 5) {
        perfectDays++;
        run++;
        bestStreak = Math.max(bestStreak, run);
      } else {
        run = 0;
      }
    });

    return {
      total,
      onTime,
      jamaah,
      perfectDays,
      bestStreak,
      onTimePct: total > 0 ? Math.round((onTime / total) * 100) : 0,
    };
  }, [logs]);

  const rows = [
    { label: "Total Prayers Logged", value: stats.total },
    {
      label: "On-Time Prayers",
      value: `${stats.onTime} (${stats.onTimePct}%)`,
    },
    { label: "In Jama'ah", value: stats.jamaah },
    { label: "Perfect Days", value: stats.perfectDays },
    { label: "Best Streak", value: `${stats.bestStreak} days` },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Lifetime Statistics
      </p>
      <div className="space-y-2">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between items-center py-2 border-b border-border last:border-0"
          >
            <span className="text-sm text-foreground">{label}</span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
