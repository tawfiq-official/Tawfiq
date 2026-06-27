import React, { useState } from "react";
import { ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";
import ReactMarkdown from "react-markdown";

// Build a rich data context string from logs + qaza for the LLM
function buildDataContext(logs, qazaTotal) {
  if (!logs || logs.length === 0) return "No prayer data available yet.";

  const recent = logs.slice(0, 30).filter((l) => !l.is_exempt);
  const total = recent.length;
  if (total === 0) return "No non-exempt prayer logs found in recent 30 days.";

  const prayerStats = PRAYERS.map((p) => {
    const onTime = recent.filter((l) => l.prayers?.[p] === "on_time").length;
    const late = recent.filter((l) => l.prayers?.[p] === "late").length;
    const missed = recent.filter((l) => l.prayers?.[p] === "missed").length;
    const jamaah = recent.filter((l) => l.jamaah?.[p]).length;
    const khushuVals = recent
      .map((l) => l.quality?.[p]?.khushu)
      .filter((v) => v > 0);
    const avgKhushu =
      khushuVals.length > 0
        ? (khushuVals.reduce((a, b) => a + b, 0) / khushuVals.length).toFixed(1)
        : "N/A";
    return `${PRAYER_NAMES[p]}: on_time=${onTime}/${total} (${Math.round((onTime / total) * 100)}%), late=${late}, missed=${missed}, jamaah=${jamaah}, avg_khushu=${avgKhushu}`;
  });

  // Day-of-week breakdown for Fajr
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fajrByDay = days.map((d, i) => {
    const dayLogs = recent.filter((l) => new Date(l.date).getDay() === i);
    const onTime = dayLogs.filter((l) => l.prayers?.fajr === "on_time").length;
    return `${d}: ${onTime}/${dayLogs.length}`;
  });

  const totalOnTime = recent.reduce(
    (acc, l) =>
      acc + PRAYERS.filter((p) => l.prayers?.[p] === "on_time").length,
    0,
  );
  const totalPossible = total * 5;
  const overallRate = Math.round((totalOnTime / totalPossible) * 100);

  const streak = (() => {
    let s = 0;
    for (const l of logs) {
      const allDone = PRAYERS.every(
        (p) => l.prayers?.[p] === "on_time" || l.prayers?.[p] === "late",
      );
      if (allDone) s++;
      else break;
    }
    return s;
  })();

  return `
PRAYER DATA SUMMARY (Last 30 days, ${total} logged days):
Overall completion rate: ${overallRate}%
Current streak: ${streak} days
Qaza debt: ${qazaTotal ?? "unknown"} prayers

Per-prayer stats:
${prayerStats.join("\n")}

Fajr by day of week:
${fajrByDay.join(", ")}

Recent trend: ${logs
    .slice(0, 7)
    .map((l) => {
      const score = PRAYERS.filter((p) => l.prayers?.[p] === "on_time").length;
      return score + "/5";
    })
    .join(", ")} (last 7 days, most recent first)
`.trim();
}

const AI_SYSTEM = `You are Tawfiq AI — a personal prayer intelligence system. You analyze the user's real prayer data and provide specific, data-driven insights and recommendations. You speak directly and concisely. You DO NOT issue religious rulings, fatwas, or general Islamic advice unrelated to the user's data. Every statement must reference actual numbers from their data. Format your response in clear sections with headers using markdown. Keep responses under 250 words. Be encouraging but honest.`;

const FEATURE_PROMPTS = {
  // Core
  ai_coach: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Act as their personal Salah coach. Answer: What is their biggest weakness? Why are they missing prayers? What ONE specific action should they take this week? Give data-driven reasoning.`,
  ask_salah: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Give a clear, honest answer to "How am I doing with my prayers?" Highlight what's working, what's not, and the single most impactful next step.`,
  oracle: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Answer as the Tawfiq Oracle. Answer all four: 1) What happened with my prayers recently? 2) Why did it happen? 3) What happens next if I continue this path? 4) What should I do TODAY specifically?`,
  why_engine: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Run the Why Engine. Identify any improving or declining trends. For each trend: what happened, WHY (based on patterns in the data), and what to do next.`,
  daily_focus: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Generate today's single most important prayer focus. State it in one sentence, then explain WHY this is the priority based on their specific data. Also give one concrete action.`,

  // Predictions
  failure_predictor: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Predict which prayer is most at risk of being missed in the next 3 days. Give: Prayer name, risk level (%), reasons from the data, and a specific prevention action.`,
  future_risk: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Analyze future risk. Which prayer habits are trending negatively? What will happen in 30 days if nothing changes? Give specific projections with numbers.`,
  future_self: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Compare their current trajectory vs an improved path. Current path: project their 1-year completion rate. Improved path (one key change): project the improved 1-year rate. What is the single highest-leverage change they can make?`,
  habit_simulator: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Simulate two scenarios based on their data: Scenario A: If they sleep 1 hour earlier — predict impact on Fajr. Scenario B: If they complete 3 extra Qaza daily — when would their debt be cleared? Show numbers.`,
  burnout_detector: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Detect signs of prayer burnout or declining motivation. Look for: completion rate drops, streak breaks, Jama'ah decline, late prayers increasing. Give a burnout risk score (Low/Medium/High) with evidence from the data.`,

  // Analytics
  monthly_story: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Write a beautiful, personal monthly prayer story. Narrate what happened this month with their prayers — achievements, struggles, patterns, and growth. Make it feel personal, not clinical. End with encouragement.`,
  pattern_discovery: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Discover 3 hidden patterns in their prayer data that they would never notice themselves. Each pattern must be specific, surprising, and backed by actual data numbers.`,
  consistency_breakdown: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Break down exactly why their prayer streaks break. Which prayer causes most streak breaks? Which day of the week? Give percentages. Then give the root cause and solution.`,
  blueprint: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Generate their Personal Prayer Blueprint. Identify: Strongest prayer, Weakest prayer, Most reliable day, Most reliable habit, Most dangerous habit. Back every point with their actual data.`,
  quality_analyzer: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Analyze prayer quality. Look at Khushu ratings and Jama'ah. Which prayer has highest quality? Which is lowest? What pattern affects quality? What one change would most improve quality?`,
  khushu_intel: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Deep dive into Khushu (concentration) trends. When is Khushu highest and lowest? What circumstances seem to improve it? What reduces it? Give a specific strategy to improve average Khushu.`,
  life_impact: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Analyze life event impacts on prayers. Look for patterns around weekends vs weekdays, travel days (travel_mode), and Ramadan (taraweeh logged). Which life context most helps their prayers? Which hurts most?`,
  momentum: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Measure spiritual momentum — not just consistency but the rate of change. Is momentum accelerating, stable, or decelerating? Give a momentum score and explain what's driving it.`,
  legacy: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Project lifetime prayer legacy. At current pace, estimate total lifetime prayers. At an improved pace (+10% completion), estimate the difference. How many additional prayers would they complete in their lifetime?`,

  // Recovery
  qaza_planner: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Create a personalized Qaza recovery plan. Given their debt and daily prayer patterns, recommend a realistic daily Qaza target. Show 3 scenarios: conservative (2/day), moderate (4/day), intensive (7/day) with completion timelines.`,
  recovery_intel: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Generate smart recovery intelligence. After recent missed prayers, what is the best recovery strategy? Which missed prayers are easiest to recover? What time windows work best for Qaza based on their data?`,

  // Coaching
  weekly_review: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Generate this week's AI review. Sections: Strengths (what went well with data), Weaknesses (what struggled with data), One Key Opportunity (most impactful thing to improve), This Week's Grade (A-F with justification).`,
  mission_generator: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Generate 3 specific missions for this week based on their weaknesses. Each mission must be: specific, achievable, and directly address a pattern in their data. Format as a checklist.`,
  ideal_day: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Design their Ideal Prayer Day — the schedule most likely to result in 5/5 prayers based on their historical success patterns. Include recommended wake time, each prayer window, and any supporting habits.`,
  reflection_writer: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Write a thoughtful AI reflection on their recent prayer journey. Transform the raw numbers into a meaningful narrative. What story does their data tell? What are they becoming?`,

  // Scorecard
  scorecard: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Generate their Monthly Worship Scorecard. Grade each category A-F with specific data: Consistency, Recovery (Qaza effort), Jama'ah Attendance, Prayer Quality (Khushu), Growth (trend). Give one improvement tip per weak area.`,
  digital_twin: (ctx) =>
    `${AI_SYSTEM}\n\nUser Data:\n${ctx}\n\nTask: Create their Tawfiq Digital Twin — a behavioral model. Describe their prayer personality: when they pray, how they recover, their Jama'ah habits, their Fajr pattern. Then simulate: what would their twin look like in 6 months if they made their top recommended change?`,
};

