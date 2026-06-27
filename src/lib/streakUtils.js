import { format, subDays, parseISO } from "date-fns";
import { getDayScore } from "./prayerUtils";

export function computeStreaks(logs) {
  // Build a map of date -> score
  const map = {};
  logs.forEach((l) => {
    map[l.date] = { score: getDayScore(l.prayers), exempt: l.is_exempt };
  });

  let current = 0;
  let best = 0;
  let streak = 0;
  const today = new Date();

  // Walk backwards from today
  for (let i = 0; i < 365; i++) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    const entry = map[dateStr];

    if (!entry) {
      // No entry = missed day (unless it's today which may not be filled yet)
      if (i === 0) continue; // today is in progress
      break;
    }

    if (entry.exempt) {
      // Exempt day doesn't break streak, skip
      continue;
    }

    if (entry.score === 5) {
      streak++;
      if (i === 0 || streak > 0) current = streak;
    } else {
      if (i === 0) {
        current = 0;
        streak = 0;
        continue;
      }
      break;
    }
  }

  // Best streak: scan all days in order
  let run = 0;
  const allDates = Object.keys(map).sort();
  allDates.forEach((d) => {
    const e = map[d];
    if (e.exempt) return;
    if (e.score === 5) {
      run++;
      best = Math.max(best, run);
    } else run = 0;
  });

  return { current, best };
}
