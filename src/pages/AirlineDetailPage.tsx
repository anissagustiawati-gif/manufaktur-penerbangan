import React from 'react';
import { ArrowLeft, Globe, Plane, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { FlightTable } from '../components/FlightTable';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  airlineCode: string;
  onNavigate: (path: string) => void;
}

export const AirlineDetailPage: React.FC<Props> = ({ airlineCode, onNavigate }) => {
  const airline = aviationService.getAirlineByCode(airlineCode);

  if (!airline) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans">
        <Plane className="w-12 h-12 text-[#681C35] mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#25232A]">Airline Not Found</h1>
        <p className="text-xs text-[#777780] mt-1">
          No commercial airline record found for code &quot;{airlineCode}&quot;.
        </p>
        <a
          href="/airlines"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/airlines');
          }}
          className="inline-block mt-6 px-4 py-2 bg-[#681C35] text-white text-xs font-semibold rounded"
        >
          Return to Airlines Directory
        </a>
      </div>
    );
  }

  const { flights } = aviationService.getFlights({ airline: airline.iata, pageSize: 50 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <a
          href="/airlines"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/airlines');
          }}
          className="inline-flex items-center gap-1.5 text-xs text-[#777780] hover:text-[#681C35] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Airlines</span>
        </a>
        <span className="text-xs text-[#777780] font-mono">Airline URL: /airline/{airline.iata}</span>
      </div>

      <div className="bg-white border border-[#E8E5E8] rounded-md shadow-xs overflow-hidden">
        <div className="bg-[#681C35] text-white p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {airline.iata}
              </span>
              <span className="text-sm font-mono text-white/80">
                / {airline.icao}
              </span>
              {airline.alliance && (
                <span className="text-[11px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded ml-2">
                  {airline.alliance}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">
              {airline.name}
            </h1>
            <p className="text-xs text-white/85 mt-1">
              {airline.country} · Callsign: <span className="font-mono font-bold text-amber-300">{airline.callsign}</span>
            </p>
          </div>

          <div className="text-right bg-white/10 p-3 rounded border border-white/20 text-xs space-y-1">
            <div className="text-[11px] text-white/70">Official Hubs</div>
            <div className="text-base font-bold font-mono text-amber-300">
              {airline.hubAirports.join(', ')}
            </div>
            {airline.fleetCount && (
              <div className="text-[10px] text-white/80">
                Operating Fleet: {airline.fleetCount} aircraft
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-[#FAF9FA] border-b border-[#E8E5E8] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[#777780] block text-[11px]">Primary Country</span>
              <span className="font-semibold text-[#25232A]">{airline.country}</span>
            </div>
            <div>
              <span className="text-[#777780] block text-[11px]">Alliance Membership</span>
              <span className="font-semibold text-[#25232A]">{airline.alliance || 'Independent'}</span>
            </div>
          </div>

          {airline.website && (
            <a
              href={airline.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E5E8] hover:border-[#681C35] rounded text-xs font-semibold text-[#681C35] transition-colors"
            >
              <span>Verified Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#25232A]">
              Active Flight Schedules Operated by {airline.name} ({flights.length})
            </h2>
            <span className="text-xs text-[#777780]">
              Real-time daily schedule index
            </span>
          </div>

          <FlightTable
            flights={flights}
            total={flights.length}
            page={1}
            pageSize={50}
            totalPages={1}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            onSelectFlight={(flightNumber) => onNavigate(`/flight/${flightNumber}`)}
            onSelectAirport={(iata) => onNavigate(`/airport/${iata}`)}
          />
        </div>
      </div>

      <AdSenseUnit slotId="airline-detail-bottom" format="horizontal" />

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title={`Explore Aviation Research & Connecting Routes for ${airline.name}`}
        subtitle={`Discover transcontinental airline analyses, regional fleet specifications, and live Canadian flight schedules.`}
      />
    </div>
  );
};
