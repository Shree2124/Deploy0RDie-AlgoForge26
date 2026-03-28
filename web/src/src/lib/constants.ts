import { OfficialRecord, ProjectCategory, Report, RiskLevel } from '@/types/types';

export const MOCK_OFFICIAL_RECORDS: OfficialRecord[] = [
  {
    id: 'MCGM-2024-001',
    projectName: 'Marine Drive Promenade Resurfacing',
    category: ProjectCategory.ROAD,
    budget: 45000000, // INR
    contractor: 'Mumbai Infra Projects Ltd',
    deadline: '2024-06-30',
    status: 'Completed',
    location: { lat: 18.944, lng: 72.823 },
    description: 'Resurfacing of the promenade walkway with anti-skid tiles and repair of the sea-facing wall.'
  },
  {
    id: 'MCGM-2024-002',
    projectName: 'Dadar Station Skywalk Repair',
    category: ProjectCategory.BUILDING,
    budget: 12000000,
    contractor: 'Urban Connectivity Solutions',
    deadline: '2024-08-15',
    status: 'In Progress',
    location: { lat: 19.0178, lng: 72.8478 },
    description: 'Structural reinforcement and roof replacement of the east-west pedestrian skywalk.'
  },
  {
    id: 'MCGM-2024-003',
    projectName: 'Andheri East Drainage Upgrade',
    category: ProjectCategory.SANITATION,
    budget: 85000000,
    contractor: 'CityFlow Engineering',
    deadline: '2024-12-01',
    status: 'In Progress',
    location: { lat: 19.1136, lng: 72.8697 },
    description: 'Installation of larger diameter storm water drains to prevent monsoon flooding in low-lying areas.'
  },
  {
    id: 'MCGM-2024-004',
    projectName: 'Bandra Bandstand Solar Lighting',
    category: ProjectCategory.OTHER,
    budget: 5500000,
    contractor: 'Green Energy Corp',
    deadline: '2024-05-01',
    status: 'Completed',
    location: { lat: 19.0544, lng: 72.8210 },
    description: 'Installation of 50 solar-powered LED streetlamps along the Bandstand pathways.'
  }
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'REP-001',
    evidence: {
       image: '', 
       timestamp: Date.now() - 86400000,
       coordinates: { lat: 19.0178, lng: 72.8478 }
    },
    matchedRecordId: 'MCGM-2024-002', // Dadar Skywalk
    auditResult: {
      riskLevel: RiskLevel.HIGH,
      discrepancies: ['Major structural cracks observed on pillar 4.', 'Rusting of exposed reinforcement bars.'],
      reasoning: 'Visual evidence suggests critical structural integrity failure not documented in official status.',
      confidenceScore: 0.92
    },
    status: 'Verified'
  },
  {
    id: 'REP-002',
    evidence: {
       image: '',
       timestamp: Date.now() - 172800000,
       coordinates: { lat: 18.944, lng: 72.823 }
    },
    matchedRecordId: 'MCGM-2024-001', // Marine Drive
    auditResult: {
      riskLevel: RiskLevel.HIGH,
      discrepancies: ['Use of sub-standard paver blocks.', 'Uneven levelling causing water stagnation.'],
      reasoning: 'Materials used do not match the grade specified in the tender document.',
      confidenceScore: 0.88
    },
    status: 'Audited'
  }
];

export const MAP_CENTER = { lat: 19.0760, lng: 72.8777 }; // Mumbai, India