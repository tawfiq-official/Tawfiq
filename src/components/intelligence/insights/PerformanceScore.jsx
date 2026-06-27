import React, { useMemo } from "react";
import { PRAYERS } from "@/lib/prayerUtils";
import { format, subDays } from "date-fns";

const STATUS_PTS = { on_time: 100, late: 60, missed: 0, none: 0 };

function scoreLog(log) {
  if (!log || log.is_exempt) return null;
  const vals = PRAYERS.map((p) => STATUS_PTS[log.prayers?.[p] || "none"]);
  const logged = vals.filter(
    (_, i) => log.prayers?.[PRAYERS[i]] !== "none",
  ).length;
  if (logged === 0) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / 5);
}

export default function PerformanceScore({ logs }) {
  const { today, week, month } = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayLog = logs.find((l) => l.date === todayStr);
    const today = scoreLog(todayLog);

    const last7Logs = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = format(subDays(new Date(), i), "yyyy-MM-dd");
        return logs.find((l) => l.date === d);
      })
      .filter(Boolean);
    const last7Scores = last7Logs.map(scoreLog).filter((v) => v !== null);
    const week =
      last7Scores.length > 0
        ? Math.round(
            last7Scores.reduce((a, b) => a + b, 0) / last7Scores.length,
          )
        : null;

    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthLogs = logs.filter((l) => l.date.startsWith(monthPrefix));
    const monthScores = monthLogs.map(scoreLog).filter((v) => v !== null);
    const month =
      monthScores.length > 0
        ? Math.round(
            monthScores.reduce((a, b) => a + b, 0) / monthScores.length,
          )
        : null;

    return { today, week, month };
  }, [logs]);

  const bar = (v) => (v === null ? 0 : v);
  const color = (v) =>
    v === null
      ? "bg-muted"
      : v >= 80
        ? "bg-green-600"
        : v >= 50
          ? "bg-amber-400"
          : "bg-red-500";
  const textColor = (v) =>
    v === null
      ? "text-muted-foreground"
      : v >= 80
        ? "text-green-600"
        : v >= 50
          ? "text-amber-500"
          : "text-red-500";

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Salah Performance Score
      </p>
      <div className="space-y-3">
        {[
          { label: "Today", value: today },
          { label: "This Week", value: week },
          { label: "This Month", value: month },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-foreground">
                {label}
              </span>
              <span
                className={`text-xs font-bold tabular-nums ${textColor(value)}`}
              >
                {value !== null ? `${value}/100` : "—"}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${color(value)}`}
                style={{ width: `${bar(value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2.5">
        On Time = 100 pts · Late = 60 pts · Missed = 0 pts
      </p>
    </div>
  );
}
