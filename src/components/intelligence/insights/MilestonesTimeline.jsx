import React, { useMemo } from "react";
import { CheckCircle } from "lucide-react";
import { PRAYERS, getDayScore } from "@/lib/prayerUtils";
import { format, parseISO } from "date-fns";

function findMilestones(logs) {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const milestones = [];

  let perfectDayStreak = 0,
    perfectDayFirst = false;
  let onTimeCounts = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
  let jamaahTotal = 0;
  let totalCompleted = 0;
  let weekStreak = 0,
    weekPerfect = 0,
    monthStart = null,
    monthPerfect = false;
  const achieved = new Set();

  sorted.forEach((log) => {
    if (log.is_exempt) return;
    const score = getDayScore(log.prayers);
    const isPerfect = score === 5;

    // Count totals
    PRAYERS.forEach((p) => {
      if (log.prayers?.[p] === "on_time" || log.prayers?.[p] === "late")
        totalCompleted++;
      if (log.prayers?.[p] === "on_time") onTimeCounts[p]++;
      if (log.jamaah?.[p]) jamaahTotal++;
    });

    // First perfect day
    if (isPerfect && !achieved.has("first_perfect_day")) {
      achieved.add("first_perfect_day");
      milestones.push({
        date: log.date,
        label: "First Perfect Day",
        icon: "🌟",
      });
    }

    // Streak tracking
    if (isPerfect) {
      perfectDayStreak++;
      if (perfectDayStreak === 7 && !achieved.has("first_perfect_week")) {
        achieved.add("first_perfect_week");
        milestones.push({
          date: log.date,
          label: "First Perfect Week",
          icon: "🔥",
        });
      }
      if (perfectDayStreak === 30 && !achieved.has("first_perfect_month")) {
        achieved.add("first_perfect_month");
        milestones.push({
          date: log.date,
          label: "First Perfect Month",
          icon: "🏆",
        });
      }
    } else {
      perfectDayStreak = 0;
    }

    // Fajr milestones
    if (onTimeCounts.fajr === 100 && !achieved.has("fajr_100")) {
      achieved.add("fajr_100");
      milestones.push({
        date: log.date,
        label: "100 On-Time Fajr Prayers",
        icon: "🌅",
      });
    }

    // Jamaah milestones
    if (jamaahTotal === 500 && !achieved.has("jamaah_500")) {
      achieved.add("jamaah_500");
      milestones.push({
        date: log.date,
        label: "500 Prayers in Congregation",
        icon: "🕌",
      });
    }

    // Total prayers
    if (totalCompleted >= 1000 && !achieved.has("total_1000")) {
      achieved.add("total_1000");
      milestones.push({
        date: log.date,
        label: "1000 Total Prayers Completed",
        icon: "✨",
      });
    }
    if (totalCompleted >= 500 && !achieved.has("total_500")) {
      achieved.add("total_500");
      milestones.push({
        date: log.date,
        label: "500 Total Prayers Completed",
        icon: "⭐",
      });
    }
  });

  return milestones.sort((a, b) => a.date.localeCompare(b.date));
}

export default function MilestonesTimeline({ logs }) {
  const milestones = useMemo(() => findMilestones(logs), [logs]);

  if (milestones.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No milestones yet. Keep praying — your first milestone is close!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Milestones
      </p>
      <div className="space-y-0">
        {milestones.map((m, i) => (
          <div
            key={i}
            className="flex items-start gap-3 pb-4 last:pb-0 relative"
          >
            {i < milestones.length - 1 && (
              <div className="absolute left-[18px] top-7 bottom-0 w-px bg-border" />
            )}
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 text-base z-10">
              {m.icon}
            </div>
            <div className="pt-1.5">
              <p className="text-sm font-semibold text-foreground">{m.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(parseISO(m.date), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
