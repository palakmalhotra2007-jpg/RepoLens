import React from 'react';
import { ReviewFinding } from '../../types/agents';
import { reviewAgents } from '../../config/agents';
import { SeverityBadge } from '../common/Badge';
import { DiffViewer } from '../common/DiffViewer';
import { Button, Badge } from '../../frontend';
import { useRepoStore } from '../../store/useRepoStore';
import {
  X,
  FileCode,
  CheckCircle2,
  Sparkles,
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
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-bg-surface border-l border-border-default shadow-[0_4px_12px_rgba(0,0,0,0.4)] z-40 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-border-default bg-bg-surface flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="font-mono text-xs text-text-tertiary">{finding.ruleId}</span>
            {finding.cweOrStandard && (
              <span className="text-xs text-text-tertiary font-mono">• {finding.cweOrStandard}</span>
            )}
          </div>
          <h2 className="text-[15px] font-semibold text-text-primary leading-snug">{finding.title}</h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-[6px] hover:bg-bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X strokeWidth={1.5} className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* File & Line Location Banner */}
        <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
            <span className="font-mono text-text-primary text-xs font-medium">
              {finding.file}:{finding.lineRange.start}-{finding.lineRange.end}
            </span>
          </div>
          <button
            onClick={() => {
              selectFileByPath(finding.file, finding.lineRange.start);
              onClose();
            }}
            className="text-accent hover:underline text-xs flex items-center gap-1 font-medium"
          >
            Open in Code Viewer <ExternalLink strokeWidth={1.5} className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-Agent Consensus Verification */}
        <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
              Ensemble Consensus Matrix
            </span>
            <Badge variant="good">
              {finding.confidence}% Confidence
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {finding.agentsInvolved.map((agentId) => {
              const profile = reviewAgents.find((a) => a.id === agentId);
              if (!profile) return null;
              return (
                <div
                  key={agentId}
                  className="p-3 rounded-[6px] bg-bg-surface border border-border-default flex items-center justify-between"
                >
                  <div className="text-xs text-text-primary font-medium">{profile.name}</div>
                  <Badge variant="good" className="text-[10px]">
                    Verified
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact & Blast Radius Summary */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Architectural Impact</h4>
          <p className="text-[13px] text-text-secondary leading-relaxed">{finding.impactSummary}</p>
        </div>

        {/* Side-by-Side Diff Fix Preview */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Automated Patch Preview</h4>
          <DiffViewer
            originalCode={finding.originalCodeSnippet}
            modifiedCode={finding.fixedCodeSnippet}
            filename={finding.file}
          />
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-border-default bg-bg-surface flex items-center justify-between">
        <button
          onClick={() => {
            setRightPanelTab('debate');
            setIsRightPanelOpen(true);
            onClose();
          }}
          className="text-text-secondary hover:text-text-primary text-xs flex items-center gap-1 transition-colors"
        >
          <span>View Inter-Agent Debate</span>
          <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
        </button>

        <div className="flex items-center gap-2">
          {isResolved ? (
            <Badge variant="good" className="gap-1.5 px-3 py-1">
              <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" /> Patch Applied Successfully
            </Badge>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                applyFix(finding.id);
              }}
            >
              <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
              <span>Apply Fix Diff</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
