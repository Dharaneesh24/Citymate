import React from "react";
import { Navigation, X, Loader2 } from "lucide-react";

export default function NearMeControl({ geoAvailable, locationLoading, userLocation, onNearMe, onResetLocation }) {
  if (!geoAvailable) return null;

  if (userLocation) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-white/20 text-white rounded-full pl-2.5 pr-0.5 py-0.5 text-xs font-medium">
        <span>📍 Using your location</span>
        <button
          onClick={onResetLocation}
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/25 transition-colors"
          title="Reset to GEM campus"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onNearMe}
      disabled={locationLoading}
      className="inline-flex items-center gap-1.5 bg-white/15 text-white rounded-full px-3 py-1 text-xs font-semibold hover:bg-white/25 transition-colors disabled:opacity-60"
    >
      {locationLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Navigation className="w-3.5 h-3.5" />
      )}
      {locationLoading ? "Locating…" : "Near Me"}
    </button>
  );
}
