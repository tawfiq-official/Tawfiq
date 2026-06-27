import React, { useState } from "react";
import { Heart, Search, Plus, Trash2 } from "lucide-react";

const KEY = "tawfiq_duas";
const CATEGORIES = [
  "Personal",
  "Family",
  "Health",
  "Career",
  "Education",
  "Travel",
  "General",
];

function getStored() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export default function DuaCollection() {
  const [duas, setDuas] = useState(getStored);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    text: "",
    category: "Personal",
    favorite: false,
  });

  function save() {
    if (!form.text.trim()) return;
    const next = [{ id: Date.now(), ...form, text: form.text.trim() }, ...duas];
    setDuas(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setForm({ text: "", category: "Personal", favorite: false });
    setAdding(false);
  }

  function remove(id) {
    const next = duas.filter((d) => d.id !== id);
    setDuas(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function toggleFav(id) {
    const next = duas.map((d) =>
      d.id === id ? { ...d, favorite: !d.favorite } : d,
    );
    setDuas(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const filtered = duas
    .filter(
      (d) =>
        !search ||
        d.text.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Personal Duas
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1 text-xs font-semibold text-primary"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {adding && (
        <div className="mb-3 space-y-2 border border-border rounded-xl p-3">
          <textarea
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="Your dua…"
            rows={3}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex gap-2">
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="flex-1 bg-secondary border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={save}
              className="bg-primary text-primary-foreground text-xs font-bold px-4 rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => setAdding(false)}
              className="text-xs text-muted-foreground px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {duas.length > 3 && (
        <div className="relative mb-3">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search duas…"
            className="w-full bg-secondary border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          {duas.length === 0
            ? "Add your personal duas — completely private."
            : "No duas match."}
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="flex items-start gap-2 bg-secondary rounded-xl px-3 py-2.5"
          >
            <button
              onClick={() => toggleFav(d.id)}
              className="mt-0.5 flex-shrink-0"
            >
              <Heart
                size={12}
                className={
                  d.favorite
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                }
              />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-relaxed">
                {d.text}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {d.category}
              </p>
            </div>
            <button
              onClick={() => remove(d.id)}
              className="flex-shrink-0 mt-0.5"
            >
              <Trash2
                size={11}
                className="text-muted-foreground hover:text-destructive transition-colors"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
