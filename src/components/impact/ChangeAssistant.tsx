import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import {
  Sparkles,
  Layers,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  ArrowRight,
  Code2,
  HelpCircle,
} from 'lucide-react';

export const ChangeAssistant: React.FC = () => {
  const {
    activeChangePlan,
    setActiveChangePlan,
    generateChangePlanForPrompt,
    selectFileByPath,
    sendChatMessage,
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
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 max-w-5xl mx-auto select-none">
      {/* Top Banner: Feature Change Assistant */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#151f38] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Change & Impact Assistant
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Repository: <span className="text-indigo-300 font-semibold">{repo.name}</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            "What do I need to change to implement this feature?"
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            RepoLens analyzes the repository dependency graph and produces an end-to-end multi-layer change plan covering database models, backend logic, API contracts, frontend views, and regression test suites.
          </p>
        </div>

        {/* Feature Prompt Input Bar */}
        <form onSubmit={handleGenerate} className="mt-5 flex gap-2">
          <input
            type="text"
            placeholder="e.g. 'Add pagination to list endpoints', 'Implement RBAC guards'..."
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={!customGoal.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Plan</span>
          </button>
        </form>

        {/* Quick Sample Goals */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-slate-500">Quick Templates:</span>
          {sampleGoals.map((g, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => generateChangePlanForPrompt(g)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-mono transition-colors border border-slate-700/50"
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {activeChangePlan ? (
        <div className="space-y-6">
          {/* Plan Header Info Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> {activeChangePlan.featureTitle}
              </h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
                  {activeChangePlan.riskLevel} Blast Risk
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> {activeChangePlan.estimatedEffort}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
              {activeChangePlan.architecturalOverview}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-mono text-slate-500">Impacted System Layers:</span>
              {activeChangePlan.impactedLayers.map((layer: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono"
                >
                  {layer}
                </span>
              ))}
            </div>
          </div>

          {/* Actionable Implementation Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Actionable Implementation Steps ({activeChangePlan.steps.length} Steps)
            </h4>

            {activeChangePlan.steps.map((step: any) => (
              <div
                key={step.stepNumber}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center font-mono">
                      {step.stepNumber}
                    </span>
                    <h5 className="font-bold text-slate-100 text-sm">{step.title}</h5>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      {step.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono uppercase font-bold">
                      {step.action}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                  <FileCode className="w-3.5 h-3.5" />
                  <button
                    onClick={() => selectFileByPath(step.targetFile)}
                    className="hover:underline font-semibold"
                  >
                    {step.targetFile}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{step.summary}</p>

                {step.codeSnippet && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300/90 overflow-x-auto">
                    <pre>{step.codeSnippet}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">Generate Architecture Change Plans with AI Copilot</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Type any proposed change or feature request above to receive a full blast radius breakdown and step-by-step implementation guide tailored to {repo.name}.
          </p>
        </div>
      )}
    </div>
  );
};
