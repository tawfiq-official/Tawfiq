import { CalendarDays, Clock3, BarChart3 } from "lucide-react";

export default function Statistics({ daily, session, lifetime }) {
  const cards = [
    {
      title: "Today",
      value: daily,
      icon: CalendarDays,
      color: "text-emerald-600",
    },
    {
      title: "Session",
      value: session,
      icon: Clock3,
      color: "text-blue-600",
    },
    {
      title: "Lifetime",
      value: lifetime,
      icon: BarChart3,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-emerald-600">
          Statistics
        </p>

        <h3 className="text-lg font-bold mt-1">Your Dhikr</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="
                rounded-2xl
                p-4
                border
                border-border
                bg-card
                flex
                flex-col
                items-center
                justify-center
                text-center
                transition-all
                duration-200
                hover:shadow-md
              "
            >
              <Icon size={22} className={`${card.color} mb-2`} />

              <h2 className="text-2xl font-black text-foreground tabular-nums">
                {card.value.toLocaleString()}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground font-medium">
                {card.title}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Keep Going 📿</p>

            <p className="text-xs text-muted-foreground mt-1">
              Every remembrance brings you closer to Allah.
            </p>
          </div>

          <div className="text-4xl">🤲</div>
        </div>
      </div>
    </div>
  );
}
