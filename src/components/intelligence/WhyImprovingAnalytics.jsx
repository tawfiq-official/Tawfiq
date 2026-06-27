import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function WhyImprovingAnalytics({ why }) {
  if (!why)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Log at least 2 weeks of prayers to see improvement analysis.
        </p>
      </div>
    );

  const { delta, recentPct, prevPct, factors } = why;
  const improving = delta > 0;
  const stable = Math.abs(delta) <= 3;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        {stable ? (
          <Minus size={15} className="text-muted-foreground" />
        ) : improving ? (
          <TrendingUp size={15} className="text-green-600" />
        ) : (
          <TrendingDown size={15} className="text-red-500" />
        )}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Why Am I {stable ? "Stable" : improving ? "Improving" : "Declining"}?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary rounded-xl px-3 py-2.5 text-center">
          <p className="text-xs text-muted-foreground">Last 14 Days</p>
          <p
            className={`text-xl font-bold tabular-nums mt-0.5 ${recentPct >= 70 ? "text-green-600" : "text-amber-500"}`}
          >
            {recentPct}%
          </p>
        </div>
        <div className="bg-secondary rounded-xl px-3 py-2.5 text-center">
          <p className="text-xs text-muted-foreground">Previous 14</p>
          <p className="text-xl font-bold tabular-nums text-muted-foreground mt-0.5">
            {prevPct}%
          </p>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
          improving
            ? "bg-green-50 dark:bg-green-950/30"
            : stable
              ? "bg-secondary"
              : "bg-red-50 dark:bg-red-950/30"
        }`}
      >
        <p
          className={`text-lg font-bold tabular-nums ${improving ? "text-green-600" : stable ? "text-muted-foreground" : "text-red-500"}`}
        >
          {delta > 0 ? "+" : ""}
          {delta}%
        </p>
        <p className="text-sm text-muted-foreground">
          {stable
            ? "No significant change"
            : improving
              ? "improvement from previous period"
              : "decline from previous period"}
        </p>
      </div>

      {factors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Contributing Factors
          </p>
          {factors.map((f) => (
            <div key={f} className="flex items-center gap-2 py-1.5">
              <span className="text-green-500 text-sm">✓</span>
              <p className="text-sm text-foreground">{f}</p>
            </div>
          ))}
        </div>
      )}

      {factors.length === 0 && !stable && !improving && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Possible Causes
          </p>
          {[
            "Inconsistent sleep schedule",
            "Lower Jama'ah attendance",
            "Reduced weekly commitment",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 py-1.5">
              <span className="text-amber-500 text-sm">⚠</span>
              <p className="text-sm text-foreground">{f}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
