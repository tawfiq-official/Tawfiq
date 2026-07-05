import { X, Play, Bookmark, Share2, Download } from "lucide-react";

import VideoPlayer from "./VideoPlayer";
import VideoInfo from "./VideoInfo";
import ActionButtons from "./ActionButtons";
import RelatedVideos from "./RelatedVideos";
import QuranReferences from "./QuranReferences";
import HadithReferences from "./HadithReferences";

export default function VideoPlayerModal({
  open,
  onClose,
  video,
  relatedVideos = [],
  quranReferences = [],
  hadithReferences = [],
}) {
  if (!open || !video) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black overflow-y-auto">
      {/* Close */}

      <button
        onClick={onClose}
        className="
          fixed
          top-5
          right-5
          z-50
          w-12
          h-12
          rounded-full
          bg-black/60
          backdrop-blur-xl
          text-white
          flex
          items-center
          justify-center
        "
      >
        <X />
      </button>

      {/* Player */}

      <VideoPlayer videoId={video.videoId} />

      <div className="max-w-5xl mx-auto p-6 space-y-10">
        <VideoInfo video={video} />

        <ActionButtons />

        <QuranReferences references={quranReferences} />

        <HadithReferences references={hadithReferences} />

        <RelatedVideos videos={relatedVideos} />
      </div>
    </div>
  );
}
