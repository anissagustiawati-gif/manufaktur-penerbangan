import React from 'react';
import { FlightStatus } from '../types/aviation';

interface Props {
  status: FlightStatus;
  delayMinutes?: number;
  className?: string;
}

export const FlightStatusBadge: React.FC<Props> = ({ status, delayMinutes = 0, className = '' }) => {
  switch (status) {
    case 'Active':
    case 'En Route':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
          <span>{status === 'En Route' ? 'En Route' : 'Active'}</span>
        </span>
      );
    case 'Delayed':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" aria-hidden="true" />
          <span>Delayed {delayMinutes > 0 ? `(+${delayMinutes}m)` : ''}</span>
        </span>
      );
    case 'Cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" aria-hidden="true" />
          <span>Cancelled</span>
        </span>
      );
    case 'Diverted':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600" aria-hidden="true" />
          <span>Diverted</span>
        </span>
      );
    case 'Landed':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" aria-hidden="true" />
          <span>Landed</span>
        </span>
      );
    case 'Scheduled':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" />
          <span>Scheduled</span>
        </span>
      );
  }
};
