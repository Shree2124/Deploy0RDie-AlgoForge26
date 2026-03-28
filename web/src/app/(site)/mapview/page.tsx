"use client";

import { useEffect, useState, useCallback } from "react";
import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { OfficialRecord, Report } from "@/types/types";
import "@/lib/leaflet";
import {
  Map as MapIcon,
  Layers,
  Crosshair,
  Sun,
  Moon,
  Satellite,
  Mountain,
  Waves,
  Thermometer,
  Circle,
  Users,
  Activity,
  ChevronDown,
  X,
} from "lucide-react";

type MapTheme = "light" | "dark" | "satellite" | "terrain" | "watercolor";
type MapOverlay = "none" | "heatmap" | "cluster" | "density";

interface AdvancedMapProps {
  records?: OfficialRecord[];
  reports?: Report[];
  onRecordSelect: (record: OfficialRecord) => void;
  userLocation?: { lat: number; lng: number } | null;
  theme: MapTheme;
  overlay: MapOverlay;
  flyToLocation?: { lat: number; lng: number } | null;
}

const AdvancedMapVisualizer = dynamic<AdvancedMapProps>(
  () => import("@/components/MapView/AdvancedMapVisualizer") as Promise<{ default: ComponentType<AdvancedMapProps> }>,
  { ssr: false }
);

const MAP_THEMES: { id: MapTheme; label: string; icon: React.ElementType }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "satellite", label: "Satellite", icon: Satellite },
  { id: "terrain", label: "Terrain", icon: Mountain },
  { id: "watercolor", label: "Watercolor", icon: Waves },
];

const MAP_OVERLAYS: { id: MapOverlay; label: string; icon: React.ElementType; description: string }[] = [
  { id: "none", label: "Standard", icon: MapIcon, description: "Standard marker view" },
  { id: "heatmap", label: "Heatmap", icon: Thermometer, description: "Activity intensity zones" },
  { id: "cluster", label: "Cluster", icon: Circle, description: "Grouped marker clusters" },
];

