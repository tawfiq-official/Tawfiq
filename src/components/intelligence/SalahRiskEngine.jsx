import React from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function SalahRiskEngine({ risk }) {
  if (!risk) return null;

  const sorted = [...risk].sort((a, b) => b.risk - a.risk);
  const highRisk = sorted.filter((r) => r.risk >= 50);
  const medRisk = sorted.filter((r) => r.risk >= 25 && r.risk < 50);

  function RiskBar({ item }) {
    const color =
      item.risk >= 60
        ? "bg-red-500"
        : item.risk >= 35
          ? "bg-amber-500"
          : "bg-green-500";
    const textColor =
      item.risk >= 60
        ? "text-red-500"
        : item.risk >= 35
          ? "text-amber-500"
          : "text-green-600";
    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className={`text-xs font-bold tabular-nums ${textColor}`}>
            {item.risk}%
          </p>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${item.risk}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={15} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Salah Risk Engine
        </p>
      </div>

      {highRisk.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={13} className="text-red-500" />
            <p className="text-xs font-bold text-red-600">High Risk</p>
          </div>
          <div className="space-y-2">
            {highRisk.map((r) => (
              <RiskBar key={r.prayer} item={r} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on recent 14-day pattern.
          </p>
        </div>
      )}

      {medRisk.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-600 mb-2">
            ⚠ Moderate Risk
          </p>
          <div className="space-y-2">
            {medRisk.map((r) => (
              <RiskBar key={r.prayer} item={r} />
            ))}
          </div>
        </div>
      )}

      {highRisk.length === 0 && medRisk.length === 0 && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 size={16} />
          <p className="text-sm font-medium">
            All prayers at low risk. Keep it up!
          </p>
        </div>
      )}

      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          All Prayers
        </p>
        {sorted.map((r) => (
          <RiskBar key={r.prayer} item={r} />
        ))}
      </div>
    </div>
  );
}
