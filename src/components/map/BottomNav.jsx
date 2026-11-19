import React, { useState, useRef, useEffect } from "react";
import { Search, X, Map as MapIcon, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNav({ search, onSearchChange, mobileView, onSetView }) {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const inputRef = useRef(null);

  const handleSearchClick = () => {
    setSearchExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleCloseSearch = () => {
    setSearchExpanded(false);
    onSearchChange("");
  };

  return (
    <>
      {/* Expandable search overlay */}
      <AnimatePresence>
        {searchExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed left-0 right-0 z-[10000] px-4"
            style={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
          >
            <div
              className="rounded-2xl shadow-lg p-3"
              style={{
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
              }}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search places, tags..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleCloseSearch}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar — floating pill */}
      <div
        className="fixed left-4 right-4 z-[9999] md:hidden"
        style={{ bottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <div
          className="flex items-center justify-around rounded-[28px] px-2 py-2"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Map */}
          <button
            onClick={() => onSetView("map")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl transition-colors ${
              mobileView === "map" ? "bg-primary/10 text-primary" : "text-[#1a1a1a]"
            }`}
          >
            <MapIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Map</span>
          </button>

          {/* List */}
          <button
            onClick={() => onSetView("list")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl transition-colors ${
              mobileView === "list" ? "bg-primary/10 text-primary" : "text-[#1a1a1a]"
            }`}
          >
            <List className="w-5 h-5" />
            <span className="text-xs font-medium">List</span>
          </button>

          {/* Search */}
          <button
            onClick={searchExpanded ? handleCloseSearch : handleSearchClick}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl transition-colors ${
              searchExpanded ? "bg-primary/10 text-primary" : "text-[#1a1a1a]"
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs font-medium">Search</span>
          </button>
        </div>
      </div>
    </>
  );
}
