import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format, subDays } from "date-fns";
import { getDayScore, PRAYERS } from "@/lib/prayerUtils";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function SpiritualMomentumGraph({ logs, momentum }) {
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const log = logs.find((l) => l.date === dateStr);
      const salah = log && !log.is_exempt ? getDayScore(log.prayers) : 0;
      const jamaah = log ? PRAYERS.filter((p) => log.jamaah?.[p]).length : 0;
      const nawafil = log
        ? Object.values(log.nawafil || {}).filter(Boolean).length
        : 0;
      return {
        day: format(d, "MMM d"),
        Salah: salah,
        "Jama'ah": jamaah,
        Nawafil: nawafil,
      };
    });
  }, [logs]);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Spiritual Momentum
        </p>
        {momentum && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              momentum.label === "Rising" || momentum.label === "Improving"
                ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                : momentum.label === "Declining" ||
                    momentum.label === "Slipping"
                  ? "bg-red-100 dark:bg-red-950/40 text-red-600"
                  : "bg-secondary text-muted-foreground"
            }`}
          >
            {momentum.label}
          </span>
        )}
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salahGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(152 52% 28%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(152 52% 28%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="jamaahGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(38 92% 50%)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(38 92% 50%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              interval={9}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 5]}
              tick={{ fontSize: 9 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Salah"
              stroke="hsl(152 52% 28%)"
              fill="url(#salahGrad)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="Jama'ah"
              stroke="hsl(38 92% 50%)"
              fill="url(#jamaahGrad)"
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-1.5 rounded-full"
            style={{ backgroundColor: "hsl(152 52% 28%)" }}
          />
          <span className="text-muted-foreground">Salah (0–5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-1.5 rounded-full"
            style={{ backgroundColor: "hsl(38 92% 50%)" }}
          />
          <span className="text-muted-foreground">Jama'ah (0–5)</span>
        </div>
      </div>
    </div>
  );
}
