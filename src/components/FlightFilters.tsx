import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';
import { FlightFilterParams, FlightStatus } from '../types/aviation';
import { CANADIAN_AIRPORTS, CANADIAN_AIRLINES, CANADIAN_AIRCRAFT } from '../data/canadianAviationData';

interface Props {
  filters: FlightFilterParams;
  onChange: (filters: FlightFilterParams) => void;
  onReset: () => void;
}

export const FlightFilters: React.FC<Props> = ({ filters, onChange, onReset }) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const countries = ['Canada'];

  const handleFieldChange = (key: keyof FlightFilterParams, value: unknown) => {
    onChange({
      ...filters,
      [key]: value,
      page: 1 // reset to first page when filter changes
    });
  };

  const statuses: (FlightStatus | 'ALL')[] = [
    'ALL',
    'Scheduled',
    'Active',
    'En Route',
    'Landed',
    'Delayed',
    'Cancelled',
    'Diverted'
  ];

  return (
    <div className="bg-white border border-[#E8E5E8] rounded-md shadow-2xs mb-6 overflow-hidden">
      {/* Top Header / Mobile Toggle Bar */}
      <div className="px-4 py-3 bg-[#F8F8FA] border-b border-[#E8E5E8] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#681C35]" />
          <h3 className="text-xs font-semibold text-[#25232A] uppercase tracking-wider">
            Canadian Flight Filter Matrix & Search Criteria
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#777780] hover:text-[#681C35] hover:bg-white rounded transition-colors cursor-pointer border border-transparent hover:border-[#E8E5E8]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="md:hidden inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-[#E8E5E8] rounded text-[#25232A]"
          >
            <SlidersHorizontal className="w-3 h-3 text-[#681C35]" />
            <span>{isOpenMobile ? 'Hide Filters' : 'Filter Options'}</span>
            {isOpenMobile ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Filter Fields Grid */}
      <div className={`p-4 ${isOpenMobile ? 'block' : 'hidden md:block'} space-y-4`}>
        {/* Row 1: Search, Flight Number, Airline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Search Canadian Flights
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#777780] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleFieldChange('search', e.target.value)}
                placeholder="Flight, city, airport (YYZ, YVR)..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Flight Number / Code
            </label>
            <input
              type="text"
              value={filters.flightNumber || ''}
              onChange={(e) => handleFieldChange('flightNumber', e.target.value)}
              placeholder="e.g. AC103, WS115, PD301"
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] uppercase font-mono focus:outline-none focus:border-[#681C35] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Canadian Airline
            </label>
            <select
              value={filters.airline || 'ALL'}
              onChange={(e) => handleFieldChange('airline', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Canadian Carriers</option>
              {CANADIAN_AIRLINES.map((a) => (
                <option key={a.iata} value={a.iata}>
                  {a.name} ({a.iata}/{a.icao})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Operational Status
            </label>
            <select
              value={filters.status || 'ALL'}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All Flight Statuses' : st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Departure Airport, Arrival Airport, Aircraft, Province */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Departure Aerodrome (Origin)
            </label>
            <select
              value={filters.departureAirport || 'ALL'}
              onChange={(e) => handleFieldChange('departureAirport', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Canadian Airports</option>
              {CANADIAN_AIRPORTS.map((a) => (
                <option key={a.iata} value={a.iata}>
                  {a.iata} - {a.city.split(',')[0]} ({a.icao})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Arrival Aerodrome (Destination)
            </label>
            <select
              value={filters.arrivalAirport || 'ALL'}
              onChange={(e) => handleFieldChange('arrivalAirport', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Arrival Destinations</option>
              {CANADIAN_AIRPORTS.map((a) => (
                <option key={a.iata} value={a.iata}>
                  {a.iata} - {a.city.split(',')[0]} ({a.icao})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Aircraft Type / Model
            </label>
            <select
              value={filters.aircraftType || 'ALL'}
              onChange={(e) => handleFieldChange('aircraftType', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Aircraft Types</option>
              {CANADIAN_AIRCRAFT.map((ac) => (
                <option key={ac.icaoType} value={ac.icaoType}>
                  {ac.model} ({ac.icaoType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Jurisdiction
            </label>
            <select
              value={filters.country || 'ALL'}
              onChange={(e) => handleFieldChange('country', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
            >
              <option value="ALL">Canada (All Provinces & Territories)</option>
              <option value="Ontario">Ontario (YYZ, YOW)</option>
              <option value="British Columbia">British Columbia (YVR, YYJ, YLW)</option>
              <option value="Quebec">Quebec (YUL, YQB)</option>
              <option value="Alberta">Alberta (YYC, YEG)</option>
              <option value="Atlantic">Atlantic (YHZ, YYT)</option>
              <option value="Northern">Northern Territories (YFB, YZF, YXY)</option>
            </select>
          </div>
        </div>

        {/* Row 3: Time Range, Sector Type, Sort By, Page Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-[#E8E5E8]/60">
          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Departure Time Window
            </label>
            <select
              value={filters.departureTimeRange || 'ALL'}
              onChange={(e) => handleFieldChange('departureTimeRange', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
            >
              <option value="ALL">Any Time (24h)</option>
              <option value="morning">Morning (06:00 - 12:00)</option>
              <option value="afternoon">Afternoon (12:00 - 18:00)</option>
              <option value="evening">Evening (18:00 - 24:00)</option>
              <option value="night">Night (00:00 - 06:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Route Classification
            </label>
            <select
              value={filters.isInternational || 'ALL'}
              onChange={(e) => handleFieldChange('isInternational', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Routes (Domestic & Intl)</option>
              <option value="international">International Flights Only</option>
              <option value="domestic">Domestic Flights Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Sort Records By
            </label>
            <div className="flex gap-1.5">
              <select
                value={filters.sortBy || 'departureTime'}
                onChange={(e) => handleFieldChange('sortBy', e.target.value)}
                className="w-full px-2 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
              >
                <option value="departureTime">Departure Time</option>
                <option value="arrivalTime">Arrival Time</option>
                <option value="airline">Airline Name</option>
                <option value="flightNumber">Flight Number</option>
              </select>
              <button
                type="button"
                onClick={() => handleFieldChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-2 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] hover:bg-white font-medium"
                title="Toggle sort direction"
              >
                {filters.sortOrder === 'desc' ? 'DESC' : 'ASC'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777780] mb-1">
              Records Per Page
            </label>
            <select
              value={filters.pageSize || 25}
              onChange={(e) => handleFieldChange('pageSize', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs text-[#25232A] focus:outline-none focus:border-[#681C35] focus:bg-white cursor-pointer"
            >
              <option value={10}>10 flights</option>
              <option value={25}>25 flights</option>
              <option value={50}>50 flights</option>
              <option value={100}>100 flights</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
