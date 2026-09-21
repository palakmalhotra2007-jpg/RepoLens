import React from 'react';
import { SeverityLevel } from '../../types/agents';

export interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '', showIcon = true }) => {
  const config = {
    critical: {
      label: 'CRITICAL',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500',
    },
    high: {
      label: 'HIGH',
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      dot: 'bg-orange-500',
    },
    medium: {
      label: 'MEDIUM',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
    },
    low: {
      label: 'LOW',
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-500',
    },
    info: {
      label: 'INFO',
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      dot: 'bg-purple-500',
    },
  }[severity] || {
    label: severity.toUpperCase(),
    bg: 'bg-slate-700/20 text-slate-400 border-slate-700/40',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wide border ${config.bg} ${className}`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
};
