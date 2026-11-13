import React from 'react';
import { Map, Newspaper, Plane, Building2, Shield, ArrowRight } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { CANADIAN_AIRPORTS, CANADIAN_AIRLINES, CANADIAN_AIRCRAFT, CANADIAN_ROUTES } from '../data/canadianAviationData';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  onNavigate: (path: string) => void;
}

export const SitemapPage: React.FC<Props> = ({ onNavigate }) => {
  const articles = aviationService.getArticles();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 font-sans">
      <div className="border-b border-[#E8E5E8] pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
          <Map className="w-4 h-4" />
          <span>Complete Site Index &amp; Navigation Tree</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#25232A] mt-1">
          HTML Sitemap &ndash; All Flight Schedules, Aerodromes &amp; Research Guides
        </h1>
        <p className="text-xs sm:text-sm text-[#777780] mt-1.5 max-w-3xl">
          Quickly navigate through all 20 Canadian aviation research whitepapers, major international hub aerodromes, commercial carrier fleets, transcontinental routes, and compliance policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Section 1: Aviation Research Guides (20 Articles) */}
        <div className="lg:col-span-2 bg-white border border-[#E8E5E8] rounded-lg p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E5E8]">
            <h2 className="text-base font-bold text-[#25232A] flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#681C35]" />
              <span>Aviation Research Guides &amp; Analyses ({articles.length})</span>
            </h2>
            <a
              href="/articles"
              onClick={(e) => { e.preventDefault(); onNavigate('/articles'); }}
              className="text-xs font-semibold text-[#681C35] hover:underline flex items-center gap-1"
            >
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {articles.map((art) => (
              <a
                key={art.slug}
                href={`/articles/${art.slug}`}
                onClick={(e) => { e.preventDefault(); onNavigate(`/articles/${art.slug}`); }}
                className="p-3 border border-[#E8E5E8] rounded-md hover:border-[#681C35] hover:bg-[#FAF9FA] transition-colors group block"
              >
                <div className="flex items-center justify-between gap-2 text-[10px] text-[#777780] mb-1">
                  <span className="font-semibold text-[#681C35]">{art.category}</span>
                  <span>{art.publishedDate}</span>
                </div>
                <h3 className="text-xs font-bold text-[#25232A] group-hover:text-[#681C35] transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>
              </a>
            ))}
          </div>
        </div>

        {/* Section 2: Core Flight Operations Tools */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-6 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-[#25232A] flex items-center gap-2 pb-2 border-b border-[#E8E5E8]">
              <Plane className="w-4 h-4 text-[#681C35]" />
              <span>Live Operations &amp; Schedules</span>
            </h2>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }} className="text-[#25232A] hover:text-[#681C35] font-medium flex items-center justify-between">
                  <span>Home &ndash; Canadian Timetables</span>
                  <ArrowRight className="w-3 h-3 text-[#777780]" />
                </a>
              </li>
              <li>
                <a href="/flights" onClick={(e) => { e.preventDefault(); onNavigate('/flights'); }} className="text-[#25232A] hover:text-[#681C35] font-medium flex items-center justify-between">
                  <span>Daily Flight Schedules (NAV CANADA)</span>
                  <ArrowRight className="w-3 h-3 text-[#777780]" />
                </a>
              </li>
              <li>
                <a href="/departures" onClick={(e) => { e.preventDefault(); onNavigate('/departures'); }} className="text-[#25232A] hover:text-[#681C35] font-medium flex items-center justify-between">
                  <span>Live Airport Departures Board</span>
                  <ArrowRight className="w-3 h-3 text-[#777780]" />
                </a>
              </li>
              <li>
                <a href="/arrivals" onClick={(e) => { e.preventDefault(); onNavigate('/arrivals'); }} className="text-[#25232A] hover:text-[#681C35] font-medium flex items-center justify-between">
                  <span>Live Airport Arrivals Board</span>
                  <ArrowRight className="w-3 h-3 text-[#777780]" />
                </a>
              </li>
              <li>
                <a href="/map" onClick={(e) => { e.preventDefault(); onNavigate('/map'); }} className="text-[#25232A] hover:text-[#681C35] font-medium flex items-center justify-between">
                  <span>Live Airspace ADS-B Radar Map</span>
                  <ArrowRight className="w-3 h-3 text-[#777780]" />
                </a>
              </li>
              <li>
                <a href="/routes" onClick={(e) => { e.preventDefault(); onNavigate('/routes'); }} className="text-[#25232A] hover:text-[#681C35] font-medium flex items-center justify-between">
                  <span>Canadian &amp; International Flight Routes ({CANADIAN_ROUTES.length})</span>
                  <ArrowRight className="w-3 h-3 text-[#777780]" />
                </a>
              </li>
            </ul>
          </div>

          {/* All Canadian Aerodromes */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-6 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-[#25232A] flex items-center gap-2 pb-2 border-b border-[#E8E5E8]">
              <Building2 className="w-4 h-4 text-[#681C35]" />
              <span>Canadian Aerodromes ({CANADIAN_AIRPORTS.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {CANADIAN_AIRPORTS.map((apt) => (
                <a
                  key={apt.iata}
                  href={`/airport/${apt.iata}`}
                  onClick={(e) => { e.preventDefault(); onNavigate(`/airport/${apt.iata}`); }}
                  className="p-2 border border-[#E8E5E8] rounded hover:border-[#681C35] hover:bg-[#FAF9FA] transition-colors"
                >
                  <span className="font-mono font-bold text-[#681C35]">{apt.iata}</span>
                  <span className="text-[#777780] block truncate text-[11px]">{apt.city.split(',')[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Airlines & Aircraft Fleet */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#25232A] flex items-center gap-2 pb-2 border-b border-[#E8E5E8]">
                <Plane className="w-4 h-4 text-[#681C35]" />
                <span>Canadian Carriers ({CANADIAN_AIRLINES.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                {CANADIAN_AIRLINES.map((al) => (
                  <a
                    key={al.iata}
                    href={`/airline/${al.iata}`}
                    onClick={(e) => { e.preventDefault(); onNavigate(`/airline/${al.iata}`); }}
                    className="p-2 border border-[#E8E5E8] rounded hover:border-[#681C35] hover:bg-[#FAF9FA] transition-colors"
                  >
                    <span className="font-mono font-bold text-[#681C35]">{al.iata}</span>
                    <span className="text-[#777780] block truncate text-[11px]">{al.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8E5E8]">
              <h3 className="text-xs font-bold text-[#25232A] uppercase tracking-wider mb-2">
                Aircraft Types ({CANADIAN_AIRCRAFT.length})
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {CANADIAN_AIRCRAFT.map((ac) => (
                  <a
                    key={ac.icaoType}
                    href={`/aircraft/${ac.icaoType}`}
                    onClick={(e) => { e.preventDefault(); onNavigate(`/aircraft/${ac.icaoType}`); }}
                    className="p-2 border border-[#E8E5E8] rounded hover:border-[#681C35] hover:bg-[#FAF9FA] transition-colors"
                  >
                    <span className="font-mono font-bold text-[#681C35]">{ac.icaoType}</span>
                    <span className="text-[#777780] block truncate text-[11px]">{ac.model}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance & Feeds */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-6 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-[#25232A] flex items-center gap-2 pb-2 border-b border-[#E8E5E8]">
              <Shield className="w-4 h-4 text-[#681C35]" />
              <span>Policies &amp; Machine Feeds</span>
            </h2>
            <ul className="space-y-1.5 text-xs text-[#504e57]">
              <li><a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('/about'); }} className="hover:text-[#681C35]">About Us</a></li>
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('/contact'); }} className="hover:text-[#681C35]">Contact Desk</a></li>
              <li><a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate('/privacy'); }} className="hover:text-[#681C35]">Privacy Policy</a></li>
              <li><a href="/terms" onClick={(e) => { e.preventDefault(); onNavigate('/terms'); }} className="hover:text-[#681C35]">Terms of Service</a></li>
              <li><a href="/disclaimer" onClick={(e) => { e.preventDefault(); onNavigate('/disclaimer'); }} className="hover:text-[#681C35]">Data Disclaimer</a></li>
              <li><a href="/editorial-policy" onClick={(e) => { e.preventDefault(); onNavigate('/editorial-policy'); }} className="hover:text-[#681C35]">Editorial Standards</a></li>
              <li className="pt-2 border-t border-[#E8E5E8] flex gap-3 text-[11px]">
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-[#681C35] font-semibold underline">XML Sitemap</a>
                <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="text-[#681C35] font-semibold underline">RSS Feed</a>
                <a href="/feed.xml" target="_blank" rel="noopener noreferrer" className="text-[#681C35] font-semibold underline">Atom Feed</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ExploreMoreSection onNavigate={onNavigate} />
    </div>
  );
};
