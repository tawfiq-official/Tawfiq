import React, { useMemo } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";
import { format } from "date-fns";

export default function SmartForecast({ logs }) {
  const forecasts = useMemo(() => {
    const results = [];
    const nonExempt = logs.filter((l) => !l.is_exempt);
    const recent = nonExempt.slice(0, 14); // last 14 days

    PRAYERS.forEach((p) => {
      const total = recent.length;
      if (total < 3) return;
      const missed = recent.filter((l) => l.prayers?.[p] === "missed").length;
      const rate = missed / total;

      if (rate >= 0.5) {
        results.push({
          prayer: p,
          risk: "High",
          tip: `${PRAYER_NAMES[p]} missed in ${Math.round(rate * 100)}% of recent days.`,
        });
      } else if (rate >= 0.3) {
        results.push({
          prayer: p,
          risk: "Moderate",
          tip: `${PRAYER_NAMES[p]} missed in ${Math.round(rate * 100)}% of recent days.`,
        });
      }
    });

    // Fajr oversleep pattern
    const fajrOversleeps = logs
      .slice(0, 7)
      .filter((l) => l.missed_reasons?.fajr === "Overslept").length;
    if (fajrOversleeps >= 2) {
      results.push({
        prayer: "fajr",
        risk: "High",
        tip: `Recurring oversleep pattern detected for Fajr (${fajrOversleeps} times this week).`,
      });
    }

    return results.slice(0, 4);
  }, [logs]);

  if (forecasts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
        <p className="text-sm text-foreground">
          No prayer risks detected. Keep it up!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Smart Forecast
      </p>
      <div className="space-y-2.5">
        {forecasts.map((f, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-xl border ${
              f.risk === "High"
                ? "bg-red-50 dark:bg-red-950/30 border-red-300/50"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-300/50"
            }`}
          >
            <AlertCircle
              size={14}
              className={`mt-0.5 flex-shrink-0 ${f.risk === "High" ? "text-red-500" : "text-amber-500"}`}
            />
            <div>
              <p
                className={`text-xs font-bold ${f.risk === "High" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}
              >
                {f.risk} Risk — {PRAYER_NAMES[f.prayer]}
              </p>
              <p className="text-xs text-foreground mt-0.5">{f.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
