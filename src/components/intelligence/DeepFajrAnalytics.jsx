import React, { useMemo } from "react";
import { Sunrise } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function DeepFajrAnalytics({ logs }) {
  const stats = useMemo(() => {
    const nonExempt = logs.filter((l) => !l.is_exempt);
    if (nonExempt.length === 0) return null;

    const total = nonExempt.filter(
      (l) => l.prayers?.fajr && l.prayers.fajr !== "none",
    ).length;
    const onTime = nonExempt.filter(
      (l) => l.prayers?.fajr === "on_time",
    ).length;
    const late = nonExempt.filter((l) => l.prayers?.fajr === "late").length;
    const missed = nonExempt.filter((l) => l.prayers?.fajr === "missed").length;
    const jamaah = nonExempt.filter(
      (l) => l.prayers?.fajr === "on_time" && l.jamaah?.fajr,
    ).length;

    // Weekend vs weekday
    const weekendLogs = nonExempt.filter((l) => {
      const d = parseISO(l.date).getDay();
      return d === 0 || d === 6;
    });
    const weekdayLogs = nonExempt.filter((l) => {
      const d = parseISO(l.date).getDay();
      return d !== 0 && d !== 6;
    });
    function onTimeRate(arr) {
      const t = arr.filter(
        (l) => l.prayers?.fajr && l.prayers.fajr !== "none",
      ).length;
      const o = arr.filter((l) => l.prayers?.fajr === "on_time").length;
      return t > 0 ? Math.round((o / t) * 100) : null;
    }

    // Monthly trend (last 3 months)
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mKey = format(d, "yyyy-MM");
      const mLogs = nonExempt.filter((l) => l.date.startsWith(mKey));
      months.push({
        label: format(d, "MMM"),
        rate: onTimeRate(mLogs),
      });
    }

    const wakeRate =
      total > 0 ? Math.round(((onTime + late) / total) * 100) : null;
    const onTimeRate2 = total > 0 ? Math.round((onTime / total) * 100) : null;

    return {
      total,
      onTime,
      late,
      missed,
      jamaah,
      wakeRate,
      onTimeRate: onTimeRate2,
      weekendRate: onTimeRate(weekendLogs),
      weekdayRate: onTimeRate(weekdayLogs),
      months,
    };
  }, [logs]);

  if (!stats)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No Fajr data yet. Start logging to unlock Fajr analytics.
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sunrise size={16} className="text-amber-500" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Deep Fajr Analytics
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            {
              label: "Wake-Up Rate",
              value: stats.wakeRate !== null ? `${stats.wakeRate}%` : "—",
              color: stats.wakeRate >= 70 ? "text-green-600" : "text-amber-500",
            },
            {
              label: "On-Time Rate",
              value: stats.onTimeRate !== null ? `${stats.onTimeRate}%` : "—",
              color:
                stats.onTimeRate >= 70 ? "text-green-600" : "text-amber-500",
            },
            { label: "Jama'ah", value: stats.jamaah, color: "text-foreground" },
            {
              label: "Missed",
              value: stats.missed,
              color: stats.missed > 5 ? "text-red-500" : "text-foreground",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-secondary rounded-xl px-3 py-3 text-center"
            >
              <p className={`text-xl font-bold tabular-nums ${color}`}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Weekend vs Weekday */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Weekend vs Weekday
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Weekday", value: stats.weekdayRate },
              { label: "Weekend", value: stats.weekendRate },
            ].map(({ label, value }) => (
              <div
                key={label}
                className={`rounded-xl px-3 py-2.5 text-center ${value !== null && value < 50 ? "bg-red-50 dark:bg-red-950/30" : "bg-secondary"}`}
              >
                <p
                  className={`text-base font-bold ${value !== null && value < 50 ? "text-red-500" : "text-foreground"}`}
                >
                  {value !== null ? `${value}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          {stats.weekendRate !== null &&
            stats.weekdayRate !== null &&
            stats.weekendRate < stats.weekdayRate - 15 && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                Weekend performance needs improvement.
              </p>
            )}
        </div>

        {/* Monthly trend */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Monthly Trend
          </p>
          <div className="flex items-end gap-2 h-16">
            {stats.months.map(({ label, rate }) => (
              <div
                key={label}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full flex flex-col justify-end"
                  style={{ height: "48px" }}
                >
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: rate !== null ? `${(rate / 100) * 48}px` : "2px",
                      minHeight: "2px",
                      backgroundColor:
                        rate !== null && rate >= 70
                          ? "hsl(152 52% 28%)"
                          : rate !== null
                            ? "hsl(38 92% 50%)"
                            : "hsl(220 10% 80%)",
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fajr improvement tips */}
      {stats.onTimeRate !== null && stats.onTimeRate < 60 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
            Fajr Improvement Tips
          </p>
          <div className="space-y-2">
            {[
              "🌙 Sleep earlier — aim for Isha + 1h",
              '📵 Set phone to "Prayer" mode at night',
              "⏰ Place alarm across the room",
              "🤲 Make intention (niyyah) before sleeping",
            ].map((tip) => (
              <p
                key={tip}
                className="text-xs text-amber-800 dark:text-amber-300"
              >
                {tip}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
