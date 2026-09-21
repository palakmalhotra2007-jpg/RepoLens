import React from 'react';

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
    <div className="rounded-xl border border-slate-800 bg-[#090d16] overflow-hidden text-xs font-mono shadow-xl">
      {filename && (
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-slate-300 flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">Target File:</span>
            <span className="font-mono text-indigo-300 font-semibold">{filename}</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Validated by 5 Agents
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        {/* Original Code Column */}
        <div className="p-0 bg-rose-950/10">
          <div className="px-3 py-1.5 bg-rose-950/30 border-b border-rose-900/30 text-rose-400 font-medium flex items-center justify-between">
            <span>{originalLabel}</span>
            <span className="text-[10px] text-rose-500/80">Current Vulnerable / Suboptimal</span>
          </div>
          <div className="p-3 overflow-x-auto space-y-0.5 max-h-72">
            {origLines.map((line, idx) => (
              <div key={idx} className="flex gap-3 text-rose-300/90 bg-rose-500/5 px-2 py-0.5 rounded">
                <span className="text-slate-600 select-none w-5 text-right flex-shrink-0">{idx + 1}</span>
                <span className="text-rose-500 select-none flex-shrink-0">-</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modified / Fixed Code Column */}
        <div className="p-0 bg-emerald-950/10">
          <div className="px-3 py-1.5 bg-emerald-950/30 border-b border-emerald-900/30 text-emerald-400 font-medium flex items-center justify-between">
            <span>{modifiedLabel}</span>
            <span className="text-[10px] text-emerald-500/80">Recommended Patch</span>
          </div>
          <div className="p-3 overflow-x-auto space-y-0.5 max-h-72">
            {modLines.map((line, idx) => (
              <div key={idx} className="flex gap-3 text-emerald-300/90 bg-emerald-500/5 px-2 py-0.5 rounded">
                <span className="text-slate-600 select-none w-5 text-right flex-shrink-0">{idx + 1}</span>
                <span className="text-emerald-500 select-none flex-shrink-0">+</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
