import { useEffect, useState } from "react";

const PRESET_GOALS = [33, 99, 100, 500, 1000];

export default function GoalSelector({ goal, onChange }) {
  const [customGoal, setCustomGoal] = useState("");

  useEffect(() => {
    if (!PRESET_GOALS.includes(goal)) {
      setCustomGoal(goal);
    }
  }, [goal]);

  function applyCustomGoal() {
    const value = Number(customGoal);

    if (isNaN(value) || value <= 0) return;

    onChange(value);
  }

  function handleCustomGoalKeyDown(e) {
    if (e.key === "Enter") applyCustomGoal();
  }

  return (
    <div className="space-y-4">
      {/* Heading */}

      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-emerald-600">
          Goal
        </p>

        <h3 className="text-lg font-bold mt-1">Daily Target</h3>
      </div>

      {/* Preset Goals */}

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {PRESET_GOALS.map((item) => {
          const active = goal === item;

          return (
            <button
              key={item}
              onClick={() => onChange(item)}
              className={`
                flex-shrink-0
                px-5
                py-3
                rounded-2xl
                border
                transition-all
                duration-200
                font-semibold
                active:scale-95

                ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg"
                    : "bg-card border-border hover:bg-muted"
                }
              `}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Custom Goal */}

      <div className="flex gap-3">
        <input
          type="number"
          min="1"
          placeholder="Custom goal"
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          onKeyDown={handleCustomGoalKeyDown}
          className="
            flex-1
            h-12
            rounded-2xl
            border
            border-border
            bg-background
            px-4
            outline-none
            placeholder:text-muted-foreground
            focus:ring-2
            focus:ring-emerald-500
          "
        />

        <button
          onClick={applyCustomGoal}
          className="
            px-5
            rounded-2xl
            bg-emerald-600
            text-white
            font-semibold
            hover:bg-emerald-700
            transition-all
            active:scale-95
          "
        >
          Set
        </button>
      </div>
    </div>
  );
}
