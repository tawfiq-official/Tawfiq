import React, { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

export default function CoachingEngine({ logs }) {
  const tips = useMemo(() => {
    const results = [];
    const nonExempt = logs.filter((l) => !l.is_exempt);
    if (nonExempt.length < 5) return results;

    PRAYERS.forEach((p) => {
      const total = nonExempt.length;
      const onTime = nonExempt.filter(
        (l) => l.prayers?.[p] === "on_time",
      ).length;
      const rate = onTime / total;

      if (p === "fajr" && rate < 0.5) {
        results.push(
          "Sleeping before 10:30 PM is strongly associated with Fajr consistency. Try adjusting your sleep time this week.",
        );
      }
      if (p === "asr") {
        const weekdayMisses = nonExempt.filter((l) => {
          const dow = new Date(l.date + "T00:00:00").getDay();
          return dow >= 1 && dow <= 5 && l.prayers?.asr === "missed";
        }).length;
        if (weekdayMisses >= 3) {
          results.push(
            "Asr is most often missed on weekdays. Setting a 3:30 PM phone reminder may help.",
          );
        }
      }
      if (rate < 0.4) {
        results.push(
          `${PRAYER_NAMES[p]} has a ${Math.round(rate * 100)}% on-time rate. Setting a dedicated alarm may help.`,
        );
      }
    });

    const jamaahDays = nonExempt.filter(
      (l) => l.jamaah && Object.values(l.jamaah).some(Boolean),
    ).length;
    if (jamaahDays / nonExempt.length < 0.2 && nonExempt.length >= 10) {
      results.push(
        "Praying in congregation (Jama'ah) strengthens consistency. Consider attending the masjid for at least one prayer per day.",
      );
    }

    const sunnahDays = nonExempt.filter(
      (l) => l.quality && Object.values(l.quality).some((q) => q?.sunnah),
    ).length;
    if (sunnahDays / nonExempt.length < 0.2 && nonExempt.length >= 10) {
      results.push(
        "Sunnah prayers reinforce the obligatory prayers. Start with the 2 rakah before Fajr — the most emphasized Sunnah.",
      );
    }

    return results.slice(0, 3);
  }, [logs]);

  if (tips.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={14} className="text-amber-500" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Coaching
        </p>
      </div>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <p
            key={i}
            className="text-sm text-foreground leading-relaxed border-b border-border last:border-0 pb-3 last:pb-0"
          >
            {tip}
          </p>
        ))}
      </div>
    </div>
  );
}