export default function MapPage() {
  const [records, setRecords] = useState<OfficialRecord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<OfficialRecord | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [activeTheme, setActiveTheme] = useState<MapTheme>("light");
  const [activeOverlay, setActiveOverlay] = useState<MapOverlay>("none");
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showOverlayPanel, setShowOverlayPanel] = useState(false);
  const [locating, setLocating] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 19.076, lng: 72.8777 });
        }
      );
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const recordsRes = await fetch("/api/records").then((r) => r.json());
        const reportsRes = await fetch("/api/reports").then((r) => r.json());
        setRecords(recordsRes ?? []);
        setReports(reportsRes ?? []);
      } catch {
        setRecords([]);
        setReports([]);
      }
    }
    loadData();
  }, []);

  const handleLocateMe = useCallback(() => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          setFlyToLocation(loc);
          setLocating(false);
        },
        () => {
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  }, []);

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden" style={{ backgroundColor: "#f4feff" }}>
      {/* Top Controls Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0 z-[500]"
        style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #b0d8db" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: "#85bdbf" }} />
            <span className="text-[14px] font-bold" style={{ color: "#040f0f" }}>
              Advanced Map View
            </span>
          </div>
          <div
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold"
            style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#85bdbf" }}></div>
            Live Data
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowThemePanel(!showThemePanel); setShowOverlayPanel(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold transition-all"
              style={{
                backgroundColor: showThemePanel ? "#57737a" : "#f4feff",
                color: showThemePanel ? "#ffffff" : "#57737a",
                border: "1px solid #b0d8db",
              }}
            >
              <Layers size={14} />
              <span className="hidden sm:inline">Theme</span>
              <ChevronDown size={12} />
            </button>

            {showThemePanel && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl z-[600] overflow-hidden"
                style={{ backgroundColor: "#ffffff", border: "1px solid #b0d8db" }}
              >
                <div className="p-2 space-y-1">
                  {MAP_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => { setActiveTheme(theme.id); setShowThemePanel(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                      style={{
                        backgroundColor: activeTheme === theme.id ? "#e0f7f9" : "transparent",
                        color: activeTheme === theme.id ? "#040f0f" : "#57737a",
                      }}
                    >
                      <theme.icon size={16} />
                      {theme.label}
                      {activeTheme === theme.id && (
                        <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: "#85bdbf" }}></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Overlay Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowOverlayPanel(!showOverlayPanel); setShowThemePanel(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold transition-all"
              style={{
                backgroundColor: showOverlayPanel ? "#57737a" : "#f4feff",
                color: showOverlayPanel ? "#ffffff" : "#57737a",
                border: "1px solid #b0d8db",
              }}
            >
              <Thermometer size={14} />
              <span className="hidden sm:inline">Overlay</span>
              <ChevronDown size={12} />
            </button>

            {showOverlayPanel && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl z-[600] overflow-hidden"
                style={{ backgroundColor: "#ffffff", border: "1px solid #b0d8db" }}
              >
                <div className="p-2 space-y-1">
                  {MAP_OVERLAYS.map((overlay) => (
                    <button
                      key={overlay.id}
                      onClick={() => { setActiveOverlay(overlay.id); setShowOverlayPanel(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                      style={{
                        backgroundColor: activeOverlay === overlay.id ? "#e0f7f9" : "transparent",
                        color: activeOverlay === overlay.id ? "#040f0f" : "#57737a",
                      }}
                    >
                      <overlay.icon size={16} />
                      <div>
                        <div className="text-[13px] font-medium">{overlay.label}</div>
                        <div className="text-[11px]" style={{ color: "#85bdbf" }}>{overlay.description}</div>
                      </div>
                      {activeOverlay === overlay.id && (
                        <div className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#85bdbf" }}></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showThemePanel || showOverlayPanel) && (
        <div className="fixed inset-0 z-[400]" onClick={() => { setShowThemePanel(false); setShowOverlayPanel(false); }} />
      )}

      {/* Map Container */}
      <div className="flex-1 relative z-0">
        <AdvancedMapVisualizer
          records={records}
          reports={reports}
          onRecordSelect={setSelectedRecord}
          userLocation={userLocation}
          theme={activeTheme}
          overlay={activeOverlay}
          flyToLocation={flyToLocation}
        />

        {/* Locate Me Button */}
        <button
          onClick={handleLocateMe}
          className="absolute bottom-6 right-6 z-[500] w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "#ffffff",
            border: "2px solid #b0d8db",
          }}
          title="Find my location"
        >
          <Crosshair
            size={22}
            className={locating ? "animate-spin" : ""}
            style={{ color: locating ? "#85bdbf" : "#57737a" }}
          />
        </button>

        {/* Active overlay badge */}
        {activeOverlay !== "none" && (
          <div
            className="absolute bottom-6 left-6 z-[500] flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg text-[12px] font-bold"
            style={{ backgroundColor: "#ffffff", border: "1px solid #b0d8db", color: "#57737a" }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#85bdbf" }}></div>
            {MAP_OVERLAYS.find((o) => o.id === activeOverlay)?.label} Active
            <button
              onClick={() => setActiveOverlay("none")}
              className="p-0.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Selected Record Info */}
        {selectedRecord && (
          <div
            className="absolute top-4 left-4 z-[500] max-w-sm rounded-xl shadow-lg p-4"
            style={{ backgroundColor: "#ffffff", border: "1px solid #b0d8db" }}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded"
                style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}
              >
                {selectedRecord.id}
              </span>
              <button onClick={() => setSelectedRecord(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={14} style={{ color: "#57737a" }} />
              </button>
            </div>
            <h3 className="text-[14px] font-bold mb-1" style={{ color: "#040f0f" }}>
              {selectedRecord.projectName}
            </h3>
            <p className="text-[12px] mb-2" style={{ color: "#57737a" }}>
              {selectedRecord.description}
            </p>
            <div className="flex items-center gap-3 text-[11px]" style={{ color: "#85bdbf" }}>
              <span>₹{(selectedRecord.budget / 10000000).toFixed(2)} Cr</span>
              <span>•</span>
              <span>{selectedRecord.contractor}</span>
              <span>•</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{
                  backgroundColor: selectedRecord.status === "Completed" ? "#dcfce7" : "#e0f7f9",
                  color: selectedRecord.status === "Completed" ? "#16a34a" : "#57737a",
                }}
              >
                {selectedRecord.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
