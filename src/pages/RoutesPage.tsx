import React, { useState } from 'react';
import { Compass, Search, ArrowRight, Plane, Clock } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  onNavigate: (path: string) => void;
}

export const RoutesPage: React.FC<Props> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const routes = aviationService.getRoutes(search);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      <div className="border-b border-[#E8E5E8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Canadian Air Route Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25232A] mt-1">
            Canadian Flight Routes & Corridors
          </h1>
          <p className="text-xs sm:text-sm text-[#777780] mt-1">
            Explore trans-Canada trunk lines, regional feeder corridors, northern Arctic routes, distances, and typical gate-to-gate block times.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search city, airport code (YYZ, YVR, YFB)..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E5E8] rounded-md text-xs focus:outline-none focus:border-[#681C35]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((route) => (
          <div
            key={route.id}
            className="bg-white border border-[#E8E5E8] rounded-md p-5 shadow-2xs hover:border-[#681C35] transition-all"
          >
            <div className="flex items-center justify-between border-b border-[#E8E5E8] pb-3">
              <div className="flex items-center gap-3">
                <a
                  href={`/airport/${route.originIata}`}
                  onClick={(e) => { e.preventDefault(); onNavigate(`/airport/${route.originIata}`); }}
                  className="text-xl font-black font-mono text-[#681C35] hover:underline"
                >
                  {route.originIata}
                </a>
                <ArrowRight className="w-4 h-4 text-[#777780]" />
                <a
                  href={`/airport/${route.destinationIata}`}
                  onClick={(e) => { e.preventDefault(); onNavigate(`/airport/${route.destinationIata}`); }}
                  className="text-xl font-black font-mono text-[#681C35] hover:underline"
                >
                  {route.destinationIata}
                </a>
              </div>

              <div className="text-xs text-[#777780] font-mono">
                {route.distanceKm.toLocaleString()} km
              </div>
            </div>

            <div className="py-3 text-xs space-y-2">
              <div className="flex justify-between text-[#25232A]">
                <span className="font-medium">{route.originName}</span>
                <span className="font-medium text-right">{route.destinationName}</span>
              </div>

              <div className="flex items-center justify-between text-[#777780] pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#681C35]" />
                  <span>Avg Duration: {Math.floor(route.typicalDurationMinutes / 60)}h {route.typicalDurationMinutes % 60}m</span>
                </span>
                <span>Operating Airlines: {route.operatingAirlines.length}</span>
              </div>

              <div className="bg-[#FAF9FA] p-2.5 rounded border border-[#E8E5E8]/60 space-y-1.5 text-[11px]">
                <div>
                  <span className="text-[#777780]">Carriers: </span>
                  <span className="font-medium text-[#25232A]">{route.operatingAirlines.join(', ')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[#777780]">Flight Numbers: </span>
                  {route.flightNumbers.map((fn) => (
                    <a
                      key={fn}
                      href={`/flight/${fn}`}
                      onClick={(e) => { e.preventDefault(); onNavigate(`/flight/${fn}`); }}
                      className="font-mono text-[#681C35] font-semibold hover:underline"
                    >
                      {fn}
                    </a>
                  ))}
                </div>
                <div>
                  <span className="text-[#777780]">Common Aircraft: </span>
                  <span className="text-[#25232A]">{route.primaryAircraft.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <a
                href={`/flights?dep=${route.originIata}&arr=${route.destinationIata}`}
                onClick={(e) => { e.preventDefault(); onNavigate(`/flights?dep=${route.originIata}&arr=${route.destinationIata}`); }}
                className="text-xs font-semibold text-[#681C35] hover:underline inline-flex items-center justify-end gap-1 cursor-pointer"
              >
                <span>View Scheduled Flights for this Route</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <AdSenseUnit slotId="routes-bottom" format="horizontal" />

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title="Discover Transcontinental Routes & Aviation Flight Analyses"
        subtitle="Explore detailed reports on the Porter E2 expansion, oceanic track coordination, and winter holding protocols."
      />
    </div>
  );
};
