import React from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { reviewAgents } from '../../config/agents';
import { SeverityBadge } from '../common/Badge';
import {
  Users2,
  Play,
  Square,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Bot,
  HelpCircle,
} from 'lucide-react';

export const AgentDebateView: React.FC = () => {
  const {
    reviewFindings,
    activeDebateFinding,
    setActiveDebateFinding,
    activeDebateStageIndex,
    setActiveDebateStageIndex,
    playMultiAgentDebate,
    stopAudioPlayback,
    voicePlayback,
    selectFileByPath,
    setActiveView,
  } = useRepoStore();

  const finding = activeDebateFinding || reviewFindings[0];

  if (!finding) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
        No active review findings available for debate.
      </div>
    );
  }

  const primaryAgent = reviewAgents.find((a) => a.id === finding.primaryAgent);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 max-w-6xl mx-auto">
      {/* Top Header: Debate Title & Multi-Agent Audio Player */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-mono font-medium flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5" /> 5-Stage Agent Collaboration Pipeline
            </span>
            <SeverityBadge severity={finding.severity} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{finding.title}</h2>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <FileCode className="w-3.5 h-3.5" />
            <button
              onClick={() => selectFileByPath(finding.file, finding.lineRange.start)}
              className="hover:underline text-indigo-300"
            >
              {finding.file}:{finding.lineRange.start}-{finding.lineRange.end}
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              Initiated by: <span className="text-slate-200 font-semibold">{primaryAgent?.name}</span>
            </span>
          </div>
        </div>

        {/* Audio Debate Action Button */}
        <div className="flex items-center gap-2">
          {voicePlayback.isPlaying ? (
            <button
              onClick={stopAudioPlayback}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Audio Debate</span>
            </button>
          ) : (
            <button
              onClick={() => playMultiAgentDebate(finding)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Multi-Agent Audio Debate</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Finding Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
        <span className="text-slate-500 text-[11px] uppercase mr-1">Select Finding:</span>
        {reviewFindings.map((f) => {
          const isSelected = f.id === finding.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                stopAudioPlayback();
                setActiveDebateFinding(f);
                setActiveDebateStageIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                  : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:text-slate-200 hover:bg-[#21262d]'
              }`}
            >
              <span className="text-xs">{reviewAgents.find(a => a.id === f.primaryAgent)?.avatar}</span>
              <span className="truncate max-w-[200px]">{f.title}</span>
            </button>
          );
        })}
      </div>

      {/* 5-Stage Collaboration Pipeline Visual Indicator */}
      <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          Collaboration Progression Pipeline
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
          {[
            { num: 1, label: 'Independent Analysis', desc: 'Primary static flag' },
            { num: 2, label: 'Cross-Agent Challenge', desc: 'Boundary & false positive test' },
            { num: 3, label: 'Debate & Rebuttal', desc: 'Architecture defense' },
            { num: 4, label: 'Verification', desc: 'AST & branch trace' },
            { num: 5, label: 'Consensus Ruling', desc: 'Synthesized fix diff' },
          ].map((step, idx) => {
            const isCurrent = activeDebateStageIndex === idx;
            const isCompleted = activeDebateStageIndex > idx;
            return (
              <div
                key={step.num}
                onClick={() => setActiveDebateStageIndex(idx)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                    : isCompleted
                    ? 'bg-[#0d1117] border-emerald-500/40 text-emerald-300'
                    : 'bg-[#0d1117] border-[#30363d] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 font-bold">STAGE {step.num}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  ) : null}
                </div>
                <div className="font-semibold truncate text-[11px]">{step.label}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Debate Timeline & 5-Agent Agreement Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Debate Stage Timeline Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Debate Arguments & Evidence Log ({finding.debateStages?.length || 0} Stages)
          </div>

          <div className="space-y-3">
            {finding.debateStages?.map((stage, idx) => {
              const agent = reviewAgents.find((a) => a.id === stage.agentId) || {
                name: stage.agentName,
                avatar: '🤖',
                color: '#6366f1',
                role: 'Specialized Agent',
              };
              const isSpeaking = voicePlayback.isPlaying && voicePlayback.speakingAgentId === stage.agentId;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isSpeaking
                      ? 'bg-indigo-950/20 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500'
                      : 'bg-[#161b22] border-[#30363d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{agent.avatar}</span>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <span>{stage.agentName}</span>
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-mono uppercase font-semibold ${
                              stage.stance === 'flagged'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : stage.stance === 'disagree_challenge'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : stage.stance === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}
                          >
                            {stage.stageTitle}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {agent.role}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">{stage.timestamp}</span>
                  </div>

                  {/* Argument Content */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans pl-8">
                    {stage.argumentText}
                  </p>

                  {/* Evidence Code Box */}
                  {stage.evidenceCode && (
                    <div className="ml-8 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] font-mono text-[11px] text-rose-300/90 overflow-x-auto">
                      <div className="text-[10px] text-slate-500 uppercase font-sans mb-1">
                        AST Evidence Tokens:
                      </div>
                      <code>{stage.evidenceCode}</code>
                    </div>
                  )}

                  {/* Audio Speaking Animation Bar */}
                  {isSpeaking && (
                    <div className="ml-8 pt-1 flex items-center gap-2 text-indigo-400 text-xs font-mono animate-pulse">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span>Speaking argument aloud ({voicePlayback.speakingAgentId})...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5-Agent Agreement & Vote Matrix Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
              <span className="font-semibold text-xs text-white flex items-center gap-1.5 font-mono">
                <Bot className="w-4 h-4 text-indigo-400" /> 5-Agent Voting Matrix
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {finding.confidence}% Consensus
              </span>
            </div>

            <div className="space-y-2">
              {finding.agreementMatrix?.map((item) => {
                const agent = reviewAgents.find((a) => a.id === item.agentId);
                return (
                  <div
                    key={item.agentId}
                    className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{agent?.avatar}</span>
                        <span className="font-semibold text-slate-200 text-xs">{agent?.shortName}</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                          item.vote === 'agree'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : item.vote === 'disagree'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.vote}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{item.reasonSummary}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action to View Patch */}
          <button
            onClick={() => setActiveView('review')}
            className="w-full py-2.5 px-4 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Inspect Verified Fix Diff in Review Panel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
