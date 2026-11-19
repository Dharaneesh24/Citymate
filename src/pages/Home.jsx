import React, { useState, useMemo, useCallback, useEffect } from "react";
import StickyHeader from "@/components/map/StickyHeader";
import TopNavBar from "@/components/map/TopNavBar";
import FilterBar from "@/components/map/FilterBar";
import MapView from "@/components/map/MapView";
import PlaceList from "@/components/map/PlaceList";
import DetailDrawer from "@/components/map/DetailDrawer";
import ProgressBanner from "@/components/map/ProgressBanner";
import BottomNav from "@/components/map/BottomNav";
import { PLACES_DATA, CATEGORIES, getWalkingMinutes, GEM_CENTER } from "@/lib/placesData";
import { base44 } from "@/api/base44Client";
import SortControl from "@/components/map/SortControl";
import { useToast } from "@/components/ui/use-toast";
import { Search, X } from "lucide-react";

const PRIORITY_PLACES = PLACES_DATA.filter((p) => p.check_in_priority);
const PRIORITY_IDS = new Set(PRIORITY_PLACES.map((p) => p.id));

function loadCompleted() {
  try {
    const raw = localStorage.getItem("pp_completed_v2");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export default function Home() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(["all"]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [completedIds, setCompletedIds] = useState(loadCompleted);
  const [mobileView, setMobileView] = useState("list");
  const [sortMode, setSortMode] = useState("default");
  const [resumeKey, setResumeKey] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [geoAvailable] = useState(() => typeof navigator !== "undefined" && !!navigator.geolocation);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setResumeKey((k) => k + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) return;
    base44.analytics.track({ eventName: "near_me_click", properties: { action: "requested" } });
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast({
            title: "Location access denied",
            description: "Showing distances from GEM campus.",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast]);

  const handleResetLocation = useCallback(() => {
    base44.analytics.track({ eventName: "near_me_click", properties: { action: "reset" } });
    setUserLocation(null);
  }, []);

  const handleSetView = useCallback((view) => {
    setMobileView(view);
  }, []);

  // Track when a user starts a search (empty → non-empty query = one search action)
  const handleSearchChange = useCallback((value) => {
    setSearch((prev) => {
      if (!prev && value) {
        base44.analytics.track({ eventName: "search_performed", properties: { query: value } });
      }
      return value;
    });
  }, []);

  // Track when a user opens a place's detail view (card or map marker click)
  const handlePlaceClick = useCallback((place) => {
    base44.analytics.track({ eventName: "place_detail_click", properties: { place_id: place.id, place_name: place.name, category: place.category } });
    setSelectedPlace(place);
  }, []);

  const handleToggleFilter = useCallback((key) => {
    setActiveFilters((prev) => {
      if (key === "all") return ["all"];
      const without = prev.filter((k) => k !== "all");
      if (without.includes(key)) {
        const next = without.filter((k) => k !== key);
        return next.length === 0 ? ["all"] : next;
      }
      return [...without, key];
    });
  }, []);

  const handleToggleComplete = useCallback((id) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("pp_completed_v2", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const filteredPlaces = useMemo(() => {
    let results = PLACES_DATA;
    const isAll = activeFilters.includes("all");
    const isFirst48h = activeFilters.includes("first48h");

    if (!isAll) {
      if (isFirst48h && activeFilters.length === 1) {
        results = results.filter((p) => p.check_in_priority);
      } else {
        const catFilters = activeFilters.filter((k) => k !== "first48h");
        results = results.filter((p) => {
          const catMatch = catFilters.length === 0 || catFilters.includes(p.category);
          const priorityMatch = !isFirst48h || p.check_in_priority;
          return catMatch && priorityMatch;
        });
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortMode === "nearest") {
      const center = userLocation || GEM_CENTER;
      results = [...results].sort(
        (a, b) => getWalkingMinutes(a.lat, a.lng, center) - getWalkingMinutes(b.lat, b.lng, center)
      );
    } else if (sortMode === "farthest") {
      const center = userLocation || GEM_CENTER;
      results = [...results].sort(
        (a, b) => getWalkingMinutes(b.lat, b.lng, center) - getWalkingMinutes(a.lat, a.lng, center)
      );
    } else if (sortMode === "highest") {
      results = [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortMode === "lowest") {
      results = [...results].sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else if (userLocation) {
      results = [...results].sort(
        (a, b) =>
          getWalkingMinutes(a.lat, a.lng, userLocation) -
          getWalkingMinutes(b.lat, b.lng, userLocation)
      );
    }

    return results;
  }, [activeFilters, search, userLocation, sortMode]);

  const showBanner = activeFilters.includes("first48h");
  const completedPriorityCount = [...completedIds].filter((id) => PRIORITY_IDS.has(id)).length;

  const activeLabel = useMemo(() => {
    if (activeFilters.includes("all")) return "ALL SPOTS";
    return activeFilters
      .map((k) => CATEGORIES.find((c) => c.key === k)?.label || k)
      .join(", ")
      .toUpperCase();
  }, [activeFilters]);

  // Right-panel content (shared between mobile list view and desktop right col)
  const RightPanel = (
    <div className="flex flex-col h-full">
      <StickyHeader
        geoAvailable={geoAvailable}
        locationLoading={locationLoading}
        userLocation={userLocation}
        onNearMe={handleNearMe}
        onResetLocation={handleResetLocation}
      />
      <FilterBar activeFilters={activeFilters} onToggleFilter={handleToggleFilter} />

      {showBanner && (
        <ProgressBanner
          completed={completedPriorityCount}
          total={PRIORITY_PLACES.length}
        />
      )}

      {/* Count line */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-border">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          {filteredPlaces.length} SPOTS — {activeLabel}
        </span>
        <SortControl sortMode={sortMode} onSortChange={setSortMode} />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: "90px" }}>
        <PlaceList
          places={filteredPlaces}
          completedIds={completedIds}
          onPlaceClick={handlePlaceClick}
          onToggleComplete={handleToggleComplete}
          userLocation={userLocation}
        />
      </div>
    </div>
  );

  return (
    <React.Fragment>
      {/* ─── DESKTOP: side-by-side ─── */}
      <div className="hidden md:flex flex-col h-screen w-screen overflow-hidden font-inter">
        <TopNavBar
          geoAvailable={geoAvailable}
          locationLoading={locationLoading}
          userLocation={userLocation}
          onNearMe={handleNearMe}
          onResetLocation={handleResetLocation}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Left: sticky map */}
          <div className="w-1/2 flex-shrink-0">
            <MapView
              key={resumeKey}
              places={filteredPlaces}
              completedIds={completedIds}
              onMarkerClick={handlePlaceClick}
              userLocation={userLocation}
            />
          </div>

          {/* Right: filters + list */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-background">
            {/* Desktop search input */}
            <div className="px-4 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search places, tags..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 bg-card text-foreground border border-border rounded-lg text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <FilterBar activeFilters={activeFilters} onToggleFilter={handleToggleFilter} />

            {showBanner && (
              <ProgressBanner
                completed={completedPriorityCount}
                total={PRIORITY_PLACES.length}
              />
            )}

            <div className="px-4 py-2 flex items-center justify-between border-b border-border">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                {filteredPlaces.length} SPOTS — {activeLabel}
              </span>
              <SortControl sortMode={sortMode} onSortChange={setSortMode} />
            </div>

            <div className="flex-1 overflow-y-auto">
              <PlaceList
                places={filteredPlaces}
                completedIds={completedIds}
                onPlaceClick={handlePlaceClick}
                onToggleComplete={handleToggleComplete}
                userLocation={userLocation}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOBILE: toggled single view ─── */}
      <div className="flex md:hidden h-screen bg-background font-inter overflow-hidden relative">
        {/* List view */}
        <div
          className="flex flex-col h-full w-full absolute inset-0 transition-opacity duration-200"
          style={{ opacity: mobileView === "list" ? 1 : 0, pointerEvents: mobileView === "list" ? "auto" : "none", zIndex: mobileView === "list" ? 1 : 0 }}
        >
          {RightPanel}
        </div>

        {/* Map view */}
        <div
          className="h-full w-full absolute inset-0 transition-opacity duration-200"
          style={{ opacity: mobileView === "map" ? 1 : 0, pointerEvents: mobileView === "map" ? "auto" : "none", zIndex: mobileView === "map" ? 1 : 0 }}
        >
          <MapView
            key={resumeKey}
            places={filteredPlaces}
            completedIds={completedIds}
            onMarkerClick={handlePlaceClick}
            userLocation={userLocation}
          />
        </div>
      </div>

      {/* Bottom navigation bar — hidden when detail drawer is open */}
      {!selectedPlace && (
        <BottomNav
          search={search}
          onSearchChange={handleSearchChange}
          mobileView={mobileView}
          onSetView={handleSetView}
        />
      )}

      {/* Detail Drawer */}
      <DetailDrawer
        place={selectedPlace}
        open={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
        isCompleted={selectedPlace ? completedIds.has(selectedPlace.id) : false}
        onToggleComplete={handleToggleComplete}
        userLocation={userLocation}
      />
    </React.Fragment>
  );
}
