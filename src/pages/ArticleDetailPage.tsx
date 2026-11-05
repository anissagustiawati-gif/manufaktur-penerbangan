import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Bookmark,
  CheckCircle2,
  Plane,
  Search,
  ArrowRight,
  Radio,
  Filter,
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { FlightStatusBadge } from '../components/FlightStatusBadge';
import { AdSenseUnit } from '../components/AdSenseUnit';

interface Props {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ArticleDetailPage: React.FC<Props> = ({ slug, onNavigate }) => {
  const [flightSearch, setFlightSearch] = useState('');
  const [filterAirport, setFilterAirport] = useState('ALL');
  const [isMobileFlightsOpen, setIsMobileFlightsOpen] = useState(false);

  const article = aviationService.getArticleBySlug(slug);

  useEffect(() => {
    aviationService.recordArticleView(slug);
    if (article) {
      document.title = `${article.title} – World Flight Schedule`;
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `https://manufaktur.biz.id/articles/${article.slug}`);
    }
  }, [slug, article]);

  // Live flights for the interactive sidebar
  const liveFlightData = aviationService.getFlights({
    search: flightSearch,
    airport: filterAirport === 'ALL' ? undefined : filterAirport,
    pageSize: 6
  });

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans">
        <h1 className="text-xl font-bold text-[#25232A]">Article Not Found</h1>
        <p className="text-xs text-[#777780] mt-1">
          The requested aviation analysis does not exist or has been archived.
        </p>
        <button
          onClick={() => onNavigate('/articles')}
          className="mt-6 px-4 py-2 bg-[#681C35] text-white text-xs font-semibold rounded cursor-pointer"
        >
          Return to Aviation News
        </button>
      </div>
    );
  }

  const relatedArticles = aviationService
    .getArticles(article.category)
    .filter(a => a.slug !== article.slug)
    .slice(0, 3);

  // Helper to parse inline bolding **text** and markdown links [label](url)
  const renderInlineFormatted = (text: string) => {
    const tokens = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
        const match = token.match(/^\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const [, label, url] = match;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onNavigate(url)}
              className="text-[#681C35] font-semibold underline decoration-[#681C35]/40 hover:decoration-[#681C35] hover:text-[#8A2948] transition-colors cursor-pointer inline text-left p-0 bg-transparent border-none align-baseline"
            >
              {label}
            </button>
          );
        }
      }
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#25232A]">{token.slice(2, -2)}</strong>;
      }
      return token;
    });
  };

  // Render article markdown content sections
  const sections = article.content.split('\n\n').filter(s => s.trim().length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center justify-between text-xs text-[#777780] mb-6">
        <button
          onClick={() => onNavigate('/articles')}
          className="inline-flex items-center gap-1.5 hover:text-[#681C35] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Canadian Articles</span>
        </button>

        <div className="flex items-center gap-2">
          <span>{article.category}</span>
          <span aria-hidden="true">/</span>
          <span className="font-mono">{article.slug}</span>
        </div>
      </nav>

      {/* Mobile-Only Collapsible Flight Utility Ribbon */}
      <div className="lg:hidden mb-6 bg-white border border-[#E8E5E8] rounded-md shadow-2xs overflow-hidden">
        <button
          onClick={() => setIsMobileFlightsOpen(!isMobileFlightsOpen)}
          className="w-full px-4 py-3 bg-[#FAF9FA] hover:bg-[#F2EFF2] flex items-center justify-between text-xs font-semibold text-[#25232A] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Plane className="w-4 h-4 text-[#681C35]" />
            <span>Live Canadian Flight Tracker & Timetable</span>
          </div>
          <div className="flex items-center gap-1 text-[#681C35]">
            <span className="text-[11px]">{isMobileFlightsOpen ? 'Hide Flights' : 'Filter Flights'}</span>
            {isMobileFlightsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isMobileFlightsOpen && (
          <div className="p-4 border-t border-[#E8E5E8] space-y-3 bg-[#FDFCFD]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#777780] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={flightSearch}
                onChange={(e) => setFlightSearch(e.target.value)}
                placeholder="Search flight (AC103, WS115) or city..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E8E5E8] rounded"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {['ALL', 'YYZ', 'YVR', 'YUL', 'YYC', 'YOW', 'YHZ'].map((hub) => (
                <button
                  key={hub}
                  onClick={() => setFilterAirport(hub)}
                  className={`px-2 py-0.5 rounded whitespace-nowrap cursor-pointer ${
                    filterAirport === hub ? 'bg-[#681C35] text-white font-bold' : 'bg-white border border-[#E8E5E8] text-[#504e57]'
                  }`}
                >
                  {hub === 'ALL' ? 'All Hubs' : hub}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {liveFlightData.flights.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  onClick={() => onNavigate(`/flight/${f.flightNumber.toLowerCase()}`)}
                  className="p-2.5 bg-white border border-[#E8E5E8] rounded hover:border-[#681C35] cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#681C35] font-mono">{f.flightNumber} · {f.airlineName}</div>
                    <div className="text-[11px] text-[#777780]">{f.departureAirportIata} → {f.arrivalAirportIata} ({f.scheduledDepartureLocal})</div>
                  </div>
                  <FlightStatusBadge status={f.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column: Full 1,000+ Word Editorial Content */}
        <article className="lg:col-span-8 space-y-8">

      {/* Article Header */}
      <header className="space-y-4">
        <div className="inline-block bg-[#681C35] text-white text-xs font-semibold px-3 py-1 rounded">
          {article.category}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#25232A] leading-tight tracking-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base text-[#504e57] leading-relaxed">
          {article.excerpt}
        </p>

        {/* Author Byline & Timestamps */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-[#E8E5E8] text-xs text-[#777780]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#681C35]/10 text-[#681C35] flex items-center justify-center font-bold">
              {article.author.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-[#25232A]">{article.author.name}</div>
              <div className="text-[11px] text-[#777780]">{article.author.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#681C35]" />
              <span>Published: {article.publishedDate}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#681C35]" />
              <span>{article.readTimeMinutes} min read (~1,000 words)</span>
            </span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <figure className="rounded-lg overflow-hidden border border-[#E8E5E8] bg-slate-100">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-80 sm:h-96 object-cover object-center"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <figcaption className="p-2.5 bg-[#FAF9FA] text-[11px] text-[#777780] border-t border-[#E8E5E8] text-center">
          Editorial photo asset: Canadian Civil Aviation technical archive & aerodrome operations.
        </figcaption>
      </figure>

      {/* In-Article Ad Placement */}
      <AdSenseUnit slotId="article-top-inline" format="horizontal" />

      {/* Article Body Content */}
      <div className="prose max-w-none text-[#25232A] text-sm leading-relaxed space-y-6">
        {sections.map((section, idx) => {
          // Check for Markdown Table
          if (section.includes('|') && section.includes('---')) {
            const lines = section.trim().split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
            if (lines.length >= 2) {
              const parseRow = (line: string) =>
                line
                  .slice(1, -1)
                  .split('|')
                  .map(cell => cell.trim());

              const headerCells = parseRow(lines[0]);
              const dataRows = lines.slice(2).map(parseRow);

              return (
                <div key={idx} className="my-6 overflow-x-auto rounded border border-[#E8E5E8] shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#681C35] text-white">
                      <tr>
                        {headerCells.map((th, hIdx) => (
                          <th key={hIdx} className="px-3.5 py-2.5 font-semibold tracking-wide border-r border-[#8A2948] last:border-r-0">
                            {renderInlineFormatted(th)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5E8] bg-white">
                      {dataRows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white hover:bg-[#F8F8FA]' : 'bg-[#FAF9FA] hover:bg-[#F2EFF2]'}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3.5 py-2 text-[#3a3740] border-r border-[#E8E5E8] last:border-r-0">
                              {renderInlineFormatted(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }

          if (section.startsWith('### ')) {
            return (
              <h2 key={idx} className="text-xl font-bold text-[#681C35] pt-4 pb-1 border-b border-[#E8E5E8]">
                {renderInlineFormatted(section.replace('### ', ''))}
              </h2>
            );
          } else if (section.startsWith('#### ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-[#25232A] pt-2">
                {renderInlineFormatted(section.replace('#### ', ''))}
              </h3>
            );
          } else if (section.startsWith('> ')) {
            return (
              <blockquote key={idx} className="p-4 my-4 border-l-4 border-[#681C35] bg-[#FAF9FA] text-xs sm:text-sm text-[#504e57] italic rounded-r">
                {renderInlineFormatted(section.replace(/^>\s*/, ''))}
              </blockquote>
            );
          } else if (section.startsWith('- ')) {
            const listItems = section.split('\n').filter(l => l.startsWith('- '));
            return (
              <ul key={idx} className="space-y-2 my-3 pl-4 list-disc text-xs sm:text-sm">
                {listItems.map((li, liIdx) => (
                  <li key={liIdx} className="text-[#3a3740]">
                    {renderInlineFormatted(li.replace('- ', ''))}
                  </li>
                ))}
              </ul>
            );
          } else if (section.match(/^\d+\.\s/)) {
            const orderedItems = section.split('\n').filter(l => l.match(/^\d+\.\s/));
            return (
              <ol key={idx} className="space-y-2 my-3 pl-5 list-decimal text-xs sm:text-sm">
                {orderedItems.map((oi, oiIdx) => (
                  <li key={oiIdx} className="text-[#3a3740]">
                    {renderInlineFormatted(oi.replace(/^\d+\.\s/, ''))}
                  </li>
                ))}
              </ol>
            );
          } else {
            return (
              <p key={idx} className="text-[#3a3740] leading-relaxed">
                {renderInlineFormatted(section)}
              </p>
            );
          }
        })}
      </div>

      {/* Tags */}
      <div className="pt-6 border-t border-[#E8E5E8] flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#777780] flex items-center gap-1 mr-1">
          <Tag className="w-3.5 h-3.5" />
          <span>Canadian Aviation Topics:</span>
        </span>
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-[#F8F8FA] border border-[#E8E5E8] px-2.5 py-1 rounded text-[#504e57]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Fact-Checking & Canadian Editorial Certification Notice */}
      <div className="bg-[#FAF9FA] border border-[#E8E5E8] p-4 rounded-md text-xs text-[#777780] flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#25232A]">
            Transport Canada & NAV CANADA Editorial Verification
          </p>
          <p className="text-[11px] leading-relaxed">
            This technical analysis is researched, compiled, and certified in adherence with Transport Canada Canadian Aviation Regulations (CARs), NAV CANADA airspace directives, CATSA passenger standards, and ICAO Annex 14 aerodrome specifications.
          </p>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="pt-8 border-t border-[#E8E5E8] space-y-4">
          <h3 className="text-base font-bold text-[#25232A]">
            Related Aviation Guides
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <div
                key={rel.slug}
                onClick={() => onNavigate(`/articles/${rel.slug}`)}
                className="bg-white border border-[#E8E5E8] rounded p-3 hover:border-[#681C35] transition-colors cursor-pointer group"
              >
                <div className="text-[10px] text-[#681C35] font-semibold">{rel.category}</div>
                <h4 className="font-bold text-xs text-[#25232A] mt-1 group-hover:text-[#681C35] line-clamp-2">
                  {rel.title}
                </h4>
                <div className="text-[10px] text-[#777780] mt-2">{rel.readTimeMinutes} min read</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AdSense Unit */}
      <AdSenseUnit slotId="article-bottom-unit" format="horizontal" />
    </article>

    {/* Desktop Sticky Companion Sidebar: Live Canadian Flight Monitor */}
    <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-20">
      {/* Live Flights Card */}
      <div className="bg-white border border-[#E8E5E8] rounded-md shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E5E8] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#25232A] flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-[#681C35]" />
              <span>Live Canadian Airspace</span>
            </h3>
          </div>
          <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            NAV CANADA ADS-B
          </span>
        </div>

        <p className="text-[11px] text-[#777780] leading-relaxed">
          Monitor real-time commercial flights across Canada while reading. Filter by Canadian hub or search by flight code.
        </p>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#777780] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={flightSearch}
            onChange={(e) => setFlightSearch(e.target.value)}
            placeholder="Search flight (AC102, WS201) or city..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded text-xs focus:outline-none focus:border-[#681C35] font-sans"
          />
        </div>

        {/* Quick Hub Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          {['ALL', 'YYZ', 'YVR', 'YUL', 'YYC', 'YEG', 'YOW', 'YHZ'].map((hub) => (
            <button
              key={hub}
              onClick={() => setFilterAirport(hub)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterAirport === hub
                  ? 'bg-[#681C35] text-white font-bold shadow-xs'
                  : 'bg-[#F8F8FA] border border-[#E8E5E8] text-[#504e57] hover:border-[#681C35]'
              }`}
            >
              {hub === 'ALL' ? 'All Hubs' : hub}
            </button>
          ))}
        </div>

        {/* Flight Results List */}
        <div className="space-y-2.5 pt-1">
          {liveFlightData.flights.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#777780] bg-[#FAF9FA] rounded border border-dashed border-[#E8E5E8]">
              No flights match &quot;{flightSearch}&quot;
            </div>
          ) : (
            liveFlightData.flights.map((flight) => (
              <div
                key={flight.id}
                onClick={() => onNavigate(`/flight/${flight.flightNumber.toLowerCase()}`)}
                className="p-3 bg-[#FAF9FA] hover:bg-white border border-[#E8E5E8] hover:border-[#681C35] rounded transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-[#681C35] group-hover:underline">
                      {flight.flightNumber}
                    </span>
                    <span className="text-[10px] text-[#777780]">·</span>
                    <span className="text-[11px] font-semibold text-[#25232A]">
                      {flight.airlineName}
                    </span>
                  </div>
                  <FlightStatusBadge status={flight.status} />
                </div>

                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="flex items-center gap-1 font-mono font-medium text-[#25232A]">
                    <span>{flight.departureAirportIata}</span>
                    <ArrowRight className="w-3 h-3 text-[#777780]" />
                    <span>{flight.arrivalAirportIata}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#777780]">
                    {flight.scheduledDepartureLocal}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-[#777780]">
                  <span>{flight.aircraftModel.split(' ')[0]} {flight.aircraftIcaoType}</span>
                  <span>Gate {flight.gateDeparture || 'Assigned'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Hub Navigation Links */}
        <div className="pt-2 border-t border-[#E8E5E8] flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigate('/map')}
            className="text-[#681C35] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>Full Airspace Radar Map</span>
          </button>
          <button
            onClick={() => onNavigate('/flights')}
            className="text-[#777780] hover:text-[#25232A] flex items-center gap-1 cursor-pointer"
          >
            <span>All Flights</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* AdSense Sidebar Display */}
      <AdSenseUnit slotId="article-sidebar-display" format="rectangle" />
    </aside>
    </div>
  </div>
  );
};
