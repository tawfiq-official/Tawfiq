import { Play, Clock } from "lucide-react";

export default function ContinueWatching({
  title,
  thumbnail,
  duration,
  watched,
  onResume,
}) {
  const progress = Math.min((watched / duration) * 100, 100);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h > 0) return `${h}h ${m}m`;

    return `${m} min`;
  };

  return (
    <div className="space-y-4">
      {/* Title */}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-green-600 font-bold">
            Continue Watching
          </p>

          <h2 className="text-2xl font-black mt-1">
            Pick up where you left off
          </h2>
        </div>
      </div>

      {/* Card */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[30px]
          h-[180px]
          shadow-xl
          group
        "
      >
        {/* Background */}

        <img
          src={thumbnail}
          alt={title}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-105
          "
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Content */}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Clock size={15} />

            <span>
              {formatTime(watched)} watched • {formatTime(duration)} total
            </span>
          </div>

          <h2 className="text-xl font-black mt-3">{title}</h2>

          {/* Progress */}

          <div className="mt-5">
            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="text-sm mt-2 opacity-80">
              {progress.toFixed(0)}% completed
            </p>
          </div>

          {/* Resume */}

          <button
            onClick={onResume}
            className="
              mt-6
              h-12
              px-6
              rounded-2xl
              bg-green-500
              hover:bg-green-600
              active:scale-95
              transition-all
              flex
              items-center
              gap-2
              font-bold
            "
          >
            <Play size={18} fill="white" />
            Resume Watching
          </button>
        </div>
      </div>
    </div>
  );
}
