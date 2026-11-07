import React, { useState, useEffect } from 'react';

interface Props {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'in-feed';
  className?: string;
}

export const AdSenseUnit: React.FC<Props> = ({ slotId, className = '' }) => {
  // Balanced 3-second countdown: neither too fast nor too slow
  const [countdown, setCountdown] = useState<number>(3);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setCountdown(3);
    setIsReady(false);

    // 1-second interval: 3s total
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [slotId]);

  return (
    <div className={`my-6 mx-auto w-full flex flex-col items-center justify-center ${className}`}>
      <div className="w-full max-w-[340px] bg-white border border-[#E8E5E8] rounded-lg p-2.5 shadow-2xs transition-all">
        {/* Header Label */}
        <div className="flex items-center justify-between text-[10px] text-[#777780] mb-2 px-1 border-b border-[#ECEBED] pb-1 uppercase tracking-wider font-mono">
          <span className="font-semibold text-[#681C35]">Sponsor Advertisement</span>
          <span>
            {isReady ? (
              <span className="text-emerald-700 font-bold">● Adsterra Live</span>
            ) : (
              <span className="text-amber-600 font-bold">
                Loading ({countdown}s)
              </span>
            )}
          </span>
        </div>

        {/* 300x250 Ad Display Box */}
        <div className="relative w-[300px] h-[250px] mx-auto bg-[#F8F8FA] rounded border border-[#E8E5E8] overflow-hidden flex items-center justify-center">
          {/* Moderate 4s Countdown Animation */}
          {!isReady && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-[#FDFCFC] to-[#F5F4F7] p-4 text-center">
              {/* Circular Countdown Badge */}
              <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-[#681C35] shadow-xs mb-2.5">
                <span className="font-mono text-xl font-black text-[#681C35]">
                  {countdown}
                </span>
                <div
                  className="absolute inset-0 rounded-full border-2 border-[#8A2948] border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                />
              </div>

              <div className="text-xs font-bold text-[#25232A]">
                Loading Sponsor Placement...
              </div>
              <p className="text-[10px] text-[#777780] mt-0.5 font-mono">
                Ready in {countdown}s
              </p>

              {/* Progress Bar for 3 Seconds */}
              <div className="w-36 h-1.5 bg-[#E8E5E8] rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-[#681C35] transition-all duration-1000 ease-linear"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setCountdown(0);
                  setIsReady(true);
                }}
                className="mt-2.5 text-[10px] text-[#681C35] hover:text-[#8A2948] underline font-medium cursor-pointer"
              >
                Skip countdown &amp; display now
              </button>
            </div>
          )}

          {/* Adsterra 300x250 Banner Iframe served from real static origin */}
          {isReady && (
            <iframe
              title={`adsterra-300x250-${slotId || 'ad'}`}
              src={`/ad-300x250.html?slot=${slotId || 'ad'}`}
              width="300"
              height="250"
              scrolling="no"
              className="w-[300px] h-[250px] border-0 overflow-hidden block"
            />
          )}
        </div>
      </div>
    </div>
  );
};
