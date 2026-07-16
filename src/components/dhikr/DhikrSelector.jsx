export default function DhikrSelector({ options, value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-emerald-600">
          Choose Dhikr
        </p>

        <h3 className="text-lg font-bold mt-1">Select Today's Dhikr</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {options.map((item) => {
          const active = value === item;

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
                whitespace-nowrap
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
    </div>
  );
}
