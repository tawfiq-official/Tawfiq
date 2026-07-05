import { Play, Clock } from "lucide-react";

export default function VideoCard({
  title,
  thumbnail,
  duration,
  category,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="
        group
        w-[250px]
        flex-shrink-0
        text-left
        transition-all
        duration-300
        hover:scale-[1.04]
      "
    >
      {/* Thumbnail */}

      <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg">
        <img
          src={thumbnail}
          alt={title}
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Play Button */}

        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-300
          "
        >
          <div
            className="
              w-14
              h-14
              rounded-full
              bg-white/90
              backdrop-blur
              flex
              items-center
              justify-center
              shadow-xl
            "
          >
            <Play size={26} fill="black" className="ml-1 text-black" />
          </div>
        </div>

        {/* Duration */}

        <div
          className="
            absolute
            bottom-3
            left-3
            flex
            items-center
            gap-1
            rounded-full
            bg-black/70
            px-3
            py-1
            text-xs
            text-white
            backdrop-blur
          "
        >
          <Clock size={12} />
          {duration}
        </div>
      </div>

      {/* Details */}

      <div className="mt-4 px-1">
        <h3
          className="
            text-lg
            font-bold
            leading-snug
            line-clamp-2
            text-slate-900
            group-hover:text-emerald-600
            transition-colors
          "
        >
          {title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <span>{duration}</span>

          <span>•</span>

          <span>{category}</span>
        </div>
      </div>
    </button>
  );
}
