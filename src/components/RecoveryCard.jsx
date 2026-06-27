import React from "react";
import { ArrowRight } from "lucide-react";
import { PRAYER_NAMES, PRAYERS } from "@/lib/prayerUtils";

export default function RecoveryCard({ log, prayerTimes, qazaTotal }) {
  if (!log) return null;

  const prayers = log.prayers || {};
  const missed = PRAYERS.filter((p) => prayers[p] === "missed");
  const pending = PRAYERS.filter((p) => prayers[p] === "none");

  const tasks = [];

  if (qazaTotal > 0)
    tasks.push({
      text: "Complete 1 Qaza prayer from your backlog",
      type: "qaza",
    });
  pending.forEach((p) =>
    tasks.push({
      text: `Pray ${PRAYER_NAMES[p]}${prayerTimes[p] ? ` (${prayerTimes[p]})` : ""}`,
      type: "pending",
    }),
  );
  missed.forEach((p) =>
    tasks.push({ text: `Make up ${PRAYER_NAMES[p]} as Qaza`, type: "missed" }),
  );

  if (tasks.length === 0) return null;

  return (
    <div className="bg-card border border-primary/20 rounded-2xl p-4">
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
        Today's Recovery Plan
      </p>
      <div className="space-y-2">
        {tasks.slice(0, 4).map((task, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <ArrowRight
              size={13}
              className={`mt-0.5 flex-shrink-0 ${
                task.type === "qaza"
                  ? "text-amber-500"
                  : task.type === "missed"
                    ? "text-red-500"
                    : "text-primary"
              }`}
            />
            <p className="text-sm text-foreground">{task.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
