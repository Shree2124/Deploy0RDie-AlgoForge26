"use client";

import "@/lib/leaflet";
import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Navigation, MapPin } from "lucide-react";
import { OfficialRecord, Report, RiskLevel } from "@/types/types";
import { MAP_CENTER } from "@/lib/constants";
import RandomMarkers from "./RandomMarkers";

type MapTheme = "light" | "dark" | "satellite" | "terrain" | "watercolor";
type MapOverlay = "none" | "heatmap" | "cluster" | "density";

const TILE_URLS: Record<MapTheme, { url: string; attribution: string }> = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri',
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  watercolor: {
    url: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia</a>',
  },
};

interface Props {
  records?: OfficialRecord[];
  reports?: Report[];
  onRecordSelect: (record: OfficialRecord) => void;
  userLocation?: { lat: number; lng: number } | null;
  theme: MapTheme;
  overlay: MapOverlay;
  flyToLocation?: { lat: number; lng: number } | null;
}

const getColorForRisk = (risk?: RiskLevel) => {
  switch (risk) {
    case RiskLevel.HIGH: return "#ef4444";
    case RiskLevel.MEDIUM: return "#f59e0b";
    case RiskLevel.LOW: return "#22c55e";
    default: return "#94a3b8";
  }
};

// User Location Icon
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

// Map fly controller
const FlyToController = ({ location }: { location?: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [location, map]);
  return null;
};

// Heatmap overlay using circle markers with large radii and low opacity
const HeatmapOverlay = ({ records, reports }: { records: OfficialRecord[]; reports: Report[] }) => {
  const points: { lat: number; lng: number; intensity: number }[] = [];

  records.forEach((r) => {
    points.push({ lat: r.location.lat, lng: r.location.lng, intensity: 0.6 });
  });
  reports.forEach((r) => {
    const risk = r.auditResult?.riskLevel;
    const intensity = risk === RiskLevel.HIGH ? 1.0 : risk === RiskLevel.MEDIUM ? 0.7 : 0.4;
    points.push({
      lat: r.evidence.coordinates.lat,
      lng: r.evidence.coordinates.lng,
      intensity,
    });
  });

  // Generate additional density points around existing ones
  const densityPoints = [...points];
  points.forEach((p) => {
    for (let i = 0; i < 5; i++) {
      densityPoints.push({
        lat: p.lat + (Math.random() - 0.5) * 0.02,
        lng: p.lng + (Math.random() - 0.5) * 0.02,
        intensity: p.intensity * (0.3 + Math.random() * 0.4),
      });
    }
  });

  return (
    <>
      {densityPoints.map((point, i) => (
        <CircleMarker
          key={`heat-${i}`}
          center={[point.lat, point.lng]}
          radius={35 * point.intensity}
          pathOptions={{
            color: "transparent",
            fillColor: point.intensity > 0.7 ? "#ef4444" : point.intensity > 0.4 ? "#f59e0b" : "#22c55e",
            fillOpacity: 0.25 * point.intensity,
          }}
        />
      ))}
    </>
  );
};

