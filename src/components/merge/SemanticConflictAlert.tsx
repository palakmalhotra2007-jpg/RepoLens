import React from 'react';
import { SemanticConflictAlert as SemanticAlertType } from '../../types/merge';
import { useRepoStore } from '../../store/useRepoStore';
import {
  AlertTriangle,
  Zap,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  Database,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { SeverityBadge } from '../common/Badge';

interface SemanticConflictAlertProps {
  alert: SemanticAlertType;
}

export const SemanticConflictAlertCard: React.FC<SemanticConflictAlertProps> = ({ alert }) => {
  const { selectFileByPath, sendChatMessage } = useRepoStore();

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900/90 border border-rose-500/30 shadow-xl space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-mono font-bold uppercase">
            ⚡ Semantic Conflict (Git Clean Merge Hazard)
          </span>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Category: <span className="text-slate-300">{alert.category}</span>
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-sm font-bold text-white mb-1.5">{alert.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
      </div>

      {/* Files Involved */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div
          onClick={() => selectFileByPath(alert.fileA)}
          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all"
        >
          <div className="text-[10px] text-slate-500 uppercase font-sans mb-1">File A (Backend)</div>
          <div className="text-indigo-300 font-semibold truncate">{alert.fileA}</div>
          <div className="mt-2 text-[11px] text-rose-300/80 bg-rose-950/20 p-2 rounded border border-rose-900/20 overflow-x-auto">
            <pre>{alert.diffA}</pre>
          </div>
        </div>

        <div
          onClick={() => selectFileByPath(alert.fileB)}
          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all"
        >
          <div className="text-[10px] text-slate-500 uppercase font-sans mb-1">File B (Frontend Context)</div>
          <div className="text-cyan-300 font-semibold truncate">{alert.fileB}</div>
          <div className="mt-2 text-[11px] text-cyan-300/80 bg-cyan-950/20 p-2 rounded border border-cyan-900/20 overflow-x-auto">
            <pre>{alert.diffB}</pre>
          </div>
        </div>
      </div>

      {/* Root Cause & Runtime Break Risk */}
      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1 text-rose-200">
        <div className="font-semibold flex items-center gap-1.5 font-mono text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Runtime Break Risk:
        </div>
        <p className="text-[11px] text-rose-300/90 leading-relaxed">{alert.runtimeBreakRisk}</p>
      </div>

      {/* Recommended Resolution Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-400">
          <strong className="text-slate-200">Recommended Fix: </strong>
          {alert.recommendedResolution}
        </div>
        <button
          onClick={() => sendChatMessage(`How should I resolve semantic conflict: "${alert.title}"?`)}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs whitespace-nowrap shadow-md shadow-indigo-600/20 transition-all"
        >
          Ask AI for Resolution Code
        </button>
      </div>
    </div>
  );
};
