import React from "react";
import { Moon } from "lucide-react";
import { PRAYER_NAMES } from "@/lib/prayerUtils";

export default function EndOfDayReflection({ eod, todayLog }) {
  if (!eod || (eod.completedCount === 0 && eod.missedCount === 0)) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Moon size={15} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          End-of-Day Reflection
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl py-3">
          <p className="text-2xl font-bold text-green-600">
            {eod.completedCount}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
        </div>
        <div
          className={`rounded-xl py-3 ${eod.missedCount > 0 ? "bg-red-50 dark:bg-red-950/30" : "bg-secondary"}`}
        >
          <p
            className={`text-2xl font-bold ${eod.missedCount > 0 ? "text-red-500" : "text-muted-foreground"}`}
          >
            {eod.missedCount}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Missed</p>
        </div>
        <div className="bg-secondary rounded-xl py-3">
          <p className="text-sm font-bold text-foreground leading-tight">
            {eod.bestPrayer ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Best</p>
        </div>
      </div>

      {eod.improvement && (
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-2.5">
          <p className="text-xs text-muted-foreground">Tomorrow's focus</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {eod.improvement} — aim earlier
          </p>
        </div>
      )}

      {eod.completedCount === 5 && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-700 rounded-xl px-3 py-2.5">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            ✨ Perfect day — all 5 prayers completed. Alhamdulillah.
          </p>
        </div>
      )}
    </div>
  );
}
