import React, { useState, useMemo } from "react";
import { Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { getCategorySvg, getCategoryColor } from "@/lib/categoryIcons";

// Standard single marker icon
const createMarkerIcon = (category, isPriority, isCompleted) => {
  const color = getCategoryColor(category);
  const svg = getCategorySvg(category, 18, "#ffffff");
  const opacity = isCompleted ? 0.45 : 1;
  const filter = isCompleted ? "grayscale(0.5)" : "none";
  const ring = isPriority ? `0 0 0 4px ${color}33, ` : "";
  const check = isCompleted
    ? `<div style="position:absolute;bottom:-3px;right:-3px;width:16px;height:16px;border-radius:50%;background:#0f766e;border:2px solid #fff;display:flex;align-items:center;justify-content:center;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`
    : "";
  const html = `<div style="position:relative;width:36px;height:36px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:${ring}0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;opacity:${opacity};filter:${filter};">${svg}${check}</div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Cluster icon shown when overlapping markers are collapsed
const createClusterIcon = (count) => {
  const html = `<div style="width:42px;height:42px;border-radius:50%;background:rgba(15,118,110,0.9);border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;font-family:Inter,sans-serif;">${count}</div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21],
  });
};

// Round coordinates to detect markers sharing the same spot
const coordKey = (place) =>
  `${Number(place.lat).toFixed(5)}_${Number(place.lng).toFixed(5)}`;

export default function SpiderfyMarkers({ places, completedIds, onMarkerClick }) {
  const map = useMap();
  const [spiderKey, setSpiderKey] = useState(null);

  // Collapse spiderfy on zoom or background click
  useMapEvents({
    zoomstart: () => setSpiderKey(null),
    click: () => setSpiderKey(null),
  });

  // Group places by coordinates — groups with >1 entry are overlapping
  const groups = useMemo(() => {
    const g = {};
    places.forEach((p) => {
      const k = coordKey(p);
      if (!g[k]) g[k] = [];
      g[k].push(p);
    });
    return g;
  }, [places]);

  // Compute spider positions (pixel-space circle → lat/lng) for the active cluster
  const offsets = useMemo(() => {
    if (!spiderKey) return {};
    const group = groups[spiderKey];
    if (!group || group.length <= 1) return {};

    const center = group[0];
    const centerPx = map.latLngToLayerPoint([center.lat, center.lng]);
    const count = group.length;
    const radius = 48; // pixels

    const result = {};
    group.forEach((place, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2; // start at top
      const px = centerPx.x + radius * Math.cos(angle);
      const py = centerPx.y + radius * Math.sin(angle);
      const ll = map.layerPointToLatLng([px, py]);
      result[place.id] = { lat: ll.lat, lng: ll.lng };
    });
    return result;
  }, [spiderKey, groups, map]);

  const markers = [];

  Object.entries(groups).forEach(([key, group]) => {
    if (group.length === 1) {
      // Single marker — no overlap, render normally
      const place = group[0];
      markers.push(
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={createMarkerIcon(place.category, place.check_in_priority, completedIds.has(place.id))}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation();
              onMarkerClick(place);
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -36]}>
            <span className="font-semibold text-sm">{place.name}</span>
            <span className="text-xs text-muted-foreground"> · {place.category}</span>
          </Tooltip>
        </Marker>
      );
    } else if (spiderKey === key) {
      // Spiderfied — render individual markers spread out in a circle
      group.forEach((place) => {
        const off = offsets[place.id];
        if (!off) return;
        markers.push(
          <Marker
            key={place.id}
            position={[off.lat, off.lng]}
            icon={createMarkerIcon(place.category, place.check_in_priority, completedIds.has(place.id))}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation();
                onMarkerClick(place);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -36]}>
              <span className="font-semibold text-sm">{place.name}</span>
              <span className="text-xs text-muted-foreground"> · {place.category}</span>
            </Tooltip>
          </Marker>
        );
      });
    } else {
      // Collapsed cluster — show count badge, expand on click
      const center = group[0];
      markers.push(
        <Marker
          key={`cluster_${key}`}
          position={[center.lat, center.lng]}
          icon={createClusterIcon(group.length)}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation();
              setSpiderKey(key);
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -42]}>
            <span className="font-semibold text-sm">{group.length} places here</span>
            <span className="text-xs text-muted-foreground"> · Click to expand</span>
          </Tooltip>
        </Marker>
      );
    }
  });

  return <>{markers}</>;
}
