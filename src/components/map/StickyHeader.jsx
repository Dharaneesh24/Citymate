import React from "react";
import NearMeControl from "./NearMeControl";
import FeedbackButton from "@/components/feedback/FeedbackButton";

export default function StickyHeader({ geoAvailable, locationLoading, userLocation, onNearMe, onResetLocation }) {
  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight font-heading leading-tight">CityMate</h1>
          <span className="text-[11px] text-primary-foreground/70 font-medium leading-tight">Everything you need to settle into Grenoble.</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <FeedbackButton compact />
          <NearMeControl
            geoAvailable={geoAvailable}
            locationLoading={locationLoading}
            userLocation={userLocation}
            onNearMe={onNearMe}
            onResetLocation={onResetLocation}
          />
        </div>
      </div>
    </header>
  );
}
