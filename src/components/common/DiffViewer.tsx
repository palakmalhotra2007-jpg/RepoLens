import React from 'react';
import { Badge } from '../../frontend';

interface DiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  filename?: string;
  originalLabel?: string;
  modifiedLabel?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  modifiedCode,
  filename,
  originalLabel = 'Original Code',
  modifiedLabel = 'Suggested Fix (AI Verified)',
}) => {
  const origLines = originalCode.trim().split('\n');
  const modLines = modifiedCode.trim().split('\n');

  return (
    <div className="rounded-[6px] border border-border-default bg-bg-surface overflow-hidden text-xs font-mono">
      {filename && (
        <div className="px-4 py-2.5 bg-bg-surface-2 border-b border-border-default text-text-primary flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <span className="text-text-tertiary text-xs">Target File:</span>
            <span className="font-mono text-text-primary font-medium">{filename}</span>
          </div>
          <Badge variant="good">
            Validated by 5 Agents
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-default">
        {/* Original Code Column */}
        <div className="p-0 bg-status-critical/[0.04]">
          <div className="px-3 py-1.5 bg-status-critical/[0.08] border-b border-border-default text-status-critical font-medium flex items-center justify-between">
            <span>{originalLabel}</span>
            <span className="text-[10px] text-text-tertiary font-sans">Current Vulnerable / Suboptimal</span>
          </div>
          <div className="p-3 overflow-x-auto space-y-0.5 max-h-72">
            {origLines.map((line, idx) => (
              <div key={idx} className="flex gap-3 text-status-critical bg-status-critical/[0.06] px-2 py-0.5 rounded-[4px]">
                <span className="text-text-tertiary select-none w-5 text-right flex-shrink-0">{idx + 1}</span>
                <span className="text-status-critical select-none flex-shrink-0">-</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modified / Fixed Code Column */}
        <div className="p-0 bg-status-good/[0.04]">
          <div className="px-3 py-1.5 bg-status-good/[0.08] border-b border-border-default text-status-good font-medium flex items-center justify-between">
            <span>{modifiedLabel}</span>
            <span className="text-[10px] text-text-tertiary font-sans">Recommended Patch</span>
          </div>
          <div className="p-3 overflow-x-auto space-y-0.5 max-h-72">
            {modLines.map((line, idx) => (
              <div key={idx} className="flex gap-3 text-status-good bg-status-good/[0.06] px-2 py-0.5 rounded-[4px]">
                <span className="text-text-tertiary select-none w-5 text-right flex-shrink-0">{idx + 1}</span>
                <span className="text-status-good select-none flex-shrink-0">+</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
