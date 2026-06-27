import React, { useState, useEffect } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GOAL_TEMPLATES = [
  "Pray Fajr on time for 14 days",
  "Attend mosque 20 times this month",
  "Complete 30 consecutive perfect days",
  "Complete 100 Qaza prayers",
  "Pray all 5 prayers on time for 7 days",
];

export default function AccountabilityGoals({ logs }) {
  const [goals, setGoals] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("tawfiq_goals");
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  function save(updated) {
    setGoals(updated);
    localStorage.setItem("tawfiq_goals", JSON.stringify(updated));
  }

  function addGoal(text) {
    if (!text.trim()) return;
    save([
      ...goals,
      {
        id: Date.now(),
        text: text.trim(),
        done: false,
        created: new Date().toISOString(),
      },
    ]);
    setNewGoal("");
    setAdding(false);
  }

  function toggleDone(id) {
    save(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  }

  function remove(id) {
    save(goals.filter((g) => g.id !== id));
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Personal Goals
          </p>
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      {adding && (
        <div className="mb-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal(newGoal)}
              placeholder="e.g. Pray Fajr on time for 14 days"
              className="flex-1 text-sm bg-secondary border border-border rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <button
              onClick={() => addGoal(newGoal)}
              className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl active:scale-95 transition-all"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {GOAL_TEMPLATES.map((t) => (
              <button
                key={t}
                onClick={() => addGoal(t)}
                className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full border border-border hover:bg-muted transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No goals set yet. Tap + to add one.
        </p>
      )}

      <div className="space-y-2">
        {goals.map((g) => (
          <div
            key={g.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              g.done
                ? "border-green-300/50 bg-green-50 dark:bg-green-950/30"
                : "border-border bg-secondary"
            }`}
          >
            <button
              onClick={() => toggleDone(g.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                g.done
                  ? "bg-green-600 border-green-600"
                  : "border-muted-foreground/40"
              }`}
            >
              {g.done && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  viewBox="0 0 12 12"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <p
              className={`text-sm flex-1 ${g.done ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {g.text}
            </p>
            <button
              onClick={() => remove(g.id)}
              className="text-muted-foreground/50 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
