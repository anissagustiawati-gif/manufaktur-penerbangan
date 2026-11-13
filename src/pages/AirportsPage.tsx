import React, { useState } from 'react';
import { Building2, Search, MapPin, Compass, ArrowRight, ExternalLink } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  onNavigate: (path: string) => void;
}

export const AirportsPage: React.FC<Props> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const airports = aviationService.getAirports(search);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      <div className="border-b border-[#E8E5E8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Canadian Aerodrome Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25232A] mt-1">
            Canadian Airports Directory (All Provinces & Territories)
          </h1>
          <p className="text-xs sm:text-sm text-[#777780] mt-1">
            Comprehensive registry of all Canadian international, regional, and Arctic aerodromes, Transport Canada certified runways, and terminals.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Canadian airports (YYZ, YVR, YUL, YYC, YFB)..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E5E8] rounded-md text-xs focus:outline-none focus:border-[#681C35]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {airports.map((airport) => (
          <a
            key={airport.iata}
            href={`/airport/${airport.iata}`}
            onClick={(e) => { e.preventDefault(); onNavigate(`/airport/${airport.iata}`); }}
            className="bg-white border border-[#E8E5E8] rounded-md p-5 hover:border-[#681C35] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-[#681C35] group-hover:underline">
                    {airport.iata}
                  </span>
                  <span className="text-xs font-mono text-[#777780] ml-2">
                    {airport.icao}
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-[#681C35]/10 text-[#681C35] px-2 py-0.5 rounded">
                  {airport.type || 'International'}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#25232A] mt-2 group-hover:text-[#681C35] transition-colors">
                {airport.name}
              </h3>
              <p className="text-xs text-[#777780] flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#681C35]" />
                <span>{airport.city}, {airport.country}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8E5E8] space-y-1 text-xs text-[#777780]">
              <div className="flex justify-between">
                <span>Timezone:</span>
                <span className="font-mono text-[#25232A]">UTC {airport.utcOffset >= 0 ? `+${airport.utcOffset}` : airport.utcOffset}</span>
              </div>
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="font-mono text-[11px] text-[#25232A]">
                  {airport.latitude.toFixed(2)}°, {airport.longitude.toFixed(2)}°
                </span>
              </div>
              <div className="flex justify-between">
                <span>Terminals:</span>
                <span className="text-[#25232A] font-medium">{airport.terminals?.length || 1} facilities</span>
              </div>

              <div className="pt-2 text-right">
                <span className="text-xs font-semibold text-[#681C35] group-hover:underline flex items-center justify-end gap-1">
                  <span>View Airport Schedules</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <AdSenseUnit slotId="airports-directory-bottom" format="horizontal" />

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title="Featured Canadian Aerodromes Editorial & Flight Guides"
        subtitle="Learn more about terminal connections at YYZ, YVR, and YUL, winter runway friction tests, and Arctic gravel kits."
      />
    </div>
  );
};
