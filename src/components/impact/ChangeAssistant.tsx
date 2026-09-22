import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { Button, Badge, Card } from '../../frontend';
import {
  Sparkles,
  Layers,
  FileCode,
  Clock,
} from 'lucide-react';

export const ChangeAssistant: React.FC = () => {
  const {
    activeChangePlan,
    generateChangePlanForPrompt,
    selectFileByPath,
    repo,
  } = useRepoStore();

  const [customGoal, setCustomGoal] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    generateChangePlanForPrompt(customGoal);
    setCustomGoal('');
  };

  const sampleGoals = [
    `Refactor architecture and modularity in ${repo.name}`,
    'Implement authentication and RBAC guards',
    'Add comprehensive automated test suites',
    'Optimize database queries and async bottlenecks',
    'Extract reusable components and reduce duplication',
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 text-text-primary w-full select-none bg-bg-base">
      {/* Top Banner: Feature Change Assistant */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <Badge variant="accent">
              AI Change & Impact Assistant
            </Badge>
            <span className="text-xs text-text-tertiary font-mono">
              Repository: <span className="text-text-primary font-medium">{repo.name}</span>
            </span>
          </div>
          <h2 className="text-[20px] font-semibold text-text-primary tracking-tight">
            "What do I need to change to implement this feature?"
          </h2>
          <p className="text-[13px] text-text-secondary leading-relaxed font-normal">
            RepoLens analyzes the repository dependency graph and produces an end-to-end multi-layer change plan covering database models, backend logic, API contracts, frontend views, and regression test suites.
          </p>
        </div>

        {/* Feature Prompt Input Bar */}
        <form onSubmit={handleGenerate} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 'Add pagination to list endpoints', 'Implement RBAC guards'..."
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            className="flex-1 bg-bg-surface-2 border border-border-default rounded-[6px] px-3.5 py-2 text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-border-strong font-sans"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!customGoal.trim()}
            className="gap-2"
          >
            <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>Generate Plan</span>
          </Button>
        </form>

        {/* Quick Sample Goals */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-text-tertiary">Templates:</span>
          {sampleGoals.map((g, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => generateChangePlanForPrompt(g)}
              className="px-2.5 py-1 rounded-[4px] bg-bg-surface-2 hover:bg-[#262B31] text-text-secondary hover:text-text-primary text-[11px] font-mono transition-colors border border-border-default"
            >
              {g}
            </button>
          ))}
        </div>
      </Card>

      {activeChangePlan ? (
        <div className="space-y-6">
          {/* Plan Header Info Card */}
          <Card className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
                <Layers strokeWidth={1.5} className="w-4 h-4 text-text-secondary" /> {activeChangePlan.featureTitle}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant={activeChangePlan.riskLevel === 'HIGH' ? 'critical' : activeChangePlan.riskLevel === 'MEDIUM' ? 'warn' : 'good'}>
                  {activeChangePlan.riskLevel} Blast Risk
                </Badge>
                <span className="text-xs text-text-tertiary font-mono flex items-center gap-1">
                  <Clock strokeWidth={1.5} className="w-3.5 h-3.5" /> {activeChangePlan.estimatedEffort}
                </span>
              </div>
            </div>

            <p className="text-[13px] text-text-secondary leading-relaxed bg-bg-surface-2 p-3.5 rounded-[6px] border border-border-default">
              {activeChangePlan.architecturalOverview}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] uppercase font-medium text-text-tertiary tracking-[0.04em]">
                Impacted Layers:
              </span>
              {activeChangePlan.impactedLayers.map((layer: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-[4px] bg-bg-surface-2 text-text-secondary border border-border-default text-[10px] font-mono"
                >
                  {layer}
                </span>
              ))}
            </div>
          </Card>

          {/* Actionable Implementation Steps */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
              Actionable Implementation Steps ({activeChangePlan.steps.length} Steps)
            </h4>

            {activeChangePlan.steps.map((step: any) => (
              <Card
                key={step.stepNumber}
                className="p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-[4px] bg-bg-surface-2 border border-border-default text-text-primary font-medium text-xs flex items-center justify-center font-mono">
                      {step.stepNumber}
                    </span>
                    <h5 className="font-semibold text-text-primary text-[14px]">{step.title}</h5>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[4px] bg-bg-surface-2 text-text-secondary text-[10px] font-mono border border-border-default">
                      {step.category}
                    </span>
                    <Badge variant="accent">
                      {step.action}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-accent">
                  <FileCode strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <button
                    onClick={() => selectFileByPath(step.targetFile)}
                    className="hover:underline font-medium"
                  >
                    {step.targetFile}
                  </button>
                </div>

                <p className="text-[13px] text-text-secondary leading-relaxed">{step.summary}</p>

                {step.codeSnippet && (
                  <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default font-mono text-xs text-text-primary overflow-x-auto">
                    <pre>{step.codeSnippet}</pre>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center space-y-3">
          <Sparkles strokeWidth={1.5} className="w-8 h-8 mx-auto text-text-tertiary" />
          <h4 className="text-[15px] font-semibold text-text-primary">Generate Architecture Change Plans with AI Copilot</h4>
          <p className="text-[13px] text-text-secondary max-w-md mx-auto">
            Type any proposed change or feature request above to receive a full blast radius breakdown and step-by-step implementation guide tailored to {repo.name}.
          </p>
        </Card>
      )}
    </div>
  );
};
