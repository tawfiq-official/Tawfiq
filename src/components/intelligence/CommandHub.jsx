import React, { useState, useMemo } from "react";
import {
  Search,
  Brain,
  TrendingUp,
  BarChart2,
  RotateCcw,
  BookOpen,
  Star,
  Zap,
  Target,
  Eye,
} from "lucide-react";
import AIFeatureView from "@/components/intelligence/AIFeatureView";

const GROUPS = [
  {
    id: "core",
    label: "Intelligence Core",
    icon: Brain,
    color: "text-primary",
    items: [
      {
        id: "oracle",
        label: "Tawfiq Oracle",
        desc: "What happened, why, and what to do today",
        tab: null,
      },
      {
        id: "ask_salah",
        label: "Ask About My Salah",
        desc: "How am I doing? Honest AI answer",
        tab: null,
      },
      {
        id: "ai_coach",
        label: "Personal Salah Coach",
        desc: "Data-driven coaching & recommendations",
        tab: null,
      },
      {
        id: "why_engine",
        label: "Why Engine 2.0",
        desc: "Why are trends improving or declining?",
        tab: null,
      },
      {
        id: "daily_focus",
        label: "Daily Focus",
        desc: "Today's single most important prayer priority",
        tab: null,
      },
    ],
  },
  {
    id: "predictions",
    label: "Predictions",
    icon: TrendingUp,
    color: "text-blue-500",
    items: [
      {
        id: "failure_predictor",
        label: "Prayer Failure Predictor",
        desc: "Which prayer is most at risk tomorrow?",
        tab: null,
      },
      {
        id: "future_risk",
        label: "Future Risk Analysis",
        desc: "30-day trajectory if habits continue",
        tab: null,
      },
      {
        id: "future_self",
        label: "Future Self Comparison",
        desc: "Current vs improved 1-year projection",
        tab: null,
      },
      {
        id: "habit_simulator",
        label: "Habit Simulator",
        desc: 'Simulate "what if I change this?"',
        tab: null,
      },
      {
        id: "burnout_detector",
        label: "Burnout Detection",
        desc: "Early warning for declining motivation",
        tab: null,
      },
    ],
  },
  {
    id: "analytics",
    label: "Personal Analytics",
    icon: BarChart2,
    color: "text-purple-500",
    items: [
      {
        id: "monthly_story",
        label: "Monthly Salah Story",
        desc: "Your prayer month as a narrative",
        tab: null,
      },
      {
        id: "pattern_discovery",
        label: "Hidden Pattern Discovery",
        desc: "3 patterns you would never notice",
        tab: null,
      },
      {
        id: "consistency_breakdown",
        label: "Consistency Breakdown",
        desc: "Why do your streaks break?",
        tab: null,
      },
      {
        id: "blueprint",
        label: "Personal Prayer Blueprint",
        desc: "Your strongest, weakest & most reliable habits",
        tab: null,
      },
      {
        id: "quality_analyzer",
        label: "Prayer Quality Analyzer",
        desc: "Khushu, timing & Jama'ah patterns",
        tab: null,
      },
      {
        id: "khushu_intel",
        label: "Khushu Intelligence",
        desc: "When is your focus highest and why?",
        tab: null,
      },
      {
        id: "life_impact",
        label: "Life Impact Analysis",
        desc: "How travel, weekends & Ramadan affect you",
        tab: null,
      },
      {
        id: "momentum",
        label: "Spiritual Momentum",
        desc: "Acceleration, not just consistency",
        tab: null,
      },
      {
        id: "legacy",
        label: "Legacy Projection",
        desc: "Lifetime prayer count at current pace",
        tab: null,
      },
    ],
  },
  {
    id: "recovery",
    label: "Recovery Intelligence",
    icon: RotateCcw,
    color: "text-amber-500",
    items: [
      {
        id: "qaza_planner",
        label: "Qaza Recovery Planner",
        desc: "Personalised plan to clear your debt",
        tab: null,
      },
      {
        id: "recovery_intel",
        label: "Recovery Intelligence",
        desc: "Easiest recovery windows from your data",
        tab: null,
      },
    ],
  },
  {
    id: "coaching",
    label: "Coaching",
    icon: Target,
    color: "text-emerald-500",
    items: [
      {
        id: "weekly_review",
        label: "Weekly AI Review",
        desc: "Strengths, weaknesses & this week's grade",
        tab: null,
      },
      {
        id: "mission_generator",
        label: "AI Mission Generator",
        desc: "3 specific missions for this week",
        tab: null,
      },
      {
        id: "ideal_day",
        label: "Ideal Day Generator",
        desc: "The schedule most associated with 5/5",
        tab: null,
      },
      {
        id: "reflection_writer",
        label: "AI Reflection Writer",
        desc: "Your data turned into a personal story",
        tab: null,
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced Intelligence",
    icon: Zap,
    color: "text-yellow-500",
    items: [
      {
        id: "scorecard",
        label: "Worship Scorecard",
        desc: "Monthly AI report card across 5 dimensions",
        tab: null,
      },
      {
        id: "digital_twin",
        label: "Tawfiq Digital Twin",
        desc: "Your prayer personality + future simulation",
        tab: null,
      },
    ],
  },
  {
    id: "sections",
    label: "Deep-Dive Sections",
    icon: Eye,
    color: "text-muted-foreground",
    items: [
      {
        id: "__tab_health",
        label: "Salah Health",
        desc: "Life score, strengths & momentum",
        tab: "health",
      },
      {
        id: "__tab_fajr",
        label: "Fajr Intelligence",
        desc: "Battle map & deep Fajr analytics",
        tab: "fajr",
      },
      {
        id: "__tab_future",
        label: "Future Outlook",
        desc: "Risk analysis & recovery planner",
        tab: "future",
      },
      {
        id: "__tab_story",
        label: "Prayer Blueprint",
        desc: "DNA, seasons, replay & legacy",
        tab: "story",
      },
      {
        id: "__tab_coach",
        label: "Coach",
        desc: "Spiritual coach & Why Engine",
        tab: "coach",
      },
      {
        id: "__tab_journal",
        label: "Journal",
        desc: "Write & search your reflections",
        tab: "journal",
      },
      {
        id: "__tab_spiritual",
        label: "Spiritual Practice",
        desc: "Wudu, Dhikr, Dua & quality",
        tab: "spiritual",
      },
    ],
  },
];

const LAST_KEY = "tawfiq_command_last_view";

export default function CommandHub({ onNavigate, logs, qazaTotal }) {
  const [search, setSearch] = useState("");
  const [activeFeature, setActiveFeature] = useState(null); // { id, label, desc }

  const allItems = useMemo(
    () =>
      GROUPS.flatMap((g) =>
        g.items.map((i) => ({ ...i, groupLabel: g.label })),
      ),
    [],
  );

  const filtered = search.trim()
    ? allItems.filter(
        (i) =>
          i.label.toLowerCase().includes(search.toLowerCase()) ||
          i.desc.toLowerCase().includes(search.toLowerCase()) ||
          i.groupLabel.toLowerCase().includes(search.toLowerCase()),
      )
    : null;

  function select(item) {
    if (item.tab) {
      localStorage.setItem(LAST_KEY, item.tab);
      onNavigate(item.tab);
    } else {
      setActiveFeature(item);
      setSearch("");
    }
  }

  // Show AI feature view
  if (activeFeature) {
    return (
      <AIFeatureView
        featureId={activeFeature.id}
        featureLabel={activeFeature.label}
        featureDesc={activeFeature.desc}
        logs={logs}
        qazaTotal={qazaTotal}
        onBack={() => setActiveFeature(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-card border border-border rounded-2xl px-4 py-2 flex items-center gap-3">
        <Search size={15} className="text-muted-foreground flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search AI features…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search results */}
      {filtered && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <p className="px-4 py-5 text-sm text-muted-foreground text-center">
              No features match your search.
            </p>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => select(item)}
                className={`w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-secondary transition-colors ${idx > 0 ? "border-t border-border" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {item.groupLabel}
                  </p>
                </div>
                <span className="text-muted-foreground/40 text-sm mt-0.5">
                  {item.tab ? "→" : "✦"}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Grouped sections */}
      {!filtered &&
        GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.id}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
                <Icon size={14} className={group.color} />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
              </div>
              {group.items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => select(item)}
                  className={`w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-secondary transition-colors active:scale-[0.99] ${idx > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {item.label}
                      </p>
                      {!item.tab && (
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <span className="text-muted-foreground/50 text-sm flex-shrink-0">
                    ›
                  </span>
                </button>
              ))}
            </div>
          );
        })}

      <p className="text-center text-xs text-muted-foreground pb-1">
        AI features require at least 7 days of prayer logs.
      </p>
    </div>
  );
}
