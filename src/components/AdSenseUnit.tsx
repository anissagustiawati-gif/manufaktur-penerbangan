import React, { useEffect, useRef } from 'react';
import { aviationService } from '../services/aviationService';

interface Props {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'in-feed';
  className?: string;
}

const PLACEHOLDER_PUB_ID = 'ca-pub-9920192837461029';

export const AdSenseUnit: React.FC<Props> = ({ slotId, format = 'horizontal', className = '' }) => {
  const pushedRef = useRef(false);
  const settings = aviationService.getSettings();
  const clientId = (settings.adSenseClientId || '').trim();
  const hasRealPublisherId =
    settings.enableAdSense &&
    clientId.startsWith('ca-pub-') &&
    clientId !== PLACEHOLDER_PUB_ID &&
    clientId.length >= 15;

  const resolvedSlot =
    slotId && /^\d+$/.test(slotId)
      ? slotId
      : format === 'rectangle'
        ? settings.adSenseSlotSidebar
        : settings.adSenseSlotTop;

  const hasValidSlot = !!resolvedSlot && /^\d+$/.test(resolvedSlot) && resolvedSlot !== '9876543210' && resolvedSlot !== '1234567890';

  useEffect(() => {
    if (!hasRealPublisherId || !hasValidSlot || pushedRef.current) return;
    try {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      // Ignore AdSense script errors before script loads
    }
  }, [hasRealPublisherId, hasValidSlot]);

  if (!hasRealPublisherId || !hasValidSlot) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={`my-6 mx-auto w-full flex flex-col items-center justify-center ${className}`}
    >
      <span className="text-[10px] text-[#777780] uppercase tracking-wider font-mono mb-1">
        Advertisement
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: format === 'rectangle' ? '250px' : '90px' }}
        data-ad-client={clientId}
        data-ad-slot={resolvedSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
};

