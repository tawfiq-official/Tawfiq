import React, { useMemo } from "react";
import { parseISO, getDay, differenceInDays } from "date-fns";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function bestDay(logs) {
  const map = {};
  DAY_NAMES.forEach((d) => {
    map[d] = { onTime: 0, total: 0 };
  });
  logs
    .filter((l) => !l.is_exempt)
    .forEach((l) => {
      const name = DAY_NAMES[getDay(parseISO(l.date))];
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (!s || s === "none") return;
        map[name].total++;
        if (s === "on_time") map[name].onTime++;
      });
    });
  const ranked = DAY_NAMES.map((d) => ({
    day: d,
    pct:
      map[d].total > 0
        ? Math.round((map[d].onTime / map[d].total) * 100)
        : null,
  }))
    .filter((d) => d.pct !== null)
    .sort((a, b) => b.pct - a.pct);
  return ranked[0]?.day || null;
}

function mostImproved(logs) {
  const recent = logs.filter((l) => !l.is_exempt).slice(0, 30);
  const old = logs.filter((l) => !l.is_exempt).slice(30, 90);
  if (old.length < 14) return null;
  let best = null,
    bestDelta = -Infinity;
  PRAYERS.forEach((p) => {
    function pct(arr) {
      const t = arr.filter((l) => l.prayers?.[p] && l.prayers[p] !== "none");
      const o = t.filter((l) => l.prayers[p] === "on_time").length;
      return t.length > 0 ? (o / t.length) * 100 : null;
    }
    const r = pct(recent),
      o = pct(old);
    if (r !== null && o !== null) {
      const delta = r - o;
      if (delta > bestDelta) {
        bestDelta = delta;
        best = p;
      }
    }
  });
  return best ? PRAYER_NAMES[best] : null;
}

function bestTimeOfDay(logs) {
  let eve = 0,
    eveT = 0,
    mor = 0,
    morT = 0;
  logs
    .filter((l) => !l.is_exempt)
    .forEach((l) => {
      ["fajr"].forEach((p) => {
        if (l.prayers?.[p] && l.prayers[p] !== "none") {
          morT++;
          if (l.prayers[p] === "on_time") mor++;
        }
      });
      ["maghrib", "isha"].forEach((p) => {
        if (l.prayers?.[p] && l.prayers[p] !== "none") {
          eveT++;
          if (l.prayers[p] === "on_time") eve++;
        }
      });
    });
  const morPct = morT > 0 ? mor / morT : 0;
  const evePct = eveT > 0 ? eve / eveT : 0;
  if (morPct === 0 && evePct === 0) return null;
  return morPct >= evePct ? "Morning" : "Evening";
}

export default function SalahDNA({ logs }) {
  const days =
    logs.length > 0
      ? differenceInDays(
          new Date(),
          parseISO(
            [...logs].sort((a, b) => a.date.localeCompare(b.date))[0].date,
          ),
        )
      : 0;

  const ready = days >= 90 && logs.length >= 30;

  const dna = useMemo(() => {
    if (!ready) return null;
    const rates = PRAYERS.map((p) => {
      const t = logs.filter(
        (l) => !l.is_exempt && l.prayers?.[p] && l.prayers[p] !== "none",
      );
      const o = t.filter((l) => l.prayers[p] === "on_time").length;
      return {
        p,
        name: PRAYER_NAMES[p],
        pct: t.length > 0 ? (o / t.length) * 100 : -1,
      };
    })
      .filter((r) => r.pct >= 0)
      .sort((a, b) => b.pct - a.pct);

    return {
      strongest: rates[0]?.name || null,
      weakest: rates[rates.length - 1]?.name || null,
      bestDay: bestDay(logs),
      bestTime: bestTimeOfDay(logs),
      improved: mostImproved(logs),
    };
  }, [logs, ready]);

  if (!ready)
    return (
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Salah DNA Profile
        </p>
        <p className="text-sm text-muted-foreground">
          Available after 90 days of tracking. Keep logging to unlock your
          personal prayer identity.
        </p>
        <div className="mt-3 bg-secondary rounded-xl px-3 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Days tracked</span>
            <span className="font-bold text-foreground tabular-nums">
              {days} / 90
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(100, (days / 90) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    );

  const traits = [
    { label: "Strongest Prayer", value: dna.strongest },
    { label: "Weakest Prayer", value: dna.weakest },
    { label: "Best Day", value: dna.bestDay },
    { label: "Best Time", value: dna.bestTime },
    { label: "Most Improved", value: dna.improved },
  ].filter((t) => t.value);

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Salah DNA Profile
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Your personalized prayer identity
      </p>
      <div className="space-y-2">
        {traits.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5"
          >
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