export default function AIFeatureView({
  featureId,
  featureLabel,
  featureDesc,
  logs,
  qazaTotal,
  onBack,
}) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dataCtx = buildDataContext(logs, qazaTotal);
  const hasData = logs && logs.filter((l) => !l.is_exempt).length >= 7;

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    const promptFn = FEATURE_PROMPTS[featureId];
    if (!promptFn) {
      setError("Feature not configured.");
      setLoading(false);
      return;
    }
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: promptFn(dataCtx),
      });
      setResult(typeof res === "string" ? res : JSON.stringify(res));
    } catch (e) {
      setError("Could not generate analysis. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Back header */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft size={14} /> Back to Intelligence Hub
        </button>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{featureLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {featureDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Not enough data */}
      {!hasData && (
        <div className="bg-secondary border border-border rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">📊</p>
          <p className="text-sm font-semibold text-foreground mb-1">
            More Data Needed
          </p>
          <p className="text-xs text-muted-foreground">
            Log at least 7 days of prayers to unlock AI analysis. Continue
            logging and check back.
          </p>
        </div>
      )}

      {/* Generate button */}
      {hasData && !result && !loading && (
        <button
          onClick={generate}
          className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3.5 rounded-2xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={15} />
          Generate {featureLabel}
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Analysing your prayer data…
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={generate}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
          <button
            onClick={generate}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-secondary border border-border rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={13} /> Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
