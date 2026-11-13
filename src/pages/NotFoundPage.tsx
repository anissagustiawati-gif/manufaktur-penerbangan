import React from 'react';
import { Plane } from 'lucide-react';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<Props> = ({ onNavigate }) => {
  React.useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) {
      meta.setAttribute('content', 'noindex, nofollow');
    }
    return () => {
      if (meta) {
        meta.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      }
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 font-sans space-y-8">
      <div className="max-w-xl mx-auto text-center space-y-4 bg-white border border-[#E8E5E8] rounded-lg p-8 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[#681C35]/10 text-[#681C35] flex items-center justify-center mx-auto">
          <Plane className="w-7 h-7 -rotate-45" />
        </div>

        <div className="text-3xl font-black font-mono text-[#681C35]">
          404 - Page Not Found
        </div>

        <h1 className="text-base font-bold text-[#25232A]">
          Flight Corridor Off-Track
        </h1>

        <p className="text-xs text-[#777780] leading-relaxed">
          The requested aviation URL or flight identifier does not exist. Use the links below to explore active flight schedules, airport timetables, or our certified aviation guides.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
            className="px-4 py-2 bg-[#681C35] hover:bg-[#8A2948] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Return to Flight Schedules
          </a>
          <a
            href="/articles"
            onClick={(e) => { e.preventDefault(); onNavigate('/articles'); }}
            className="px-4 py-2 bg-white border border-[#E8E5E8] hover:border-[#681C35] text-[#25232A] text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Browse Aviation News
          </a>
          <a
            href="/map"
            onClick={(e) => { e.preventDefault(); onNavigate('/map'); }}
            className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Live Tracking Map
          </a>
        </div>
      </div>

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title="Discover Certified Canadian Aviation Editorial Analyses"
        subtitle="Explore our comprehensive technical guides on winter de-icing holdover times, space-based ADS-B radar, and airport transit protocols."
      />
    </div>
  );
};