// Cluster overlay using larger circle markers
const ClusterOverlay = ({ records, reports }: { records: OfficialRecord[]; reports: Report[] }) => {
  const clusters: { lat: number; lng: number; count: number; risk: string }[] = [];

  // Group by proximity
  const allPoints = [
    ...records.map((r) => ({ lat: r.location.lat, lng: r.location.lng, risk: "low" })),
    ...reports.map((r) => ({
      lat: r.evidence.coordinates.lat,
      lng: r.evidence.coordinates.lng,
      risk: r.auditResult?.riskLevel === RiskLevel.HIGH ? "high" : r.auditResult?.riskLevel === RiskLevel.MEDIUM ? "medium" : "low",
    })),
  ];

  // Simple grid-based clustering
  const grid: Record<string, { lat: number; lng: number; count: number; highCount: number }> = {};
  allPoints.forEach((p) => {
    const key = `${Math.round(p.lat * 50)}:${Math.round(p.lng * 50)}`;
    if (!grid[key]) {
      grid[key] = { lat: p.lat, lng: p.lng, count: 0, highCount: 0 };
    }
    grid[key].count++;
    if (p.risk === "high") grid[key].highCount++;
  });

  return (
    <>
      {Object.values(grid).map((cluster, i) => (
        <CircleMarker
          key={`cluster-${i}`}
          center={[cluster.lat, cluster.lng]}
          radius={15 + cluster.count * 5}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: cluster.highCount > 0 ? "#ef4444" : "#85bdbf",
            fillOpacity: 0.7,
          }}
        >
          <Popup>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: "#040f0f" }}>{cluster.count}</div>
              <div className="text-xs" style={{ color: "#57737a" }}>reports in area</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

// Population density overlay (simulated)
const DensityOverlay = () => {
  const densityZones = [
    { lat: 19.076, lng: 72.8777, radius: 50, density: 0.9, label: "High Density" },
    { lat: 19.0178, lng: 72.8478, radius: 40, density: 0.7, label: "Medium Density" },
    { lat: 18.944, lng: 72.823, radius: 45, density: 0.8, label: "High Density" },
    { lat: 19.1136, lng: 72.8697, radius: 35, density: 0.5, label: "Low Density" },
    { lat: 19.0544, lng: 72.821, radius: 30, density: 0.6, label: "Medium Density" },
  ];

  return (
    <>
      {densityZones.map((zone, i) => (
        <CircleMarker
          key={`density-${i}`}
          center={[zone.lat, zone.lng]}
          radius={zone.radius}
          pathOptions={{
            color: "transparent",
            fillColor: zone.density > 0.7 ? "#7c3aed" : zone.density > 0.5 ? "#8b5cf6" : "#a78bfa",
            fillOpacity: 0.2 + zone.density * 0.15,
          }}
        >
          <Popup>
            <div className="text-center">
              <div className="text-sm font-bold" style={{ color: "#040f0f" }}>{zone.label}</div>
              <div className="text-xs" style={{ color: "#57737a" }}>Density: {Math.round(zone.density * 100)}%</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

export default function AdvancedMapVisualizer({
  records = [],
  reports = [],
  onRecordSelect,
  userLocation,
  theme,
  overlay,
  flyToLocation,
}: Props) {
  const tileConfig = TILE_URLS[theme];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[MAP_CENTER.lat, MAP_CENTER.lng]}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          key={theme}
          url={tileConfig.url}
          attribution={tileConfig.attribution}
        />

        <FlyToController location={flyToLocation || userLocation} />

        {/* Random background markers */}
        {overlay === "none" && (
          <RandomMarkers
            center={userLocation ? [userLocation.lat, userLocation.lng] : [MAP_CENTER.lat, MAP_CENTER.lng]}
            count={20}
          />
        )}

        {/* User Location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup><div className="text-xs font-bold text-blue-600">You are here</div></Popup>
          </Marker>
        )}

        {/* Standard markers */}
        {overlay === "none" && records.map((record) => (
          <Marker
            key={record.id}
            position={[record.location.lat, record.location.lng]}
            eventHandlers={{ click: () => onRecordSelect(record) }}
          >
            <Popup>
              <div>
                <div className="font-bold text-sm">{record.projectName}</div>
                <div className="text-xs text-gray-500">₹{(record.budget / 10000000).toFixed(2)} Cr</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {overlay === "none" && reports.map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.evidence.coordinates.lat, report.evidence.coordinates.lng]}
            radius={12}
            pathOptions={{
              color: "white",
              weight: 2,
              fillColor: getColorForRisk(report.auditResult?.riskLevel),
              fillOpacity: 0.8,
            }}
          />
        ))}

        {/* Overlay layers */}
        {overlay === "heatmap" && <HeatmapOverlay records={records} reports={reports} />}
        {overlay === "cluster" && <ClusterOverlay records={records} reports={reports} />}
        {overlay === "density" && <DensityOverlay />}
      </MapContainer>
    </div>
  );
}
