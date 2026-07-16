  import { RotateCcw } from "lucide-react";
  import { useEffect, useState } from "react";

  export default function DhikrCounter({ dhikr, count, goal, onTap, onReset }) {
    const [animate, setAnimate] = useState(false);
    const [roundComplete, setRoundComplete] = useState(false);

    useEffect(() => {
      setAnimate(true);

      const t = setTimeout(() => setAnimate(false), 120);

      return () => clearTimeout(t);
    }, [count]);

    useEffect(() => {
      if (count > 0 && goal > 0 && count % goal === 0) {
        setRoundComplete(true);

        const t = setTimeout(() => setRoundComplete(false), 1800);

        return () => clearTimeout(t);
      }
    }, [count, goal]);

    return (
      <div className="space-y-5">
        {/* Dhikr Name */}

        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-600 font-bold">
            Current Dhikr
          </p>

          <h2 className="mt-2 text-3xl font-black text-foreground">{dhikr}</h2>
        </div>

        {/* Counter */}

        <button
          onClick={onTap}
          aria-label={`Tap to count ${dhikr}`}
          className="
            relative
            w-full
            aspect-square
            rounded-full
            bg-gradient-to-br
            from-emerald-500
            via-emerald-600
            to-green-700
            shadow-2xl
            active:scale-95
            transition-all
            duration-150
            flex
            flex-col
            items-center
            justify-center
            overflow-hidden
          "
        >
          {/* Glow */}

          <div className="absolute inset-0 bg-white/10" />

          {/* Counter */}

          <div
            className={`transition-transform duration-150 ${
              animate ? "scale-110" : "scale-100"
            }`}
          >
            <h1 className="text-7xl font-black text-white tabular-nums">
              {count}
            </h1>

            <p className="mt-2 text-white/80 text-sm font-medium">Tap anywhere</p>
          </div>

          {/* Ripple */}

          <div className="absolute inset-0 rounded-full border border-white/10" />
        </button>

        {/* Round milestone (fires every time a full "goal" round is tapped out) */}

        {roundComplete && (
          <div
            className="
              rounded-2xl
              bg-emerald-50
              border
              border-emerald-200
              p-4
              text-center
              animate-pulse
            "
          >
            <h3 className="font-bold text-emerald-700">🎉 Round Complete!</h3>

            <p className="text-sm text-emerald-600 mt-1">
              {goal} counted — keep going or pause to reflect.
            </p>
          </div>
        )}

        {/* Actions */}

        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="
              flex
              items-center
              gap-2
              px-5
              py-3
              rounded-2xl
              bg-card
              border
              border-border
              hover:bg-muted
              transition-all
              active:scale-95
            "
          >
            <RotateCcw size={18} />

            <span className="font-semibold">Reset Counter</span>
          </button>
        </div>
      </div>
    );
  }
