import React, { useState } from 'react';
import { PlaneLanding, Building, Search, ArrowRight } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { FlightStatusBadge } from '../components/FlightStatusBadge';
import { CANADIAN_AIRPORTS } from '../data/canadianAviationData';
import { FlightStatus } from '../types/aviation';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  onNavigate: (path: string) => void;
}

export const ArrivalsPage: React.FC<Props> = ({ onNavigate }) => {
  const [selectedAirport, setSelectedAirport] = useState<string>('YVR');
  const [selectedStatus, setSelectedStatus] = useState<FlightStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const airport = aviationService.getAirportByCode(selectedAirport);
  let arrivals = aviationService.getArrivals(selectedAirport, selectedStatus);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    arrivals = arrivals.filter(f =>
      f.flightNumber.toLowerCase().includes(q) ||
      f.airlineName.toLowerCase().includes(q) ||
      f.departureCity.toLowerCase().includes(q) ||
      f.departureAirportIata.toLowerCase().includes(q)
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-[#E8E5E8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
            <PlaneLanding className="w-4 h-4" />
            <span>Canadian Aerodromes Operations Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25232A] mt-1">
            Live Canadian Airport Arrivals
          </h1>
          <p className="text-xs sm:text-sm text-[#777780] mt-1">
            Real-time inbound flight status, touchdown confirmations, gate arrivals, and baggage claim belt allocations across Canadian airports.
          </p>
        </div>

        {/* Airport Switcher */}
        <div className="bg-white border border-[#E8E5E8] p-2 rounded-md shadow-2xs flex items-center gap-2">
          <Building className="w-4 h-4 text-[#681C35]" />
          <span className="text-xs font-medium text-[#777780]">Select Hub:</span>
          <select
            value={selectedAirport}
            onChange={(e) => setSelectedAirport(e.target.value)}
            className="text-xs font-bold text-[#681C35] bg-[#F8F8FA] border border-[#E8E5E8] rounded px-2.5 py-1 focus:outline-none cursor-pointer"
          >
            {CANADIAN_AIRPORTS.map((a) => (
              <option key={a.iata} value={a.iata}>
                {a.iata} - {a.city.split(',')[0]} ({a.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Airport Summary Strip */}
      {airport && (
        <div className="bg-[#681C35] text-white p-4 rounded-md shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xl font-black font-mono tracking-tight flex items-center gap-2">
              <span>{airport.iata} / {airport.icao}</span>
              <span className="text-xs font-normal text-white/80 font-sans">— {airport.name}</span>
            </div>
            <div className="text-xs text-white/85 mt-0.5">
              {airport.city}, {airport.country} · Timezone: {airport.timezone} (UTC {airport.utcOffset >= 0 ? `+${airport.utcOffset}` : airport.utcOffset})
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => onNavigate(`/airport/${airport.iata.toLowerCase()}`)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded font-medium transition-colors text-white cursor-pointer"
            >
              View Full Airport Details
            </button>
          </div>
        </div>
      )}

      {/* Control Strip */}
      <div className="bg-white border border-[#E8E5E8] rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#777780]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flight number, airline, origin city..."
            className="w-full bg-[#F8F8FA] border border-[#E8E5E8] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#681C35]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#777780]">Status Filter:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FlightStatus | 'ALL')}
            className="bg-[#F8F8FA] border border-[#E8E5E8] rounded px-2 py-1 text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Inbound Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Active">En Route</option>
            <option value="Landed">Landed</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
      </div>

      {/* Arrivals Board: Mobile Responsive Cards + Desktop Table */}
      {arrivals.length === 0 ? (
        <div className="bg-white border border-[#E8E5E8] rounded-lg p-12 text-center text-[#777780] shadow-xs">
          <PlaneLanding className="w-10 h-10 text-[#681C35]/40 mx-auto mb-2" />
          <p className="font-bold text-[#25232A]">No arrivals found</p>
          <p className="text-xs text-[#777780] mt-1">No inbound flights match the current filter criteria for {selectedAirport}.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View (No Horizontal Scroll) */}
          <div className="md:hidden space-y-3">
            {arrivals.map((flight) => (
              <div
                key={flight.id}
                onClick={() => onNavigate(`/flight/${flight.flightNumber.toLowerCase()}`)}
                className="bg-white border border-[#E8E5E8] hover:border-[#681C35] rounded-xl p-4 shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F0EEF0]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-[#681C35]">{flight.flightNumber}</span>
                    <span className="text-xs text-[#777780]">·</span>
                    <span className="text-xs font-semibold text-[#25232A]">{flight.airlineName}</span>
                  </div>
                  <FlightStatusBadge status={flight.status} delayMinutes={flight.delayMinutes} />
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-extrabold font-mono text-[#25232A]">{flight.scheduledArrivalLocal}</div>
                    <div className="text-[11px] text-[#777780] mt-0.5">
                      {flight.terminalArrival || 'Main Inbound'} · Gate {flight.gateArrival || '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-[#681C35]">{flight.departureAirportIata}</div>
                    <div className="text-xs font-medium text-[#25232A]">From {flight.departureCity}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0EEF0] flex items-center justify-between text-[11px] text-[#777780]">
                  <span>Baggage: <strong className="text-[#25232A]">{flight.baggageBelt || 'Carousel 1'}</strong></span>
                  <span className="text-[#681C35] font-semibold flex items-center gap-1">
                    <span>Flight Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-[#E8E5E8] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9FA] text-[#777780] border-b border-[#E8E5E8] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Sched Arr</th>
                  <th className="py-3 px-4">Flight</th>
                  <th className="py-3 px-4">Airline</th>
                  <th className="py-3 px-4">Origin</th>
                  <th className="py-3 px-4">Terminal</th>
                  <th className="py-3 px-4">Gate</th>
                  <th className="py-3 px-4">Baggage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E8]">
                {arrivals.map((flight) => (
                  <tr
                    key={flight.id}
                    onClick={() => onNavigate(`/flight/${flight.flightNumber.toLowerCase()}`)}
                    className="hover:bg-[#FAF9FA] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-sm text-[#25232A]">
                      {flight.scheduledArrivalLocal}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#681C35]">
                      {flight.flightNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#25232A]">
                      {flight.airlineName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#25232A]">{flight.departureCity}</span>{' '}
                      <span className="font-mono text-[#681C35] font-semibold">({flight.departureAirportIata})</span>
                    </td>
                    <td className="py-3 px-4 text-[#777780]">
                      {flight.terminalArrival || 'T1'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#25232A]">
                      {flight.gateArrival || '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {flight.baggageBelt || 'Belt 1'}
                    </td>
                    <td className="py-3 px-4">
                      <FlightStatusBadge status={flight.status} delayMinutes={flight.delayMinutes} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs text-[#681C35] font-semibold group-hover:underline flex items-center justify-end gap-1">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AdSenseUnit slotId="arrivals-bottom" format="horizontal" />

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title="Airport Inbound Customs, Baggage & Flight Guides"
        subtitle="Learn more about Canadian customs pre-clearance, minimum connection times, and passenger compensation rights under APAPR."
      />
    </div>
  );
};
