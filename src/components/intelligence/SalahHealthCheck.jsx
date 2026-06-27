import React, { useMemo } from "react";
import { CheckCircle2, AlertCircle, Heart } from "lucide-react";
import { prayerRates } from "@/lib/intelligenceUtils";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

export default function SalahHealthCheck({
  logs,
  healthScore,
  strongest,
  weakest,
}) {
  const rates = useMemo(() => prayerRates(logs, 30), [logs]);

  const strengths = rates
    .filter((r) => r.pct !== null && r.pct >= 75)
    .map((r) => `${r.name} Consistency`);
  const jamaahLogs = logs.slice(0, 30).filter((l) => !l.is_exempt);
  const jamaahRate = useMemo(() => {
    let j = 0,
      t = 0;
    jamaahLogs.forEach((l) =>
      PRAYERS.forEach((p) => {
        if (l.prayers?.[p] === "on_time") {
          t++;
          if (l.jamaah?.[p]) j++;
        }
      }),
    );
    return t > 0 ? Math.round((j / t) * 100) : 0;
  }, [jamaahLogs]);
  if (jamaahRate >= 40) strengths.push("Jama'ah Attendance");

  const needs = rates
    .filter((r) => r.pct !== null && r.pct < 60)
    .map((r) => `${r.name} Completion`);
  const color =
    healthScore === null
      ? "text-muted-foreground"
      : healthScore >= 80
        ? "text-green-600"
        : healthScore >= 50
          ? "text-amber-500"
          : "text-red-500";
  const label =
    healthScore === null
      ? "No data yet"
      : healthScore >= 80
        ? "Excellent"
        : healthScore >= 60
          ? "Good"
          : healthScore >= 40
            ? "Needs Work"
            : "Critical";

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Heart size={16} className={color} />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Monthly Health Check
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <p
            className={`text-5xl font-bold tabular-nums leading-none ${color}`}
          >
            {healthScore ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
        {healthScore !== null && (
          <div className="flex-1">
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${healthScore}%`,
                  backgroundColor:
                    healthScore >= 80
                      ? "hsl(152 52% 28%)"
                      : healthScore >= 50
                        ? "hsl(38 92% 50%)"
                        : "hsl(0 75% 55%)",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on last 30 days
            </p>
          </div>
        )}
      </div>

      {strengths.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
            ✓ Strengths
          </p>
          <div className="space-y-1.5">
            {strengths.map((s) => (
              <div key={s} className="flex items-center gap-2">
                <CheckCircle2
                  size={13}
                  className="text-green-600 flex-shrink-0"
                />
                <p className="text-sm text-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {needs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
            ⚠ Needs Attention
          </p>
          <div className="space-y-1.5">
            {needs.map((n) => (
              <div key={n} className="flex items-center gap-2">
                <AlertCircle
                  size={13}
                  className="text-amber-500 flex-shrink-0"
                />
                <p className="text-sm text-foreground">{n}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {strengths.length === 0 && needs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Log prayers to generate your health check.
        </p>
      )}
    </div>
  );
}
