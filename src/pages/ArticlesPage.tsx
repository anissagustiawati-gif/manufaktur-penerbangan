import React, { useState, useMemo } from 'react';
import { Newspaper, Search, ArrowRight, ChevronLeft, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  onNavigate: (path: string) => void;
}

export const ArticlesPage: React.FC<Props> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const categories = [
    'ALL',
    'Aviation Technology',
    'Airport Guides',
    'Airline Information',
    'Airport Operations',
    'Global Aviation',
    'Aviation Meteorology'
  ];

  const allFilteredArticles = useMemo(() => {
    return aviationService.getArticles(
      selectedCategory === 'ALL' ? undefined : selectedCategory,
      search
    );
  }, [selectedCategory, search]);

  const totalPages = Math.max(1, Math.ceil(allFilteredArticles.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedArticles = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return allFilteredArticles.slice(startIndex, startIndex + pageSize);
  }, [allFilteredArticles, validCurrentPage, pageSize]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startRecord = allFilteredArticles.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(validCurrentPage * pageSize, allFilteredArticles.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      <div className="border-b border-[#E8E5E8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
            <Newspaper className="w-4 h-4" />
            <span>Canadian Aviation Editorial &amp; Technical Analyses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25232A] mt-1">
            Canadian Aviation News &amp; Operational Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#777780] mt-1">
            Comprehensive 1,000 to 1,500+ word aviation guides covering winter de-icing holdover times, NAV CANADA space-based ADS-B, APAPR passenger rights, Mirabel A220 manufacturing, and transatlantic oceanic routing.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search articles, technology, airports..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E5E8] rounded-md text-xs focus:outline-none focus:border-[#681C35]"
          />
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
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

        <div className="text-xs text-[#777780] font-medium hidden sm:block">
          Showing <strong className="text-[#25232A]">{startRecord}-{endRecord}</strong> of <strong className="text-[#25232A]">{allFilteredArticles.length}</strong> articles
        </div>
      </div>

      {/* Articles Grid */}
      {paginatedArticles.length === 0 ? (
        <div className="bg-white border border-[#E8E5E8] rounded-lg p-12 text-center text-[#777780]">
          <BookOpen className="w-10 h-10 mx-auto text-[#777780] opacity-40 mb-3" />
          <h3 className="text-base font-bold text-[#25232A]">No articles found</h3>
          <p className="text-xs mt-1">Try clearing your search query or selecting a different category filter.</p>
          <button
            onClick={() => { setSelectedCategory('ALL'); setSearch(''); setCurrentPage(1); }}
            className="mt-4 px-4 py-2 bg-[#681C35] text-white text-xs font-semibold rounded-md hover:bg-[#8A2948] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArticles.map((art) => (
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
                        <span className="font-semibold text-[#681C35]">{art.views.toLocaleString('en-US')} views</span>
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
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Numbered Pagination (1, 2, 3, 4 ...) */}
      {totalPages > 1 && (
        <div className="bg-white border border-[#E8E5E8] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="text-xs text-[#777780]">
            Page <strong className="text-[#25232A]">{validCurrentPage}</strong> of <strong className="text-[#25232A]">{totalPages}</strong> &mdash; Showing {startRecord}-{endRecord} of {allFilteredArticles.length} aviation articles
          </div>

          <div className="flex items-center gap-1">
            {/* Previous Page Button */}
            <button
              onClick={() => handlePageChange(Math.max(1, validCurrentPage - 1))}
              disabled={validCurrentPage === 1}
              className="px-2.5 py-1.5 border border-[#E8E5E8] rounded text-xs font-medium text-[#25232A] hover:bg-[#FAF9FA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Numbered Buttons: 1, 2, 3 ... */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`min-w-8 h-8 px-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  validCurrentPage === pageNum
                    ? 'bg-[#681C35] text-white shadow-xs'
                    : 'border border-[#E8E5E8] text-[#25232A] hover:bg-[#FAF9FA] hover:border-[#681C35]'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, validCurrentPage + 1))}
              disabled={validCurrentPage === totalPages}
              className="px-2.5 py-1.5 border border-[#E8E5E8] rounded text-xs font-medium text-[#25232A] hover:bg-[#FAF9FA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              aria-label="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <AdSenseUnit slotId="articles-directory-bottom" format="horizontal" />

      {/* Continuation & Discovery Section */}
      <ExploreMoreSection onNavigate={onNavigate} />
    </div>
  );
};
