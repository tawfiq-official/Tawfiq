import React, { useMemo, useState } from "react";
import { parseISO, differenceInDays } from "date-fns";
import { PRAYERS } from "@/lib/prayerUtils";

export default function LifetimeProjection({ logs }) {
  const [age, setAge] = useState("");

  const stats = useMemo(() => {
    if (logs.length === 0) return null;
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = parseISO(sorted[0].date);
    const daysTracked = differenceInDays(new Date(), firstDate) + 1;

    let completed = 0;
    logs
      .filter((l) => !l.is_exempt)
      .forEach((l) =>
        PRAYERS.forEach((p) => {
          if (
            l.prayers?.[p] &&
            l.prayers[p] !== "none" &&
            l.prayers[p] !== "missed"
          )
            completed++;
        }),
      );

    const dailyAvg = daysTracked > 0 ? completed / daysTracked : 0;

    return { daysTracked, completed, dailyAvg };
  }, [logs]);

  const ageNum = parseInt(age) || 0;
  const lifeExpectancy = 70;
  const yearsLeft = ageNum > 0 ? Math.max(0, lifeExpectancy - ageNum) : null;
  const lifetimePotential =
    yearsLeft !== null ? Math.round(yearsLeft * 365 * 5) : null;
  const lifetimeEstCompleted =
    yearsLeft !== null && stats
      ? Math.round(stats.completed + yearsLeft * 365 * stats.dailyAvg)
      : null;

  if (!stats)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Log prayers to see lifetime projections.
        </p>
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Lifetime Salah Projection
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Perspective on lifelong worship
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-secondary rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-foreground tabular-nums">
            {stats.daysTracked.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Days Tracked
          </p>
        </div>
        <div className="bg-secondary rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-green-600 tabular-nums">
            {stats.completed.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Prayers Completed
          </p>
        </div>
      </div>

      <div className="border border-border rounded-xl px-3 py-3 mb-3">
        <p className="text-xs text-muted-foreground mb-2">
          Enter your age for lifetime projection
        </p>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Your age…"
          min="10"
          max="100"
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {lifetimePotential !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5">
            <span className="text-xs text-muted-foreground">
              Remaining potential prayers
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {lifetimePotential.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-3 py-2.5">
            <span className="text-xs text-muted-foreground">
              Estimated lifetime total
            </span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {lifetimeEstCompleted?.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
