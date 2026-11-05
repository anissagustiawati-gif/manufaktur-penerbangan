export type FlightStatus =
  | 'Scheduled'
  | 'Active'
  | 'En Route'
  | 'Landed'
  | 'Delayed'
  | 'Cancelled'
  | 'Diverted'
  | 'Unknown';

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string; // e.g. "Asia/Singapore", "America/New_York"
  utcOffset: number; // in hours
  latitude: number;
  longitude: number;
  elevationFeet?: number;
  terminals?: string[];
  runways?: string[];
  type?: 'International' | 'Major Hub' | 'Regional' | 'Domestic';
  website?: string;
  imageUrl?: string;
}

export interface Airline {
  iata: string;
  icao: string;
  name: string;
  callsign: string;
  country: string;
  hubAirports: string[]; // IATA codes
  website?: string;
  fleetCount?: number;
  alliance?: string;
  logoUrl?: string;
}

export interface Aircraft {
  icaoType: string; // e.g. A359, B789, A388, B77W
  manufacturer: 'Airbus' | 'Boeing' | 'Embraer' | 'ATR' | 'Bombardier';
  model: string; // e.g. "Airbus A350-900"
  typeCategory: 'Wide-body Jet' | 'Narrow-body Jet' | 'Regional Jet' | 'Turboprop';
  wingspanMeters: number;
  lengthMeters: number;
  rangeKm: number;
  cruisingSpeedKmH: number;
  maxPassengers: number;
  engineCount: number;
  engineType: string;
}

export interface FlightRecord {
  id: string; // e.g. "SQ321-20261102"
  flightNumber: string; // e.g. "SQ321"
  iataFlightCode: string; // "SQ321"
  icaoFlightCode: string; // "SIA321"
  airlineIata: string; // "SQ"
  airlineIcao: string; // "SIA"
  airlineName: string;
  departureAirportIata: string;
  departureAirportIcao: string;
  departureAirportName: string;
  departureCity: string;
  departureCountry: string;
  arrivalAirportIata: string;
  arrivalAirportIcao: string;
  arrivalAirportName: string;
  arrivalCity: string;
  arrivalCountry: string;
  
  // Date & Time in UTC ISO strings
  scheduledDepartureUtc: string;
  estimatedDepartureUtc?: string;
  actualDepartureUtc?: string;
  
  scheduledArrivalUtc: string;
  estimatedArrivalUtc?: string;
  actualArrivalUtc?: string;
  
  // Local time cached strings for display
  scheduledDepartureLocal: string; // "14:30"
  departureDateLocal: string; // "2026-11-02"
  scheduledArrivalLocal: string; // "20:55"
  arrivalDateLocal: string; // "2026-11-02"
  
  status: FlightStatus;
  delayMinutes: number;
  durationMinutes: number;
  
  aircraftIcaoType: string;
  aircraftModel: string;
  aircraftRegistration?: string;
  
  terminalDeparture?: string;
  gateDeparture?: string;
  terminalArrival?: string;
  gateArrival?: string;
  baggageBelt?: string;
  
  isInternational: boolean;
  codeshares?: string[];
  
  // Real-time tracking data if available
  liveTracking?: {
    latitude: number;
    longitude: number;
    altitudeFeet: number;
    groundSpeedKnots: number;
    headingDegrees: number;
    verticalRateFpm?: number;
    lastUpdateUtc: string;
    source: 'OpenSky' | 'ADS-B' | 'AeroAPI' | 'Simulated Route';
  };
  
  dataSource: 'Aviationstack' | 'OpenSky Network' | 'AirLabs' | 'Authoritative Reference';
  lastUpdatedUtc: string;
}

export interface FlightRoute {
  id: string; // "SIN-LHR"
  originIata: string;
  originName: string;
  destinationIata: string;
  destinationName: string;
  distanceKm: number;
  typicalDurationMinutes: number;
  operatingAirlines: string[];
  flightNumbers: string[];
  primaryAircraft: string[];
}

export interface AviationArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category:
    | 'Aviation News'
    | 'Airport Guides'
    | 'Airline Information'
    | 'Aircraft Guides'
    | 'Flight Travel Tips'
    | 'Aviation Technology'
    | 'Airport Operations'
    | 'Global Aviation';
  featuredImage: string;
  author: {
    name: string;
    role: string;
  };
  publishedDate: string;
  updatedDate: string;
  readTimeMinutes: number;
  tags: string[];
  isPublished: boolean;
  views?: number;
  uniqueVisitors?: number;
}

export interface DailyTraffic {
  date: string;
  dayLabel: string;
  visitors: number;
  pageviews: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  dateFormatted: string;
  isRead: boolean;
  targetEmail: string;
}

export interface VisitorAnalytics {
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  totalPageviews: number;
  averageTimeOnSite: string;
  bounceRate: string;
  dailyHistory: DailyTraffic[];
  articleViews: Record<string, { views: number; uniqueVisitors: number; lastViewedUtc: string }>;
  routeViews: Record<string, number>;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  provider: 'OpenSky Network' | 'Aviationstack' | 'AirLabs' | 'Authoritative Sync';
  status: 'Success' | 'Warning' | 'Error';
  recordsImported: number;
  recordsUpdated: number;
  durationMs: number;
  notes: string;
}

export interface WebsiteSettings {
  siteName: string;
  tagline: string;
  enableAdSense: boolean;
  adSenseClientId: string;
  adSenseSlotTop: string;
  adSenseSlotSidebar: string;
  activeProvider: 'OpenSky Network' | 'Aviationstack' | 'AirLabs' | 'Combined';
  aviationstackApiKey: string;
  airlabsApiKey: string;
  syncIntervalMinutes: number;
  autoSyncEnabled: boolean;
}

export interface FlightFilterParams {
  search?: string;
  flightNumber?: string;
  airport?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  airline?: string;
  country?: string;
  aircraftType?: string;
  status?: FlightStatus | 'ALL';
  date?: string;
  isInternational?: 'ALL' | 'domestic' | 'international';
  departureTimeRange?: 'ALL' | 'morning' | 'afternoon' | 'evening' | 'night';
  sortBy?: 'departureTime' | 'arrivalTime' | 'airline' | 'flightNumber';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
