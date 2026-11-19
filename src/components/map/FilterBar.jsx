import React from "react";
import { CATEGORIES } from "@/lib/placesData";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { base44 } from "@/api/base44Client";

export default function FilterBar({ activeFilters, onToggleFilter }) {
  const handleClick = (cat, isActive) => {
    base44.analytics.track({
      eventName: "filter_chip_click",
      properties: { category: cat.key, label: cat.label, selected: !isActive },
    });
    onToggleFilter(cat.key);
  };

  return (
    <div className="px-4 pt-2 pb-1">
      <div className="flex flex-wrap gap-x-[6px] gap-y-[6px]">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilters.includes(cat.key);
          const isGolden = cat.key === "first48h";
          const Icon = getCategoryIcon(cat.key);

          return (
            <button
              key={cat.key}
              onClick={() => handleClick(cat, isActive)}
              className={`flex items-center gap-1 px-[10px] py-[4px] rounded-2xl text-[11px] font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? isGolden
                    ? "bg-accent text-white border-accent"
                    : "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-[#1a1a1a] border-[#e0e0e0] hover:border-primary/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
