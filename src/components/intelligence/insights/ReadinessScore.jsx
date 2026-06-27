import React, { useMemo } from "react";
import { PRAYERS } from "@/lib/prayerUtils";

function calcDayReadiness(log) {
  if (!log || log.is_exempt) return null;
  let total = 0,
    earned = 0;
  PRAYERS.forEach((p) => {
    const status = log.prayers?.[p];
    if (status === "none") return;
    total += 4; // max 4 pts per prayer
    if (status === "on_time") earned += 1;
    if (log.jamaah?.[p]) earned += 1;
    if (log.quality?.[p]?.sunnah) earned += 1;
    if (log.quality?.[p]?.dhikr) earned += 1;
  });
  return total > 0 ? Math.round((earned / total) * 100) : null;
}

export default function ReadinessScore({ logs, todayLog }) {
  const { daily, weekly, monthly } = useMemo(() => {
    const daily = calcDayReadiness(todayLog);
    const last7 = logs
      .slice(0, 7)
      .map(calcDayReadiness)
      .filter((v) => v !== null);
    const last30 = logs
      .slice(0, 30)
      .map(calcDayReadiness)
      .filter((v) => v !== null);
    const weekly =
      last7.length > 0
        ? Math.round(last7.reduce((a, b) => a + b, 0) / last7.length)
        : null;
    const monthly =
      last30.length > 0
        ? Math.round(last30.reduce((a, b) => a + b, 0) / last30.length)
        : null;
    return { daily, weekly, monthly };
  }, [logs, todayLog]);

  const color = (v) =>
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
        Prayer Readiness Score
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Today", value: daily },
          { label: "7-Day", value: weekly },
          { label: "30-Day", value: monthly },
        ].map(({ label, value }) => (
          <div key={label} className="text-center bg-secondary rounded-xl py-3">
            <p className={`text-xl font-bold tabular-nums ${color(value)}`}>
              {value !== null ? `${value}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Based on on-time prayer, Jama'ah, Sunnah, and Dhikr.
      </p>
    </div>
  );
}
