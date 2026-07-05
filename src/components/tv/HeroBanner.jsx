import { Play, Info, Search, Star } from "lucide-react";

export default function HeroBanner({
  title,
  description,
  image,
  onPlay,
  onInfo,
}) {
  return (
    <div className="relative w-full h-[520px] overflow-hidden rounded-[30px]">
      {/* Background */}

      <img
        src={image}
        alt={title}
        className="
absolute
inset-0
w-full
h-full
object-cover
transition-transform
duration-700
hover:scale-105
"
      />

      {/* Gradient */}

      <div
        className="absolute inset-0 bg-gradient-to-t
bg-gradient-to-t
from-black
via-black/50
to-black/10"
      />

      {/* SEARCH BAR */}

      <div className="absolute 4 left-8 right-8 z-20">
        <button
          className="
      w-full
      h-14
      rounded-2xl
      bg-black/35
      backdrop-blur-xl
      border
     border-white/10
     shadow-2xl 
      px-5
      flex
      items-center
      gap-3
      shadow-xl
      hover:bg-white/20
      transition-all
    "
        >
          <Search size={20} className="text-white/70" />

          <span className="flex-1 text-left text-white/70 text-sm">
            Search videos, Prophets, Quran...
          </span>

          <div className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
            <span className="text-[11px] font-bold text-emerald-300">
              Explore
            </span>
          </div>
        </button>
      </div>

      {/* Content */}

      <div
        className="
    absolute
    inset-0
    flex
    flex-col
    justify-end
    px-7
    pb-8
    pt-40
    text-white
  "
      >
        <p
          className="
inline-flex
w-fit
rounded-full
bg-emerald-500/20
border
border-emerald-400/30
px-3
py-1
text-[11px]
font-bold
tracking-[0.25em]
text-emerald-300
uppercase
"
        >
          FEATURED SERIES
        </p>

        <div className="max-w-[260px] mt-4">
          <h1 className="text-[38px] font-black leading-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex text-yellow-400">
            <Star size={15} fill="currentColor" />
            <Star size={15} fill="currentColor" />
            <Star size={15} fill="currentColor" />
            <Star size={15} fill="currentColor" />
            <Star size={15} fill="currentColor" />
          </div>

          <span className="text-sm text-white/80">12 Episodes</span>

          <span className="text-white/40">•</span>

          <span className="text-sm text-emerald-300">New</span>
        </div>

        <p className="mt-3 text-sm text-white/80 leading-6 max-w-xs">
          {description}
        </p>

        {/* <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs">
            Documentary
          </span>

          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs">
            Prophets
          </span>

          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs">
            Islamic History
          </span>
        </div> */}

        {/* Buttons */}

        <div className="flex gap-3 mt-8">
          <button
            onClick={onPlay}
            className="
            px-6
h-12
              rounded-2xl
              bg-emerald-500 shadow-lg
              hover:bg-green-600
              active:scale-95
              transition-all
              flex
              items-center
              justify-center
              gap-2
              font-bold
              text-lg
            "
          >
            <Play size={22} fill="white" />
            Continue Watching
          </button>

          <button
            onClick={onInfo}
            className="
              w-12
h-12
              rounded-2xl
              bg-white/10 border border-white/20
              backdrop-blur-xl
              hover:bg-white/20
              transition-all
              active:scale-95
              flex
              items-center
              justify-center
            "
          >
            <Info size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
