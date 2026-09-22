import React from 'react';
import { SeverityLevel } from '../../types/agents';
import { Badge } from '../../frontend';

export interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const variant =
    severity === 'critical' ? 'critical' :
    severity === 'high' ? 'warn' :
    severity === 'medium' ? 'warn' :
    severity === 'low' ? 'good' :
    'neutral';

  return (
    <Badge variant={variant} className={className}>
      {severity}
    </Badge>
  );
};

export { Badge };
