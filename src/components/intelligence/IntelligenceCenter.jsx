import React from "react";
import {
  Flame,
  Trophy,
  Heart,
  TrendingUp,
  AlertTriangle,
  Target,
  Star,
  Clock,
} from "lucide-react";

function StatPill({ label, value, color = "text-foreground", sub }) {
  return (
    <div className="bg-secondary rounded-2xl px-4 py-3 flex flex-col gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold tabular-nums leading-tight ${color}`}>
        {value ?? "—"}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function IntelligenceCenter({
  streak,
  bestStreak,
  healthScore,
  strongest,
  weakest,
  momentum,
  risk,
  goal,
  perfect,
  age,
}) {
  const topRisk = risk ? [...risk].sort((a, b) => b.risk - a.risk)[0] : null;
  const healthColor =
    healthScore === null
      ? "text-muted-foreground"
      : healthScore >= 80
        ? "text-green-600"
        : healthScore >= 50
          ? "text-amber-500"
          : "text-red-500";

  return (
    <div className="space-y-3">
      {/* Main score card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Health Score
            </p>
            <p
              className={`text-5xl font-bold tabular-nums leading-tight mt-1 ${healthColor}`}
            >
              {healthScore !== null ? healthScore : "—"}
              {healthScore !== null && (
                <span className="text-xl text-muted-foreground">/100</span>
              )}
            </p>
          </div>
          <div
            className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
            style={{
              borderColor:
                healthScore >= 80
                  ? "hsl(152 52% 28%)"
                  : healthScore >= 50
                    ? "hsl(38 92% 50%)"
                    : "hsl(0 75% 55%)",
            }}
          >
            <Heart size={22} className={healthColor} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="text-center bg-secondary rounded-xl py-2.5">
            <p className="text-lg font-bold text-foreground tabular-nums">
              {streak ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
          <div className="text-center bg-secondary rounded-xl py-2.5">
            <p className="text-lg font-bold text-foreground tabular-nums">
              {bestStreak ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Best</p>
          </div>
          <div className="text-center bg-secondary rounded-xl py-2.5">
            <p className="text-lg font-bold text-foreground tabular-nums">
              {perfect?.perfectDays ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Perfect</p>
          </div>
          <div className="text-center bg-secondary rounded-xl py-2.5">
            <p
              className={`text-lg font-bold tabular-nums ${momentum?.delta > 0 ? "text-green-600" : momentum?.delta < 0 ? "text-red-500" : "text-foreground"}`}
            >
              {momentum
                ? (momentum.delta > 0 ? "+" : "") + momentum.delta + "%"
                : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Trend</p>
          </div>
        </div>
      </div>

      {/* Strengths & struggles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Strongest
          </p>
          <div className="flex items-center gap-2">
            <Star size={16} className="text-green-600" />
            <p className="text-sm font-bold text-foreground">
              {strongest?.name ?? "—"}
            </p>
          </div>
          {strongest && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              {strongest.pct}% on time
            </p>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Weakest
          </p>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <p className="text-sm font-bold text-foreground">
              {weakest?.name ?? "—"}
            </p>
          </div>
          {weakest && (
            <p className="text-xs text-amber-500 mt-1 font-medium">
              {weakest.pct}% on time
            </p>
          )}
        </div>
      </div>

      {/* Current goal */}
      {goal && (
        <div className="bg-primary/10 border border-primary/25 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target size={15} className="text-primary" />
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              Current Goal
            </p>
          </div>
          <p className="text-sm font-semibold text-foreground">{goal.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{goal.desc}</p>
          {goal.next && (
            <p className="text-xs text-primary mt-2 font-medium">
              → Next: {goal.next}
            </p>
          )}
        </div>
      )}

      {/* Risk alert */}
      {topRisk && topRisk.risk >= 40 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} className="text-red-500" />
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              Risk Alert
            </p>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {topRisk.name} at risk
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {topRisk.risk}% risk score based on recent pattern. Take action
            today.
          </p>
        </div>
      )}

      {/* Salah age */}
      {age && (
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Prayer Age
            </p>
            <p className="text-xl font-bold text-foreground mt-1">
              {age.years > 0 ? `${age.years}y ` : ""}
              {age.months > 0 ? `${age.months}m ` : ""}
              {age.years === 0 && age.months === 0 ? `${age.days} days` : ""}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {age.days} days tracked
          </p>
        </div>
      )}
    </div>
  );
}
