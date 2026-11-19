import React from "react";
import PlaceCard from "./PlaceCard";
import { MapPin } from "lucide-react";

export default function PlaceList({ places, completedIds, onPlaceClick, onToggleComplete, userLocation }) {
  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
          <MapPin className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">No spots here yet</p>
        <p className="text-xs text-muted-foreground">Verified spots coming soon. Suggest one!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4 pb-24">
      {places.map((place, i) => (
        <PlaceCard
          key={place.id}
          place={place}
          isCompleted={completedIds.has(place.id)}
          onToggleComplete={onToggleComplete}
          onClick={onPlaceClick}
          index={i}
          userLocation={userLocation}
        />
      ))}
    </div>
  );
}
