import React from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { reviewAgents } from '../../config/agents';
import { SeverityBadge } from '../common/Badge';
import { Button, Badge, Card, CardHeader, CardContent } from '../../frontend';
import {
  Users2,
  Play,
  Square,
  Volume2,
  CheckCircle2,
  FileCode,
  ArrowRight,
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
  } = useRepoStore();

  const finding = activeDebateFinding || reviewFindings[0];

  if (!finding) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary text-xs bg-bg-base">
        No active review findings available for debate.
      </div>
    );
  }

  const primaryAgent = reviewAgents.find((a) => a.id === finding.primaryAgent);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 text-text-primary max-w-6xl mx-auto bg-bg-base select-none">
      {/* Top Header: Debate Title & Multi-Agent Audio Player */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="accent">
                5-Stage Collaboration Pipeline
              </Badge>
              <SeverityBadge severity={finding.severity} />
            </div>
            <h2 className="text-[20px] font-semibold text-text-primary tracking-tight">{finding.title}</h2>
            <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
              <FileCode strokeWidth={1.5} className="w-4 h-4 text-text-tertiary" />
              <button
                onClick={() => selectFileByPath(finding.file, finding.lineRange.start)}
                className="hover:underline text-accent"
              >
                {finding.file}:{finding.lineRange.start}-{finding.lineRange.end}
              </button>
              <span className="text-border-strong">•</span>
              <span className="text-text-tertiary">
                Initiated by: <span className="text-text-primary font-medium">{primaryAgent?.name}</span>
              </span>
            </div>
          </div>

          {/* Audio Debate Action Button */}
          <div className="flex items-center gap-2">
            {voicePlayback.isPlaying ? (
              <Button
                variant="primary"
                onClick={stopAudioPlayback}
                className="gap-2 text-status-critical"
              >
                <Square strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
                <span>Stop Audio Debate</span>
              </Button>
            ) : (
              <Button
                variant="accent"
                onClick={() => playMultiAgentDebate(finding)}
                className="gap-2"
              >
                <Play strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
                <span>Play Audio Debate</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Select Finding Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary mr-1">
          Topic:
        </span>
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
              className={`px-3 py-1 rounded-[4px] border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-bg-surface-2 border-accent text-text-primary font-medium'
                  : 'bg-bg-surface border-border-default text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary'
              }`}
            >
              <span className="truncate max-w-[200px]">{f.title}</span>
            </button>
          );
        })}
      </div>

      {/* 5-Stage Collaboration Pipeline Visual Indicator */}
      <Card className="p-4 space-y-3">
        <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
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

      {/* Main Grid: Debate Timeline & 5-Agent Agreement Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Debate Stage Timeline Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
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
                  className={`p-4 rounded-[6px] border transition-colors space-y-3 bg-bg-surface ${
                    isSpeaking ? 'border-accent' : 'border-border-default'
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Agreement Matrix & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] flex items-center justify-between">
              <span>Consensus Voting Ledger</span>
              <Badge variant="good">
                {finding.agreementMatrix?.filter((v) => v.vote === 'agree').length || 0}/5 Agreed
              </Badge>
            </div>

            <div className="space-y-2">
              {finding.agreementMatrix?.map((item) => (
                <div
                  key={item.agentId}
                  className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text-primary text-xs">{item.agentName}</span>
                    <Badge
                      variant={item.vote === 'agree' ? 'good' : 'critical'}
                      className="text-[10px]"
                    >
                      {item.vote}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-2">{item.reasonSummary}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
