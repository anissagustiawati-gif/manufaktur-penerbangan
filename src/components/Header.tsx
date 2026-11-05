import React, { useState, useEffect } from 'react';
import { Search, Plane, Clock, Globe, Menu, X, Shield, Radio, Navigation2 } from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  onSearch: (query: string) => void;
}

export const Header: React.FC<Props> = ({ currentPath, onNavigate, onSearch }) => {
  const [searchInput, setSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigate(`/flights?q=${encodeURIComponent(searchInput.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  // Format dynamic top bar date: "MONDAY, NOVEMBER 2, 2026"
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  const formattedUtcTime = currentTime.toUTCString().slice(17, 25) + ' UTC';
  const formattedLocalTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Flight Schedules', path: '/flights' },
    { label: 'Departures', path: '/departures' },
    { label: 'Arrivals', path: '/arrivals' },
    { label: 'Airports', path: '/airports' },
    { label: 'Airlines', path: '/airlines' },
    { label: 'Aircraft', path: '/aircraft' },
    { label: 'Flight Routes', path: '/routes' },
    { label: 'Live Map', path: '/map', isBadge: true },
    { label: 'Aviation News', path: '/articles' },
    { label: 'About Us', path: '/about' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E8E5E8] shadow-xs">
      {/* Top Universal Information Bar */}
      <div className="bg-[#681C35] text-white text-xs py-1.5 px-4 sm:px-8 border-b border-[#8A2948]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 font-medium tracking-wide text-[11px] sm:text-xs">
            <span className="font-semibold text-white/95 hidden sm:inline">{formattedDate}</span>
            <span className="text-white/40 hidden sm:inline" aria-hidden="true">|</span>
            <span className="flex items-center gap-1.5 text-white/90">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-mono tabular-nums">{formattedUtcTime}</span>
              <span className="text-white/60 hidden sm:inline">({formattedLocalTime} Local)</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-white/80">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-white/80">
              <Globe className="w-3 h-3 text-emerald-300" />
              Global Aviation Network Data
            </span>
          </div>
        </div>
      </div>

      {/* Main Brand & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-md bg-[#681C35] text-white flex items-center justify-center shadow-xs group-hover:bg-[#8A2948] transition-colors">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="text-sm sm:text-lg font-bold tracking-tight text-[#25232A] leading-tight font-sans flex items-center gap-1.5 flex-wrap">
                <span>WORLD FLIGHT SCHEDULE</span>
                <span className="text-[10px] sm:text-xs font-semibold text-[#681C35] bg-[#681C35]/10 px-1.5 py-0.5 rounded">CANADA</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-[#777780] tracking-wide hidden sm:block">
                Canadian Aerodromes, Flight Timetables & Transponder Tracking
              </div>
            </div>
          </button>
        </div>

        {/* Global Fast Search Form */}
        <div className="flex-1 max-w-lg hidden lg:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#777780] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Canadian flight (AC102, WS201), airport (YYZ, YVR), airline, city..."
              className="w-full pl-10 pr-24 py-2 bg-[#F8F8FA] border border-[#E8E5E8] rounded-md text-xs text-[#25232A] placeholder-[#777780] focus:outline-none focus:border-[#681C35] focus:bg-white transition-all font-sans"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#681C35] hover:bg-[#8A2948] text-white text-[11px] font-medium rounded transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => onNavigate('/map')}
            className="p-2 text-[#681C35] hover:bg-[#F8F8FA] rounded-md"
            title="Live Radar Map"
          >
            <Radio className="w-5 h-5 text-emerald-600" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#25232A] hover:bg-[#F8F8FA] rounded-md"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar (Desktop) */}
      <nav className="border-t border-[#E8E5E8] bg-white hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1 py-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#681C35] font-semibold'
                      : 'text-[#504e57] hover:text-[#25232A]'
                  }`}
                >
                  {item.label}
                  {item.isBadge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#681C35]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 py-1">
            <button
              onClick={() => onNavigate('/map')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-medium hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Navigation2 className="w-3 h-3 text-emerald-700" />
              <span>Live Tracking Map</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E8E5E8] px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <Search className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search flight, airport, airline..."
              className="w-full pl-9 pr-20 py-2 bg-[#F8F8FA] border border-[#E8E5E8] rounded-md text-xs text-[#25232A]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#681C35] text-white text-xs rounded"
            >
              Go
            </button>
          </form>

          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-[#E8E5E8]">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-xs font-medium rounded ${
                  currentPath === item.path ? 'bg-[#681C35]/10 text-[#681C35] font-semibold' : 'text-[#25232A] hover:bg-[#F8F8FA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E8E5E8] flex justify-between items-center text-xs text-[#777780]">
            <span>UTC: {formattedUtcTime}</span>
            <span className="font-mono">{formattedLocalTime} Local</span>
          </div>
        </div>
      )}
    </header>
  );
};
