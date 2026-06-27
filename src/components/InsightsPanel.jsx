import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, Sun } from "lucide-react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function InsightsPanel({ logs }) {
  const insights = useMemo(() => {
    const nonExempt = logs.filter((l) => !l.is_exempt);
    if (nonExempt.length < 3) return null;

    // Per-prayer on-time rates
    const prayerRates = PRAYERS.map((p) => {
      const rate =
        nonExempt.filter((l) => l.prayers?.[p] === "on_time").length /
        nonExempt.length;
      return { prayer: p, rate };
    });
    const strongest = [...prayerRates].sort((a, b) => b.rate - a.rate)[0];
    const weakest = [...prayerRates].sort((a, b) => a.rate - b.rate)[0];

    // Best/worst day of week
    const dayScores = Array(7)
      .fill(0)
      .map(() => ({ total: 0, completed: 0 }));
    nonExempt.forEach((l) => {
      const dow = new Date(l.date + "T00:00:00").getDay();
      dayScores[dow].total += 5;
      dayScores[dow].completed += Object.values(l.prayers || {}).filter(
        (s) => s === "on_time",
      ).length;
    });
    const dayRates = dayScores.map((d, i) => ({
      day: i,
      rate: d.total > 0 ? d.completed / d.total : 0,
    }));
    const bestDay = [...dayRates].sort((a, b) => b.rate - a.rate)[0];
    const worstDay = [...dayRates].sort((a, b) => a.rate - b.rate)[0];

    // Monthly completion %
    const now = new Date();
    const thisMonth = nonExempt.filter((l) =>
      l.date.startsWith(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      ),
    );
    const monthTotal = thisMonth.length * 5;
    const monthOnTime = thisMonth.reduce(
      (acc, l) =>
        acc +
        Object.values(l.prayers || {}).filter((s) => s === "on_time").length,
      0,
    );
    const monthPct =
      monthTotal > 0 ? Math.round((monthOnTime / monthTotal) * 100) : 0;

    // Avg khushu
    let khushuSum = 0,
      khushuCount = 0;
    nonExempt.forEach((l) => {
      PRAYERS.forEach((p) => {
        const k = l.quality?.[p]?.khushu;
        if (k) {
          khushuSum += k;
          khushuCount++;
        }
      });
    });
    const avgKhushu =
      khushuCount > 0 ? (khushuSum / khushuCount).toFixed(1) : null;

    // Most missed reason
    const reasons = {};
    nonExempt.forEach((l) => {
      PRAYERS.forEach((p) => {
        const r = l.missed_reasons?.[p];
        if (r) reasons[r] = (reasons[r] || 0) + 1;
      });
    });
    const topReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0];
    const totalMissedWithReason = Object.values(reasons).reduce(
      (a, b) => a + b,
      0,
    );
    const topReasonPct =
      topReason && totalMissedWithReason > 0
        ? Math.round((topReason[1] / totalMissedWithReason) * 100)
        : null;

    return {
      strongest,
      weakest,
      bestDay,
      worstDay,
      monthPct,
      avgKhushu,
      topReason,
      topReasonPct,
    };
  }, [logs]);

  if (!insights) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Log at least 3 days to unlock insights.
        </p>
      </div>
    );
  }

  const cards = [
    {
      icon: <TrendingUp size={15} className="text-green-600" />,
      label: "Strongest Prayer",
      value: PRAYER_NAMES[insights.strongest.prayer],
      sub: `${Math.round(insights.strongest.rate * 100)}% on-time`,
      color: "text-green-600",
    },
    {
      icon: <TrendingDown size={15} className="text-red-500" />,
      label: "Needs Attention",
      value: PRAYER_NAMES[insights.weakest.prayer],
      sub: `${Math.round(insights.weakest.rate * 100)}% on-time`,
      color: "text-red-500",
    },
    {
      icon: <Sun size={15} className="text-amber-500" />,
      label: "Best Day",
      value: DAYS[insights.bestDay.day],
      sub: `${Math.round(insights.bestDay.rate * 100)}% completion`,
      color: "text-amber-500",
    },
    {
      icon: <Calendar size={15} className="text-primary" />,
      label: "This Month",
      value: `${insights.monthPct}%`,
      sub: "on-time completion",
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ icon, label, value, sub, color }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-2xl p-3.5"
          >
            <div className="flex items-center gap-1.5 mb-2">
              {icon}
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Narrative insights */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Key Findings
        </p>
        <p className="text-sm text-foreground">
          <span className="font-semibold text-red-500">
            {PRAYER_NAMES[insights.weakest.prayer]}
          </span>{" "}
          has your lowest completion rate at{" "}
          {Math.round(insights.weakest.rate * 100)}%.
        </p>
        <p className="text-sm text-foreground">
          <span className="font-semibold text-amber-500">
            {DAYS[insights.bestDay.day]}
          </span>{" "}
          is your most consistent day.
        </p>
        {insights.avgKhushu && (
          <p className="text-sm text-foreground">
            Average Khushu score:{" "}
            <span className="font-semibold text-primary">
              {insights.avgKhushu}/5
            </span>
          </p>
        )}
        {insights.topReasonPct && (
          <p className="text-sm text-foreground">
            <span className="font-semibold text-red-500">
              {insights.topReasonPct}%
            </span>{" "}
            of missed prayers are due to{" "}
            <span className="font-semibold">{insights.topReason[0]}</span>.
          </p>
        )}
      </div>
    </div>
  );
}
