import React, { useMemo, useState } from "react";
import { parseISO, getYear, format, startOfMonth, endOfMonth } from "date-fns";
import { PRAYERS } from "@/lib/prayerUtils";
import { computeStreaks } from "@/lib/streakUtils";

function yearStats(logs, year) {
  const yl = logs.filter(
    (l) => !l.is_exempt && l.date.startsWith(year.toString()),
  );
  if (yl.length === 0) return null;
  let onT = 0,
    late = 0,
    miss = 0,
    tot = 0,
    j = 0;
  yl.forEach((l) =>
    PRAYERS.forEach((p) => {
      const s = l.prayers?.[p];
      if (!s || s === "none") return;
      tot++;
      if (s === "on_time") {
        onT++;
        if (l.jamaah?.[p]) j++;
      } else if (s === "late") late++;
      else if (s === "missed") miss++;
    }),
  );
  const perfect = yl.filter((l) =>
    PRAYERS.every((p) => l.prayers?.[p] === "on_time"),
  ).length;
  const onTimePct = tot > 0 ? Math.round((onT / tot) * 100) : 0;
  const jamaahPct = onT > 0 ? Math.round((j / onT) * 100) : 0;

  // Monthly breakdown
  const months = [];
  for (let m = 0; m < 12; m++) {
    const s = format(startOfMonth(new Date(year, m)), "yyyy-MM-dd");
    const e = format(endOfMonth(new Date(year, m)), "yyyy-MM-dd");
    const ml = yl.filter((l) => l.date >= s && l.date <= e);
    if (ml.length === 0) continue;
    let mt = 0,
      mo = 0;
    ml.forEach((l) =>
      PRAYERS.forEach((p) => {
        const s2 = l.prayers?.[p];
        if (s2 && s2 !== "none") {
          mt++;
          if (s2 === "on_time") mo++;
        }
      }),
    );
    months.push({
      label: format(new Date(year, m), "MMM"),
      pct: mt > 0 ? Math.round((mo / mt) * 100) : null,
    });
  }

  return {
    year,
    daysLogged: yl.length,
    onTimePct,
    jamaahPct,
    perfect,
    onTime: onT,
    late,
    missed: miss,
    total: tot,
    months,
  };
}

export default function AnnualBook({ logs }) {
  const years = useMemo(() => {
    const ys = [...new Set(logs.map((l) => getYear(parseISO(l.date))))].sort(
      (a, b) => b - a,
    );
    return ys.map((y) => yearStats(logs, y)).filter(Boolean);
  }, [logs]);

  const [selectedYear, setSelectedYear] = useState(0);

  if (years.length === 0)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Annual Tawfiq Book
        </p>
        <p className="text-sm text-muted-foreground">
          Your annual review will be available after logging prayers for a full
          year.
        </p>
      </div>
    );

  const data = years[selectedYear];
  const colorFor = (v) =>
    v >= 90
      ? "bg-green-500"
      : v >= 75
        ? "bg-green-400"
        : v >= 60
          ? "bg-amber-400"
          : "bg-red-400";

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Annual Tawfiq Book
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Your permanent personal prayer record
      </p>

      {years.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {years.map((y, i) => (
            <button
              key={y.year}
              onClick={() => setSelectedYear(i)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${selectedYear === i ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-secondary"}`}
            >
              {y.year}
            </button>
          ))}
        </div>
      )}

      <p className="text-lg font-bold text-foreground mb-3">
        Tawfiq {data.year} Annual Review
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Days Logged", value: data.daysLogged },
          { label: "On Time", value: `${data.onTimePct}%` },
          { label: "Jama'ah", value: `${data.jamaahPct}%` },
          { label: "Perfect Days", value: data.perfect },
          {
            label: "Prayers Made",
            value: (data.onTime + data.late).toLocaleString(),
          },
          { label: "Prayers Missed", value: data.missed.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-secondary rounded-xl px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Monthly Breakdown
      </p>
      <div className="space-y-1.5">
        {data.months.map(({ label, pct }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-9 flex-shrink-0">
              {label}
            </span>
            <div className="flex-1 bg-secondary rounded-full h-3.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${colorFor(pct || 0)}`}
                style={{ width: `${pct || 0}%` }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums w-9 text-right">
              {pct !== null ? `${pct}%` : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
