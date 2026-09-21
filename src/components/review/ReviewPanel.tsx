import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { reviewAgents } from '../../data/mockReviewAgents';
import { FindingCard } from './FindingCard';
import { IssueDrawer } from './IssueDrawer';
import { SeverityBadge } from '../common/Badge';
import { AgentId, SeverityLevel, ReviewFinding } from '../../types/agents';
import {
  ShieldAlert,
  Bot,
  Filter,
  CheckCircle2,
  Play,
  Square,
  RefreshCw,
  Sparkles,
  Volume2,
  Users2,
  Layers,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const ReviewPanel: React.FC = () => {
  const {
    reviewFindings,
    orchestrationSummary,
    selectedFinding,
    setSelectedFinding,
    activeDebateFinding,
    setActiveDebateFinding,
    activeDebateStageIndex,
    setActiveDebateStageIndex,
    playMultiAgentDebate,
    stopAudioPlayback,
    voicePlayback,
    agentFilter,
    setAgentFilter,
    severityFilter,
    setSeverityFilter,
    runReview,
    isReviewRunning,
    reviewProgress,
    speakAgentBriefing,
    applyFix,
    selectFileByPath,
  } = useRepoStore();

  const [activeTab, setActiveTab] = useState<'findings' | 'debate' | 'orchestration'>('findings');
  const [drawerFinding, setDrawerFinding] = useState<ReviewFinding | null>(null);

  const filteredFindings = reviewFindings.filter((finding) => {
    if (agentFilter !== 'all' && finding.primaryAgent !== agentFilter && !finding.agentsInvolved.includes(agentFilter)) {
      return false;
    }
    if (severityFilter !== 'all' && finding.severity !== severityFilter) {
      return false;
    }
    return true;
  });

  const resolvedCount = reviewFindings.filter((f) => f.status === 'resolved').length;
  const currentDebateFinding = activeDebateFinding || reviewFindings[0];
  const primaryDebateAgent = reviewAgents.find((a) => a.id === currentDebateFinding?.primaryAgent);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 max-w-7xl mx-auto text-xs">
      {/* Top Banner: Orchestrator Verdict & Re-run Trigger */}
      <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-mono font-medium flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> 5-Agent Central Review Orchestrator
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Status: <span className="text-amber-400 font-bold uppercase">{orchestrationSummary.readinessVerdict.replace(/_/g, ' ')}</span>
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Multi-Agent Engineering Code Review & Live Debate
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            {orchestrationSummary.finalReviewerNotes}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Orchestrator Summary */}
          <button
            onClick={() => speakAgentBriefing(orchestrationSummary.orchestratorAudioSummary, 'orchestrator')}
            className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors font-mono"
            title="Listen to verbal executive summary"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Audio Summary</span>
          </button>

          <button
            onClick={runReview}
            disabled={isReviewRunning}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {isReviewRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning ({reviewProgress.percent}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Re-run Review</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5 Specialized Autonomous Agents Status Grid */}
      <div>
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
          5 Specialized Review Agents & Domain Responsibilities
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {reviewAgents.map((agent) => {
            const isSelected = agentFilter === agent.id;
            const agentIssuesCount = reviewFindings.filter(
              (f) => f.primaryAgent === agent.id && f.status === 'open'
            ).length;

            return (
              <div
                key={agent.id}
                onClick={() => {
                  setAgentFilter(isSelected ? 'all' : agent.id);
                  setActiveTab('findings');
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                    : 'bg-[#161b22] border-[#30363d] hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{agent.avatar}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        agentIssuesCount > 0
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {agentIssuesCount} open
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white leading-snug">{agent.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{agent.role}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-[#30363d] flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-2.5 h-2.5 text-indigo-400" /> Voice Ready
                  </span>
                  <span>{isSelected ? '✓ Filter Active' : 'Filter'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Sub-View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('findings')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'findings'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-[#161b22] text-slate-400 hover:text-slate-200 border border-[#30363d]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Audit Findings & Fixes ({filteredFindings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('debate')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'debate'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-[#161b22] text-slate-400 hover:text-slate-200 border border-[#30363d]'
          }`}
        >
          <Users2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Live 5-Stage Debate Arena</span>
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px]">
            {currentDebateFinding ? currentDebateFinding.title.slice(0, 24) + '...' : 'Active'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orchestration')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'orchestration'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-[#161b22] text-slate-400 hover:text-slate-200 border border-[#30363d]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Orchestration Consensus Report</span>
        </button>
      </div>

      {/* TAB 1: ALL FINDINGS & DIFF FIXES */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 uppercase mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-indigo-400" /> Severity:
              </span>

              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded uppercase transition-all ${
                    severityFilter === sev
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-[#0d1117] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}

              {agentFilter !== 'all' && (
                <button
                  onClick={() => setAgentFilter('all')}
                  className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30"
                >
                  Reset Agent ({agentFilter})
                </button>
              )}
            </div>

            <div className="text-slate-400">
              Showing <span className="text-white font-bold">{filteredFindings.length}</span> issues (
              <span className="text-emerald-400">{resolvedCount} resolved</span>)
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-2.5">
            {filteredFindings.length > 0 ? (
              filteredFindings.map((finding) => (
                <div key={finding.id} className="relative">
                  <FindingCard
                    finding={finding}
                    isSelected={selectedFinding?.id === finding.id}
                    onSelect={() => {
                      setSelectedFinding(finding);
                      setActiveDebateFinding(finding);
                      setDrawerFinding(finding);
                    }}
                  />
                  {/* Inline Quick Trigger to Live Debate */}
                  <div className="absolute right-4 bottom-3 z-10 hidden sm:block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDebateFinding(finding);
                        setActiveTab('debate');
                      }}
                      className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-indigo-600 text-slate-300 hover:text-white border border-[#30363d] text-[11px] font-mono flex items-center gap-1 transition-all"
                    >
                      <Users2 className="w-3 h-3 text-purple-400" />
                      <span>Live Debate & Voting Matrix</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[#161b22] rounded-xl border border-[#30363d] text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <h4 className="font-semibold text-white text-xs">All rules verified clean</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE 5-STAGE DEBATE & CONSENSUS ARENA */}
      {activeTab === 'debate' && currentDebateFinding && (
        <div className="space-y-5">
          {/* Finding Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
            <span className="text-slate-500 text-[11px] uppercase mr-1">Select Issue for Live Debate:</span>
            {reviewFindings.map((f) => {
              const isSelected = f.id === currentDebateFinding.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    stopAudioPlayback();
                    setActiveDebateFinding(f);
                    setSelectedFinding(f);
                    setActiveDebateStageIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold shadow-sm'
                      : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:text-slate-200 hover:bg-[#21262d]'
                  }`}
                >
                  <span className="text-xs">{reviewAgents.find((a) => a.id === f.primaryAgent)?.avatar}</span>
                  <span className="truncate max-w-[190px]">{f.title}</span>
                </button>
              );
            })}
          </div>

          {/* Debate Header with Multi-Agent Audio Player */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-mono font-medium flex items-center gap-1.5">
                  <Users2 className="w-3.5 h-3.5" /> 5-Stage Inter-Agent Cross-Verification Pipeline
                </span>
                <SeverityBadge severity={currentDebateFinding.severity} />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{currentDebateFinding.title}</h3>
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                <FileCode className="w-3.5 h-3.5" />
                <button
                  onClick={() => selectFileByPath(currentDebateFinding.file, currentDebateFinding.lineRange.start)}
                  className="hover:underline text-indigo-300"
                >
                  {currentDebateFinding.file}:{currentDebateFinding.lineRange.start}-{currentDebateFinding.lineRange.end}
                </button>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  Initiated by: <span className="text-slate-200 font-semibold">{primaryDebateAgent?.name}</span>
                </span>
              </div>
            </div>

            {/* Audio Debate Action Button */}
            <div className="flex items-center gap-2">
              {voicePlayback.isPlaying ? (
                <button
                  onClick={stopAudioPlayback}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all font-mono"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Audio Debate</span>
                </button>
              ) : (
                <button
                  onClick={() => playMultiAgentDebate(currentDebateFinding)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all font-mono"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>▶️ Play Multi-Agent Audio Debate</span>
                </button>
              )}
            </div>
          </div>

          {/* 5-Stage Visual Progression Pipeline */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Pipeline Stage Progression</span>
              <span className="text-indigo-400 font-bold">Stage {activeDebateStageIndex + 1} of 5</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
              {[
                { num: 1, label: '1. Independent Analysis', desc: 'Primary static flag' },
                { num: 2, label: '2. Cross-Agent Challenge', desc: 'Boundary & false positive test' },
                { num: 3, label: '3. Debate & Rebuttal', desc: 'Architecture defense' },
                { num: 4, label: '4. Verification', desc: 'AST & branch trace' },
                { num: 5, label: '5. Consensus Ruling', desc: 'Synthesized fix diff' },
              ].map((step, idx) => {
                const isCurrent = activeDebateStageIndex === idx;
                const isCompleted = activeDebateStageIndex > idx;
                return (
                  <div
                    key={step.num}
                    onClick={() => setActiveDebateStageIndex(idx)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold ring-1 ring-indigo-500/30'
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

          {/* Main Grid: Debate Arguments & 5-Agent Agreement Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Debate Timeline Column */}
            <div className="lg:col-span-8 space-y-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Debate Arguments & Evidence Log ({currentDebateFinding.debateStages?.length || 0} Stages)
              </div>

              <div className="space-y-3">
                {currentDebateFinding.debateStages?.map((stage, idx) => {
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
                      className={`p-4 rounded-xl border transition-all space-y-2.5 ${
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
                        <div className="ml-8 p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] font-mono text-[11px] text-rose-300/90 overflow-x-auto">
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

            {/* 5-Agent Agreement & Voting Matrix Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
                  <span className="font-semibold text-xs text-white flex items-center gap-1.5 font-mono">
                    <Bot className="w-4 h-4 text-indigo-400" /> 5-Agent Voting Matrix
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {currentDebateFinding.confidence}% Consensus
                  </span>
                </div>

                <div className="space-y-2">
                  {currentDebateFinding.agreementMatrix?.map((item) => {
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

              {/* Synthesized Fix Diff & Action */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white flex items-center gap-1 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Synthesized Consensus Diff
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Verified by 5 Agents</span>
                </div>

                <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d] font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-36">
                  <pre className="whitespace-pre-wrap">{currentDebateFinding.fixedCodeSnippet}</pre>
                </div>

                <button
                  onClick={() => applyFix(currentDebateFinding.id)}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {currentDebateFinding.status === 'resolved'
                      ? '✓ Patch Diff Applied'
                      : 'Accept Ruling & Apply Fix Diff'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CENTRAL ORCHESTRATION SUMMARY */}
      {activeTab === 'orchestration' && (
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Central Review Orchestration Ledger</h3>
              <p className="text-slate-400 text-xs">
                Cross-agent verification statistics, challenge audits, and repository merge readiness score.
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-bold">
              Health Score: {orchestrationSummary.overallHealthScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
              <span className="text-slate-500 uppercase text-[10px]">Total Issues Flagged</span>
              <span className="text-lg font-bold text-white block">{orchestrationSummary.totalIssuesFound}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
              <span className="text-slate-500 uppercase text-[10px]">Critical Blockers</span>
              <span className="text-lg font-bold text-rose-400 block">{orchestrationSummary.criticalCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
              <span className="text-slate-500 uppercase text-[10px]">Challenges Resolved</span>
              <span className="text-lg font-bold text-emerald-400 block">{orchestrationSummary.challengesResolved}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
              <span className="text-slate-500 uppercase text-[10px]">Cross-Agent Verifications</span>
              <span className="text-lg font-bold text-cyan-400 block">{orchestrationSummary.crossAgentVerifications}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
            <span className="font-semibold text-slate-200 text-xs block font-mono">
              Final Reviewer Synthesized Notes:
            </span>
            <p className="text-slate-300 text-xs leading-relaxed font-sans">
              {orchestrationSummary.finalReviewerNotes}
            </p>
          </div>
        </div>
      )}

      {/* Side Drawer */}
      <IssueDrawer finding={drawerFinding} onClose={() => setDrawerFinding(null)} />
    </div>
  );
};
