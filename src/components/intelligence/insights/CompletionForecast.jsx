import React, { useMemo } from "react";
import { getDayScore } from "@/lib/prayerUtils";
import { format, subDays, getDaysInMonth, getDaysInYear } from "date-fns";

export default function CompletionForecast({ logs }) {
  const { month, quarter, year } = useMemo(() => {
    const logMap = {};
    logs.forEach((l) => {
      logMap[l.date] = l;
    });

    // 14-day rolling rate
    let sum = 0,
      n = 0;
    for (let i = 1; i <= 14; i++) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      const l = logMap[d];
      if (l && !l.is_exempt) {
        sum += getDayScore(l.prayers);
        n++;
      }
    }
    const rate = n > 0 ? sum / n / 5 : null; // 0-1

    if (rate === null) return { month: null, quarter: null, year: null };

    return {
      month: Math.min(100, Math.round(rate * 100)),
      quarter: Math.min(100, Math.round(rate * 100)),
      year: Math.min(100, Math.round(rate * 100)),
    };
  }, [logs]);

  if (month === null) return null;

  const bar = (v) => ({
    width: `${v}%`,
    backgroundColor:
      v >= 80
        ? "hsl(152 52% 28%)"
        : v >= 60
          ? "hsl(38 92% 50%)"
          : "hsl(0 75% 55%)",
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Completion Forecast
      </p>
      <div className="space-y-3">
        {[
          { label: "Month End", value: month },
          { label: "Quarter End", value: quarter },
          { label: "Year End", value: year },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-foreground">
                {label}
              </span>
              <span className="text-xs font-bold text-muted-foreground tabular-nums">
                {value}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={bar(value)}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2.5">
        Based on your 14-day rolling average.
      </p>
    </div>
  );
}
