import React, { useState, useRef, useEffect, useMemo } from "react";
import { Send, Sparkles, X, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";
import ReactMarkdown from "react-markdown";

// ── Data context builder ─────────────────────────────────────────────────────
function buildContext(logs, qazaTotal, streak, strongest, weakest) {
  const recent = (logs || []).slice(0, 30).filter((l) => !l.is_exempt);
  const total = recent.length;
  if (total === 0) return "No prayer data available yet.";

  const pStats = PRAYERS.map((p) => {
    const onTime = recent.filter((l) => l.prayers?.[p] === "on_time").length;
    const late = recent.filter((l) => l.prayers?.[p] === "late").length;
    const missed = recent.filter((l) => l.prayers?.[p] === "missed").length;
    const jamaah = recent.filter((l) => l.jamaah?.[p]).length;
    const khVals = recent
      .map((l) => l.quality?.[p]?.khushu)
      .filter((v) => v > 0);
    const avgKh = khVals.length
      ? (khVals.reduce((a, b) => a + b, 0) / khVals.length).toFixed(1)
      : "N/A";
    return `${PRAYER_NAMES[p]}: on_time=${onTime}/${total} (${Math.round((onTime / total) * 100)}%), late=${late}, missed=${missed}, jamaah=${jamaah}, avg_khushu=${avgKh}`;
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fajrByDay = days
    .map((d, i) => {
      const dl = recent.filter((l) => new Date(l.date).getDay() === i);
      const ok = dl.filter((l) => l.prayers?.fajr === "on_time").length;
      return `${d}:${ok}/${dl.length}`;
    })
    .join(" ");

  const totalOT = recent.reduce(
    (a, l) => a + PRAYERS.filter((p) => l.prayers?.[p] === "on_time").length,
    0,
  );
  const overallRate = Math.round((totalOT / (total * 5)) * 100);

  return `Days logged: ${total} | Overall rate: ${overallRate}% | Streak: ${streak ?? 0} days | Qaza debt: ${qazaTotal ?? "unknown"}
Strongest: ${strongest?.name ?? "unknown"} (${strongest?.pct ?? 0}%) | Weakest: ${weakest?.name ?? "unknown"} (${weakest?.pct ?? 0}%)
Per-prayer: ${pStats.join("; ")}
Fajr by day: ${fajrByDay}`;
}

// ── System prompt ────────────────────────────────────────────────────────────
const SYSTEM = `You are Tawfiq Mentor — a personal Salah growth companion. You help users understand their prayer habits, improve consistency, and achieve their goals.

Core Rules:
- Focus on prayer habits, consistency, Qaza recovery, Salah improvement, and Quran/Hadith for spiritual growth
- Reference the user's actual data numbers in every response
- Be warm, calm, encouraging, and non-judgmental
- Keep responses concise (under 200 words) and actionable
- Use markdown with headers and bullet points for clarity
- Do NOT act as a generic chatbot — every response must reference their data
- End every response with one concrete action they can take today

Quran & Hadith Knowledge:
- You MAY share relevant Quran verses and authentic hadith when they relate to prayer improvement
- ALWAYS cite properly: Quran (Surah name, chapter:verse) or Hadith (collection, hadith number)
- You may explain the meaning and context of verses/hadith
- NEVER invent or fabricate references — only cite well-known authentic narrations
- For Salah topics: cite relevant verses from Surah Al-Baqarah 2:238, Al-Ma'arij 70:19-23, and hadiths from Bukhari/Muslim about prayer

Religious Safety:
- You MAY explain what verses/hadith mean in context of prayer improvement
- You MUST NOT issue fatwas or declare anything halal/haram
- You MUST NOT give legal/fiqh rulings
- If asked for a ruling, respond: "Please consult a qualified scholar for religious rulings. I can help with your prayer consistency and habits."
- Recommend authentic sources (Bukhari, Muslim, Quran.com) for deeper study`;

const CHIPS = [
  "Why am I missing Fajr?",
  "What should I focus on this week?",
  "How can I reduce Qaza faster?",
  "Show my biggest weakness.",
  "Review my week.",
  "What happens if I continue this pace?",
  "How far have I come?",
  "What is hurting my consistency?",
  "Show Quran verses about prayer.",
  "Show Hadith about Fajr.",
  "Show Hadith about consistency.",
  "Show Quran verses about patience.",
];

export default function TawfiqMentor({
  logs,
  qazaTotal,
  streak,
  strongest,
  weakest,
  userName,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const dataCtx = useMemo(
    () => buildContext(logs, qazaTotal, streak, strongest, weakest),
    [logs, qazaTotal, streak, strongest, weakest],
  );

  const hasData = (logs || []).filter((l) => !l.is_exempt).length >= 7;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = [...messages, userMsg].slice(-8); // last 8 for context
    const historyText = history
      .map((m) => `${m.role === "user" ? "User" : "Mentor"}: ${m.content}`)
      .join("\n");

    const prompt = `${SYSTEM}

User's Prayer Data:
${dataCtx}

Conversation:
${historyText}

Respond as Tawfiq Mentor:`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: typeof res === "string" ? res : JSON.stringify(res),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    }
    setLoading(false);
  }

  const name = userName?.split(" ")[0] || "there";
  const greeting = `Assalamu Alaikum${userName ? `, ${name}` : ""}.`;

  return (
    <div
      className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden"
      style={{ minHeight: 520 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-primary/5">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Tawfiq Mentor</p>
          <p className="text-[11px] text-muted-foreground">
            Your Personal Salah Growth Companion
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ maxHeight: 380 }}
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">
                {greeting}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I'm your Tawfiq Mentor. I help you understand your Salah habits,
                improve consistency, and achieve your goals.
              </p>
              {!hasData && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                  📊 Log at least 7 days of prayers to unlock personalized
                  insights.
                </p>
              )}
              {hasData && streak > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="bg-secondary rounded-xl px-3 py-2 text-center">
                    <p className="text-base font-bold text-foreground tabular-nums">
                      {streak}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Day Streak
                    </p>
                  </div>
                  <div className="bg-secondary rounded-xl px-3 py-2 text-center">
                    <p className="text-base font-bold text-foreground tabular-nums">
                      {strongest?.pct ?? 0}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {strongest?.name ?? "—"} (best)
                    </p>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                What would you like to work on today?
              </p>
            </div>

            {/* Suggested chips */}
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="text-xs font-medium bg-secondary border border-border rounded-full px-3 py-1.5 text-foreground hover:bg-muted transition-colors active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <Sparkles size={11} className="text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary border border-border rounded-bl-sm text-foreground"
              }`}
            >
              {msg.role === "user" ? (
                <p>{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert text-foreground [&>*]:text-foreground [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
              <Sparkles size={11} className="text-primary" />
            </div>
            <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Chip suggestions after messages */}
        {messages.length > 0 && !loading && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {CHIPS.slice(0, 4).map((chip) => (
              <button
                key={chip}
                onClick={() => send(chip)}
                className="text-[11px] font-medium bg-secondary border border-border rounded-full px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-3 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask about your prayer habits…"
          rows={1}
          className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          style={{ maxHeight: 96 }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
