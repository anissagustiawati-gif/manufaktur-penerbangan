import React, { useState } from 'react';
import {
  Search,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Activity,
  AlertTriangle,
  Clock,
  Compass,
  ArrowRight,
  ShieldAlert,
  Building2,
  Users
} from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { FlightTable } from '../components/FlightTable';
import { FlightFilters } from '../components/FlightFilters';
import { FlightStatusBadge } from '../components/FlightStatusBadge';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';
import { FlightFilterParams } from '../types/aviation';
import { CANADIAN_AIRPORTS } from '../data/canadianAviationData';

interface Props {
  onNavigate: (path: string) => void;
  onSearchGlobal: (query: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate, onSearchGlobal }) => {
  const [filters, setFilters] = useState<FlightFilterParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'departureTime',
    sortOrder: 'asc'
  });

  const [heroSearch, setHeroSearch] = useState('');
  const [activeBoardTab, setActiveBoardTab] = useState<'departures' | 'arrivals'>('departures');
  const [boardAirport, setBoardAirport] = useState('ALL');
  const [articlePage, setArticlePage] = useState(1);

  const stats = aviationService.getLiveStats();
  const paginatedData = aviationService.getFlights(filters);
  const allArticles = aviationService.getArticles();
  const homeArticlePageSize = 8;
  const totalArticlePages = Math.ceil(allArticles.length / homeArticlePageSize);
  const paginatedArticles = allArticles.slice((articlePage - 1) * homeArticlePageSize, articlePage * homeArticlePageSize);
  const departures = aviationService.getDepartures(boardAirport === 'ALL' ? undefined : boardAirport).slice(0, 5);
  const arrivals = aviationService.getArrivals(boardAirport === 'ALL' ? undefined : boardAirport).slice(0, 5);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onSearchGlobal(heroSearch.trim());
      onNavigate(`/flights?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      sortBy: 'departureTime',
      sortOrder: 'asc'
    });
  };

  return (
    <div className="space-y-10 pb-12 font-sans">
      {/* SECTION A: Main Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#681C35] to-[#4e1327] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Hero Text & Search */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-300 uppercase">
              <Compass className="w-4 h-4 shrink-0" />
              <span>Canada National Civil Aviation Information Portal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Canada Flight Schedules & Airport Information
            </h1>

            <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-xl">
              Explore all Canadian flight schedules, airport departures, arrivals, carrier details, aircraft types, and verified flight status updates across NAV CANADA airspace.
            </p>

            {/* Quick Hero Flight Search Box */}
            <form onSubmit={handleHeroSubmit} className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Enter Flight (AC103, WS115, PD301), Canadian Airport (YYZ, YVR, YUL), or City..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white text-[#25232A] rounded-md text-xs placeholder-[#777780] focus:outline-none focus:ring-2 focus:ring-amber-300 font-sans"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#8A2948] hover:bg-[#a63357] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Flights</span>
                </button>
              </div>

              {/* Quick Suggestion Tags */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[11px] text-white/70">
                <span className="font-medium text-white/90">Canadian Hubs & Flights:</span>
                {['AC103', 'Toronto Pearson (YYZ)', 'Vancouver (YVR)', 'Montréal-Trudeau (YUL)', 'Calgary (YYC)', 'Airbus A220'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setHeroSearch(tag);
                      onNavigate(`/flights?q=${encodeURIComponent(tag)}`);
                    }}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-white/80 underline decoration-white/30"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden border border-white/20 shadow-2xl group bg-[#3a0d1c]">
              <img
                src="/assets/images/hero_aviation_flight_1793637455661.jpg"
                alt="Commercial aircraft flying across sunlit Canadian sky"
                className="w-full h-64 sm:h-80 object-cover object-center group-hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4">
                <div className="text-white text-xs font-bold flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-amber-300 -rotate-45" />
                  <span>Canadian Airspace Flight Tracking System</span>
                </div>
                <p className="text-[11px] text-white/85 mt-0.5">
                  Real-time transponder telemetry & scheduled operations across all 10 provinces & 3 territories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        {/* SECTION B: Live Flight Statistics */}
        <section aria-labelledby="live-flight-statistics">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8E5E8] mb-4 gap-2">
            <div>
              <h2 id="live-flight-statistics" className="text-base font-bold text-[#25232A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#681C35]" />
                <span>Live Flight Statistics & Operational Overview</span>
              </h2>
              <p className="text-xs text-[#777780] mt-0.5">
                Real-time operational summary computed from active global timetable records and ADS-B feeds.
              </p>
            </div>
            <div className="text-[11px] text-[#777780] font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{stats.lastSyncTimestamp}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 border border-[#E8E5E8] rounded-md shadow-2xs">
              <div className="text-[11px] font-medium text-[#777780]">Flights Scheduled</div>
              <div className="text-xl sm:text-2xl font-bold text-[#681C35] font-mono tabular-nums mt-1">
                {stats.totalScheduledToday}
              </div>
              <div className="text-[10px] text-[#777780] mt-0.5">Today's Operating Matrix</div>
            </div>

            <div className="bg-white p-3.5 border border-[#E8E5E8] rounded-md shadow-2xs">
              <div className="text-[11px] font-medium text-[#777780]">Airborne / En Route</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
                {stats.activeFlights}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Transponder Active</div>
            </div>

            <div className="bg-white p-3.5 border border-[#E8E5E8] rounded-md shadow-2xs">
              <div className="text-[11px] font-medium text-[#777780]">Delayed Flights</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
                {stats.delayedFlights}
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5">&gt; 15 min delta</div>
            </div>

            <div className="bg-white p-3.5 border border-[#E8E5E8] rounded-md shadow-2xs">
              <div className="text-[11px] font-medium text-[#777780]">Cancelled Flights</div>
              <div className="text-xl sm:text-2xl font-bold text-rose-700 font-mono tabular-nums mt-1">
                {stats.cancelledFlights}
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">Weather/Operational</div>
            </div>

            <div className="bg-white p-3.5 border border-[#E8E5E8] rounded-md shadow-2xs">
              <div className="text-[11px] font-medium text-[#777780]">Landed Today</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-800 font-mono tabular-nums mt-1">
                {stats.landedFlights}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Block-On Verified</div>
            </div>

            <div className="bg-white p-3.5 border border-[#E8E5E8] rounded-md shadow-2xs">
              <div className="text-[11px] font-medium text-[#777780]">Upcoming Departures</div>
              <div className="text-xl sm:text-2xl font-bold text-[#681C35] font-mono tabular-nums mt-1">
                {stats.scheduledUpcoming}
              </div>
              <div className="text-[10px] text-[#777780] mt-0.5">Gate boarding next</div>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-[#777780] bg-[#FAF9FA] px-3 py-1.5 rounded border border-[#E8E5E8] flex items-center justify-between">
            <span>{stats.coverageNotice}</span>
            <button
              onClick={() => onNavigate('/map')}
              className="text-[#681C35] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Live Aircraft Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </section>

        {/* AdSense Placement 1 */}
        <AdSenseUnit slotId="homepage-top-leaderboard" format="horizontal" />

        {/* SECTION C: Worldwide Flight Schedule Table Today */}
        <section aria-labelledby="worldwide-flight-schedules">
          <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>VALID DAILY FLIGHT DATA · AUTOMATIC MIDNIGHT ROLLOVER</span>
              </div>
              <h2 id="worldwide-flight-schedules" className="text-xl font-bold text-[#25232A]">
                Canadian Commercial Flight Schedules
              </h2>
              <p className="text-xs text-[#777780] mt-0.5">
                Authoritative real-time flight records synchronized with NAV CANADA airspace and Canadian airport authorities.
              </p>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono font-bold text-[#681C35] bg-[#681C35]/10 px-3 py-1 rounded">
                CALENDAR: {new Date().toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </span>
            </div>
          </div>

          {/* 1-Click Fast Hub Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
            <span className="text-xs font-bold text-[#777780] shrink-0 mr-1">Quick Hub:</span>
            {[
              { label: 'All Canada Flights', code: '' },
              { label: 'YYZ Toronto Pearson', code: 'YYZ' },
              { label: 'YVR Vancouver', code: 'YVR' },
              { label: 'YUL Montréal-Trudeau', code: 'YUL' },
              { label: 'YYC Calgary', code: 'YYC' },
              { label: 'YEG Edmonton', code: 'YEG' },
              { label: 'YOW Ottawa', code: 'YOW' },
              { label: 'YHZ Halifax', code: 'YHZ' }
            ].map((hub) => (
              <button
                key={hub.code}
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, airport: hub.code || undefined, page: 1 }))}
                className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-all cursor-pointer ${
                  (filters.airport === hub.code || (!filters.airport && !hub.code))
                    ? 'bg-[#681C35] text-white font-bold shadow-xs'
                    : 'bg-white border border-[#E8E5E8] text-[#504e57] hover:border-[#681C35] hover:text-[#25232A]'
                }`}
              >
                {hub.label}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <FlightFilters
            filters={filters}
            onChange={(newFilters) => setFilters(newFilters)}
            onReset={handleResetFilters}
          />

          {/* Table */}
          <FlightTable
            flights={paginatedData.flights}
            total={paginatedData.total}
            page={paginatedData.page}
            pageSize={paginatedData.pageSize}
            totalPages={paginatedData.totalPages}
            onPageChange={(p) => setFilters({ ...filters, page: p })}
            onPageSizeChange={(s) => setFilters({ ...filters, pageSize: s, page: 1 })}
            onSelectFlight={(flightNumber) => onNavigate(`/flight/${flightNumber.toLowerCase()}`)}
            onSelectAirport={(iata) => onNavigate(`/airport/${iata.toLowerCase()}`)}
            onSelectAirline={(iata) => onNavigate(`/airline/${iata.toLowerCase()}`)}
            lastUpdated={stats.lastSyncTimestamp}
          />
        </section>

        {/* SECTION D: Latest Departures & Arrivals Tabs */}
        <section className="bg-white border border-[#E8E5E8] rounded-md p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E5E8]">
            <div>
              <h2 className="text-base font-bold text-[#25232A]">
                Airport Flight Boards: Departures & Arrivals
              </h2>
              <p className="text-xs text-[#777780] mt-0.5">
                Check live gate updates, scheduled times, and actual statuses by hub airport.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Board Selector Tabs */}
              <div className="flex bg-[#F8F8FA] p-0.5 border border-[#E8E5E8] rounded">
                <button
                  onClick={() => setActiveBoardTab('departures')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeBoardTab === 'departures'
                      ? 'bg-[#681C35] text-white shadow-xs'
                      : 'text-[#777780] hover:text-[#25232A]'
                  }`}
                >
                  <PlaneTakeoff className="w-3.5 h-3.5" />
                  <span>Latest Departures</span>
                </button>
                <button
                  onClick={() => setActiveBoardTab('arrivals')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeBoardTab === 'arrivals'
                      ? 'bg-[#681C35] text-white shadow-xs'
                      : 'text-[#777780] hover:text-[#25232A]'
                  }`}
                >
                  <PlaneLanding className="w-3.5 h-3.5" />
                  <span>Latest Arrivals</span>
                </button>
              </div>

              {/* Airport selector */}
              <select
                value={boardAirport}
                onChange={(e) => setBoardAirport(e.target.value)}
                className="bg-[#F8F8FA] border border-[#E8E5E8] rounded px-2.5 py-1 text-xs text-[#25232A] font-medium cursor-pointer"
              >
                <option value="ALL">All Canadian Hubs</option>
                {CANADIAN_AIRPORTS.slice(0, 10).map((a) => (
                  <option key={a.iata} value={a.iata}>
                    {a.iata} ({a.city.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Board List */}
          <div className="divide-y divide-[#E8E5E8] mt-2">
            {(activeBoardTab === 'departures' ? departures : arrivals).map((flight) => (
              <div
                key={flight.id}
                onClick={() => onNavigate(`/flight/${flight.flightNumber.toLowerCase()}`)}
                className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9FA] rounded transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#681C35]/10 text-[#681C35] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {flight.airlineIata}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#681C35] font-mono">
                        {flight.flightNumber}
                      </span>
                      <span className="text-xs text-[#25232A] font-medium">
                        {flight.airlineName}
                      </span>
                    </div>
                    <div className="text-xs text-[#777780] flex items-center gap-2 mt-0.5">
                      <span>{flight.departureAirportIata} ({flight.departureCity})</span>
                      <ArrowRight className="w-3 h-3 text-[#777780]" />
                      <span>{flight.arrivalAirportIata} ({flight.arrivalCity})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                  <div className="text-right">
                    <div className="font-mono tabular-nums font-semibold text-[#25232A]">
                      {activeBoardTab === 'departures' ? flight.scheduledDepartureLocal : flight.scheduledArrivalLocal}
                    </div>
                    <div className="text-[10px] text-[#777780]">
                      {activeBoardTab === 'departures'
                        ? flight.gateDeparture ? `Gate ${flight.gateDeparture}` : flight.terminalDeparture || 'Scheduled'
                        : flight.baggageBelt || 'Terminal Inbound'}
                    </div>
                  </div>

                  <FlightStatusBadge status={flight.status} delayMinutes={flight.delayMinutes} />

                  <ArrowRight className="w-4 h-4 text-[#777780] hidden sm:block" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E8E5E8] flex justify-between items-center text-xs">
            <span className="text-[#777780]">
              Showing top operations for {boardAirport === 'ALL' ? 'all Canadian hubs' : boardAirport}
            </span>
            <button
              onClick={() => onNavigate(activeBoardTab === 'departures' ? '/departures' : '/arrivals')}
              className="text-[#681C35] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View full {activeBoardTab} board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* SECTION E: Global Airport Spotlight & Search Directory */}
        <section className="bg-white border border-[#E8E5E8] rounded-md p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E5E8] gap-3">
            <div>
              <h2 className="text-base font-bold text-[#25232A] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#681C35]" />
                <span>Featured Canadian International Airports</span>
              </h2>
              <p className="text-xs text-[#777780] mt-0.5">
                Explore IATA/ICAO runway specifications, terminals, Canadian timezones, and direct flight connections.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/airports')}
              className="text-xs font-semibold text-[#681C35] hover:underline flex items-center gap-1"
            >
              <span>Browse All Canadian Aerodromes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {CANADIAN_AIRPORTS.slice(0, 4).map((airport) => (
              <div
                key={airport.iata}
                onClick={() => onNavigate(`/airport/${airport.iata.toLowerCase()}`)}
                className="p-3.5 border border-[#E8E5E8] rounded hover:border-[#681C35] hover:bg-[#FAF9FA] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-mono text-[#681C35] group-hover:underline">
                    {airport.iata}
                  </span>
                  <span className="text-[11px] font-mono text-[#777780]">
                    ICAO: {airport.icao}
                  </span>
                </div>
                <h3 className="font-semibold text-xs text-[#25232A] mt-1 line-clamp-1">
                  {airport.name}
                </h3>
                <p className="text-xs text-[#777780] mt-0.5">
                  {airport.city}
                </p>
                <div className="mt-3 pt-2 border-t border-[#E8E5E8]/60 flex items-center justify-between text-[11px] text-[#777780]">
                  <span>{airport.terminals?.length || 1} Terminals</span>
                  <span className="font-mono">UTC {airport.utcOffset >= 0 ? `+${airport.utcOffset}` : airport.utcOffset}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 15: Aviation Articles and Editorial Content */}
        <section aria-labelledby="aviation-news-travel-insights">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8E5E8] mb-6 gap-3">
            <div>
              <h2 id="aviation-news-travel-insights" className="text-lg font-bold text-[#25232A]">
                Canadian Aviation Technical Analyses & Operations Guides
              </h2>
              <p className="text-xs text-[#777780] mt-0.5">
                Certified Transport Canada & NAV CANADA operational research, winter holdover times, aerodynamics, and airport connection logistics.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/articles')}
              className="text-xs font-semibold text-[#681C35] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All {allArticles.length} Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedArticles.map((art) => (
              <a
                key={art.slug}
                href={`/articles/${art.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/articles/${art.slug}`);
                }}
                className="bg-white border border-[#E8E5E8] rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col group relative"
              >
                <div className="h-44 overflow-hidden relative bg-slate-100">
                  <img
                    src={art.featuredImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="bg-[#681C35] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                      {art.category}
                    </span>
                    {art.publishedDate.includes('November 10') && (
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                        NEW · NOV 2026
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-[#777780] flex items-center gap-2 mb-1.5">
                      <span>{art.publishedDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>{art.readTimeMinutes} min read</span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#25232A] group-hover:text-[#681C35] transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-[#777780] mt-2 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8E5E8] flex items-center justify-between text-xs text-[#681C35] font-semibold">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Homepage Articles Numbered Pagination & Quick Access */}
          <div className="mt-6 bg-[#FAF9FA] border border-[#E8E5E8] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#777780]">
              Showing <strong className="text-[#25232A]">{(articlePage - 1) * homeArticlePageSize + 1}-{Math.min(articlePage * homeArticlePageSize, allArticles.length)}</strong> of <strong className="text-[#25232A]">{allArticles.length}</strong> Aviation Research Guides (8 per page):
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#777780] mr-1">Pages:</span>
              {Array.from({ length: totalArticlePages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setArticlePage(p);
                    document.getElementById('aviation-news-travel-insights')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-7 h-7 rounded text-xs font-bold cursor-pointer flex items-center justify-center transition-colors ${
                    articlePage === p
                      ? 'bg-[#681C35] text-white shadow-xs'
                      : 'bg-white border border-[#E8E5E8] text-[#25232A] hover:border-[#681C35]'
                  }`}
                  title={`Page ${p}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => onNavigate('/articles')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#681C35] hover:bg-[#8A2948] text-white text-xs font-semibold rounded transition-colors cursor-pointer ml-1"
              >
                <span>Browse All {allArticles.length} Guides</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        {/* AdSense Unit Bottom */}
        <AdSenseUnit slotId="homepage-bottom-unit" format="horizontal" />

        {/* Global Continuation & Hub Boards */}
        <ExploreMoreSection onNavigate={onNavigate} />
      </div>
    </div>
  );
};
