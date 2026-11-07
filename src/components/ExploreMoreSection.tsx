import React from 'react';
import { Newspaper, Plane, ArrowRight, Radio, Building2, Compass, ShieldCheck } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { CANADIAN_AIRPORTS } from '../data/canadianAviationData';

interface Props {
  onNavigate: (path: string) => void;
  excludeSlug?: string;
  title?: string;
  subtitle?: string;
}

export const ExploreMoreSection: React.FC<Props> = ({
  onNavigate,
  excludeSlug,
  title = "Explore Canadian Aviation Insights & Live Timetables",
  subtitle = "Continue exploring in-depth flight operations research, major airport timetables, and live transponder radar tracking."
}) => {
  const allArticles = aviationService.getArticles();
  const articles = allArticles.filter(a => a.slug !== excludeSlug).slice(0, 4);

  return (
    <div className="mt-12 pt-8 border-t border-[#E8E5E8] space-y-10 font-sans">
      {/* 1. Trending Articles Section */}
      <section aria-labelledby="explore-trending-articles">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8E5E8] mb-6 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
              <Newspaper className="w-4 h-4" />
              <span>Recommended Reading</span>
            </div>
            <h2 id="explore-trending-articles" className="text-lg sm:text-xl font-bold text-[#25232A] mt-0.5">
              {title}
            </h2>
            <p className="text-xs text-[#777780] mt-0.5 max-w-2xl">
              {subtitle}
            </p>
          </div>

          <button
            onClick={() => onNavigate('/articles')}
            className="text-xs font-semibold text-[#681C35] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All 11 Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {articles.map((art) => (
            <article
              key={art.slug}
              onClick={() => onNavigate(`/articles/${art.slug}`)}
              className="bg-white border border-[#E8E5E8] rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
            >
              <div className="h-40 overflow-hidden relative bg-slate-100">
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
                <div className="absolute top-2.5 left-2.5 bg-[#681C35] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                  {art.category}
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
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Canadian Airspace Radar Callout Banner */}
      <section className="bg-gradient-to-r from-[#681C35] to-[#461122] text-white rounded-lg p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>NAV CANADA ADS-B Telemetry Network</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            Live Canadian Commercial Airspace Flight Radar
          </h3>
          <p className="text-xs text-white/85 leading-relaxed">
            Track real-time flight positions, barometric altitude, and ground speed vectors across Toronto (YYZ), Vancouver (YVR), Montreal (YUL), and High Arctic flight paths.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/map')}
            className="px-5 py-2.5 bg-white text-[#681C35] hover:bg-[#FAF9FA] text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#681C35]" />
            <span>Open Live Radar Map</span>
          </button>
          <button
            onClick={() => onNavigate('/flights')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-md border border-white/20 transition-colors cursor-pointer"
          >
            Flight Timetables
          </button>
        </div>
      </section>

      {/* 3. Major Canadian Hub Quick Access Grid */}
      <section className="bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8E5E8] mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#25232A] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#681C35]" />
              <span>Major Canadian Airport Flight Boards</span>
            </h3>
            <p className="text-xs text-[#777780] mt-0.5">
              Instant access to verified scheduled departures, arrivals, and gate telemetry.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/airports')}
            className="text-xs font-semibold text-[#681C35] hover:underline flex items-center gap-1"
          >
            <span>All Aerodromes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CANADIAN_AIRPORTS.slice(0, 6).map((airport) => (
            <div
              key={airport.iata}
              onClick={() => onNavigate(`/airport/${airport.iata.toLowerCase()}`)}
              className="p-3 border border-[#E8E5E8] rounded hover:border-[#681C35] hover:bg-[#FAF9FA] transition-all cursor-pointer group"
            >
              <div className="text-base font-bold font-mono text-[#681C35] group-hover:underline">
                {airport.iata}
              </div>
              <div className="text-xs font-semibold text-[#25232A] truncate mt-0.5">
                {airport.city.split(',')[0]}
              </div>
              <div className="text-[10px] text-[#777780] mt-1 flex items-center justify-between">
                <span>{airport.terminals?.length || 1} Terminals</span>
                <span className="font-mono">{airport.icao}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
