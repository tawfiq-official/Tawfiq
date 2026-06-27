import React, { useMemo } from "react";
import { Star } from "lucide-react";
import { getDayScore } from "@/lib/prayerUtils";

export default function PerfectDayEngine({ perfect, logs }) {
  const recent30PerfectDays = useMemo(() => {
    return logs
      .filter((l) => !l.is_exempt)
      .slice(0, 30)
      .filter((l) => getDayScore(l.prayers) === 5).length;
  }, [logs]);

  const thisMonthTotal = useMemo(() => {
    const m = new Date().toISOString().slice(0, 7);
    return logs.filter((l) => !l.is_exempt && l.date.startsWith(m)).length;
  }, [logs]);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Star size={15} className="text-yellow-500" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Perfect Day Engine
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        A perfect day = all 5 prayers on time.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "All Time",
            value: perfect?.perfectDays ?? 0,
            color: "text-yellow-500",
          },
          {
            label: "This Month",
            value: recent30PerfectDays,
            color: "text-primary",
          },
          {
            label: "Perfect Weeks",
            value: perfect?.perfectWeeks ?? 0,
            color: "text-foreground",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center bg-secondary rounded-xl py-3">
            <p className={`text-2xl font-bold tabular-nums ${color}`}>
              {value}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {thisMonthTotal > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl px-3 py-2.5">
          <p className="text-sm text-foreground">
            <span className="font-bold">{recent30PerfectDays}</span>
            <span className="text-muted-foreground"> out of </span>
            <span className="font-bold">{thisMonthTotal}</span>
            <span className="text-muted-foreground">
              {" "}
              days tracked were perfect
            </span>
          </p>
          {recent30PerfectDays >= 25 && (
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
              One of your strongest months. SubhanAllah.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
