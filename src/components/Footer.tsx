import React from 'react';
import { Plane, ShieldCheck, Globe, Radio } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#1f1a1d] text-white border-t border-[#382b31] pt-12 pb-8 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#382b31]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#681C35] flex items-center justify-center text-white">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                WORLD FLIGHT SCHEDULE <span className="text-xs font-semibold text-rose-300 bg-white/10 px-1.5 py-0.5 rounded">CANADA</span>
              </span>
            </div>
            <p className="text-xs text-[#b8b3b7] leading-relaxed max-w-sm">
              Dedicated Canadian Aerodrome Timetables, Flight Schedules & Transponder Tracking. Providing valid real-time daily updated timetables across all 10 Canadian provinces & 3 territories, featuring Air Canada, WestJet, Porter Airlines, Air Transat, Flair, and Canadian North.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#9d979c]">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                ADS-B & NAV CANADA Space-Based Feeds
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Valid Daily Timetable Sync
              </span>
            </div>
          </div>

          {/* Col 1: Flight Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Flight Operations</h4>
            <ul className="space-y-2 text-xs text-[#b8b3b7]">
              <li>
                <button onClick={() => onNavigate('/flights')} className="hover:text-white transition-colors cursor-pointer">
                  Flight Schedules
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/departures')} className="hover:text-white transition-colors cursor-pointer">
                  Airport Departures
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/arrivals')} className="hover:text-white transition-colors cursor-pointer">
                  Airport Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/map')} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <span>Live Tracking Radar</span>
                  <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/routes')} className="hover:text-white transition-colors cursor-pointer">
                  Worldwide Routes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Directories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Directories</h4>
            <ul className="space-y-2 text-xs text-[#b8b3b7]">
              <li>
                <button onClick={() => onNavigate('/airports')} className="hover:text-white transition-colors cursor-pointer">
                  Global Airports (IATA/ICAO)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/airlines')} className="hover:text-white transition-colors cursor-pointer">
                  International Airlines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/aircraft')} className="hover:text-white transition-colors cursor-pointer">
                  Commercial Aircraft Types
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/articles')} className="hover:text-white transition-colors cursor-pointer">
                  Aviation News & Insights
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Editorial & Policies</h4>
            <ul className="space-y-2 text-xs text-[#b8b3b7]">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/disclaimer')} className="hover:text-white transition-colors cursor-pointer">
                  Aviation Data Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/editorial-policy')} className="hover:text-white transition-colors cursor-pointer">
                  Editorial Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom note & copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8c868b]">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#8A2948]" />
            <span>
              &copy; {new Date().getFullYear()} World Flight Schedule. All international aviation rights reserved.
            </span>
          </div>
          <p className="text-[11px] text-[#757074] text-center md:text-right max-w-md">
            Flight information is compiled from verified airline timetables, airport authority feeds, and public ADS-B transponder telemetry. Not for primary navigational flight planning.
          </p>
        </div>
      </div>
    </footer>
  );
};
