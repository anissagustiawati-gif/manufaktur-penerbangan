import React from 'react';
import { ArrowLeft, Plane, Gauge, Maximize2, Users, Compass, ArrowRight } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { FlightTable } from '../components/FlightTable';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  aircraftCode: string;
  onNavigate: (path: string) => void;
}

export const AircraftDetailPage: React.FC<Props> = ({ aircraftCode, onNavigate }) => {
  const aircraft = aviationService.getAircraftByCode(aircraftCode);

  if (!aircraft) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans">
        <Plane className="w-12 h-12 text-[#681C35] mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#25232A]">Aircraft Type Not Found</h1>
        <p className="text-xs text-[#777780] mt-1">
          No verified aircraft specifications found for code &quot;{aircraftCode}&quot;.
        </p>
        <a
          href="/aircraft"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/aircraft');
          }}
          className="inline-block mt-6 px-4 py-2 bg-[#681C35] text-white text-xs font-semibold rounded"
        >
          Return to Aircraft Directory
        </a>
      </div>
    );
  }

  const { flights } = aviationService.getFlights({ aircraftType: aircraft.icaoType, pageSize: 50 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <a
          href="/aircraft"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/aircraft');
          }}
          className="inline-flex items-center gap-1.5 text-xs text-[#777780] hover:text-[#681C35] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Aircraft Types</span>
        </a>
        <span className="text-xs text-[#777780] font-mono">Aircraft URL: /aircraft/{aircraft.icaoType}</span>
      </div>

      <div className="bg-white border border-[#E8E5E8] rounded-md shadow-xs overflow-hidden">
        <div className="bg-[#681C35] text-white p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {aircraft.icaoType}
              </span>
              <span className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded ml-2">
                {aircraft.typeCategory}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">
              {aircraft.model}
            </h1>
            <p className="text-xs text-white/85 mt-1">
              Manufacturer: <span className="font-semibold">{aircraft.manufacturer}</span> · Commercial Aviation Type
            </p>
          </div>

          <div className="text-right bg-white/10 p-3 rounded border border-white/20 text-xs space-y-1">
            <div className="text-[11px] text-white/70">Certified Range</div>
            <div className="text-xl font-bold font-mono text-amber-300">
              {aircraft.rangeKm.toLocaleString()} km
            </div>
            <div className="text-[10px] text-white/80">
              {aircraft.maxPassengers === 0 ? 'Configuration: Cargo Freighter (0 pax)' : `Max Passengers: ${aircraft.maxPassengers} pax`}
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="p-6 bg-[#FAF9FA] border-b border-[#E8E5E8] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#777780] block text-[11px]">Wingspan</span>
            <span className="font-mono font-bold text-[#25232A]">{aircraft.wingspanMeters} meters</span>
          </div>
          <div>
            <span className="text-[#777780] block text-[11px]">Overall Length</span>
            <span className="font-mono font-bold text-[#25232A]">{aircraft.lengthMeters} meters</span>
          </div>
          <div>
            <span className="text-[#777780] block text-[11px]">Cruising Velocity</span>
            <span className="font-mono font-bold text-[#25232A]">
              {aircraft.cruisingSpeedKmH} km/h ({Math.round(aircraft.cruisingSpeedKmH * 0.539957)} kts)
            </span>
          </div>
          <div>
            <span className="text-[#777780] block text-[11px]">Powerplants</span>
            <span className="font-semibold text-[#25232A]">{aircraft.engineCount}x {aircraft.engineType}</span>
          </div>
        </div>

        <div className="px-6 pt-5 pb-1 text-xs text-[#504e57] leading-relaxed">
          <p>
            The <strong>{aircraft.model}</strong> (ICAO designator <span className="font-mono font-semibold text-[#25232A]">{aircraft.icaoType}</span>) is certified by {aircraft.manufacturer} in the {aircraft.typeCategory} class, powered by {aircraft.engineCount} {aircraft.engineType} engines delivering a certified range of {aircraft.rangeKm.toLocaleString()} km at {aircraft.cruisingSpeedKmH} km/h.{' '}
            {aircraft.maxPassengers === 0
              ? 'Configured strictly as a dedicated main-deck freighter supporting overnight express cargo trunk lines across Hamilton (YHM), Toronto (YYZ), Vancouver (YVR), and Montréal-Mirabel (YMX).'
              : `Configured to accommodate up to ${aircraft.maxPassengers} passengers across Canadian trunk, regional, and transoceanic commercial routes.`}
          </p>
        </div>

        {/* Operating flights */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#25232A]">
              Currently Scheduled Flights Operating the {aircraft.model} ({flights.length})
            </h2>
            <span className="text-xs text-[#777780]">
              Verified commercial assignments
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

      <AdSenseUnit slotId="aircraft-detail-bottom" format="horizontal" />

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title={`Explore Aviation Research & Routes for ${aircraft.model}`}
        subtitle={`Discover technical aerodynamic analyses, cabin ergonomics, and real-time Canadian airline deployment records.`}
      />
    </div>
  );
};
