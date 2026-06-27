import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, RotateCcw, BarChart2, Sparkles, BookOpen } from "lucide-react";

const TABS = [
  { path: "/", label: "Today", Icon: Home },
  { path: "/intelligence", label: "Tawfiq", Icon: RotateCcw },
  { path: "/quran", label: "Quran", Icon: BookOpen },
  { path: "/progress", label: "Progress", Icon: BarChart2 },
  { path: "/qaza", label: "Qaza", Icon: Sparkles },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border safe-bottom">
      <div className="max-w-md mx-auto flex items-stretch">
        {TABS.map(({ path, label, Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors duration-150 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
