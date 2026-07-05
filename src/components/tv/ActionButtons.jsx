import { Play, Plus, Share2, Download, Bookmark } from "lucide-react";

export default function ActionButtons({
  onPlay,
  onSave,
  onDownload,
  onShare,
  saved = false,
}) {
  return (
    <div className="space-y-5">
      {/* Primary Action */}

      <button
        onClick={onPlay}
        className="
          w-full
          h-14
          rounded-2xl
          bg-emerald-500
          hover:bg-emerald-600
          active:scale-[0.98]
          transition-all
          flex
          items-center
          justify-center
          gap-3
          font-bold
          text-white
          text-lg
          shadow-lg
        "
      >
        <Play size={22} fill="white" />
        Play Now
      </button>

      {/* Secondary Actions */}

      <div className="grid grid-cols-4 gap-4">
        <ActionItem
          icon={
            saved ? (
              <Bookmark size={22} fill="currentColor" />
            ) : (
              <Plus size={22} />
            )
          }
          label={saved ? "Saved" : "My List"}
          onClick={onSave}
        />

        <ActionItem
          icon={<Download size={22} />}
          label="Download"
          onClick={onDownload}
        />

        <ActionItem
          icon={<Share2 size={22} />}
          label="Share"
          onClick={onShare}
        />

        <ActionItem icon={<Bookmark size={22} />} label="Bookmark" />
      </div>
    </div>
  );
}

function ActionItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        flex
        flex-col
        items-center
        justify-center
        gap-2
        rounded-2xl
        border
        border-slate-200
        bg-white
        py-4
        transition-all
        hover:-translate-y-1
        hover:shadow-lg
        active:scale-95
      "
    >
      <div className="text-emerald-600">{icon}</div>

      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </button>
  );
}
