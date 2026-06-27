import React, { useMemo } from "react";
import { RotateCcw, Clock } from "lucide-react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";
import { format } from "date-fns";

const PRAYER_DURATION = { fajr: 4, dhuhr: 8, asr: 8, maghrib: 5, isha: 10 }; // minutes estimate

export default function PrayerRecoveryAssistant({ todayLog, logs }) {
  const missed = useMemo(() => {
    if (!todayLog) return [];
    return PRAYERS.filter((p) => todayLog.prayers?.[p] === "missed");
  }, [todayLog]);

  if (missed.length === 0) return null;

  const totalMins = missed.reduce(
    (sum, p) => sum + (PRAYER_DURATION[p] || 8),
    0,
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <RotateCcw size={15} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recovery Plan
        </p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Missed today:</p>
        <div className="space-y-1.5">
          {missed.map((p, i) => (
            <div
              key={p}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2"
            >
              <span className="text-xs font-bold text-red-500">{i + 1}</span>
              <p className="text-sm font-semibold text-foreground flex-1">
                {PRAYER_NAMES[p]}
              </p>
              <p className="text-xs text-muted-foreground">
                Qaza {PRAYER_NAMES[p]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Estimated recovery time
          </p>
        </div>
        <p className="text-sm font-bold text-foreground">{totalMins} minutes</p>
      </div>

      <p className="text-xs text-muted-foreground">
        Add these to your Qaza tracker and make them up as soon as possible. The
        sooner, the lighter the debt.
      </p>
    </div>
  );
}
