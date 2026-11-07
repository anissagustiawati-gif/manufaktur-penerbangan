import React, { useState } from 'react';
import { Plane, Search, ArrowRight, Gauge, Shield, Maximize2 } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  onNavigate: (path: string) => void;
}

export const AircraftPage: React.FC<Props> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const aircraftList = aviationService.getAircraftList(search);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      <div className="border-b border-[#E8E5E8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
            <Plane className="w-4 h-4" />
            <span>Commercial Aircraft Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25232A] mt-1">
            Canadian Commercial Aircraft Fleets
          </h1>
          <p className="text-xs sm:text-sm text-[#777780] mt-1">
            Authoritative aircraft specifications, Canadian-assembled Airbus A220s, Boeing 787s, Bombardier Q400 turboprops, Arctic combi jets, and propulsion systems.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search model, manufacturer (Airbus, Boeing)..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E5E8] rounded-md text-xs focus:outline-none focus:border-[#681C35]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aircraftList.map((ac) => (
          <div
            key={ac.icaoType}
            onClick={() => onNavigate(`/aircraft/${ac.icaoType.toLowerCase()}`)}
            className="bg-white border border-[#E8E5E8] rounded-md p-5 hover:border-[#681C35] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl font-black font-mono text-[#681C35] group-hover:underline">
                    {ac.icaoType}
                  </span>
                  <span className="text-xs font-bold text-[#777780] ml-2">
                    {ac.manufacturer}
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {ac.typeCategory}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#25232A] mt-2 group-hover:text-[#681C35] transition-colors">
                {ac.model}
              </h3>
              <p className="text-xs text-[#777780] mt-1">
                Engine: <span className="text-[#25232A] font-medium">{ac.engineType}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8E5E8] space-y-1 text-xs text-[#777780]">
              <div className="flex justify-between">
                <span>Maximum Range:</span>
                <span className="font-mono text-[#25232A] font-semibold">{ac.rangeKm.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span>Max Passenger Capacity:</span>
                <span className="font-mono text-[#25232A] font-semibold">{ac.maxPassengers} seats</span>
              </div>
              <div className="flex justify-between">
                <span>Cruising Speed:</span>
                <span className="font-mono text-[#25232A]">{ac.cruisingSpeedKmH} km/h (M0.85)</span>
              </div>

              <div className="pt-2 text-right">
                <span className="text-xs font-semibold text-[#681C35] group-hover:underline flex items-center justify-end gap-1">
                  <span>View Operating Flights</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdSenseUnit slotId="aircraft-directory-bottom" format="horizontal" />

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title="Featured Commercial Aircraft Engineering & Fleet Analyses"
        subtitle="Read our investigative reports on Airbus A220 Mirabel production, Pratt & Whitney GTF fuel burn metrics, and Boeing 737 MAX dispatch reliability."
      />
    </div>
  );
};
