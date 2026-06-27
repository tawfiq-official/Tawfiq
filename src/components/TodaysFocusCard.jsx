import React, { useMemo } from "react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";
import { computeStreaks } from "@/lib/streakUtils";

export default function TodaysFocusCard({ logs, todayLog, qazaTotal }) {
  const focus = useMemo(() => {
    const { current: streak } = computeStreaks(logs);

    // Check if any prayer already missed today
    const missedToday = todayLog
      ? PRAYERS.filter((p) => todayLog.prayers?.[p] === "missed")
      : [];

    if (missedToday.length > 0) {
      const name = PRAYER_NAMES[missedToday[0]];
      return {
        title: `Recover ${name}`,
        sub: "Make up the missed prayer when possible.",
      };
    }

    // Protect streak
    if (streak >= 7) {
      return {
        title: `Protect Your ${streak}-Day Streak`,
        sub: "Complete all 5 prayers on time today.",
      };
    }

    // Fajr not yet logged
    if (!todayLog?.prayers?.fajr || todayLog.prayers.fajr === "none") {
      return {
        title: "Start With Fajr",
        sub: "The day begins with the first prayer.",
      };
    }

    // Qaza backlog
    if (qazaTotal >= 5) {
      return {
        title: "Complete 2 Qaza Prayers",
        sub: `You have ${qazaTotal} Qaza remaining — reduce it steadily.`,
      };
    }

    // Generic
    return {
      title: "Complete All 5 Prayers Today",
      sub: "Consistency is the foundation.",
    };
  }, [logs, todayLog, qazaTotal]);

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3.5">
      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
        Today's Focus
      </p>
      <p className="text-sm font-bold text-foreground leading-snug">
        {focus.title}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{focus.sub}</p>
    </div>
  );
}
