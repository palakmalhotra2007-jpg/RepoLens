import React from 'react';
import { SemanticConflictAlert as SemanticAlertType } from '../../types/merge';
import { useRepoStore } from '../../store/useRepoStore';
import { Button, Badge, Card } from '../../frontend';
import { SeverityBadge } from '../common/Badge';
import { ShieldAlert } from 'lucide-react';

interface SemanticConflictAlertProps {
  alert: SemanticAlertType;
}

export const SemanticConflictAlertCard: React.FC<SemanticConflictAlertProps> = ({ alert }) => {
  const { selectFileByPath, sendChatMessage } = useRepoStore();

  return (
    <Card className="p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <Badge variant="critical">
            Semantic Conflict
          </Badge>
        </div>
        <span className="text-xs font-mono text-text-tertiary">
          Category: <span className="text-text-primary">{alert.category}</span>
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-[15px] font-semibold text-text-primary mb-1">{alert.title}</h3>
        <p className="text-[13px] text-text-secondary leading-relaxed">{alert.description}</p>
      </div>

      {/* Files Involved */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div
          onClick={() => selectFileByPath(alert.fileA)}
          className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default hover:bg-[#262B31] cursor-pointer transition-colors"
        >
          <div className="text-[10px] text-text-tertiary uppercase font-sans mb-1 font-medium">File A (Backend)</div>
          <div className="text-text-primary font-medium truncate">{alert.fileA}</div>
          <div className="mt-2 text-[11px] text-status-critical bg-bg-surface p-2.5 rounded-[4px] border border-border-default overflow-x-auto">
            <pre>{alert.diffA}</pre>
          </div>
        </div>

        <div
          onClick={() => selectFileByPath(alert.fileB)}
          className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default hover:bg-[#262B31] cursor-pointer transition-colors"
        >
          <div className="text-[10px] text-text-tertiary uppercase font-sans mb-1 font-medium">File B (Frontend Context)</div>
          <div className="text-text-primary font-medium truncate">{alert.fileB}</div>
          <div className="mt-2 text-[11px] text-accent bg-bg-surface p-2.5 rounded-[4px] border border-border-default overflow-x-auto">
            <pre>{alert.diffB}</pre>
          </div>
        </div>
      </div>

      {/* Root Cause & Runtime Break Risk */}
      <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default text-xs space-y-1">
        <div className="font-medium flex items-center gap-1.5 font-mono text-[11px] text-status-critical">
          <ShieldAlert strokeWidth={1.5} className="w-3.5 h-3.5 text-status-critical" /> Runtime Break Risk:
        </div>
        <p className="text-[12px] text-text-secondary leading-relaxed">{alert.runtimeBreakRisk}</p>
      </div>

      {/* Recommended Resolution Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-border-default">
        <div className="text-text-secondary text-[13px]">
          <strong className="text-text-primary font-medium">Recommended Fix: </strong>
          {alert.recommendedResolution}
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => sendChatMessage(`How should I resolve semantic conflict: "${alert.title}"?`)}
          className="whitespace-nowrap"
        >
          Ask AI for Resolution Code
        </Button>
      </div>
    </Card>
  );
};
