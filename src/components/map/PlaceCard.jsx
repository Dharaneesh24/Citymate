import React from "react";
import { getWalkingMinutes, CATEGORY_LABELS, getRatingColor } from "@/lib/placesData";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryIcons";
import { formatPhone } from "@/lib/placesRichData";
import { MapPin, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function PlaceCard({ place, isCompleted, onToggleComplete, onClick, index, userLocation }) {
  const walkMin = getWalkingMinutes(place.lat, place.lng, userLocation);
  const Icon = getCategoryIcon(place.category);
  const color = getCategoryColor(place.category);
  const topTags = (place.tags || []).slice(0, 2);
  const hasRating = place.rating != null && place.rating !== 0;
  const hasAddress = !!place.google_formatted_address;
  const phone = formatPhone(place.phone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.45), duration: 0.28, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onClick(place)}
      className={`relative rounded-2xl cursor-pointer overflow-hidden transition-shadow duration-200 border bg-card/80 backdrop-blur-xl shadow-sm ${
        isCompleted
          ? "border-border opacity-60"
          : place.check_in_priority
          ? "border-accent/40 hover:shadow-md"
          : "border-white/50 dark:border-white/10 hover:shadow-md"
      }`}
    >
      {place.check_in_priority && !isCompleted && (
        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full z-10" />
      )}
      <div className="p-4">
        {/* Top row: name + category (left)  |  walk time + rating (right, stacked) */}
        <div className="flex items-start justify-between gap-2">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            {/* Name */}
            <div className="flex items-center gap-1.5 mb-1">
              {place.check_in_priority && (
                <Star className={`w-3.5 h-3.5 flex-shrink-0 ${isCompleted ? "text-muted-foreground" : "text-accent fill-accent"}`} />
              )}
              <h3 className={`font-heading font-bold text-[15px] leading-tight truncate ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {place.name}
              </h3>
            </div>
            {/* Category */}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0" style={{ backgroundColor: color + "1a" }}>
                <Icon className="w-3 h-3" style={{ color }} />
              </span>
              <span className="text-xs text-muted-foreground font-medium">{CATEGORY_LABELS[place.category] || place.category}</span>
            </div>
          </div>

          {/* Right column — walking time (large, bold) + rating (small) stacked */}
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0 pr-3 mt-0.5">
            <span className="text-[15px] font-bold text-foreground whitespace-nowrap leading-tight">
              {userLocation ? "📍" : "🚶"} {walkMin} min
            </span>
            {hasRating && (
              <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold">
                <Star className="w-[13px] h-[13px]" style={{ color: "#F5A623", fill: "#F5A623" }} />
                <span style={{ color: getRatingColor(place.rating) }}>{place.rating}</span>
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        {hasAddress && (
          <div className="flex items-center gap-1 mt-2 mb-2 min-w-0">
            <MapPin className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground/80 truncate min-w-0">{place.google_formatted_address}</span>
          </div>
        )}

        {/* Tags + phone + complete toggle */}
        <div className="flex flex-wrap items-center gap-1.5">
          {topTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">
              {tag}
            </Badge>
          ))}
          {phone && (
            <span className="text-[10px] text-muted-foreground/70 font-medium truncate">{phone}</span>
          )}
          {place.check_in_priority && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(place.id);
              }}
              className="ml-auto flex-shrink-0 min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-full transition-colors"
              title={isCompleted ? "Mark incomplete" : "Mark complete"}
            >
              <CheckCircle2
                className={`w-6 h-6 transition-colors ${
                  isCompleted ? "text-primary fill-primary/10" : "text-muted-foreground/40 hover:text-primary"
                }`}
              />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
