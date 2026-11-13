import React, { useState, useEffect } from 'react';
import { Plane, Compass, RotateCcw } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { FlightTable } from '../components/FlightTable';
import { FlightFilters } from '../components/FlightFilters';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';
import { FlightFilterParams } from '../types/aviation';

interface Props {
  initialSearch?: string;
  onNavigate: (path: string) => void;
}

export const FlightSchedulesPage: React.FC<Props> = ({ initialSearch, onNavigate }) => {
  const [filters, setFilters] = useState<FlightFilterParams>({
    search: initialSearch || '',
    page: 1,
    pageSize: 25,
    sortBy: 'departureTime',
    sortOrder: 'asc'
  });

  useEffect(() => {
    if (initialSearch !== undefined) {
      setFilters(prev => ({ ...prev, search: initialSearch, page: 1 }));
    }
  }, [initialSearch]);

  const result = aviationService.getFlights(filters);
  const stats = aviationService.getLiveStats();

  const handleReset = () => {
    setFilters({
      page: 1,
      pageSize: 25,
      sortBy: 'departureTime',
      sortOrder: 'asc'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      {/* Page Header */}
      <div className="border-b border-[#E8E5E8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
            <Plane className="w-4 h-4" />
            <span>Master Timetable Index</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25232A] mt-1">
            Canadian Flight Schedules
          </h1>
          <p className="text-xs sm:text-sm text-[#777780] mt-1">
            Explore commercial scheduled flights across Canadian provinces and territories, aerodrome coordinates, aircraft types, and verified daily operational statuses.
          </p>
        </div>

        <div className="bg-white border border-[#E8E5E8] px-4 py-2.5 rounded-md text-xs text-[#777780] shadow-2xs">
          <div>Verified Timetables: <span className="font-mono font-bold text-[#681C35]">{result.total}</span></div>
          <div className="text-[10px] text-[#777780] mt-0.5">Updated: {stats.lastSyncTimestamp}</div>
        </div>
      </div>

      {/* Advanced Filter Box */}
      <FlightFilters
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={handleReset}
      />

      {/* AdSense Placement */}
      <AdSenseUnit slotId="schedules-middle-banner" format="horizontal" />

      {/* Table Component */}
      <FlightTable
        flights={result.flights}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        onPageChange={(p) => setFilters({ ...filters, page: p })}
        onPageSizeChange={(s) => setFilters({ ...filters, pageSize: s, page: 1 })}
        onSelectFlight={(flightNumber) => onNavigate(`/flight/${flightNumber}`)}
        onSelectAirport={(iata) => onNavigate(`/airport/${iata}`)}
        onSelectAirline={(iata) => onNavigate(`/airline/${iata}`)}
        lastUpdated={stats.lastSyncTimestamp}
      />

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title="Featured Canadian Aviation Guides & Airport Operations"
        subtitle="Explore in-depth technical analyses on de-icing holdover formulas, satellite ADS-B radar, and passenger rights under APAPR."
      />
    </div>
  );
};
