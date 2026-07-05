import HeroBanner from "@/components/tv/HeroBanner";
import ContinueWatching from "@/components/tv/ContinueWatching";
import CategoryRow from "@/components/tv/CategoryRow";
import BottomNav from "@/components/BottomNav";

const prophets = [
  {
    id: 1,
    title: "Story of Prophet Adam (AS)",
    thumbnail: "https://picsum.photos/300/450?1",
    duration: "22 min",
    category: "Prophets",
  },
  {
    id: 2,
    title: "Story of Prophet Nuh (AS)",
    thumbnail: "https://picsum.photos/300/450?2",
    duration: "34 min",
    category: "Prophets",
  },
  {
    id: 3,
    title: "Story of Prophet Ibrahim (AS)",
    thumbnail: "https://picsum.photos/300/450?3",
    duration: "28 min",
    category: "Prophets",
  },
  {
    id: 4,
    title: "Story of Prophet Musa (AS)",
    thumbnail: "https://picsum.photos/300/450?4",
    duration: "41 min",
    category: "Prophets",
  },
];

export default function TawfiqTV() {
  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-900">


        
      <HeroBanner   
        title="Stories of the Prophets"
        description="Journey through the lives of Allah's Prophets with authentic Islamic sources."
        image="https://picsum.photos/1200/700"
        onPlay={() => {}}
        onInfo={() => {}}
      />

      <div className="px-5 py-8 space-y-7">
        <ContinueWatching
          title="Story of Prophet Yusuf (AS)"
          thumbnail="https://picsum.photos/800/450"
          duration={42}
          watched={18}
          onResume={() => {}}
        />

        <CategoryRow
          title="Stories of the Prophets"
          subtitle="Learn from authentic narrations."
          videos={prophets}
        />

        <CategoryRow
          title="Prayer & Worship"
          subtitle="Master your Salah."
          videos={prophets}
        />

        <CategoryRow
          title="Islamic History"
          subtitle="Discover the past."
          videos={prophets}
        />  

              <BottomNav />

      </div>
    </div>
  );
}
