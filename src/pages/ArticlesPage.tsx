import React, { useState } from 'react';
import { Newspaper, Search, ArrowRight, Clock, Tag } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { AdSenseUnit } from '../components/AdSenseUnit';

interface Props {
  onNavigate: (path: string) => void;
}

export const ArticlesPage: React.FC<Props> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const categories = [
    'ALL',
    'Aviation Technology',
    'Airport Guides',
    'Airline Information',
    'Airport Operations',
    'Global Aviation'
  ];

  const articles = aviationService.getArticles(
    selectedCategory === 'ALL' ? undefined : selectedCategory,
    search
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      <div className="border-b border-[#E8E5E8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
            <Newspaper className="w-4 h-4" />
            <span>Canadian Aviation Editorial & Technical Analyses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25232A] mt-1">
            Canadian Aviation News & Operational Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#777780] mt-1">
            In-depth 1,000-word investigative analyses covering winter de-icing holdover times, NAV CANADA space-based ADS-B in the High Arctic, Canadian hub connection protocols, and northern combi jet operations.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, technology, airports..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E5E8] rounded-md text-xs focus:outline-none focus:border-[#681C35]"
          />
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#681C35] text-white font-semibold'
                : 'bg-white border border-[#E8E5E8] text-[#504e57] hover:border-[#681C35] hover:text-[#25232A]'
            }`}
          >
            {cat === 'ALL' ? 'All Editorial Topics' : cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <article
            key={art.slug}
            onClick={() => onNavigate(`/articles/${art.slug}`)}
            className="bg-white border border-[#E8E5E8] rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
          >
            <div className="h-48 overflow-hidden relative bg-slate-100">
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
              <div className="absolute top-3 left-3 bg-[#681C35] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                {art.category}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[11px] text-[#777780] flex items-center gap-2 mb-2">
                  <span>{art.publishedDate}</span>
                  <span aria-hidden="true">·</span>
                  <span>{art.readTimeMinutes} min read</span>
                  {art.views && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#681C35]">{art.views.toLocaleString('id-ID')} views</span>
                    </>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#25232A] group-hover:text-[#681C35] transition-colors leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-[#777780] mt-2 line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E5E8] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#777780] font-medium">By {art.author.name}</span>
                <span className="text-xs text-[#681C35] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AdSenseUnit slotId="articles-directory-bottom" format="horizontal" />
    </div>
  );
};
