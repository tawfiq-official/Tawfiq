import React, { useState } from "react";

const SCENARIOS = [
  { label: "Scenario A", daily: 2, color: "text-amber-500" },
  { label: "Scenario B", daily: 5, color: "text-primary" },
  { label: "Scenario C", daily: 10, color: "text-green-600" },
];

function monthsToComplete(total, daily) {
  if (!daily || !total) return null;
  const days = Math.ceil(total / daily);
  const months = Math.floor(days / 30);
  const remDays = days % 30;
  if (months === 0) return `${days} days`;
  if (remDays === 0) return `${months} month${months > 1 ? "s" : ""}`;
  return `${months}m ${remDays}d`;
}

export default function QazaRecoverySimulator({ qazaTotal }) {
  const [custom, setCustom] = useState("");
  const total = typeof qazaTotal === "number" ? qazaTotal : 0;

  if (total === 0)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Qaza Recovery Simulator
        </p>
        <p className="text-sm text-muted-foreground">
          No Qaza debt recorded. MashaAllah — keep going!
        </p>
      </div>
    );

  const customNum = parseInt(custom) || 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Qaza Recovery Simulator
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Plan your path to clearing your debt
      </p>

      <div className="bg-secondary rounded-xl px-4 py-3 mb-4 text-center">
        <p className="text-xs text-muted-foreground">Current Qaza Debt</p>
        <p className="text-3xl font-bold text-foreground tabular-nums mt-0.5">
          {total.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">prayers</p>
      </div>

      <div className="space-y-2 mb-4">
        {SCENARIOS.map(({ label, daily, color }) => (
          <div
            key={label}
            className="flex items-center justify-between border border-border rounded-xl px-3 py-2.5"
          >
            <div>
              <p className="text-xs font-semibold text-foreground">
                {label}: {daily} Qaza/day
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Completion in
              </p>
            </div>
            <p className={`text-sm font-bold tabular-nums ${color}`}>
              {monthsToComplete(total, daily)}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-xl px-3 py-3">
        <p className="text-xs text-muted-foreground mb-2">
          Custom: How many Qaza can you do daily?
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. 3"
            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {customNum > 0 && (
            <p className="text-sm font-bold text-primary tabular-nums whitespace-nowrap">
              {monthsToComplete(total, customNum)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
