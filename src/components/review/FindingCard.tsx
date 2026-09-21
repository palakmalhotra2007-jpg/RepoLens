import React from 'react';
import { ReviewFinding } from '../../types/agents';
import { reviewAgents } from '../../data/mockReviewAgents';
import { SeverityBadge } from '../common/Badge';
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
      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group text-xs ${
        isResolved
          ? 'bg-[#161b22]/50 border-emerald-900/30 opacity-75'
          : isDismissed
          ? 'bg-[#161b22]/30 border-[#30363d]/40 opacity-50'
          : isSelected
          ? 'bg-[#161b22] border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
          : 'bg-[#161b22] border-[#30363d] hover:border-slate-500'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={finding.severity} />
          <span className="font-mono text-slate-500 text-[11px]">{finding.ruleId}</span>
          {finding.cweOrStandard && (
            <span className="hidden sm:inline text-slate-500 text-[10px] font-mono">
              • {finding.cweOrStandard}
            </span>
          )}
        </div>

        {/* Involved Agent Badge + Voice Briefing Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isSpeaking) {
                stopAudioPlayback();
              } else {
                speakAgentBriefing(finding.audioBriefingScript, finding.primaryAgent);
              }
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-colors ${
              isSpeaking
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                : 'bg-[#0d1117] hover:bg-[#21262d] text-indigo-300 border border-[#30363d]'
            }`}
            title="Listen to agent audio briefing"
          >
            {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-indigo-400" />}
            <span>{isSpeaking ? 'Stop Audio' : `${primaryAgent.shortName} Voice Briefing`}</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-slate-100 text-xs mb-1 group-hover:text-indigo-300 transition-colors">
        {finding.title}
      </h4>

      {/* File & Line Location */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-indigo-400 mb-2">
        <FileCode className="w-3 h-3" />
        <span
          onClick={(e) => {
            e.stopPropagation();
            selectFileByPath(finding.file, finding.lineRange.start);
          }}
          className="hover:underline text-indigo-300"
        >
          {finding.file}:{finding.lineRange.start}-{finding.lineRange.end}
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-400">
          Consensus: <span className="text-emerald-400 font-bold">{finding.confidence}%</span>
        </span>
      </div>

      {/* Evidence Code Box */}
      <div className="p-2 rounded bg-[#0d1117] border border-[#30363d] font-mono text-[11px] text-rose-300/90 overflow-x-auto mb-2">
        <code>{finding.evidence}</code>
      </div>

      {/* Suggested Resolution */}
      <p className="text-slate-400 leading-snug text-[11px] mb-3">
        <strong className="text-slate-300">Suggested Fix: </strong>
        {finding.suggestedResolution}
      </p>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[#30363d] text-xs">
        <div className="flex items-center gap-2">
          {isResolved ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Patch Applied
            </span>
          ) : isDismissed ? (
            <span className="text-slate-500 text-[11px]">Dismissed</span>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  applyFix(finding.id);
                }}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Apply Fix Diff</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissFinding(finding.id);
                }}
                className="px-2 py-1 rounded hover:bg-[#21262d] text-slate-400 hover:text-slate-200 text-[11px]"
              >
                Dismiss
              </button>
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
          className="text-slate-400 hover:text-indigo-300 text-[11px] font-mono flex items-center gap-1"
        >
          <Users2 className="w-3 h-3 text-purple-400" />
          <span>View Debate Pipeline</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
