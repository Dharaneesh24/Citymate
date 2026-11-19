import React from "react";
import { ArrowUpDown, ChevronDown, MapPin, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const LABELS = {
  default: "Sort",
  nearest: "Nearest",
  farthest: "Farthest",
  highest: "Top Rated",
  lowest: "Low Rated",
};

export default function SortControl({ sortMode, onSortChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{LABELS[sortMode] || "Sort"}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem onClick={() => onSortChange("nearest")}>
          <MapPin className="w-3.5 h-3.5 mr-2" /> Nearest
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange("farthest")}>
          <MapPin className="w-3.5 h-3.5 mr-2" /> Farthest
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onSortChange("highest")}>
          <Star className="w-3.5 h-3.5 mr-2" /> Highest Rated
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange("lowest")}>
          <Star className="w-3.5 h-3.5 mr-2" /> Lowest Rated
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
