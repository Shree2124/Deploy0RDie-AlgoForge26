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
} from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Navigation } from "lucide-react";
import { OfficialRecord, Report, RiskLevel } from "@/types/types";
import { MAP_CENTER } from "@/lib/constants";

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

// Heatmap overlay — soft gradient edges via concentric layered circles
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

  // Soft-edge layers: each point gets 4 concentric rings (large→small, faint→opaque)
  const layers = [
    { radiusScale: 1.0, opacityScale: 0.08 },
    { radiusScale: 0.7, opacityScale: 0.14 },
    { radiusScale: 0.45, opacityScale: 0.22 },
    { radiusScale: 0.22, opacityScale: 0.35 },
  ];

  const getColor = (intensity: number) =>
    intensity > 0.7 ? "#ef4444" : intensity > 0.4 ? "#f59e0b" : "#22c55e";

  return (
    <>
      {points.map((point, i) =>
        layers.map((layer, li) => (
          <CircleMarker
            key={`heat-${i}-${li}`}
            center={[point.lat, point.lng]}
            radius={55 * point.intensity * layer.radiusScale}
            pathOptions={{
              color: "transparent",
              fillColor: getColor(point.intensity),
              fillOpacity: layer.opacityScale * point.intensity,
            }}
          />
        ))
      )}
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

// Population density overlay — built dynamically from report clusters
const DensityOverlay = ({ records, reports }: { records: OfficialRecord[]; reports: Report[] }) => {
  // Grid-based density from real data
  const grid: Record<string, { lat: number; lng: number; count: number }> = {};
  const allPoints = [
    ...records.map((r) => ({ lat: r.location.lat, lng: r.location.lng })),
    ...reports.map((r) => ({ lat: r.evidence.coordinates.lat, lng: r.evidence.coordinates.lng })),
  ];
  allPoints.forEach((p) => {
    const key = `${Math.round(p.lat * 30)}:${Math.round(p.lng * 30)}`;
    if (!grid[key]) grid[key] = { lat: p.lat, lng: p.lng, count: 0 };
    grid[key].count++;
  });
  const maxCount = Math.max(...Object.values(grid).map((g) => g.count), 1);

  return (
    <>
      {Object.values(grid).map((zone, i) => {
        const density = zone.count / maxCount;
        return (
          <CircleMarker
            key={`density-${i}`}
            center={[zone.lat, zone.lng]}
            radius={25 + density * 30}
            pathOptions={{
              color: "transparent",
              fillColor: density > 0.7 ? "#7c3aed" : density > 0.4 ? "#8b5cf6" : "#a78bfa",
              fillOpacity: 0.15 + density * 0.2,
            }}
          >
            <Popup>
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: "#040f0f" }}>{zone.count} report{zone.count > 1 ? 's' : ''}</div>
                <div className="text-xs" style={{ color: "#57737a" }}>Density: {Math.round(density * 100)}%</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
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

        {/* Overlay layers */}
        {overlay === "heatmap" && <HeatmapOverlay records={records} reports={reports} />}
        {overlay === "cluster" && <ClusterOverlay records={records} reports={reports} />}
        {overlay === "density" && <DensityOverlay records={records} reports={reports} />}
      </MapContainer>
    </div>
  );
}
