"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { useRouter } from "next/navigation";
import { RiskLevel } from "@/types/types";

interface RandomMarkersProps {
  center: [number, number];
  count: number;
}

const MOCK_AUDITS = [
  {
    id: "AUDIT-001",
    projectName: "Marine Drive Promenade Resurfacing",
    riskLevel: RiskLevel.HIGH,
    discrepancies: ["Sub-standard materials", "Uneven levelling"],
    reasoning: "Materials don't match tender specifications",
    confidenceScore: 0.88,
  },
  {
    id: "AUDIT-002",
    projectName: "Road Widening Project - Eastern Corridor",
    riskLevel: RiskLevel.MEDIUM,
    discrepancies: ["Delayed timeline", "Budget overrun"],
    reasoning: "Project completion delayed by 6 months",
    confidenceScore: 0.75,
  },
  {
    id: "AUDIT-003",
    projectName: "Water Pipeline Renovation",
    riskLevel: RiskLevel.LOW,
    discrepancies: [],
    reasoning: "Project completed as per specifications",
    confidenceScore: 0.95,
  },
];

const MOCK_RECORDS = [
  {
    id: "MCGM-2024-001",
    projectName: "Marine Drive Promenade Resurfacing",
    contractor: "Mumbai Infra Projects Ltd",
    budget: 45000000,
    status: "Completed",
    location: { lat: 19.0176, lng: 72.8292 },
  },
  {
    id: "MCGM-2024-002",
    projectName: "Road Widening Project - Eastern Corridor",
    contractor: "Bharat Road Builders",
    budget: 75000000,
    status: "In Progress",
    location: { lat: 19.076, lng: 72.877 },
  },
  {
    id: "MCGM-2024-003",
    projectName: "Water Pipeline Renovation",
    contractor: "Aqua Infrastructure Ltd",
    budget: 35000000,
    status: "Completed",
    location: { lat: 19.0895, lng: 72.8656 },
  },
];

const getColorForRisk = (risk: RiskLevel) => {
  switch (risk) {
    case RiskLevel.HIGH:
      return "#ef4444";
    case RiskLevel.MEDIUM:
      return "#f59e0b";
    case RiskLevel.LOW:
      return "#22c55e";
    default:
      return "#94a3b8";
  }
};

export default function RandomMarkers({ center, count }: RandomMarkersProps) {
  const router = useRouter();

  const generateRandomMarkers = () => {
    const markers = [];
    for (let i = 0; i < count; i++) {
      const audit = MOCK_AUDITS[i % MOCK_AUDITS.length];
      const record = MOCK_RECORDS[i % MOCK_RECORDS.length];

      const lat = center[0] + (Math.random() - 0.5) * 0.1;
      const lng = center[1] + (Math.random() - 0.5) * 0.1;

      markers.push({
        id: `marker-${i}`,
        lat,
        lng,
        audit,
        record,
      });
    }
    return markers;
  };

  const markers = generateRandomMarkers();

  const handleMarkerClick = (
    audit: (typeof MOCK_AUDITS)[0],
    record: (typeof MOCK_RECORDS)[0]
  ) => {
    const auditParam = encodeURIComponent(JSON.stringify(audit));
    const recordParam = encodeURIComponent(JSON.stringify(record));
    router.push(`/auditview?audit=${auditParam}&record=${recordParam}`);
  };

  return (
    <>
      {markers.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={8}
          pathOptions={{
            color: "white",
            weight: 2,
            fillColor: getColorForRisk(marker.audit.riskLevel),
            fillOpacity: 0.7,
          }}
          eventHandlers={{
            click: () => handleMarkerClick(marker.audit, marker.record),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{marker.audit.projectName}</p>
              <p className="text-xs text-slate-600 mt-1">Click to view audit</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
