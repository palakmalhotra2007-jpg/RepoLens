import React from 'react';
import { ReviewFinding } from '../../types/agents';
import { reviewAgents } from '../../config/agents';
import { SeverityBadge } from '../common/Badge';
import { DiffViewer } from '../common/DiffViewer';
import { useRepoStore } from '../../store/useRepoStore';
import {
  X,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Users2,
  Sparkles,
  Bot,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

interface IssueDrawerProps {
  finding: ReviewFinding | null;
  onClose: () => void;
}

export const IssueDrawer: React.FC<IssueDrawerProps> = ({ finding, onClose }) => {
  const { applyFix, selectFileByPath, setRightPanelTab, setIsRightPanelOpen } = useRepoStore();

  if (!finding) return null;

  const isResolved = finding.status === 'resolved';

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl z-40 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="font-mono text-xs text-slate-400">{finding.ruleId}</span>
            {finding.cweOrStandard && (
              <span className="text-xs text-slate-500 font-mono">• {finding.cweOrStandard}</span>
            )}
          </div>
          <h2 className="text-base font-bold text-white leading-snug">{finding.title}</h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* File & Line Location Banner */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-slate-200 text-xs font-semibold">
              {finding.file}:{finding.lineRange.start}-{finding.lineRange.end}
            </span>
          </div>
          <button
            onClick={() => {
              selectFileByPath(finding.file, finding.lineRange.start);
              onClose();
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium text-xs flex items-center gap-1"
          >
            Open in Code Viewer <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Multi-Agent Consensus Verification */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
              <Bot className="w-3.5 h-3.5 text-indigo-400" /> 5-Agent Consensus Matrix
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              {finding.confidence}% Confidence Rating
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {finding.agentsInvolved.map((agentId) => {
              const profile = reviewAgents.find((a) => a.id === agentId);
              if (!profile) return null;
              return (
                <div
                  key={agentId}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5"
                >
                  <span className="text-base">{profile.avatar}</span>
                  <div>
                    <div className="font-medium text-slate-200 text-xs">{profile.name}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      ✓ Corroborated finding
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact & Blast Radius Summary */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-200 text-xs">Architectural Impact</h4>
          <p className="text-slate-300 leading-relaxed">{finding.impactSummary}</p>
        </div>

        {/* Side-by-Side Diff Fix Preview */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-200 text-xs">Automated Patch Preview</h4>
          <DiffViewer
            originalCode={finding.originalCodeSnippet}
            modifiedCode={finding.fixedCodeSnippet}
            filename={finding.file}
          />
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
        <button
          onClick={() => {
            setRightPanelTab('debate');
            setIsRightPanelOpen(true);
            onClose();
          }}
          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
        >
          <span>View Inter-Agent Debate</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-2">
          {isResolved ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Patch Applied Successfully
            </div>
          ) : (
            <button
              onClick={() => {
                applyFix(finding.id);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply Fix Diff</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
