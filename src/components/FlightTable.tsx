import React, { useState } from 'react';
import {
  Plane,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  MapPin,
  Building,
  Gauge,
  LayoutGrid,
  Table as TableIcon,
  Radio,
  ExternalLink
} from 'lucide-react';
import { FlightRecord } from '../types/aviation';
import { FlightStatusBadge } from './FlightStatusBadge';

interface Props {
  flights: FlightRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSelectFlight: (flightId: string) => void;
  onSelectAirport?: (iata: string) => void;
  onSelectAirline?: (iata: string) => void;
  lastUpdated?: string;
}

export const FlightTable: React.FC<Props> = ({
  flights,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onSelectFlight,
  onSelectAirport,
  onSelectAirline,
  lastUpdated
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Airline color helper for brand distinction
  const getAirlineBadgeStyle = (iata: string) => {
    switch (iata) {
      case 'AC':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'WS':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'PD':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'TS':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'F8':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '5T':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Control & Summary Bar */}
      <div className="bg-white border border-[#E8E5E8] rounded-lg p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#681C35] text-white flex items-center justify-center shrink-0">
            <Plane className="w-4 h-4 -rotate-45" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#25232A]">
              Canadian Commercial Flight Schedule
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-[#777780]">
              <span className="font-semibold text-[#681C35]">{total} active flights found</span>
              {lastUpdated && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="hidden sm:inline">Synced {lastUpdated}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* View Mode Toggle: Cards (Default, No Scroll) vs Table */}
          <div className="flex items-center bg-[#F8F8FA] border border-[#E8E5E8] rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#681C35] text-white shadow-2xs'
                  : 'text-[#777780] hover:text-[#25232A]'
              }`}
              title="Modern Responsive Cards (No Horizontal Scrolling)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards (Responsive)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#681C35] text-white shadow-2xs'
                  : 'text-[#777780] hover:text-[#25232A]'
              }`}
              title="Dense Grid Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table View</span>
            </button>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#777780]">
            <span className="hidden md:inline text-[11px]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#F8F8FA] border border-[#E8E5E8] rounded px-2 py-1 text-xs text-[#25232A] font-medium focus:outline-none focus:border-[#681C35] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* ZERO FLIGHTS STATE */}
      {flights.length === 0 ? (
        <div className="bg-white border border-[#E8E5E8] rounded-lg p-12 text-center shadow-xs">
          <Plane className="w-10 h-10 text-[#681C35]/40 mx-auto mb-3" />
          <h4 className="text-base font-bold text-[#25232A]">No Matching Canadian Flights</h4>
          <p className="text-xs text-[#777780] mt-1 max-w-sm mx-auto">
            No active flight schedules found matching your current filter criteria. Try resetting or selecting another hub.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* MODE 1: MODERN RESPONSIVE FLIGHT STRIPS (100% Width, Zero Side-Scroll) */
        <div className="space-y-3">
          {flights.map((flight) => {
            return (
              <div
                key={flight.id}
                onClick={() => onSelectFlight(flight.flightNumber)}
                className="bg-white border border-[#E8E5E8] hover:border-[#681C35] rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Accent top border stripe for Canadian carrier brand */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#681C35] via-[#8A2948] to-[#681C35] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Row 1: Airline Badge, Flight Code, and Status */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#F0EEF0]">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getAirlineBadgeStyle(
                        flight.airlineIata
                      )}`}
                    >
                      {flight.airlineName}
                    </span>
                    <span className="font-mono font-extrabold text-base sm:text-lg text-[#681C35] tracking-tight">
                      {flight.flightNumber}
                    </span>
                    <span className="text-[11px] font-mono text-[#777780] hidden sm:inline">
                      ICAO: {flight.icaoFlightCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FlightStatusBadge status={flight.status} delayMinutes={flight.delayMinutes} />
                    <span className="text-[11px] font-medium bg-[#F8F8FA] border border-[#E8E5E8] text-[#504e57] px-2 py-0.5 rounded hidden sm:inline-block">
                      {flight.aircraftModel.split(' ')[0]} {flight.aircraftIcaoType}
                    </span>
                  </div>
                </div>

                {/* Row 2: Route Visual Diagram & Times */}
                <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Departure Point */}
                  <div className="md:col-span-4 flex items-center md:items-start justify-between md:justify-start gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#25232A] tracking-tight">
                          {flight.scheduledDepartureLocal.split(' ')[0]}
                        </span>
                        <span className="text-xs font-semibold text-[#681C35] font-mono">
                          {flight.scheduledDepartureLocal.split(' ')[1] || 'LOCAL'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono font-bold text-sm text-[#25232A]">
                          {flight.departureAirportIata}
                        </span>
                        <span className="text-xs text-[#777780] font-medium">·</span>
                        <span className="text-xs text-[#504e57] font-medium">
                          {flight.departureCity}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#777780] mt-0.5 flex items-center gap-1">
                        <Building className="w-3 h-3 text-[#681C35]" />
                        <span>{flight.terminalDeparture || 'Main Terminal'}</span>
                        {flight.gateDeparture && (
                          <span className="font-semibold text-[#25232A]">
                            · Gate {flight.gateDeparture}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flight Vector Center Graphic */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center py-2 md:py-0 border-y md:border-y-0 border-[#F0EEF0]/60">
                    <div className="text-[11px] font-semibold text-[#777780] flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-[#681C35]" />
                      <span>
                        {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                      </span>
                      <span className="text-[#A09CA3]">·</span>
                      <span className="text-emerald-700 font-medium">Non-stop</span>
                    </div>

                    {/* Plane Travel Line */}
                    <div className="w-full max-w-[200px] flex items-center gap-2">
                      <div className="h-0.5 flex-1 bg-gradient-to-r from-[#681C35]/20 to-[#681C35]"></div>
                      <Plane className="w-4 h-4 text-[#681C35] shrink-0 transform rotate-90" />
                      <div className="h-0.5 flex-1 bg-gradient-to-r from-[#681C35] to-[#681C35]/20"></div>
                    </div>

                    {flight.liveTracking ? (
                      <div className="text-[10px] text-emerald-700 font-mono mt-1 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>
                          FL{Math.round(flight.liveTracking.altitudeFeet / 100)} ·{' '}
                          {flight.liveTracking.groundSpeedKnots} kts
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#777780] mt-1 font-mono">
                        Direct Air Corridor
                      </span>
                    )}
                  </div>

                  {/* Arrival Point */}
                  <div className="md:col-span-4 flex items-center md:items-end justify-between md:justify-end gap-4 text-right">
                    <div>
                      <div className="flex items-baseline justify-end gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#25232A] tracking-tight">
                          {flight.scheduledArrivalLocal.split(' ')[0]}
                        </span>
                        <span className="text-xs font-semibold text-[#681C35] font-mono">
                          {flight.scheduledArrivalLocal.split(' ')[1] || 'LOCAL'}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <span className="font-mono font-bold text-sm text-[#25232A]">
                          {flight.arrivalAirportIata}
                        </span>
                        <span className="text-xs text-[#777780] font-medium">·</span>
                        <span className="text-xs text-[#504e57] font-medium">
                          {flight.arrivalCity}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#777780] mt-0.5 flex items-center justify-end gap-1">
                        <span>{flight.terminalArrival || 'Main Inbound'}</span>
                        {flight.baggageBelt && (
                          <span className="font-semibold text-[#25232A]">
                            · {flight.baggageBelt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Meta & Action */}
                <div className="pt-3 border-t border-[#F0EEF0] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#777780]">
                    <span>
                      Aircraft:{' '}
                      <strong className="text-[#25232A]">{flight.aircraftModel}</strong>
                    </span>
                    {flight.aircraftRegistration && (
                      <span className="font-mono bg-[#F8F8FA] px-1.5 py-0.5 rounded border border-[#E8E5E8]">
                        Tail {flight.aircraftRegistration}
                      </span>
                    )}
                    {flight.codeshares && flight.codeshares.length > 0 && (
                      <span className="hidden sm:inline text-[#777780]">
                        Codeshares: {flight.codeshares.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>

                  <a
                    href={`/flight/${flight.flightNumber}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectFlight(flight.flightNumber);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#681C35] group-hover:text-[#8A2948] group-hover:translate-x-0.5 transition-all cursor-pointer"
                  >
                    <span>Inspect Live Flight &amp; Radar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE 2: CLEAN MODERN TABLE VIEW */
        <div className="bg-white border border-[#E8E5E8] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9FA] text-[#777780] border-b border-[#E8E5E8] font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Flight</th>
                  <th className="py-3 px-4">Airline</th>
                  <th className="py-3 px-4">Aircraft</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Departure</th>
                  <th className="py-3 px-4">Arrival</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E8]">
                {flights.map((flight) => (
                  <tr
                    key={flight.id}
                    onClick={() => onSelectFlight(flight.flightNumber)}
                    className="hover:bg-[#FAF9FA] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-sm text-[#681C35]">
                      {flight.flightNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#25232A]">{flight.airlineName}</span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#504e57]">
                      <div>{flight.aircraftModel}</div>
                      <div className="font-mono text-[10px] text-[#777780]">
                        {flight.aircraftIcaoType}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#25232A]">
                      {flight.departureAirportIata} → {flight.arrivalAirportIata}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="font-bold text-[#25232A]">
                        {flight.scheduledDepartureLocal}
                      </div>
                      <div className="text-[10px] text-[#777780]">
                        Gate {flight.gateDeparture || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="font-bold text-[#25232A]">
                        {flight.scheduledArrivalLocal}
                      </div>
                      <div className="text-[10px] text-[#777780]">
                        Gate {flight.gateArrival || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <FlightStatusBadge status={flight.status} delayMinutes={flight.delayMinutes} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`/flight/${flight.flightNumber}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelectFlight(flight.flightNumber);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#681C35] font-semibold group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="bg-white border border-[#E8E5E8] rounded-lg p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#777780]">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Info className="w-3.5 h-3.5 text-[#681C35]" />
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} valid operations
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-2.5 py-1 rounded border border-[#E8E5E8] bg-white text-[#25232A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F8FA] cursor-pointer flex items-center gap-1 font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <span className="font-mono text-xs px-2 font-semibold text-[#25232A]">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-2.5 py-1 rounded border border-[#E8E5E8] bg-white text-[#25232A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F8FA] cursor-pointer flex items-center gap-1 font-medium"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
