import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Navigation, CheckCircle2, Globe, Phone, Clock, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { getWalkingMinutes, CATEGORY_LABELS, getRatingColor } from "@/lib/placesData";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryIcons";
import { formatPhone } from "@/lib/placesRichData";
import { base44 } from "@/api/base44Client";

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= rating ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function DetailDrawer({ place, open, onClose, isCompleted, onToggleComplete, userLocation }) {
  const [hoursOpen, setHoursOpen] = useState(false);

  if (!place) return null;

  const walkMin = getWalkingMinutes(place.lat, place.lng, userLocation);
  const Icon = getCategoryIcon(place.category);
  const color = getCategoryColor(place.category);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ", Grenoble, France")}`;

  const hasAddress = !!place.google_formatted_address;
  const hasRating = place.rating != null && place.rating !== 0;
  const hasWebsite = !!place.website;
  const phone = formatPhone(place.phone);
  const hours = Array.isArray(place.weekly_hours) ? place.weekly_hours : [];
  const hasHours = hours.length > 0;
  const reviews = Array.isArray(place.top_reviews) ? place.top_reviews.slice(0, 2) : [];
  const hasReviews = reviews.length > 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl px-0 pb-0 flex flex-col bg-card/95 backdrop-blur-xl border-t border-white/30 dark:border-white/10 shadow-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header — Name & Category */}
        <SheetHeader className="px-5 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-3">
            {place.check_in_priority && (
              <Star className="w-4 h-4 text-accent fill-accent mt-1 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-bold font-heading text-foreground leading-snug">
                {place.name}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium gap-1.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded" style={{ backgroundColor: color + "22" }}>
                    <Icon className="w-2.5 h-2.5" style={{ color }} />
                  </span>
                  {CATEGORY_LABELS[place.category] || place.category}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-sm">{walkMin} min walk</span>
                </div>
                {hasRating && (
                  <span className="inline-flex items-center gap-1 text-[15px] font-semibold">
                    <Star className="w-[15px] h-[15px]" style={{ color: "#F5A623", fill: "#F5A623" }} />
                    <span style={{ color: getRatingColor(place.rating) }}>{place.rating}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Description — directly under the title */}
          {place.description && (
            <p className="text-sm text-foreground leading-relaxed">{place.description}</p>
          )}

          {/* Tags */}
          {(place.tags || []).length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {(place.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-3 py-1 font-medium">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          {hasAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground leading-snug">{place.google_formatted_address}</span>
            </div>
          )}

          {/* Website + Phone row */}
          {(hasWebsite || phone) && (
            <div className="flex flex-wrap gap-2">
              {hasWebsite && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {phone}
                </a>
              )}
            </div>
          )}

          {/* Weekly Hours accordion */}
          {hasHours && (
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setHoursOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  View Opening Hours
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${hoursOpen ? "rotate-180" : ""}`} />
              </button>
              {hoursOpen && (
                <ul className="px-4 pb-3 space-y-1.5 border-t border-border pt-3">
                  {hours.map((line) => (
                    <li key={line} className="text-xs text-muted-foreground leading-snug">{line}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Top Reviews */}
          {hasReviews && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">User Reviews</p>
              <div className="space-y-3">
                {reviews.map((rev, i) => (
                  <div key={i} className="bg-secondary/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-foreground">{rev.author}</span>
                      <StarRow rating={rev.rating || 0} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action buttons */}
        <div className="px-5 py-4 border-t border-border bg-card/95 backdrop-blur-xl flex-shrink-0 space-y-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => base44.analytics.track({ eventName: "open_in_google_maps", properties: { place_id: place.id, place_name: place.name, category: place.category } })}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            Open in Google Maps
          </a>
          {place.check_in_priority && (
            <Button
              variant="outline"
              className={`w-full h-11 gap-2 font-semibold transition-all ${
                isCompleted
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-foreground"
              }`}
              onClick={() => onToggleComplete(place.id)}
            >
              <CheckCircle2 className={`w-5 h-5 ${isCompleted ? "text-primary fill-primary/10" : ""}`} />
              {isCompleted ? "Marked as Complete ✓" : "Mark as Complete"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
