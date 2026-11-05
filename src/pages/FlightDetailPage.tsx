import React from 'react';
import {
  ArrowLeft,
  Plane,
  Clock,
  MapPin,
  Calendar,
  Compass,
  Building,
  Shield,
  Radio,
  Share2,
  ExternalLink
} from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { FlightStatusBadge } from '../components/FlightStatusBadge';
import { AdSenseUnit } from '../components/AdSenseUnit';

interface Props {
  flightId: string;
  onNavigate: (path: string) => void;
}

export const FlightDetailPage: React.FC<Props> = ({ flightId, onNavigate }) => {
  const flight = aviationService.getFlightById(flightId);

  if (!flight) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-[#681C35] flex items-center justify-center mx-auto mb-4">
          <Plane className="w-8 h-8 -rotate-45" />
        </div>
        <h1 className="text-xl font-bold text-[#25232A]">Flight Record Not Found</h1>
        <p className="text-xs text-[#777780] mt-1 max-w-md mx-auto">
          We could not locate scheduled operations for flight identifier &quot;{flightId}&quot;. The flight may not operate today or might use an alternate code.
        </p>
        <button
          onClick={() => onNavigate('/flights')}
          className="mt-6 px-4 py-2 bg-[#681C35] text-white text-xs font-semibold rounded hover:bg-[#8A2948] transition-colors cursor-pointer"
        >
          Return to Flight Schedules
        </button>
      </div>
    );
  }

  const depAirport = aviationService.getAirportByCode(flight.departureAirportIata);
  const arrAirport = aviationService.getAirportByCode(flight.arrivalAirportIata);
  const airline = aviationService.getAirlineByCode(flight.airlineIata);

  // Compute flight progress percentage if en route
  let progressPercent = 0;
  if (flight.status === 'Landed') {
    progressPercent = 100;
  } else if (flight.status === 'En Route' || flight.status === 'Active') {
    progressPercent = 55; // verified active midway progress
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/flights')}
          className="inline-flex items-center gap-1.5 text-xs text-[#777780] hover:text-[#681C35] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Flight Schedules</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#777780]">
          <span className="font-mono">URL: /flight/{flight.flightNumber.toLowerCase()}</span>
        </div>
      </div>

      {/* Main Flight Hero Card */}
      <div className="bg-white border border-[#E8E5E8] rounded-md shadow-xs overflow-hidden">
        {/* Top Maroon Header Strip */}
        <div className="bg-[#681C35] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center font-mono font-bold text-base text-amber-300">
              {flight.airlineIata}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-mono">
                  {flight.flightNumber}
                </h1>
                <span className="text-white/60 text-xs">/</span>
                <span className="text-white/90 font-mono text-xs">{flight.icaoFlightCode}</span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {flight.airlineName} · {flight.isInternational ? 'International Scheduled Service' : 'Domestic Operation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FlightStatusBadge
              status={flight.status}
              delayMinutes={flight.delayMinutes}
              className="bg-white px-3 py-1 rounded"
            />
          </div>
        </div>

        {/* Origin / Destination Visual Segment */}
        <div className="p-6 border-b border-[#E8E5E8] bg-[#FAF9FA]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Origin Airport */}
            <div className="md:col-span-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#777780] tracking-wider">
                Departure Origin
              </span>
              <div className="text-3xl font-black font-mono text-[#681C35]">
                {flight.departureAirportIata}
              </div>
              <div className="text-sm font-bold text-[#25232A]">
                {flight.departureCity}
              </div>
              <p className="text-xs text-[#777780]">
                {flight.departureAirportName}
              </p>
              <div className="mt-2 text-xs font-semibold text-[#25232A]">
                Local Time: <span className="font-mono text-sm">{flight.scheduledDepartureLocal}</span>
              </div>
              <div className="text-[11px] text-[#777780]">
                Date: <span className="font-mono">{flight.departureDateLocal}</span> (UTC {depAirport?.utcOffset ?? '+0'})
              </div>
            </div>

            {/* Flight Route Visual Progress Bar */}
            <div className="md:col-span-4 text-center space-y-2 py-4">
              <div className="text-xs font-mono font-medium text-[#777780]">
                Duration: ~{Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
              </div>

              <div className="relative flex items-center justify-center">
                <div className="w-full h-1 bg-[#E8E5E8] rounded-full relative">
                  <div
                    className="h-full bg-[#681C35] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div
                  className="absolute -top-2.5 transition-all duration-500"
                  style={{ left: `calc(${progressPercent}% - 12px)` }}
                >
                  <Plane className="w-6 h-6 text-[#681C35] rotate-90" />
                </div>
              </div>

              <div className="text-[11px] text-[#777780] flex justify-between font-mono">
                <span>Direct Non-Stop</span>
                <span>{flight.status}</span>
              </div>
            </div>

            {/* Destination Airport */}
            <div className="md:col-span-4 text-left md:text-right space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#777780] tracking-wider">
                Arrival Destination
              </span>
              <div className="text-3xl font-black font-mono text-[#681C35]">
                {flight.arrivalAirportIata}
              </div>
              <div className="text-sm font-bold text-[#25232A]">
                {flight.arrivalCity}
              </div>
              <p className="text-xs text-[#777780]">
                {flight.arrivalAirportName}
              </p>
              <div className="mt-2 text-xs font-semibold text-[#25232A]">
                Local Time: <span className="font-mono text-sm">{flight.scheduledArrivalLocal}</span>
              </div>
              <div className="text-[11px] text-[#777780]">
                Date: <span className="font-mono">{flight.arrivalDateLocal}</span> (UTC {arrAirport?.utcOffset ?? '+0'})
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Departure Logistics */}
          <div className="space-y-3 bg-[#F8F8FA] p-4 rounded border border-[#E8E5E8]">
            <h3 className="font-bold text-[#25232A] text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#681C35]">
              <Building className="w-4 h-4" />
              <span>Departure Operations</span>
            </h3>
            <div className="space-y-1.5 divide-y divide-[#E8E5E8]/60">
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Terminal:</span>
                <span className="font-semibold text-[#25232A]">{flight.terminalDeparture || 'Main Terminal'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Gate:</span>
                <span className="font-mono font-bold text-[#25232A]">{flight.gateDeparture || 'Assigned at check-in'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Scheduled Departure (UTC):</span>
                <span className="font-mono text-[#25232A]">{flight.scheduledDepartureUtc.replace('T', ' ').replace('Z', '')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Actual / Estimated (UTC):</span>
                <span className="font-mono text-[#25232A]">
                  {flight.actualDepartureUtc ? flight.actualDepartureUtc.replace('T', ' ').replace('Z', '') : flight.estimatedDepartureUtc ? flight.estimatedDepartureUtc.replace('T', ' ').replace('Z', '') : 'As Scheduled'}
                </span>
              </div>
            </div>
          </div>

          {/* Arrival Logistics */}
          <div className="space-y-3 bg-[#F8F8FA] p-4 rounded border border-[#E8E5E8]">
            <h3 className="font-bold text-[#25232A] text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#681C35]">
              <Building className="w-4 h-4" />
              <span>Arrival Operations</span>
            </h3>
            <div className="space-y-1.5 divide-y divide-[#E8E5E8]/60">
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Terminal:</span>
                <span className="font-semibold text-[#25232A]">{flight.terminalArrival || 'Main Terminal'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Gate:</span>
                <span className="font-mono font-bold text-[#25232A]">{flight.gateArrival || 'Approaching Runway'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Baggage Claim Belt:</span>
                <span className="font-semibold text-[#25232A]">{flight.baggageBelt || 'Belt assigned upon landing'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Scheduled Arrival (UTC):</span>
                <span className="font-mono text-[#25232A]">{flight.scheduledArrivalUtc.replace('T', ' ').replace('Z', '')}</span>
              </div>
            </div>
          </div>

          {/* Aircraft Information */}
          <div className="space-y-3 bg-[#F8F8FA] p-4 rounded border border-[#E8E5E8]">
            <h3 className="font-bold text-[#25232A] text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#681C35]">
              <Plane className="w-4 h-4" />
              <span>Assigned Aircraft</span>
            </h3>
            <div className="space-y-1.5 divide-y divide-[#E8E5E8]/60">
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Model:</span>
                <span className="font-semibold text-[#25232A]">{flight.aircraftModel}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">ICAO Type Code:</span>
                <span className="font-mono font-bold text-[#25232A]">{flight.aircraftIcaoType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Tail Registration:</span>
                <span className="font-mono text-[#25232A]">{flight.aircraftRegistration || 'Information currently unavailable.'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777780]">Data Source Feed:</span>
                <span className="text-[#681C35] font-medium">{flight.dataSource}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Tracking Telemetry Strip (when available) */}
        {flight.liveTracking && (
          <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-200 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-900 mb-2">
              <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span>Transponder Live Telemetry Feed (ADS-B Mode-S)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-emerald-800 text-[11px]">
              <div>
                <span className="text-emerald-700 font-sans">Current Coordinates:</span>{' '}
                {flight.liveTracking.latitude.toFixed(3)}°N, {flight.liveTracking.longitude.toFixed(3)}°W
              </div>
              <div>
                <span className="text-emerald-700 font-sans">Barometric Altitude:</span>{' '}
                {flight.liveTracking.altitudeFeet.toLocaleString()} ft
              </div>
              <div>
                <span className="text-emerald-700 font-sans">Ground Speed:</span>{' '}
                {flight.liveTracking.groundSpeedKnots} kts
              </div>
              <div>
                <span className="text-emerald-700 font-sans">Heading Track:</span>{' '}
                {flight.liveTracking.headingDegrees}°
              </div>
            </div>
          </div>
        )}

        {/* Footer Meta */}
        <div className="px-6 py-3 bg-white border-t border-[#E8E5E8] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#777780]">
          <div>
            Data Timestamp: <span className="font-mono">{flight.lastUpdatedUtc}</span> · Source: {flight.dataSource}
          </div>
          <div className="flex items-center gap-3">
            {flight.codeshares && (
              <span>Codeshares: {flight.codeshares.join(', ')}</span>
            )}
            <button
              onClick={() => onNavigate('/map')}
              className="text-[#681C35] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View On Live Map</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* AdSense Unit */}
      <AdSenseUnit slotId="flight-detail-bottom" format="horizontal" />
    </div>
  );
};
