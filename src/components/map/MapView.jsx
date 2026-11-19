import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { CLUSTER_CENTER } from "@/lib/placesData";
import SpiderfyMarkers from "./SpiderfyMarkers";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

function FitBounds({ places, userLocation }) {
  const map = useMap();
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    // Don't re-fit when user location is active — RecenterToUser handles the view
    if (userLocation) return;
    if (places.length > 0) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView([CLUSTER_CENTER.lat, CLUSTER_CENTER.lng], 14);
    }
  }, [places, map, userLocation]);
  return null;
}

function RecenterToUser({ userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation, map]);
  return null;
}

function createUserMarkerIcon() {
  const html = `<div style="position:relative;width:22px;height:22px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.3);"></div>
    <div style="position:absolute;inset:3px;border-radius:50%;background:#3b82f6;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
  </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
}

export default function MapView({ places, completedIds, onMarkerClick, userLocation }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 z-10 bg-secondary animate-pulse flex flex-col gap-3 p-6 pointer-events-none">
          <div className="w-1/3 h-4 bg-muted-foreground/20 rounded-full" />
          <div className="flex-1 bg-muted-foreground/10 rounded-xl" />
          <div className="w-1/2 h-4 bg-muted-foreground/20 rounded-full self-center" />
        </div>
      )}
    <MapContainer
      whenReady={() => setLoaded(true)}
      center={[CLUSTER_CENTER.lat, CLUSTER_CENTER.lng]}
      zoom={14}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <FitBounds places={places} userLocation={userLocation} />
      <RecenterToUser userLocation={userLocation} />
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={createUserMarkerIcon()}
        >
          <Tooltip direction="top" offset={[0, -22]}>
            <span className="font-semibold text-xs text-blue-600">You are here</span>
          </Tooltip>
        </Marker>
      )}
      <SpiderfyMarkers
        places={places}
        completedIds={completedIds}
        onMarkerClick={onMarkerClick}
      />
    </MapContainer>
    </div>
  );
}
