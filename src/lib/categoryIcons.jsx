import { renderToStaticMarkup } from "react-dom/server";
import {
  ShoppingCart, Stethoscope, Landmark, Coffee, Bike, Dumbbell,
  Utensils, Wine, Mountain, Star, Compass, MapPin,
} from "lucide-react";

const ICON_MAP = {
  all: Compass,
  first48h: Star,
  Medical: Stethoscope,
  Groceries: ShoppingCart,
  "Admin/Bank": Landmark,
  "Study Cafés": Coffee,
  Transport: Bike,
  "Life & Gym": Dumbbell,
  "Budget Eats": Utensils,
  "Social/Bars": Wine,
  Outdoors: Mountain,
};

export const CATEGORY_COLORS = {
  Medical: "#dc2626",
  Groceries: "#16a34a",
  "Admin/Bank": "#0f766e",
  "Study Cafés": "#b45309",
  Transport: "#2563eb",
  "Life & Gym": "#7c3aed",
  "Budget Eats": "#ea580c",
  "Social/Bars": "#db2777",
  Outdoors: "#15803d",
};

export function getCategoryIcon(key) {
  return ICON_MAP[key] || MapPin;
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || "#0f766e";
}

// Render a Lucide icon to an SVG string — used for Leaflet divIcon markers.
export function getCategorySvg(category, size = 18, color = "#ffffff") {
  const Icon = ICON_MAP[category];
  if (!Icon) return "";
  return renderToStaticMarkup(<Icon size={size} color={color} strokeWidth={2.5} />);
}
