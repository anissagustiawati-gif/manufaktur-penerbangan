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
                <a
                  href="/flights"
                  onClick={(e) => { e.preventDefault(); onNavigate('/flights'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Flight Schedules
                </a>
              </li>
              <li>
                <a
                  href="/departures"
                  onClick={(e) => { e.preventDefault(); onNavigate('/departures'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Airport Departures
                </a>
              </li>
              <li>
                <a
                  href="/arrivals"
                  onClick={(e) => { e.preventDefault(); onNavigate('/arrivals'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Airport Arrivals
                </a>
              </li>
              <li>
                <a
                  href="/map"
                  onClick={(e) => { e.preventDefault(); onNavigate('/map'); }}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Live Tracking Radar</span>
                  <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
                </a>
              </li>
              <li>
                <a
                  href="/routes"
                  onClick={(e) => { e.preventDefault(); onNavigate('/routes'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Worldwide Routes
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Directories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Directories</h4>
            <ul className="space-y-2 text-xs text-[#b8b3b7]">
              <li>
                <a
                  href="/airports"
                  onClick={(e) => { e.preventDefault(); onNavigate('/airports'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Global Airports (IATA/ICAO)
                </a>
              </li>
              <li>
                <a
                  href="/airlines"
                  onClick={(e) => { e.preventDefault(); onNavigate('/airlines'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  International Airlines
                </a>
              </li>
              <li>
                <a
                  href="/aircraft"
                  onClick={(e) => { e.preventDefault(); onNavigate('/aircraft'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Commercial Aircraft Types
                </a>
              </li>
              <li>
                <a
                  href="/articles"
                  onClick={(e) => { e.preventDefault(); onNavigate('/articles'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Aviation News &amp; Insights
                </a>
              </li>
              <li>
                <a
                  href="/sitemap"
                  onClick={(e) => { e.preventDefault(); onNavigate('/sitemap'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  HTML Site Index
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Editorial &amp; Policies</h4>
            <ul className="space-y-2 text-xs text-[#b8b3b7]">
              <li>
                <a
                  href="/about"
                  onClick={(e) => { e.preventDefault(); onNavigate('/about'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => { e.preventDefault(); onNavigate('/contact'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => { e.preventDefault(); onNavigate('/privacy'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => { e.preventDefault(); onNavigate('/terms'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a
                  href="/disclaimer"
                  onClick={(e) => { e.preventDefault(); onNavigate('/disclaimer'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Aviation Data Disclaimer
                </a>
              </li>
              <li>
                <a
                  href="/editorial-policy"
                  onClick={(e) => { e.preventDefault(); onNavigate('/editorial-policy'); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Editorial Policy
                </a>
              </li>
              <li className="pt-1 flex items-center gap-2 text-[11px] text-[#9d979c]">
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  XML Sitemap
                </a>
                <span>&middot;</span>
                <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  RSS Feed
                </a>
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
