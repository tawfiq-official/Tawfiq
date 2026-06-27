import React from "react";
import { TrendingUp } from "lucide-react";

export default function FutureSelfSimulator({ future }) {
  if (!future)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Log prayers for at least 7 days to see your future projections.
        </p>
      </div>
    );

  const {
    currentPct,
    proj30,
    proj90,
    proj365,
    currentStreak,
    projStreak30,
    projStreak90,
  } = future;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Future Self Simulator
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        If your current habits continue…
      </p>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Projected Completion Rate
        </p>
        {[
          { label: "Today", value: currentPct, note: "current" },
          { label: "30 Days", value: proj30, note: "projected" },
          { label: "90 Days", value: proj90, note: "projected" },
          { label: "1 Year", value: proj365, note: "projected" },
        ].map(({ label, value, note }) => (
          <div key={label} className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground w-16 flex-shrink-0">
              {label}
            </p>
            <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${value}%`,
                  backgroundColor:
                    note === "current"
                      ? "hsl(220 10% 60%)"
                      : "hsl(152 52% 28%)",
                }}
              />
            </div>
            <p
              className={`text-xs font-bold tabular-nums w-8 text-right ${note === "current" ? "text-muted-foreground" : "text-primary"}`}
            >
              {value}%
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Projected Streak
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Now", value: currentStreak },
            { label: "30 Days", value: projStreak30 },
            { label: "90 Days", value: projStreak90 },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="text-center bg-secondary rounded-xl py-3"
            >
              <p className="text-xl font-bold tabular-nums text-foreground">
                {value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Projections are estimates based on your recent pace.
      </p>
    </div>
  );
}
