export type Locale = "en" | "kn";

export interface FIRSummary {
  id: number;
  firNumber: string;
  date: string;
  crimeType: "murder" | "robbery" | "theft" | "fraud" | "assault" | "kidnapping" | string;
  district: string;
  station?: string | null;
  status: "open" | "closed" | "pending" | "chargesheeted" | string;
  modusOperandi?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accusedCount?: number;
  victimCount?: number;
}

export interface OffenderSummary {
  id: number;
  name: string;
  age?: number | null;
  gender?: "M" | "F" | string | null;
  address?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  firCount: number;
  knownCrimeTypes: string[];
  lastSeenDistrict?: string | null;
  riskScore?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  locale: Locale;
  timestamp: string;
  isLoading?: boolean;
}

export interface Alert {
  id: number;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  firId?: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "accused" | "fir" | "district" | "crime_type" | string;
  group?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  linkType?: "co_accused" | "association" | "hierarchy" | string;
  weight?: number;
  directed?: boolean;
  metadata?: Record<string, unknown>;
}
