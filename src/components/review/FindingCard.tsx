import React from 'react';
import { ReviewFinding } from '../../types/agents';
import { reviewAgents } from '../../config/agents';
import { SeverityBadge } from '../common/Badge';
import { Button } from '../../frontend';
import { useRepoStore } from '../../store/useRepoStore';
import {
  FileCode,
  CheckCircle2,
  Volume2,
  VolumeX,
  Users2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface FindingCardProps {
  finding: ReviewFinding;
  isSelected?: boolean;
  onSelect: () => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding, isSelected, onSelect }) => {
  const {
    applyFix,
    dismissFinding,
    selectFileByPath,
    setActiveDebateFinding,
    setActiveView,
    speakAgentBriefing,
    stopAudioPlayback,
    voicePlayback,
  } = useRepoStore();

  const primaryAgent = reviewAgents.find((a) => a.id === finding.primaryAgent) || {
    name: 'Specialist Agent',
    avatar: '🤖',
    shortName: 'Agent',
  };

  const isResolved = finding.status === 'resolved';
  const isDismissed = finding.status === 'dismissed';
  const isSpeaking = voicePlayback.isPlaying && voicePlayback.speakingAgentId === finding.primaryAgent;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-[6px] border transition-colors cursor-pointer relative overflow-hidden group text-xs ${
        isResolved
          ? 'bg-bg-surface border-border-default opacity-60'
          : isDismissed
          ? 'bg-bg-surface border-border-default opacity-40'
          : isSelected
          ? 'bg-bg-surface-2 border-accent'
          : 'bg-bg-surface border-border-default hover:bg-bg-surface-2'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={finding.severity} />
          <span className="font-mono text-text-tertiary text-[11px]">{finding.ruleId}</span>
          {finding.cweOrStandard && (
            <span className="hidden sm:inline text-text-tertiary text-[11px] font-mono">
              • {finding.cweOrStandard}
            </span>
          )}
        </div>

        {/* Involved Agent Badge + Voice Briefing Button */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (isSpeaking) {
                stopAudioPlayback();
              } else {
                speakAgentBriefing(finding.audioBriefingScript, finding.primaryAgent);
              }
            }}
            className="text-[11px] font-mono"
            title="Listen to agent audio briefing"
          >
            {isSpeaking ? (
              <VolumeX strokeWidth={1.5} className="w-3.5 h-3.5 text-status-critical" />
            ) : (
              <Volume2 strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
            )}
            <span>{isSpeaking ? 'Stop Audio' : `${primaryAgent.shortName} Briefing`}</span>
          </Button>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-[14px] font-medium text-text-primary mb-1">
        {finding.title}
      </h4>

      {/* File & Line Location */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary mb-2">
        <FileCode strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" />
        <span
          onClick={(e) => {
            e.stopPropagation();
            selectFileByPath(finding.file, finding.lineRange.start);
          }}
          className="hover:underline text-accent"
        >
          {finding.file}:{finding.lineRange.start}-{finding.lineRange.end}
        </span>
        <span className="text-border-strong">•</span>
        <span className="text-text-tertiary">
          Consensus: <span className="text-text-primary font-medium">{finding.confidence}%</span>
        </span>
      </div>

      {/* Evidence Code Box */}
      <div className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default font-mono text-[11px] text-status-critical overflow-x-auto mb-2">
        <code>{finding.evidence}</code>
      </div>

      {/* Suggested Resolution */}
      <p className="text-[13px] text-text-secondary leading-snug mb-3">
        <strong className="text-text-primary font-medium">Suggested Fix: </strong>
        {finding.suggestedResolution}
      </p>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border-default text-xs">
        <div className="flex items-center gap-2">
          {isResolved ? (
            <span className="flex items-center gap-1.5 text-status-good font-medium text-[11px]">
              <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5 text-status-good" /> Patch Applied
            </span>
          ) : isDismissed ? (
            <span className="text-text-tertiary text-[11px]">Dismissed</span>
          ) : (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  applyFix(finding.id);
                }}
              >
                <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
                <span>Apply Fix Diff</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissFinding(finding.id);
                }}
              >
                Dismiss
              </Button>
            </>
          )}
        </div>

        {/* View Full 5-Stage Debate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDebateFinding(finding);
            setActiveView('debate');
          }}
          className="text-text-secondary hover:text-text-primary text-[11px] font-mono flex items-center gap-1 transition-colors"
        >
          <Users2 strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
          <span>View Debate Pipeline</span>
          <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
        </button>
      </div>
    </div>
  );
};
