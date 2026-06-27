import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getDayScore } from "@/lib/prayerUtils";
import { format, subDays } from "date-fns";

export default function MomentumIndicator({ logs }) {
  const { state, delta, label } = useMemo(() => {
    const logMap = {};
    logs.forEach((l) => {
      logMap[l.date] = l;
    });

    function avgScore(startDay, count) {
      let sum = 0,
        n = 0;
      for (let i = startDay; i < startDay + count; i++) {
        const d = format(subDays(new Date(), i), "yyyy-MM-dd");
        const l = logMap[d];
        if (l && !l.is_exempt) {
          sum += getDayScore(l.prayers);
          n++;
        }
      }
      return n > 0 ? sum / n : null;
    }

    const recent = avgScore(0, 7);
    const prior = avgScore(7, 7);

    if (recent === null || prior === null)
      return { state: "stable", delta: 0, label: "Not enough data yet" };

    const maxScore = 5;
    const recentPct = (recent / maxScore) * 100;
    const priorPct = (prior / maxScore) * 100;
    const diff = Math.round(recentPct - priorPct);

    let state;
    if (diff >= 5) state = "rising";
    else if (diff <= -5) state = "falling";
    else state = "stable";

    const absDiff = Math.abs(diff);
    const label =
      state === "rising"
        ? `+${absDiff}% improvement over last 14 days`
        : state === "falling"
          ? `-${absDiff}% completion rate over last 14 days`
          : "Consistent performance over last 14 days";

    return { state, delta: diff, label };
  }, [logs]);

  const config = {
    rising: {
      Icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30 border-green-300/50",
      text: "Rising",
    },
    stable: {
      Icon: Minus,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-300/50",
      text: "Stable",
    },
    falling: {
      Icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/30 border-red-300/50",
      text: "Falling",
    },
  }[state];

  return (
    <div className={`rounded-2xl border p-4 ${config.bg}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Momentum
      </p>
      <div className="flex items-center gap-2">
        {state === "rising" && (
          <TrendingUp size={18} className={config.color} />
        )}
        {state === "stable" && <Minus size={18} className={config.color} />}
        {state === "falling" && (
          <TrendingDown size={18} className={config.color} />
        )}
        <span className={`text-lg font-bold ${config.color}`}>
          {config.text}
        </span>
      </div>
      <p className="text-sm text-foreground mt-1">{label}</p>
    </div>
  );
}
