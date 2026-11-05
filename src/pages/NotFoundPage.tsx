import React from 'react';
import { Plane, Compass, ArrowLeft } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto px-4 py-20 text-center font-sans space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#681C35]/10 text-[#681C35] flex items-center justify-center mx-auto mb-2">
        <Plane className="w-8 h-8 -rotate-45" />
      </div>

      <div className="text-4xl font-black font-mono text-[#681C35]">
        404
      </div>

      <h1 className="text-xl font-bold text-[#25232A]">
        Flight Corridor Off-Track (Page Not Found)
      </h1>

      <p className="text-xs sm:text-sm text-[#777780] max-w-md mx-auto leading-relaxed">
        The requested aviation URL or flight identifier does not exist or has been relocated to an alternate airspace waypoint.
      </p>

      <div className="pt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 bg-[#681C35] hover:bg-[#8A2948] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
        >
          Return to Global Flight Schedules
        </button>
        <button
          onClick={() => onNavigate('/flights')}
          className="px-4 py-2 bg-white border border-[#E8E5E8] hover:border-[#681C35] text-[#25232A] text-xs font-medium rounded transition-colors cursor-pointer"
        >
          Search Timetables
        </button>
      </div>
    </div>
  );
};
