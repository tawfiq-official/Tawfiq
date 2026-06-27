import React, { useMemo } from "react";
import { getDayScore } from "@/lib/prayerUtils";
import { format } from "date-fns";

export default function SilentAccountability({ logs, perfect }) {
  const thisMonth = useMemo(() => {
    const m = new Date().toISOString().slice(0, 7);
    const mLogs = logs.filter((l) => !l.is_exempt && l.date.startsWith(m));
    const perfectDays = mLogs.filter(
      (l) => getDayScore(l.prayers) === 5,
    ).length;
    const totalDays = mLogs.length;
    const day = new Date().getDate();
    return { perfectDays, totalDays, day };
  }, [logs]);

  const lastMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const m = format(d, "yyyy-MM");
    const mLogs = logs.filter((l) => !l.is_exempt && l.date.startsWith(m));
    const perfectDays = mLogs.filter(
      (l) => getDayScore(l.prayers) === 5,
    ).length;
    const totalDays = mLogs.length;
    return { perfectDays, totalDays, name: format(d, "MMMM") };
  }, [logs]);

  const ratio =
    thisMonth.totalDays > 0 ? thisMonth.perfectDays / thisMonth.totalDays : 0;
  const note =
    ratio >= 0.95
      ? "One of your strongest months"
      : ratio >= 0.8
        ? "Strong month — keep going"
        : ratio >= 0.6
          ? "Good progress this month"
          : "Room to grow this month";

  if (thisMonth.totalDays === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        This Month
      </p>

      <div className="flex items-baseline gap-2">
        <p className="text-5xl font-bold tabular-nums text-foreground">
          {thisMonth.perfectDays}
        </p>
        <p className="text-muted-foreground text-base">
          / {thisMonth.totalDays} perfect days
        </p>
      </div>

      <p className="text-sm text-foreground font-medium">{note}</p>

      {/* Progress bar */}
      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, ratio * 100)}%`,
            backgroundColor:
              ratio >= 0.8
                ? "hsl(152 52% 28%)"
                : ratio >= 0.5
                  ? "hsl(38 92% 50%)"
                  : "hsl(0 75% 55%)",
          }}
        />
      </div>

      {lastMonth.totalDays > 0 && (
        <div className="bg-secondary rounded-xl px-3 py-2 text-xs">
          <span className="text-muted-foreground">{lastMonth.name}: </span>
          <span className="font-semibold text-foreground">
            {lastMonth.perfectDays}/{lastMonth.totalDays}
          </span>
          <span className="text-muted-foreground"> perfect days</span>
        </div>
      )}
    </div>
  );
}
