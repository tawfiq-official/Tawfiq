import { X } from "lucide-react";
import ActionButtons from "./ActionButtons";
import RelatedVideos from "./RelatedVideos";
import QuranReferences from "./QuranReferences";
import HadithReferences from "./HadithReferences";

export default function VideoDetailsModal({
  open,
  video,
  onClose,
  relatedVideos = [],
  quranReferences = [],
  hadithReferences = [],
}) {
  if (!open || !video) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex justify-center overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl my-10 overflow-hidden">
        {/* Close */}

        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center"
        >
          <X size={22} />
        </button>

        {/* Hero Image */}

        <div className="relative h-[320px]">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          <div className="absolute bottom-8 left-8 text-white">
            <span className="text-xs uppercase tracking-[0.25em] text-emerald-300 font-bold">
              Featured Lesson
            </span>

            <h1 className="text-4xl font-black mt-3">{video.title}</h1>

            <div className="flex gap-3 mt-3 text-sm text-white/80">
              <span>{video.duration}</span>
              <span>•</span>
              <span>{video.category}</span>
            </div>
          </div>
        </div>

        {/* Content */}

        <div className="p-8 space-y-8">
          {/* Description */}

          <div>
            <h2 className="text-2xl font-black">About this video</h2>

            <p className="mt-4 text-slate-600 leading-7">
              {video.description ||
                "Learn authentic Islamic knowledge from trusted sources. Every lesson is designed to help you understand Islam step by step."}
            </p>
          </div>

          {/* Actions */}

          <ActionButtons
            onPlay={() => {}}
            onSave={() => {}}
            onDownload={() => {}}
            onShare={() => {}}
          />

          {/* Quran */}

          <QuranReferences references={quranReferences} />

          {/* Hadith */}

          <HadithReferences references={hadithReferences} />

          {/* Related */}

          <RelatedVideos videos={relatedVideos} />
        </div>
      </div>
    </div>
  );
}
