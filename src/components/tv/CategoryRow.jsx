import { ChevronRight } from "lucide-react";
import VideoCard from "./VideoCard";

export default function CategoryRow({
  title,
  subtitle,
  videos = [],
  onSeeAll,
}) {
  return (
    <section className="space-y-5">
      {/* Header */}

      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

        <button
          onClick={onSeeAll}
          className="
            flex
            items-center
            gap-1
            text-sm
            font-bold
            text-emerald-600
            hover:text-emerald-700
            transition-colors
          "
        >
          See All
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Horizontal Scroll */}

      <div
        className="
          flex
          gap-5
          overflow-x-auto
          overflow-y-hidden
          pb-2
          snap-x
          snap-mandatory
          scroll-smooth
          scrollbar-hide
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {videos.map((video) => (
          <div
            key={video.id}
            className="
              flex-shrink-0
              snap-start
            "
          >
            <VideoCard
              title={video.title}
              thumbnail={video.thumbnail}
              duration={video.duration}
              category={video.category}
              onClick={() => console.log(video.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
