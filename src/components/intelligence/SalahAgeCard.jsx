import React from "react";
import { Calendar } from "lucide-react";

export default function SalahAgeCard({ age }) {
  if (!age)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No logs yet. Your Salah Age starts from your first logged prayer.
        </p>
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={15} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Salah Age
        </p>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        {age.years > 0 && (
          <span className="text-4xl font-bold text-foreground tabular-nums">
            {age.years}
            <span className="text-lg text-muted-foreground ml-1">yr</span>
          </span>
        )}
        {age.months > 0 && (
          <span className="text-4xl font-bold text-foreground tabular-nums">
            {age.months}
            <span className="text-lg text-muted-foreground ml-1">mo</span>
          </span>
        )}
        {age.years === 0 && age.months === 0 && (
          <span className="text-4xl font-bold text-foreground tabular-nums">
            {age.days}
            <span className="text-lg text-muted-foreground ml-1">days</span>
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {age.days} total days tracked since {age.since}
      </p>

      <div className="mt-3 bg-secondary rounded-xl px-3 py-2">
        <p className="text-xs text-foreground">
          {age.days < 30 &&
            "You're just getting started. Every prayer is a brick."}
          {age.days >= 30 &&
            age.days < 180 &&
            "Solid foundation. Keep building your practice."}
          {age.days >= 180 &&
            age.days < 365 &&
            "Half a year of tracking. Your commitment shows."}
          {age.days >= 365 &&
            "A full year or more of tracking. SubhanAllah — this is dedication."}
        </p>
      </div>
    </div>
  );
}
