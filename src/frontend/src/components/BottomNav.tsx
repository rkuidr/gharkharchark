import { BarChart2, Calendar, FileText, Home, Settings } from "lucide-react";
import type React from "react";

export type TabName = "home" | "calendar" | "analysis" | "reports" | "settings";

interface BottomNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs: { id: TabName; label: string; Icon: React.ElementType }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "calendar", label: "Calendar", Icon: Calendar },
  { id: "analysis", label: "Analysis", Icon: BarChart2 },
  { id: "reports", label: "Reports", Icon: FileText },
  { id: "settings", label: "Settings", Icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-40 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? "text-gk-accent"
                  : "text-gk-text-secondary hover:text-gk-text"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? "bg-green-50 dark:bg-green-900/20" : ""
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={
                    isActive ? "text-gk-accent" : "text-gk-text-secondary"
                  }
                />
              </div>
              <span
                className={`text-[10px] font-semibold ${isActive ? "text-gk-accent" : "text-gk-text-secondary"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
