import React, { useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import {
  calcHealthScore,
  generateGoal,
  calcRiskScore,
  strongestWeakest,
  calcMomentum,
} from "@/lib/intelligenceUtils";
import { computeStreaks } from "@/lib/streakUtils";

const INSIGHTS = [
  (d) =>
    d.strongest
      ? `Your strongest prayer is ${d.strongest.name} at ${d.strongest.pct}% on-time.`
      : null,
  (d) =>
    d.momentum?.delta > 5
      ? `Momentum is rising — up ${d.momentum.delta}% this week.`
      : null,
  (d) =>
    d.momentum?.delta < -5
      ? `Momentum dipped ${Math.abs(d.momentum.delta)}% — let's recover this week.`
      : null,
  (d) =>
    d.streak > 0 ? `You are on a ${d.streak}-day consistency streak.` : null,
  (d) =>
    d.weakest
      ? `${d.weakest.name} needs attention — only ${d.weakest.pct}% on-time.`
      : null,
  (d) =>
    d.topRisk?.risk >= 40
      ? `Risk of missing ${d.topRisk.name} is elevated at ${d.topRisk.risk}%.`
      : null,
];

const IntelligencePreviewCard = memo(function IntelligencePreviewCard({
  logs,
}) {
  const healthScore = useMemo(() => calcHealthScore(logs), [logs]);
  const goal = useMemo(() => generateGoal(logs), [logs]);
  const risk = useMemo(() => calcRiskScore(logs), [logs]);
  const { strongest, weakest } = useMemo(() => strongestWeakest(logs), [logs]);
  const momentum = useMemo(() => calcMomentum(logs), [logs]);
  const { current: streak } = useMemo(() => computeStreaks(logs), [logs]);

  const topRisk = risk ? [...risk].sort((a, b) => b.risk - a.risk)[0] : null;

  const insight = useMemo(() => {
    const data = { strongest, weakest, momentum, streak, topRisk };
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000,
    );
    for (let i = 0; i < INSIGHTS.length; i++) {
      const idx = (dayOfYear + i) % INSIGHTS.length;
      const result = INSIGHTS[idx](data);
      if (result) return result;
    }
    return "Log prayers consistently to unlock personalized insights.";
  }, [strongest, weakest, momentum, streak, topRisk]);

  const riskLevel = !topRisk
    ? "Unknown"
    : topRisk.risk >= 60
      ? "High"
      : topRisk.risk >= 30
        ? "Medium"
        : "Low";

  const riskColor =
    riskLevel === "High"
      ? "text-red-500"
      : riskLevel === "Medium"
        ? "text-amber-500"
        : "text-green-600";

  if (!logs || logs.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
            <Sparkles size={14} className="text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">
            Tawfiq Intelligence
          </p>
        </div>
        <Link
          to="/intelligence"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
        >
          Open <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-secondary rounded-xl px-2.5 py-2.5 text-center">
          <p
            className={`text-lg font-bold tabular-nums ${healthScore !== null ? (healthScore >= 80 ? "text-green-600" : healthScore >= 50 ? "text-amber-500" : "text-red-500") : "text-muted-foreground"}`}
          >
            {healthScore ?? "—"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Health</p>
        </div>
        <div className="bg-secondary rounded-xl px-2.5 py-2.5 text-center">
          <p className={`text-sm font-bold ${riskColor}`}>{riskLevel}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Risk</p>
        </div>
        <div className="bg-secondary rounded-xl px-2.5 py-2.5 text-center">
          <p className="text-sm font-bold text-foreground tabular-nums">
            {streak ?? 0}d
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Streak</p>
        </div>
      </div>

      {goal && (
        <div className="bg-primary/8 border border-primary/15 rounded-xl px-3 py-2 mb-3">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">
            Current Goal
          </p>
          <p className="text-xs font-semibold text-foreground">{goal.title}</p>
        </div>
      )}

      <div className="bg-secondary rounded-xl px-3 py-2.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Today's Insight
        </p>
        <p className="text-xs text-foreground leading-relaxed">{insight}</p>
      </div>
    </div>
  );
});

export default IntelligencePreviewCard;
