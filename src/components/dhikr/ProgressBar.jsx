export default function ProgressBar({ value, goal, progress, completed }) {
  const percentage = Math.min(Math.round(progress), 100);

  const remaining = Math.max(goal - value, 0);

  return (
    <div className="space-y-3">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-emerald-600">
            Progress
          </p>

          <h3 className="text-lg font-bold mt-1">Daily Progress</h3>
        </div>

        <p className="text-2xl font-black text-emerald-600">{percentage}%</p>
      </div>

      {/* Progress Bar */}

      <div className="relative w-full h-4 rounded-full bg-muted overflow-hidden">
        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-emerald-500
            via-emerald-600
            to-green-700
            transition-all
            duration-500
          "
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      {/* Caption */}

      <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
        <span>
          {value} / {goal}
        </span>

        {!completed && <span>{remaining} remaining</span>}
      </div>

      {/* Status */}

      {completed && (
        <div
          className="
            rounded-2xl
            border
            border-emerald-300
            bg-emerald-50
            dark:bg-emerald-950/20
            p-4
            text-center
          "
        >
          <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            🎉 Goal Completed
          </h3>

          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
            May Allah accept your remembrance.
          </p>
        </div>
      )}
    </div>
  );
}
