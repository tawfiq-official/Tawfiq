import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { format, subDays } from "date-fns";

export default function FajrRescue({ logs }) {
  const { riskLevel, tips } = useMemo(() => {
    // Count Fajr misses in rolling 14-day window
    const misses = Array(14)
      .fill(0)
      .filter((_, i) => {
        const d = format(subDays(new Date(), i + 1), "yyyy-MM-dd");
        const log = logs.find((l) => l.date === d);
        return log && !log.is_exempt && log.prayers?.fajr === "missed";
      }).length;

    // Count Fajr "oversleep" reasons
    const oversleepCount = logs
      .slice(0, 14)
      .filter((l) => l.missed_reasons?.fajr === "Overslept").length;

    let riskLevel, riskColor;
    if (misses >= 7) {
      riskLevel = "High";
      riskColor = "text-red-500";
    } else if (misses >= 3) {
      riskLevel = "Moderate";
      riskColor = "text-amber-500";
    } else {
      riskLevel = "Low";
      riskColor = "text-green-600";
    }

    const tips = [];
    if (misses >= 3) {
      tips.push("Sleep before 10:30 PM tonight");
      tips.push("Set two alarms — one as backup");
      tips.push("Prepare wudu clothes before sleeping");
    }
    if (oversleepCount >= 2) {
      tips.push("Place your phone across the room");
      tips.push("Reduce screen time before bed");
    }
    if (misses === 0) tips.push("Excellent Fajr consistency — keep it up");

    return { riskLevel, riskColor, tips };
  }, [logs]);

  const isLow = riskLevel === "Low";

  return (
    <div
      className={`bg-card border rounded-2xl p-4 ${isLow ? "border-border" : "border-amber-300/50 dark:border-amber-700/40"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Fajr Rescue
        </p>
        <div className="flex items-center gap-1.5">
          {isLow ? (
            <CheckCircle size={14} className="text-green-600" />
          ) : (
            <AlertTriangle size={14} className="text-amber-500" />
          )}
          <span
            className={`text-xs font-bold ${isLow ? "text-green-600" : riskLevel === "High" ? "text-red-500" : "text-amber-500"}`}
          >
            {riskLevel} Risk
          </span>
        </div>
      </div>
      <div className="space-y-1.5">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-primary mt-0.5 text-xs">•</span>
            <p className="text-sm text-foreground">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
