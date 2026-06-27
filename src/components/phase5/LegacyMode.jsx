import React, { useMemo } from "react";
import { parseISO, differenceInDays, differenceInMonths } from "date-fns";
import { PRAYERS } from "@/lib/prayerUtils";

export default function LegacyMode({ logs }) {
  const stats = useMemo(() => {
    if (logs.length === 0) return null;
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const first = parseISO(sorted[0].date);
    const now = new Date();
    const totalDays = differenceInDays(now, first);
    const totalMonths = differenceInMonths(now, first);
    const years = Math.floor(totalDays / 365);
    const remainMonths = totalMonths % 12;

    let totalPrayers = 0,
      onTimePrayers = 0,
      jamaahPrayers = 0;
    logs
      .filter((l) => !l.is_exempt)
      .forEach((l) => {
        PRAYERS.forEach((p) => {
          const s = l.prayers?.[p];
          if (!s || s === "none") return;
          totalPrayers++;
          if (s === "on_time") {
            onTimePrayers++;
            if (l.jamaah?.[p]) jamaahPrayers++;
          }
        });
      });

    const daysLogged = logs.filter((l) => !l.is_exempt).length;
    const prayerAge =
      years > 0
        ? `${years}y ${remainMonths}m`
        : totalMonths > 0
          ? `${totalMonths} months`
          : `${totalDays} days`;

    return {
      totalDays,
      totalMonths,
      years,
      daysLogged,
      totalPrayers,
      onTimePrayers,
      jamaahPrayers,
      prayerAge,
    };
  }, [logs]);

  if (!stats)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Start logging to build your lifetime legacy.
        </p>
      </div>
    );

  const items = [
    { label: "Prayer Age", value: stats.prayerAge },
    { label: "Days Tracked", value: stats.daysLogged.toLocaleString() },
    {
      label: "Total Prayers Logged",
      value: stats.totalPrayers.toLocaleString(),
    },
    { label: "Prayed On Time", value: stats.onTimePrayers.toLocaleString() },
    { label: "Prayed in Jama'ah", value: stats.jamaahPrayers.toLocaleString() },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Legacy Mode
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Your lifetime commitment to prayer
      </p>
      <div className="space-y-2">
        {items.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between bg-secondary rounded-xl px-3 py-3"
          >
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
