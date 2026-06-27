import React, { useMemo, memo } from "react";
import { Navigation, ChevronRight, MapPin } from "lucide-react";

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

function calcQibla(lat, lon) {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LON - lon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function calcDistance(lat, lon) {
  const R = 6371;
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δφ = ((KAABA_LAT - lat) * Math.PI) / 180;
  const Δλ = ((KAABA_LON - lon) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function bearingToCardinal(deg) {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

function bearingToFullCardinal(deg) {
  const dirs = [
    "North",
    "North-Northeast",
    "Northeast",
    "East-Northeast",
    "East",
    "East-Southeast",
    "Southeast",
    "South-Southeast",
    "South",
    "South-Southwest",
    "Southwest",
    "West-Southwest",
    "West",
    "West-Northwest",
    "Northwest",
    "North-Northwest",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Static compass needle — no sensors, just shows direction
function StaticCompassPreview({ qiblaDir }) {
  const needleAngle = qiblaDir ?? 0;
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      {/* Ring */}
      <div className="absolute inset-0 rounded-full border-2 border-border bg-secondary flex items-center justify-center">
        {/* Cardinal labels */}
        {[
          ["N", 0],
          ["E", 90],
          ["S", 180],
          ["W", 270],
        ].map(([l, a]) => (
          <span
            key={l}
            className="absolute text-[8px] font-bold text-muted-foreground"
            style={{
              left: "50%",
              top: "50%",
              transform: `rotate(${a}deg) translateY(-22px) rotate(-${a}deg) translateX(-50%)`,
              transformOrigin: "center",
            }}
          >
            {l}
          </span>
        ))}
        {/* North dot */}
        <div
          className="absolute"
          style={{ top: 4, left: "50%", transform: "translateX(-50%)" }}
        >
          <div className="w-1 h-2 rounded-full bg-red-500" />
        </div>
        {/* Kaaba marker */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "50%",
            top: "50%",
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
            transform: `rotate(${needleAngle}deg) translateY(-22px) rotate(-${needleAngle}deg)`,
          }}
        >
          <span className="text-base leading-none">🕋</span>
        </div>
      </div>
    </div>
  );
}

const QiblaCard = memo(function QiblaCard({ latitude, longitude, onOpen }) {
  const qiblaDir = useMemo(
    () => (latitude && longitude ? calcQibla(latitude, longitude) : null),
    [latitude, longitude],
  );
  const distance = useMemo(
    () => (latitude && longitude ? calcDistance(latitude, longitude) : null),
    [latitude, longitude],
  );

  if (!latitude) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <Navigation size={22} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Qibla Direction</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin size={11} /> Location required
          </p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
            ⚠ Enable location in Settings
          </p>
        </div>
        <button
          onClick={onOpen}
          className="bg-primary text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
        >
          Open
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-4">
        <StaticCompassPreview qiblaDir={qiblaDir} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Qibla Direction
          </p>
          <p className="text-sm font-bold text-foreground">
            {bearingToFullCardinal(qiblaDir)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {Math.round(qiblaDir)}° · {distance?.toLocaleString()} km to Makkah
          </p>
          <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 font-semibold flex items-center gap-1">
            ✓ Qibla Ready
          </p>
        </div>
        <button
          onClick={onOpen}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
        >
          Open <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
});

export default QiblaCard;
