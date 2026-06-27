import React, { useState } from "react";
import { MapPin, Eye, EyeOff } from "lucide-react";

const STORAGE_KEY = "tawfiq_mosque_locations";

function getLocations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveLocations(locs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locs));
}

export default function MosqueMemoryMap() {
  const [enabled, setEnabled] = useState(
    () => !!localStorage.getItem("tawfiq_mosque_enabled"),
  );
  const [locations, setLocations] = useState(getLocations);
  const [input, setInput] = useState("");

  function enable() {
    localStorage.setItem("tawfiq_mosque_enabled", "1");
    setEnabled(true);
  }
  function disable() {
    localStorage.removeItem("tawfiq_mosque_enabled");
    setEnabled(false);
  }

  function addLocation() {
    if (!input.trim()) return;
    const next = [...locations, { id: Date.now(), city: input.trim() }];
    setLocations(next);
    saveLocations(next);
    setInput("");
  }

  function removeLocation(id) {
    const next = locations.filter((l) => l.id !== id);
    setLocations(next);
    saveLocations(next);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Mosque Memory Map
        </p>
        <button
          onClick={enabled ? disable : enable}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {enabled ? (
            <>
              <EyeOff size={12} /> Private On
            </>
          ) : (
            <>
              <Eye size={12} /> Enable
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Cities where you prayed — opt-in, completely private
      </p>

      {!enabled ? (
        <div className="text-center py-4">
          <MapPin size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-3">
            Enable to record your spiritual travel history
          </p>
          <button
            onClick={enable}
            className="bg-secondary text-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:bg-muted transition-colors"
          >
            Enable Mosque Memory
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLocation()}
              placeholder="City or location name…"
              className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={addLocation}
              disabled={!input.trim()}
              className="bg-primary text-primary-foreground text-xs font-semibold px-4 rounded-xl disabled:opacity-40 hover:opacity-90 transition-all"
            >
              Add
            </button>
          </div>

          {locations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No locations added yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5"
                >
                  <MapPin size={11} className="text-primary" />
                  <span className="text-xs text-foreground">{loc.city}</span>
                  <button
                    onClick={() => removeLocation(loc.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
