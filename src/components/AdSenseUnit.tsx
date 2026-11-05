import React, { useState, useEffect } from 'react';

interface Props {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'in-feed';
  className?: string;
}

export const AdSenseUnit: React.FC<Props> = ({ slotId, className = '' }) => {
  const [countdown, setCountdown] = useState<number>(8);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Normal 1-second countdown from 8 to 0 as requested by user
  useEffect(() => {
    setCountdown(8);
    setIsReady(false);

    // Normal countdown interval: 1000ms (1 second per tick, 8s total)
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

  // HTML content for Adsterra 300x250 banner
  const adsterraHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=300, initial-scale=1.0">
    <meta name="referrer" content="no-referrer-when-downgrade">
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        width: 300px;
        height: 250px;
        background: transparent;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : 'dadc3184f70b3e4ec47ba368b8321549',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://bicea.org/22/dadc3184f70b3e4ec47ba368b8321549"></script>
  </body>
</html>`;

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
                Memuat ({countdown}s)
              </span>
            )}
          </span>
        </div>

        {/* 300x250 Ad Display Box */}
        <div className="relative w-[300px] h-[250px] mx-auto bg-[#F8F8FA] rounded border border-[#E8E5E8] overflow-hidden flex items-center justify-center">
          {/* Normal 8s Countdown Animation */}
          {!isReady && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-[#FDFCFC] to-[#F5F4F7] p-4 text-center">
              {/* Circular Countdown Badge */}
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-[#681C35] shadow-xs mb-3">
                <span className="font-mono text-2xl font-black text-[#681C35]">
                  {countdown}
                </span>
                <div
                  className="absolute inset-0 rounded-full border-2 border-[#8A2948] border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                />
              </div>

              <div className="text-xs font-bold text-[#25232A]">
                Menyiapkan Iklan Sponsor...
              </div>
              <p className="text-[10px] text-[#777780] mt-0.5 font-mono">
                Tampil dalam {countdown} detik
              </p>

              {/* Progress Bar for 8 Seconds */}
              <div className="w-44 h-1.5 bg-[#E8E5E8] rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#681C35] transition-all duration-1000 ease-linear"
                  style={{ width: `${((8 - countdown) / 8) * 100}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setCountdown(0);
                  setIsReady(true);
                }}
                className="mt-3 text-[10px] text-[#681C35] hover:text-[#8A2948] underline font-medium cursor-pointer"
              >
                Lewati &amp; Tampilkan Iklan Sekarang
              </button>
            </div>
          )}

          {/* Adsterra 300x250 Banner Iframe (Unrestricted for Ad Scripts) */}
          {isReady && (
            <iframe
              title={`adsterra-300x250-${slotId || 'ad'}`}
              srcDoc={adsterraHtml}
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
