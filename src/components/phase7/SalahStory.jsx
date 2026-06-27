import React, { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  parseISO,
} from "date-fns";
import { PRAYERS } from "@/lib/prayerUtils";

function buildStory(logs, monthDate) {
  const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
  const end = format(endOfMonth(monthDate), "yyyy-MM-dd");
  const ml = logs.filter(
    (l) => !l.is_exempt && l.date >= start && l.date <= end,
  );
  if (ml.length === 0) return null;

  let onT = 0,
    late = 0,
    miss = 0,
    tot = 0,
    j = 0,
    nawafil = 0;
  ml.forEach((l) => {
    PRAYERS.forEach((p) => {
      const s = l.prayers?.[p];
      if (!s || s === "none") return;
      tot++;
      if (s === "on_time") {
        onT++;
        if (l.jamaah?.[p]) j++;
      } else if (s === "late") late++;
      else if (s === "missed") miss++;
    });
    nawafil += Object.values(l.nawafil || {}).filter(Boolean).length;
  });

  // Previous month
  const prev = subMonths(monthDate, 1);
  const pStart = format(startOfMonth(prev), "yyyy-MM-dd");
  const pEnd = format(endOfMonth(prev), "yyyy-MM-dd");
  const pl = logs.filter(
    (l) => !l.is_exempt && l.date >= pStart && l.date <= pEnd,
  );
  let pOnT = 0,
    pTot = 0;
  pl.forEach((l) =>
    PRAYERS.forEach((p) => {
      const s = l.prayers?.[p];
      if (s && s !== "none") {
        pTot++;
        if (s === "on_time") pOnT++;
      }
    }),
  );

  const onTimePct = tot > 0 ? Math.round((onT / tot) * 100) : 0;
  const prevPct = pTot > 0 ? Math.round((pOnT / pTot) * 100) : null;
  const delta = prevPct !== null ? onTimePct - prevPct : null;
  const jamaahPct = onT > 0 ? Math.round((j / onT) * 100) : 0;
  const perfect = ml.filter((l) =>
    PRAYERS.every((p) => l.prayers?.[p] === "on_time"),
  ).length;

  // Best week
  const weeks = [0, 1, 2, 3]
    .map((w) => {
      const wl = ml.filter((l) => {
        const day = parseISO(l.date).getDate();
        return day >= w * 7 + 1 && day <= (w + 1) * 7;
      });
      let wt = 0,
        wo = 0;
      wl.forEach((l) =>
        PRAYERS.forEach((p) => {
          const s = l.prayers?.[p];
          if (s && s !== "none") {
            wt++;
            if (s === "on_time") wo++;
          }
        }),
      );
      return { week: w + 1, pct: wt > 0 ? Math.round((wo / wt) * 100) : null };
    })
    .filter((w) => w.pct !== null)
    .sort((a, b) => b.pct - a.pct);
  const bestWeek = weeks[0];

  return {
    month: format(monthDate, "MMMM yyyy"),
    daysLogged: ml.length,
    completed: onT + late,
    onTimePct,
    jamaahPct,
    perfect,
    miss,
    delta,
    bestWeek,
    nawafil,
  };
}

export default function SalahStory({ logs }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const monthDate = useMemo(
    () => subMonths(new Date(), monthOffset),
    [monthOffset],
  );
  const story = useMemo(() => buildStory(logs, monthDate), [logs, monthDate]);

  if (!story)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Salah Story
        </p>
        <p className="text-sm text-muted-foreground">
          No data for {format(monthDate, "MMMM yyyy")}.
        </p>
        {monthOffset > 0 && (
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="text-xs text-primary mt-2"
          >
            ← Newer month
          </button>
        )}
      </div>
    );

  const tone =
    story.delta !== null
      ? story.delta > 5
        ? "one of your strongest months"
        : story.delta < -5
          ? "a challenging month"
          : "a steady month"
      : "a tracked month";

  const lines = [
    `In ${story.month}, you logged ${story.daysLogged} day${story.daysLogged !== 1 ? "s" : ""} and completed ${story.completed} prayers.`,
    story.onTimePct >= 80
      ? `Your on-time rate was ${story.onTimePct}% — excellent consistency.`
      : `Your on-time rate was ${story.onTimePct}%.${story.onTimePct < 60 ? " There is room for improvement." : " Keep building on this."}`,
    story.delta !== null
      ? story.delta > 0
        ? `You improved by ${story.delta}% compared to last month.`
        : story.delta < 0
          ? `You dropped ${Math.abs(story.delta)}% from last month.`
          : `Your performance matched last month.')`
      : null,
    story.bestWeek
      ? `Your strongest week was Week ${story.bestWeek.week} at ${story.bestWeek.pct}% on-time.`
      : null,
    story.jamaahPct > 0
      ? `Jama'ah attendance: ${story.jamaahPct}% of on-time prayers.`
      : null,
    story.miss > 0
      ? `${story.miss} prayers were missed — consider adding ${Math.ceil(story.miss / 30)} Qaza daily to recover.`
      : "No prayers were missed this month — MashaAllah.",
    story.perfect > 0
      ? `You had ${story.perfect} perfect day${story.perfect !== 1 ? "s" : ""} — all 5 on time.`
      : null,
    story.nawafil > 0
      ? `You logged ${story.nawafil} Nawafil prayer${story.nawafil !== 1 ? "s" : ""}.`
      : null,
    `This was ${tone} for you.`,
  ].filter(Boolean);

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Salah Story
          </p>
          <p className="text-base font-bold text-foreground mt-0.5">
            {story.month}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg bg-secondary"
          >
            ← Older
          </button>
          {monthOffset > 0 && (
            <button
              onClick={() => setMonthOffset((o) => o - 1)}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg bg-secondary"
            >
              Newer →
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          {
            label: "On Time",
            value: `${story.onTimePct}%`,
            color: "text-green-600",
          },
          {
            label: "Jama'ah",
            value: `${story.jamaahPct}%`,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Perfect Days",
            value: story.perfect,
            color: "text-primary",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-secondary rounded-xl py-3 text-center">
            <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
