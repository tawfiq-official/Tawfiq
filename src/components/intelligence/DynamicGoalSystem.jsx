import React, { useState } from "react";
import { Target, ChevronRight, CheckCircle2 } from "lucide-react";
import { prayerRates } from "@/lib/intelligenceUtils";

export default function DynamicGoalSystem({ logs, goal }) {
  const [checked, setChecked] = useState(false);
  const rates = prayerRates(logs, 14);

  const milestones = [
    { id: 1, label: "3 days in a row", done: rates.some((r) => r.pct >= 50) },
    { id: 2, label: "7-day streak", done: rates.some((r) => r.pct >= 70) },
    { id: 3, label: "14-day streak", done: rates.some((r) => r.pct >= 80) },
    {
      id: 4,
      label: "30-day perfect run",
      done: rates.every((r) => r.pct === null || r.pct >= 80),
    },
  ];

  if (!goal) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Target size={15} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Dynamic Goal
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
        <p className="text-sm font-bold text-foreground">{goal.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{goal.desc}</p>
        {goal.next && (
          <div className="flex items-center gap-1 mt-2">
            <ChevronRight size={12} className="text-primary" />
            <p className="text-xs text-primary font-medium">
              After this: {goal.next}
            </p>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Goal Ladder
        </p>
        {milestones.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center gap-3 py-2 border-b border-border last:border-0"
          >
            {m.done ? (
              <CheckCircle2
                size={15}
                className="text-green-600 flex-shrink-0"
              />
            ) : (
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${i === milestones.findIndex((x) => !x.done) ? "border-primary" : "border-border"}`}
              />
            )}
            <p
              className={`text-sm ${m.done ? "text-muted-foreground line-through" : "text-foreground"}`}
            >
              {m.label}
            </p>
            {i === milestones.findIndex((x) => !x.done) && (
              <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
