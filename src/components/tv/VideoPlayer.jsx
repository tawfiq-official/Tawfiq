export default function VideoPlayer({ videoId }) {
  return (
    <div className="w-full aspect-video bg-black">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="Tawfiq TV"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
