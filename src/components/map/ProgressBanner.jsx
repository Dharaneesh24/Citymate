import React from "react";
import { Star } from "lucide-react";

export default function ProgressBanner({ completed, total }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mx-4 mt-3 mb-1 rounded-xl overflow-hidden border border-accent/30 bg-gradient-to-r from-accent/10 to-amber-50">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-accent fill-accent flex-shrink-0" />
            <span className="text-sm font-bold text-foreground">
              Step 1: Complete your essentials.
            </span>
          </div>
          <span className="text-xs font-semibold text-accent bg-accent/15 px-2 py-0.5 rounded-full">
            {completed}/{total}
          </span>
        </div>
        <div className="w-full bg-accent/20 rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {percent === 100
            ? "🎉 Golden Path complete! You're all set."
            : `${total - completed} more to go — you've got this!`}
        </p>
      </div>
    </div>
  );
}
