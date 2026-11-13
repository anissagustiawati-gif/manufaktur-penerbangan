import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Compass,
  PlaneTakeoff,
  PlaneLanding,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { FlightStatusBadge } from '../components/FlightStatusBadge';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  airportCode: string;
  onNavigate: (path: string) => void;
}

export const AirportDetailPage: React.FC<Props> = ({ airportCode, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'departures' | 'arrivals'>('departures');
  const airport = aviationService.getAirportByCode(airportCode);

  if (!airport) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans">
        <Building2 className="w-12 h-12 text-[#681C35] mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#25232A]">Airport Not Found</h1>
        <p className="text-xs text-[#777780] mt-1">
          No aerodrome record found for identifier &quot;{airportCode}&quot;.
        </p>
        <a
          href="/airports"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/airports');
          }}
          className="inline-block mt-6 px-4 py-2 bg-[#681C35] text-white text-xs font-semibold rounded"
        >
          Return to Airports Directory
        </a>
      </div>
    );
  }

  const departures = aviationService.getDepartures(airport.iata);
  const arrivals = aviationService.getArrivals(airport.iata);

  // Compute live local time at airport based on utcOffset
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMins = now.getUTCMinutes();
  const localHours = (utcHours + airport.utcOffset + 24) % 24;
  const localTimeStr = `${String(localHours).padStart(2, '0')}:${String(utcMins).padStart(2, '0')} Local`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      {/* Back breadcrumb */}
      <div className="flex items-center justify-between">
        <a
          href="/airports"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/airports');
          }}
          className="inline-flex items-center gap-1.5 text-xs text-[#777780] hover:text-[#681C35] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Airports</span>
        </a>
        <span className="text-xs text-[#777780] font-mono">Aerodrome URL: /airport/{airport.iata}</span>
      </div>

      {/* Airport Hero Card */}
      <div className="bg-white border border-[#E8E5E8] rounded-md shadow-xs overflow-hidden">
        <div className="bg-[#681C35] text-white p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {airport.iata}
              </span>
              <span className="text-sm font-mono text-white/80">
                / {airport.icao}
              </span>
              <span className="text-[11px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded ml-2">
                {airport.type || 'International'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">
              {airport.name}
            </h1>
            <p className="text-xs text-white/85 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{airport.city}, {airport.country}</span>
            </p>
          </div>

          <div className="text-right bg-white/10 p-3 rounded border border-white/20 text-xs space-y-1">
            <div className="text-[11px] text-white/70">Local Airport Time</div>
            <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
              {localTimeStr}
            </div>
            <div className="text-[10px] text-white/80">
              {airport.timezone} (UTC {airport.utcOffset >= 0 ? `+${airport.utcOffset}` : airport.utcOffset})
            </div>
          </div>
        </div>

        {/* Airport Specifications Bar */}
        <div className="p-6 bg-[#FAF9FA] border-b border-[#E8E5E8] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#777780] block text-[11px]">Geographic Coordinates</span>
            <span className="font-mono font-bold text-[#25232A]">
              {airport.latitude.toFixed(4)}°N, {airport.longitude.toFixed(4)}°E
            </span>
          </div>
          <div>
            <span className="text-[#777780] block text-[11px]">Field Elevation</span>
            <span className="font-mono font-bold text-[#25232A]">
              {airport.elevationFeet ? `${airport.elevationFeet} ft MSL` : 'Information currently unavailable.'}
            </span>
          </div>
          <div>
            <span className="text-[#777780] block text-[11px]">Passenger Terminals</span>
            <span className="font-semibold text-[#25232A]">
              {airport.terminals ? airport.terminals.join(', ') : 'Central Terminal'}
            </span>
          </div>
          <div>
            <span className="text-[#777780] block text-[11px]">Active Runways</span>
            <span className="font-mono font-semibold text-[#25232A]">
              {airport.runways ? airport.runways.join(' · ') : 'Commercial Paved'}
            </span>
          </div>
        </div>

        {/* Live Boards Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E5E8] pb-3">
            <div className="flex bg-[#F8F8FA] p-0.5 border border-[#E8E5E8] rounded">
              <button
                onClick={() => setActiveTab('departures')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'departures'
                    ? 'bg-[#681C35] text-white'
                    : 'text-[#777780] hover:text-[#25232A]'
                }`}
              >
                <PlaneTakeoff className="w-3.5 h-3.5" />
                <span>Today's Departures ({departures.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('arrivals')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'arrivals'
                    ? 'bg-[#681C35] text-white'
                    : 'text-[#777780] hover:text-[#25232A]'
                }`}
              >
                <PlaneLanding className="w-3.5 h-3.5" />
                <span>Today's Arrivals ({arrivals.length})</span>
              </button>
            </div>

            <span className="text-xs text-[#777780]">
              Showing confirmed flights connecting with {airport.iata}
            </span>
          </div>

          {/* List of Flights */}
          <div className="divide-y divide-[#E8E5E8]">
            {(activeTab === 'departures' ? departures : arrivals).map((flight) => (
              <a
                key={flight.id}
                href={`/flight/${flight.flightNumber}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/flight/${flight.flightNumber}`);
                }}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9FA] px-2 rounded transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#681C35]/10 text-[#681C35] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {flight.airlineIata}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#681C35] font-mono">
                        {flight.flightNumber}
                      </span>
                      <span className="text-xs text-[#25232A] font-medium">
                        {flight.airlineName}
                      </span>
                    </div>
                    <div className="text-xs text-[#777780]">
                      {activeTab === 'departures'
                        ? `To ${flight.arrivalCity} (${flight.arrivalAirportIata})`
                        : `From ${flight.departureCity} (${flight.departureAirportIata})`}
                      {' · '}
                      <span>{flight.aircraftModel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-[#25232A]">
                      {activeTab === 'departures' ? flight.scheduledDepartureLocal : flight.scheduledArrivalLocal}
                    </div>
                    <div className="text-[10px] text-[#777780]">
                      {activeTab === 'departures'
                        ? flight.gateDeparture ? `Gate ${flight.gateDeparture}` : flight.terminalDeparture || 'Scheduled'
                        : flight.baggageBelt || 'Terminal Inbound'}
                    </div>
                  </div>

                  <FlightStatusBadge status={flight.status} delayMinutes={flight.delayMinutes} />

                  <ArrowRight className="w-4 h-4 text-[#777780] hidden sm:block" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <AdSenseUnit slotId="airport-detail-bottom" format="horizontal" />

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title={`Explore Aviation Guides & Nearby Flight Corridors for ${airport.name}`}
        subtitle={`In-depth operational analyses, de-icing regulations, and connections across Canada from ${airport.iata}.`}
      />
    </div>
  );
};
