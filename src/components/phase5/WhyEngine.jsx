import React, { useMemo } from "react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

function analyzeWhy(logs) {
  const recent14 = logs.filter((l) => !l.is_exempt).slice(0, 14);
  const prev14 = logs.filter((l) => !l.is_exempt).slice(14, 28);
  if (recent14.length < 7 || prev14.length < 7) return null;

  function prayerPct(arr, prayer) {
    const t = arr.filter(
      (l) => l.prayers?.[prayer] && l.prayers[prayer] !== "none",
    );
    const o = t.filter((l) => l.prayers[prayer] === "on_time").length;
    return t.length >= 3 ? Math.round((o / t.length) * 100) : null;
  }
  function jamaahPct(arr) {
    let j = 0,
      t = 0;
    arr.forEach((l) =>
      PRAYERS.forEach((p) => {
        if (l.prayers?.[p] === "on_time") {
          t++;
          if (l.jamaah?.[p]) j++;
        }
      }),
    );
    return t > 0 ? Math.round((j / t) * 100) : null;
  }
  function overallPct(arr) {
    let o = 0,
      t = 0;
    arr.forEach((l) =>
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (s && s !== "none") {
          t++;
          if (s === "on_time") o++;
        }
      }),
    );
    return t > 0 ? Math.round((o / t) * 100) : null;
  }

  const recentJ = jamaahPct(recent14);
  const prevJ = jamaahPct(prev14);
  const overall = { recent: overallPct(recent14), prev: overallPct(prev14) };
  const delta =
    overall.recent !== null && overall.prev !== null
      ? overall.recent - overall.prev
      : null;

  const prayers = PRAYERS.map((p) => ({
    p,
    name: PRAYER_NAMES[p],
    recent: prayerPct(recent14, p),
    prev: prayerPct(prev14, p),
  }))
    .filter((x) => x.recent !== null && x.prev !== null)
    .map((x) => ({ ...x, delta: x.recent - x.prev }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const improving = prayers.filter((x) => x.delta > 5);
  const declining = prayers.filter((x) => x.delta < -5);

  // Rule-based why factors
  const whyImproving = [];
  const whyDeclining = [];
  const actions = [];

  if (recentJ !== null && prevJ !== null && recentJ - prevJ > 5)
    whyImproving.push("Increased Jama'ah attendance");
  if (delta !== null && delta > 8)
    whyImproving.push("Better overall weekly consistency");
  if (improving.some((x) => x.p === "fajr"))
    whyImproving.push(
      "Fajr success has improved — likely earlier sleep or stronger morning routine",
    );
  if (improving.length >= 3)
    whyImproving.push(
      "Multiple prayers improving simultaneously — strong momentum",
    );

  if (declining.some((x) => x.p === "fajr")) {
    whyDeclining.push(
      "Fajr success declining — sleep schedule may have shifted",
    );
    actions.push("Sleep before 10:30 PM to improve Fajr");
  }
  if (declining.some((x) => x.p === "asr")) {
    whyDeclining.push("Asr declining — likely busy afternoon schedule");
    actions.push("Set a dedicated Asr reminder during work hours");
  }
  if (recentJ !== null && prevJ !== null && recentJ - prevJ < -5) {
    whyDeclining.push("Jama'ah attendance has dropped");
    actions.push("Try attending at least one prayer in Jama'ah daily");
  }
  if (delta !== null && delta < -8)
    whyDeclining.push(
      "Overall on-time rate has fallen significantly this fortnight",
    );
  if (declining.length >= 3)
    actions.push("Focus on one prayer at a time — start with the most missed");

  return {
    improving,
    declining,
    whyImproving,
    whyDeclining,
    actions,
    overall,
    delta,
  };
}

export default function WhyEngine({ logs }) {
  const analysis = useMemo(() => analyzeWhy(logs), [logs]);

  if (!analysis)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Why Engine
        </p>
        <p className="text-sm text-muted-foreground">
          Log prayers for 14+ days to receive cause analysis.
        </p>
      </div>
    );

  const {
    improving,
    declining,
    whyImproving,
    whyDeclining,
    actions,
    overall,
    delta,
  } = analysis;
  const trend =
    delta !== null
      ? delta > 3
        ? "improving"
        : delta < -3
          ? "declining"
          : "stable"
      : "stable";

  return (
    <div className="space-y-3">
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Why Engine
        </p>

        <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 mb-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Overall Trend</p>
            <p
              className={`text-lg font-bold mt-0.5 ${trend === "improving" ? "text-green-600" : trend === "declining" ? "text-red-500" : "text-foreground"}`}
            >
              {trend === "improving"
                ? "↑ Improving"
                : trend === "declining"
                  ? "↓ Declining"
                  : "→ Stable"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">14-Day Rate</p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              {overall.recent}%
            </p>
          </div>
        </div>

        {improving.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
              📈 What's Improving
            </p>
            <div className="space-y-1.5">
              {improving.map((x) => (
                <div
                  key={x.p}
                  className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2"
                >
                  <span className="text-xs text-foreground">{x.name}</span>
                  <span className="text-xs font-bold text-green-600">
                    +{x.delta}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {declining.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
              📉 What's Declining
            </p>
            <div className="space-y-1.5">
              {declining.map((x) => (
                <div
                  key={x.p}
                  className="flex items-center justify-between bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2"
                >
                  <span className="text-xs text-foreground">{x.name}</span>
                  <span className="text-xs font-bold text-red-500">
                    {x.delta}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(whyImproving.length > 0 || whyDeclining.length > 0) && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Likely Causes
          </p>
          {whyImproving.map((w, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
              <p className="text-xs text-foreground leading-relaxed">{w}</p>
            </div>
          ))}
          {whyDeclining.map((w, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="text-red-500 flex-shrink-0 mt-0.5">!</span>
              <p className="text-xs text-foreground leading-relaxed">{w}</p>
            </div>
          ))}
        </div>
      )}

      {actions.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Recommended Actions
          </p>
          {actions.map((a, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="text-primary flex-shrink-0 mt-0.5">→</span>
              <p className="text-xs text-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
