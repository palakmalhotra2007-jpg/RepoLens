import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { reviewAgents } from '../../config/agents';
import { FindingCard } from './FindingCard';
import { IssueDrawer } from './IssueDrawer';
import { SeverityBadge } from '../common/Badge';
import { ReviewFinding } from '../../types/agents';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  TabsList,
  TabsTrigger,
} from '../../frontend';
import {
  ShieldAlert,
  Bot,
  Filter,
  CheckCircle2,
  Play,
  Square,
  RefreshCw,
  Volume2,
  Users2,
  FileCode,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ReviewPanel: React.FC = () => {
  const {
    reviewState,
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
    selectFileByPath,
  } = useRepoStore();

  const [activeTab, setActiveTab] = useState<'findings' | 'debate' | 'orchestration'>('findings');
  const [drawerFinding, setDrawerFinding] = useState<ReviewFinding | null>(null);

  // 1. NOT STARTED STATE
  if (reviewState === 'not_started') {
    return (
      <div className="flex-1 overflow-y-auto p-8 text-text-primary w-full text-xs space-y-8 select-none bg-bg-base">
        {/* Hero Header */}
        <Card className="p-8 space-y-4 text-center">
          <div className="inline-flex">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              MULTI-AGENT CODE REVIEW & DEBATE ENSEMBLE
            </span>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-[20px] font-semibold text-text-primary tracking-tight">
              Autonomous 5-Agent Engineering Review
            </h2>
            <p className="text-[13px] text-text-secondary leading-relaxed font-normal">
              Review is currently not started. Click below to dispatch 5 specialized autonomous agents to perform independent static analysis, inter-agent cross-challenges, live debate, and orchestrator consensus.
            </p>
          </div>

          <div className="pt-2">
            {/* The single Accent-variant button on the page */}
            <Button
              variant="accent"
              size="lg"
              onClick={runReview}
              className="gap-2 px-6"
            >
              <Play strokeWidth={1.5} className="w-4 h-4 fill-current" />
              <span>Run 5-Agent Review</span>
            </Button>
          </div>
        </Card>

        {/* 5 Specialized Agent Domain Scopes */}
        <div className="space-y-4">
          <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
            5 Specialized Autonomous Agents & Domain Scopes
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewAgents.map((agent, idx) => (
              <Card
                key={agent.id}
                className="p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary mb-1">
                    AGENT #{idx + 1}
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-primary">{agent.name}</h3>
                  <p className="text-[13px] text-text-secondary mt-1.5 leading-relaxed font-normal">
                    {agent.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-default space-y-2">
                  <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary block">
                    DOMAIN FOCUS AREAS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.focusAreas.map((fa, fIdx) => (
                      <span
                        key={fIdx}
                        className="px-2 py-0.5 rounded-full bg-bg-surface-2 text-text-secondary text-[11px] border border-border-default"
                      >
                        {fa}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. RUNNING / DEBATING / CONSENSUS STATE (Live Progress)
  if (reviewState === 'running' || reviewState === 'debating' || reviewState === 'consensus') {
    return (
      <div className="flex-1 overflow-y-auto p-8 text-text-primary w-full text-xs space-y-8 flex flex-col justify-center items-center select-none min-h-[500px] bg-bg-base">
        <Card className="w-full max-w-3xl p-8 space-y-6 text-center">
          <div className="w-10 h-10 rounded-[6px] bg-bg-surface-2 border border-border-default flex items-center justify-center mx-auto text-accent">
            <RefreshCw strokeWidth={1.5} className="w-5 h-5 animate-spin" />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
              {reviewState === 'running' && 'Phase 1: Autonomous Domain Scanning'}
              {reviewState === 'debating' && 'Phase 2: Inter-Agent Cross-Debate & Challenge'}
              {reviewState === 'consensus' && 'Phase 3: Central Orchestrator Consensus Synthesis'}
            </div>
            <h2 className="text-[20px] font-semibold text-text-primary">5-Agent Ensemble Review in Progress</h2>
            <p className="text-xs text-text-secondary font-mono">{reviewProgress.label}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 max-w-md mx-auto font-mono">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Overall Progress</span>
              <span className="text-text-primary font-medium">{reviewProgress.percent}%</span>
            </div>
            <div className="w-full h-2 rounded-[4px] bg-bg-surface-2 border border-border-default overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${reviewProgress.percent}%` }}
              />
            </div>
          </div>

          {/* Active Agents Indicator - Generous width, clean responsive layout with no text overflow */}
          <div className="grid grid-cols-5 gap-2 max-w-2xl mx-auto pt-2 text-[11px]">
            {reviewAgents.map((agent) => (
              <div
                key={agent.id}
                className="px-2.5 py-2.5 rounded-[6px] bg-bg-surface-2 border border-border-default flex flex-col items-center justify-center gap-1.5 min-w-0"
              >
                <span className="truncate w-full text-center text-text-primary font-medium">{agent.shortName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // 3. COMPLETED STATE (Full Review Dashboard)
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

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 text-text-primary w-full text-xs select-none bg-bg-base">
      {/* Top Banner: Orchestrator Verdict & Re-run Trigger */}
      <Card className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="neutral">
              5-Agent Central Review Orchestrator
            </Badge>
            <Badge variant="warn">
              {orchestrationSummary.readinessVerdict.replace(/_/g, ' ')}
            </Badge>
          </div>
          <h2 className="text-[20px] font-semibold text-text-primary tracking-tight">
            Multi-Agent Engineering Code Review & Live Debate
          </h2>
          <p className="text-[13px] text-text-secondary leading-relaxed font-normal max-w-3xl">
            {orchestrationSummary.finalReviewerNotes}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Orchestrator Summary */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => speakAgentBriefing(orchestrationSummary.orchestratorAudioSummary, 'orchestrator')}
            title="Listen to verbal executive summary"
          >
            <Volume2 strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
            <span>Audio Summary</span>
          </Button>

          {/* The single Accent button on screen */}
          <Button
            variant="accent"
            size="sm"
            onClick={runReview}
            disabled={isReviewRunning}
          >
            <Play strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
            <span>Re-run Review</span>
          </Button>
        </div>
      </Card>

      {/* 5 Specialized Autonomous Agents Status Grid */}
      <div className="space-y-3">
        <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
          5 Specialized Review Agents & Domain Responsibilities
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {reviewAgents.map((agent, idx) => {
            const isSelected = agentFilter === agent.id;
            const agentIssuesCount = reviewFindings.filter(
              (f) => f.primaryAgent === agent.id && f.status === 'open'
            ).length;

            return (
              <Card
                key={agent.id}
                onClick={() => {
                  setAgentFilter(isSelected ? 'all' : agent.id);
                  setActiveTab('findings');
                }}
                className={`p-4 cursor-pointer transition-colors flex flex-col justify-between space-y-3 ${
                  isSelected ? 'border-accent bg-bg-surface-2' : 'hover:bg-bg-surface-2'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
                      AGENT #{idx + 1}
                    </span>
                    <Badge variant={agentIssuesCount > 0 ? 'critical' : 'good'}>
                      {agentIssuesCount} open
                    </Badge>
                  </div>
                  <h4 className="text-[14px] font-medium text-text-primary leading-snug">{agent.name}</h4>
                  <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 font-normal">{agent.role}</p>
                </div>

                <div className="pt-2 border-t border-border-default flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                  <span>{isSelected ? '✓ Filter Active' : 'Filter'}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sub-View Switcher Tabs (Underline Active Style, No Box Background) */}
      <div>
        <TabsList>
          <TabsTrigger active={activeTab === 'findings'} onClick={() => setActiveTab('findings')}>
            Audit Findings & Fixes ({filteredFindings.length})
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'debate'} onClick={() => setActiveTab('debate')}>
            Live Debate Arena
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'orchestration'} onClick={() => setActiveTab('orchestration')}>
            Orchestration Consensus Report
          </TabsTrigger>
        </TabsList>
      </div>

      {/* TAB 1: ALL FINDINGS & DIFF FIXES */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 rounded-[6px] bg-bg-surface border border-border-default flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary flex items-center gap-1.5">
                <Filter strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" /> Severity:
              </span>

              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-[4px] uppercase font-mono text-[10px] transition-colors ${
                    severityFilter === sev
                      ? 'bg-bg-surface-2 border border-border-strong text-text-primary font-medium'
                      : 'bg-transparent text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  {sev}
                </button>
              ))}

              {agentFilter !== 'all' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAgentFilter('all')}
                  className="text-status-critical"
                >
                  Reset Agent ({agentFilter})
                </Button>
              )}
            </div>

            <div className="text-text-secondary text-xs">
              Showing <span className="text-text-primary font-medium">{filteredFindings.length}</span> issues (
              <span className="text-status-good">{resolvedCount} resolved</span>)
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-3">
            {filteredFindings.length > 0 ? (
              filteredFindings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  isSelected={selectedFinding?.id === finding.id}
                  onSelect={() => {
                    setSelectedFinding(finding);
                    setActiveDebateFinding(finding);
                    setDrawerFinding(finding);
                  }}
                />
              ))
            ) : (
              <Card className="p-8 text-center text-text-secondary space-y-2">
                <CheckCircle2 strokeWidth={1.5} className="w-8 h-8 mx-auto text-status-good mb-2" />
                <h4 className="font-semibold text-text-primary text-xs">All rules verified clean</h4>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE DEBATE ARENA */}
      {activeTab === 'debate' && (
        <div className="space-y-4">
          {currentDebateFinding ? (
            <>
              {/* Finding Selector & Debate Controls Header */}
              <Card className="p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="accent">
                        Live Agent Debate Arena
                      </Badge>
                      <SeverityBadge severity={currentDebateFinding.severity} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-text-primary tracking-tight">
                      {currentDebateFinding.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
                      <FileCode strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" />
                      <button
                        onClick={() => selectFileByPath(currentDebateFinding.file, currentDebateFinding.lineRange.start)}
                        className="hover:underline text-accent"
                      >
                        {currentDebateFinding.file}:{currentDebateFinding.lineRange.start}-{currentDebateFinding.lineRange.end}
                      </button>
                    </div>
                  </div>

                  {/* Audio Controls & Skip to Report */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setActiveTab('orchestration')}
                      title="Skip debate and go to final report"
                    >
                      <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Skip to Report</span>
                    </Button>

                    {voicePlayback.isPlaying ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={stopAudioPlayback}
                        className="text-status-critical"
                      >
                        <Square strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Audio</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => playMultiAgentDebate(currentDebateFinding)}
                      >
                        <Play strokeWidth={1.5} className="w-3.5 h-3.5 fill-current text-text-secondary" />
                        <span>Play Audio Debate</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Finding Switcher (if multiple findings exist) */}
                {reviewFindings.length > 1 && (
                  <div className="pt-3 border-t border-border-default flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="text-text-tertiary text-[11px] uppercase tracking-[0.04em]">Topic:</span>
                    {reviewFindings.slice(0, 5).map((finding, idx) => (
                      <button
                        key={finding.id}
                        onClick={() => {
                          setActiveDebateFinding(finding);
                          setSelectedFinding(finding);
                          setActiveDebateStageIndex(0);
                        }}
                        className={`px-2.5 py-1 rounded-[4px] transition-colors flex items-center gap-1.5 ${
                          currentDebateFinding.id === finding.id
                            ? 'bg-bg-surface-2 border border-accent text-text-primary font-medium'
                            : 'bg-bg-surface-2 border border-border-default text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <span>#{idx + 1}</span>
                        <span className="truncate max-w-[150px]">{finding.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* 5-Stage Debate Pipeline Stepper */}
              <Card className="p-4 space-y-3">
                <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] flex items-center justify-between">
                  <span>5-Stage Cross-Agent Debate Protocol</span>
                  <Badge variant="accent">Stage {activeDebateStageIndex + 1} of 5</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
                  {[
                    { num: 1, label: '1. Analysis', desc: 'Primary flag' },
                    { num: 2, label: '2. Challenge', desc: 'Peer challenge' },
                    { num: 3, label: '3. Rebuttal', desc: 'Evidence defense' },
                    { num: 4, label: '4. Verification', desc: 'AST & call-sites' },
                    { num: 5, label: '5. Consensus', desc: 'Final ruling' },
                  ].map((step, idx) => {
                    const isCurrent = activeDebateStageIndex === idx;
                    const isCompleted = activeDebateStageIndex > idx;
                    return (
                      <div
                        key={step.num}
                        onClick={() => setActiveDebateStageIndex(idx)}
                        className={`p-3 rounded-[6px] border cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-bg-surface-2 border-accent text-text-primary font-medium'
                            : isCompleted
                            ? 'bg-bg-surface-2 border-border-default text-status-good'
                            : 'bg-bg-surface-2 border-border-default text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-text-tertiary font-bold">STAGE {step.num}</span>
                          {isCompleted ? (
                            <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5 text-status-good" />
                          ) : isCurrent ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          ) : null}
                        </div>
                        <div className="font-semibold truncate text-[11px]">{step.label}</div>
                        <div className="text-[10px] text-text-tertiary truncate mt-0.5">{step.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Inter-Agent Agreement Voting Matrix */}
              {currentDebateFinding.agreementMatrix && currentDebateFinding.agreementMatrix.length > 0 && (
                <Card className="p-4 space-y-3 font-mono">
                  <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] flex items-center justify-between">
                    <span>5-Agent Consensus Voting Ledger</span>
                    <Badge variant="good">
                      {currentDebateFinding.agreementMatrix.filter((v) => v.vote === 'agree').length}/5 Agents Agreed
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    {currentDebateFinding.agreementMatrix.map((item) => (
                      <div
                        key={item.agentId}
                        className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary truncate">{item.agentName.split(' ')[0]}</span>
                          <Badge
                            variant={item.vote === 'agree' ? 'good' : 'critical'}
                            className="text-[10px]"
                          >
                            {item.vote}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-text-secondary font-sans line-clamp-2">{item.reasonSummary}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Debate Arguments */}
              <div className="space-y-3">
                <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
                  Live Agent Arguments & Real-Time Discourse ({currentDebateFinding.debateStages?.length || 0} Stages)
                </div>

                {currentDebateFinding.debateStages?.map((stage, idx) => {
                  const agent = reviewAgents.find((a) => a.id === stage.agentId) || {
                    name: stage.agentName,
                    role: 'Specialized Agent',
                  };
                  const isSpeaking = voicePlayback.isPlaying && voicePlayback.speakingAgentId === stage.agentId;

                  return (
                    <Card
                      key={idx}
                      className={`p-4 space-y-2.5 ${
                        isSpeaking ? 'border-accent bg-bg-surface-2' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-xs text-text-primary flex items-center gap-2">
                            <span>{stage.agentName}</span>
                            <Badge
                              variant={
                                stage.stance === 'flagged' ? 'critical' :
                                stage.stance === 'disagree_challenge' ? 'warn' :
                                stage.stance === 'verified' ? 'good' : 'accent'
                              }
                              className="text-[10px]"
                            >
                              {stage.stageTitle}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-text-tertiary font-mono mt-0.5">
                            {agent.role}
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-text-tertiary">{stage.timestamp}</span>
                      </div>

                      <p className="text-[13px] text-text-secondary leading-relaxed">
                        {stage.argumentText}
                      </p>

                      {stage.evidenceCode && (
                        <div className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default font-mono text-[11px] text-status-critical overflow-x-auto">
                          <div className="text-[10px] text-text-tertiary uppercase font-sans mb-1 font-medium">
                            Evidence:
                          </div>
                          <code>{stage.evidenceCode}</code>
                        </div>
                      )}

                      {isSpeaking && (
                        <div className="pt-1 flex items-center gap-2 text-accent text-xs font-mono">
                          <Volume2 strokeWidth={1.5} className="w-4 h-4 text-accent" />
                          <span>Speaking argument in audio synthesis...</span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center text-text-secondary space-y-4">
              <Users2 strokeWidth={1.5} className="w-10 h-10 mx-auto text-text-tertiary" />
              <div className="space-y-1">
                <h3 className="font-semibold text-text-primary text-[15px]">No Active Finding in Debate Arena</h3>
                <p className="text-[13px] text-text-secondary max-w-md mx-auto">
                  Trigger a multi-agent review to dispatch all 5 autonomous agents and view live debate rounds and voting consensus.
                </p>
              </div>
              <Button
                variant="accent"
                onClick={runReview}
                disabled={isReviewRunning}
                className="gap-2"
              >
                <Play strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
                <span>Run 5-Agent Review & Debate</span>
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: CENTRAL ORCHESTRATION SUMMARY */}
      {activeTab === 'orchestration' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">Central Review Orchestration Ledger</h3>
              <p className="text-[13px] text-text-secondary font-normal">
                Cross-agent verification statistics, challenge audits, and repository merge readiness score.
              </p>
            </div>
            <Badge variant="good">
              Health Score: {orchestrationSummary.overallHealthScore}/100
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default">
              <span className="text-text-tertiary uppercase text-[11px] block mb-1">Total Issues</span>
              <span className="text-[24px] font-semibold font-mono tabular-nums text-text-primary block">{orchestrationSummary.totalIssuesFound}</span>
            </div>
            <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default">
              <span className="text-text-tertiary uppercase text-[11px] block mb-1">Critical Blockers</span>
              <span className="text-[24px] font-semibold font-mono tabular-nums text-status-critical block">{orchestrationSummary.criticalCount}</span>
            </div>
            <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default">
              <span className="text-text-tertiary uppercase text-[11px] block mb-1">Challenges Resolved</span>
              <span className="text-[24px] font-semibold font-mono tabular-nums text-status-good block">{orchestrationSummary.challengesResolved}</span>
            </div>
            <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default">
              <span className="text-text-tertiary uppercase text-[11px] block mb-1">Verifications</span>
              <span className="text-[24px] font-semibold font-mono tabular-nums text-text-primary block">{orchestrationSummary.crossAgentVerifications}</span>
            </div>
          </div>

          <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-2">
            <span className="font-medium text-text-primary text-xs block font-mono">
              Final Reviewer Synthesized Notes:
            </span>
            <p className="text-[13px] text-text-secondary leading-relaxed font-sans font-normal">
              {orchestrationSummary.finalReviewerNotes}
            </p>
          </div>
        </Card>
      )}

      {/* Side Drawer */}
      <IssueDrawer finding={drawerFinding} onClose={() => setDrawerFinding(null)} />
    </div>
  );
};
