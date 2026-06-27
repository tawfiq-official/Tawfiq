import React, { useMemo } from "react";
import { Download } from "lucide-react";
import { PRAYERS, PRAYER_NAMES, getDayScore } from "@/lib/prayerUtils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AnnualReview({ logs }) {
  const year = new Date().getFullYear();

  const stats = useMemo(() => {
    const yearLogs = logs.filter(
      (l) => l.date.startsWith(String(year)) && !l.is_exempt,
    );
    if (yearLogs.length === 0) return null;

    let onTime = 0,
      late = 0,
      missed = 0,
      total = 0,
      jamaahTotal = 0;
    yearLogs.forEach((l) => {
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (s === "on_time") {
          onTime++;
          total++;
        } else if (s === "late") {
          late++;
          total++;
        } else if (s === "missed") {
          missed++;
          total++;
        }
        if (l.jamaah?.[p]) jamaahTotal++;
      });
    });

    const prayerRates = PRAYERS.map((p) => ({
      p,
      rate:
        yearLogs.filter((l) => l.prayers?.[p] === "on_time").length /
        yearLogs.length,
    }));
    const strongest = [...prayerRates].sort((a, b) => b.rate - a.rate)[0];
    const weakest = [...prayerRates].sort((a, b) => a.rate - b.rate)[0];

    // Best month by score
    const monthScores = Array(12)
      .fill(0)
      .map((_, mo) => {
        const prefix = `${year}-${String(mo + 1).padStart(2, "0")}`;
        const ml = yearLogs.filter((l) => l.date.startsWith(prefix));
        if (ml.length === 0) return { mo, avg: 0 };
        const avg =
          ml.reduce((acc, l) => acc + getDayScore(l.prayers), 0) / ml.length;
        return { mo, avg };
      });
    const bestMonth = [...monthScores].sort((a, b) => b.avg - a.avg)[0];

    return {
      total,
      onTime,
      late,
      missed,
      jamaahTotal,
      onTimePct: total > 0 ? Math.round((onTime / total) * 100) : 0,
      latePct: total > 0 ? Math.round((late / total) * 100) : 0,
      missedPct: total > 0 ? Math.round((missed / total) * 100) : 0,
      strongest: PRAYER_NAMES[strongest.p],
      weakest: PRAYER_NAMES[weakest.p],
      bestMonth: MONTHS[bestMonth.mo],
    };
  }, [logs, year]);

  function exportPDF() {
    // Simple text-based PDF using print dialog
    const content = stats
      ? `
Tawfiq — Annual Review ${year}
================================
Total Prayers Logged: ${stats.total}
On-Time: ${stats.onTimePct}%
Late: ${stats.latePct}%
Missed: ${stats.missedPct}%
Jama'ah Prayers: ${stats.jamaahTotal}
Strongest Prayer: ${stats.strongest}
Weakest Prayer: ${stats.weakest}
Best Month: ${stats.bestMonth}
    `.trim()
      : "No data yet.";
    const w = window.open("", "_blank");
    w.document.write(
      `<pre style="font-family:monospace;padding:2rem;white-space:pre-wrap">${content}</pre>`,
    );
    w.document.close();
    w.print();
  }

  if (!stats)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">No data yet for {year}.</p>
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {year} Annual Review
        </p>
        <button
          onClick={exportPDF}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1 transition-colors"
        >
          <Download size={11} /> PDF
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "Total Logged", value: stats.total },
          { label: "On-Time", value: `${stats.onTimePct}%` },
          { label: "Late", value: `${stats.latePct}%` },
          { label: "Missed", value: `${stats.missedPct}%` },
          { label: "In Jama'ah", value: stats.jamaahTotal },
          { label: "Best Month", value: stats.bestMonth },
        ].map(({ label, value }) => (
          <div key={label} className="bg-secondary rounded-xl px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 text-xs">
        <div className="flex-1 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
          <p className="text-muted-foreground">Strongest</p>
          <p className="font-bold text-green-700 dark:text-green-400 mt-0.5">
            {stats.strongest}
          </p>
        </div>
        <div className="flex-1 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
          <p className="text-muted-foreground">Weakest</p>
          <p className="font-bold text-red-600 dark:text-red-400 mt-0.5">
            {stats.weakest}
          </p>
        </div>
      </div>
    </div>
  );
}
