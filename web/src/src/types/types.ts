export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  UNKNOWN = 'Unknown'
}

export enum ProjectCategory {
  ROAD = 'Roads',
  SANITATION = 'Sanitation',
  BUILDING = 'Public Buildings',
  WATER = 'Water Supply',
  OTHER = 'Other'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Citizen' | 'Official' | 'Admin';
}

export interface OfficialRecord {
  id: string;
  projectName: string;
  category: ProjectCategory;
  budget: number;
  contractor: string;
  deadline: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  location: Coordinates;
  description: string;
}

export interface Evidence {
  image: string;
  timestamp: number;
  coordinates: Coordinates;
  userComment?: string;
}

export interface AuditResult {
  riskLevel: RiskLevel;
  discrepancies: string[];
  reasoning: string;
  confidenceScore: number;
  generatedComplaint?: string;
}

export interface Report {
  id: string;
  evidence: Evidence;
  matchedRecordId?: string; 
  auditResult?: AuditResult;
  status: 'Pending' | 'Audited' | 'Verified';
}

export interface DashboardStats {
  totalReports: number;
  highRiskCount: number;
  fundsAtRisk: number;
}