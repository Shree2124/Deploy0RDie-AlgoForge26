"use client";

import "@/lib/leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
  useMapEvents, // Import events hook
} from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Navigation, MapPin } from "lucide-react";
import { OfficialRecord, Report, RiskLevel } from "@/types/types";
import { MAP_CENTER } from "@/lib/constants";

interface Props {
  records?: OfficialRecord[];
  reports?: Report[];
  onRecordSelect: (record: OfficialRecord) => void;
  userLocation?: { lat: number; lng: number } | null;
  // New Props for Map Selection
  onMapClick?: (lat: number, lng: number) => void;
  draftLocation?: { lat: number; lng: number } | null;
}

const getColorForRisk = (risk?: RiskLevel) => {
  switch (risk) {
    case RiskLevel.HIGH: return "#ef4444";
    case RiskLevel.MEDIUM: return "#f59e0b";
    case RiskLevel.LOW: return "#22c55e";
    default: return "#94a3b8";
  }
};

const CATEGORY_COLORS: Record<string, string> = {
  'Roads': '#f97316',
  'Sanitation': '#eab308',
  'Public Buildings': '#3b82f6',
  'Water Supply': '#06b6d4',
  'Other': '#6b7280',
};

const getColorForCategory = (category?: string) => {
  return CATEGORY_COLORS[category || 'Other'] || CATEGORY_COLORS['Other'];
};

// 1. User Location Icon (Blue Pulse)
const createUserIcon = () => {
  if (typeof window === "undefined") return L.divIcon({});
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex items-center justify-center w-8 h-8">
      <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-40 animate-ping"></div>
      <div className="relative w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
        <Navigation size={12} className="text-white fill-current" />
      </div>
    </div>
  );
  return L.divIcon({ html: iconHtml, className: "custom-user-marker", iconSize: [32, 32], iconAnchor: [16, 16] });
};

// 2. Draft Location Icon (Purple Pin) 
const createDraftIcon = () => {
  if (typeof window === "undefined") return L.divIcon({});
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex items-center justify-center w-8 h-8 -mt-8">
      <div className="relative w-8 h-8 text-purple-600 drop-shadow-lg filter">
        <MapPin size={32} fill="currentColor" className="text-white" />
      </div>
      <div className="absolute -bottom-1 w-2 h-1 bg-black/30 rounded-full blur-[2px]"></div>
    </div>
  );
  return L.divIcon({ html: iconHtml, className: "custom-draft-marker", iconSize: [32, 32], iconAnchor: [16, 32] });
};

// 3. Helper to capture map clicks
const MapClickHandler = ({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// 4. Controller to fly to locations
const MapController = ({ center }: { center?: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 15, { animate: true });
    }
  }, [center, map]);
  return null;
};

export default function MapVisualizer({
  records = [],
  reports = [],
  onRecordSelect,
  userLocation,
  onMapClick,
  draftLocation,
}: Props) {
  
  // Map Focus Priority: Draft Selection > User Location > Default
  const activeCenter = draftLocation || userLocation;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[MAP_CENTER.lat, MAP_CENTER.lng]}
        zoom={14}
        className="h-full w-full"
        zoomControl={false} // Cleaner look
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Controls Map Movement */}
        <MapController center={activeCenter} />

        {/* Handles Clicks for selection */}
        <MapClickHandler onMapClick={onMapClick} />

        {/* 1. User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup><div className="text-xs font-bold text-blue-600">You are here</div></Popup>
          </Marker>
        )}

        {/* 2. Draft Selection Marker (Purple) */}
        {draftLocation && (
          <Marker position={[draftLocation.lat, draftLocation.lng]} icon={createDraftIcon()}>
            <Popup><div className="text-xs font-bold text-purple-600">Selected Location</div></Popup>
          </Marker>
        )}

        {/* 3. Official Records Markers */}
        {records.map((record) => (
          <Marker
            key={record.id}
            position={[record.location.lat, record.location.lng]}
            eventHandlers={{ click: () => onRecordSelect(record) }}
          >
            <Popup>{record.projectName}</Popup>
          </Marker>
        ))}

        {/* 4. Citizen Report Markers (category-colored with risk ring) */}
        {reports.map((report) => (
          <CircleMarker
            key={report.id}
            center={[
              report.evidence.coordinates.lat,
              report.evidence.coordinates.lng,
            ]}
            radius={10}
            pathOptions={{
              color: getColorForRisk(report.auditResult?.riskLevel),
              weight: 3,
              fillColor: getColorForCategory(report.category),
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColorForCategory(report.category) }} />
                  <span className="text-xs font-bold text-slate-800">{report.category || 'Other'}</span>
                </div>
                {report.auditResult && (
                  <div className="text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mb-1" style={{
                    backgroundColor: report.auditResult.riskLevel === RiskLevel.HIGH ? '#fef2f2' : report.auditResult.riskLevel === RiskLevel.MEDIUM ? '#fffbeb' : '#f0fdf4',
                    color: getColorForRisk(report.auditResult.riskLevel),
                  }}>
                    {report.auditResult.riskLevel} Risk
                  </div>
                )}
                {report.evidence.userComment && (
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{report.evidence.userComment}</p>
                )}
                <div className="text-[10px] text-slate-400 mt-1">#{report.id.substring(0, 8)}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}