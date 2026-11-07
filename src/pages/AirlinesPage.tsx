import React, { useState } from 'react';
import { Users, Search, Globe, Plane, ArrowRight } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  onNavigate: (path: string) => void;
}

export const AirlinesPage: React.FC<Props> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const airlines = aviationService.getAirlines(search);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      <div className="border-b border-[#E8E5E8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
            <Plane className="w-4 h-4" />
            <span>Canadian Carriers Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25232A] mt-1">
            Canadian Commercial Airlines Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#777780] mt-1">
            Explore Canada&apos;s major national carriers, northern lifeline operators, IATA/ICAO airline codes, callsigns, and active fleets.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Canadian airlines (Air Canada, WestJet, Porter)..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E5E8] rounded-md text-xs focus:outline-none focus:border-[#681C35]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {airlines.map((airline) => (
          <div
            key={airline.iata}
            onClick={() => onNavigate(`/airline/${airline.iata.toLowerCase()}`)}
            className="bg-white border border-[#E8E5E8] rounded-md p-5 hover:border-[#681C35] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-[#681C35] group-hover:underline">
                    {airline.iata}
                  </span>
                  <span className="text-xs font-mono text-[#777780] ml-2">
                    {airline.icao}
                  </span>
                </div>
                {airline.alliance && (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {airline.alliance}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-[#25232A] mt-2 group-hover:text-[#681C35] transition-colors">
                {airline.name}
              </h3>
              <p className="text-xs text-[#777780] mt-1">
                {airline.country} · Callsign: <span className="font-mono text-[#25232A] font-semibold">{airline.callsign}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8E5E8] space-y-1 text-xs text-[#777780]">
              <div className="flex justify-between">
                <span>Main Hubs:</span>
                <span className="font-mono font-semibold text-[#25232A]">{airline.hubAirports.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Fleet Count:</span>
                <span className="font-mono text-[#25232A]">{airline.fleetCount ? `${airline.fleetCount} aircraft` : 'Verified Fleet'}</span>
              </div>

              <div className="pt-2 text-right">
                <span className="text-xs font-semibold text-[#681C35] group-hover:underline flex items-center justify-end gap-1">
                  <span>View Airline Operations</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdSenseUnit slotId="airlines-bottom" format="horizontal" />

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title="Featured Canadian Carrier Analyses & Transcontinental Fleets"
        subtitle="Explore detailed reports on Porter Airlines' Embraer E2 expansion, Air Canada's international network, and WestJet's Boeing 737 operations."
      />
    </div>
  );
};
