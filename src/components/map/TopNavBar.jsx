import React from "react";
import NearMeControl from "./NearMeControl";
import FeedbackButton from "@/components/feedback/FeedbackButton";

export default function TopNavBar({ geoAvailable, locationLoading, userLocation, onNearMe, onResetLocation }) {
  return (
    <header className="w-full bg-primary text-primary-foreground shadow-md flex items-center justify-between gap-6 px-6 py-2.5 z-50">
      <div className="flex flex-col flex-shrink-0">
        <h1 className="text-xl font-extrabold tracking-tight leading-tight font-heading">CityMate</h1>
        <span className="text-[11px] text-primary-foreground/70 font-medium leading-tight">Everything you need to settle into Grenoble.</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <FeedbackButton />
        <NearMeControl
          geoAvailable={geoAvailable}
          locationLoading={locationLoading}
          userLocation={userLocation}
          onNearMe={onNearMe}
          onResetLocation={onResetLocation}
        />
      </div>
    </header>
  );
}
