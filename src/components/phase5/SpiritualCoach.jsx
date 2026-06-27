import React, { useMemo } from "react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

function buildObservations(logs) {
  const obs = [];
  const recent = logs.filter((l) => !l.is_exempt).slice(0, 14);
  if (recent.length < 7) return obs;

  // Per-prayer analysis
  PRAYERS.forEach((p) => {
    const tracked = recent.filter(
      (l) => l.prayers?.[p] && l.prayers[p] !== "none",
    );
    if (tracked.length < 5) return;
    const missed = tracked.filter((l) => l.prayers[p] === "missed").length;
    const late = tracked.filter((l) => l.prayers[p] === "late").length;
    const onTime = tracked.filter((l) => l.prayers[p] === "on_time").length;
    const onTimePct = Math.round((onTime / tracked.length) * 100);
    const jamaah = tracked.filter(
      (l) => l.prayers[p] === "on_time" && l.jamaah?.[p],
    ).length;
    const name = PRAYER_NAMES[p];

    if (missed >= 3) {
      obs.push({
        type: "critical",
        observation: `${name} has been missed ${missed} times in the last ${tracked.length} days.`,
        recommendation: `Prioritize ${name} — set a dedicated reminder and prepare in advance.`,
      });
    } else if (late >= 4 && p === "fajr") {
      obs.push({
        type: "warning",
        observation: `Fajr is being prayed late ${late} times recently.`,
        recommendation: `Try sleeping earlier to wake up before Fajr naturally.`,
      });
    } else if (late >= 3) {
      obs.push({
        type: "warning",
        observation: `${name} is frequently prayed late (${late} times recently).`,
        recommendation: `Set an earlier reminder for ${name} to build the habit of praying on time.`,
      });
    } else if (onTimePct >= 85 && jamaah < onTime * 0.3 && p !== "fajr") {
      obs.push({
        type: "growth",
        observation: `${name} on-time rate is strong at ${onTimePct}%. Jama'ah attendance is low.`,
        recommendation: `Consider attending ${name} in congregation — it multiplies your reward 27×.`,
      });
    } else if (onTimePct === 100) {
      obs.push({
        type: "strength",
        observation: `${name} is your most consistent prayer — 100% on time this fortnight.`,
        recommendation: `Build on this strength by adding Sunnah prayers around ${name}.`,
      });
    }
  });

  // Qaza debt observation
  const qazaDays = recent.filter((l) =>
    PRAYERS.some((p) => l.prayers?.[p] === "missed"),
  ).length;
  if (qazaDays >= 5) {
    obs.push({
      type: "critical",
      observation: `Missed prayers have accumulated over ${qazaDays} days this fortnight.`,
      recommendation: `Make up 2–3 missed prayers daily to reduce your Qaza backlog gradually.`,
    });
  }

  // Positive momentum
  const prev7 = logs.filter((l) => !l.is_exempt).slice(7, 14);
  if (recent.slice(0, 7).length >= 5 && prev7.length >= 5) {
    function score(arr) {
      let t = 0,
        o = 0;
      arr.forEach((l) =>
        PRAYERS.forEach((p) => {
          const s = l.prayers?.[p];
          if (s && s !== "none") {
            t++;
            if (s === "on_time") o++;
          }
        }),
      );
      return t > 0 ? o / t : 0;
    }
    const s7 = score(recent.slice(0, 7)),
      sp = score(prev7);
    if (s7 - sp > 0.1) {
      obs.push({
        type: "strength",
        observation: `Your last 7 days are significantly better than the previous 7 days.`,
        recommendation: `You are on an upward trend — maintain your current routine and don't break the momentum.`,
      });
    }
  }

  return obs.slice(0, 5); // cap at 5
}

const TYPE_STYLES = {
  critical: {
    dot: "bg-red-500",
    badge: "text-red-600 bg-red-50 dark:bg-red-950/30",
  },
  warning: {
    dot: "bg-amber-500",
    badge: "text-amber-700 bg-amber-50 dark:bg-amber-950/30",
  },
  growth: {
    dot: "bg-blue-500",
    badge: "text-blue-700 bg-blue-50 dark:bg-blue-950/30",
  },
  strength: {
    dot: "bg-green-500",
    badge: "text-green-700 bg-green-50 dark:bg-green-950/30",
  },
};
const TYPE_LABELS = {
  critical: "Action Required",
  warning: "Needs Attention",
  growth: "Growth Opportunity",
  strength: "Strength",
};

export default function SpiritualCoach({ logs }) {
  const observations = useMemo(() => buildObservations(logs), [logs]);

  if (observations.length === 0)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Spiritual Coach
        </p>
        <p className="text-sm text-muted-foreground">
          Log prayers consistently for 7+ days to receive personalized
          observations.
        </p>
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Spiritual Coach
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Observations based on your prayer data
      </p>
      <div className="space-y-3">
        {observations.map((obs, i) => {
          const style = TYPE_STYLES[obs.type];
          return (
            <div
              key={i}
              className="border border-border rounded-xl p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}
                >
                  {TYPE_LABELS[obs.type]}
                </span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                {obs.observation}
              </p>
              <div className="bg-secondary rounded-lg px-3 py-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Recommendation
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                  {obs.recommendation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
