import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { sampleChangePlans } from '../../data/mockImpactGraph';
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
} from 'lucide-react';

export const ChangeAssistant: React.FC = () => {
  const {
    activeChangePlan,
    setActiveChangePlan,
    generateChangePlanForPrompt,
    selectFileByPath,
  } = useRepoStore();

  const [customGoal, setCustomGoal] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    generateChangePlanForPrompt(customGoal);
    setCustomGoal('');
  };

  const plan = activeChangePlan || sampleChangePlans[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 max-w-5xl mx-auto">
      {/* Top Banner: Feature Change Assistant */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#151f38] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Change Assistant
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Effort: <span className="text-indigo-300 font-semibold">{plan.estimatedEffort}</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            "What do I need to change to implement this feature?"
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            RepoLens analyzes the full dependency graph and writes an end-to-end multi-layer change plan covering database schemas, backend services, API contracts, frontend UI, and integration tests.
          </p>
        </div>

        {/* Feature Prompt Input Bar */}
        <form onSubmit={handleGenerate} className="mt-5 flex gap-2">
          <input
            type="text"
            placeholder="Ask: 'What do I need to change to add Apple Pay?' or 'Implement RBAC'..."
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Plan</span>
          </button>
        </form>

        {/* Quick Sample Goals */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-slate-500">Quick Templates:</span>
          <button
            onClick={() => setActiveChangePlan(sampleChangePlans[0])}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-mono transition-colors"
          >
            💳 Add Apple Pay & Google Pay
          </button>
          <button
            onClick={() => setActiveChangePlan(sampleChangePlans[1])}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-mono transition-colors"
          >
            🛡️ Role-Based Access Control (RBAC)
          </button>
        </div>
      </div>

      {/* Plan Header Info Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> {plan.featureTitle}
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
              {plan.riskLevel} Blast Risk
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {plan.estimatedEffort}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
          {plan.architecturalOverview}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-mono text-slate-500">Impacted System Layers:</span>
          {plan.impactedLayers.map((layer, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono"
            >
              {layer}
            </span>
          ))}
        </div>
      </div>

      {/* Step-by-Step Implementation Action Plan */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Actionable Implementation Steps ({plan.steps.length} Steps)
        </h4>

        {plan.steps.map((step) => (
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

            {/* Target File link */}
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

            {/* Code Snippet */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300/90 overflow-x-auto">
              <pre>{step.codeSnippet}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* Security & Validation Safeguards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security Box */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 space-y-2">
          <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-rose-400" /> Security Safeguards
          </span>
          <ul className="space-y-1.5 text-[11px] text-rose-200/80">
            {plan.securityConsiderations.map((sec, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-rose-400 select-none">•</span>
                <span>{sec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Validation Box */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 space-y-2">
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Validation & Test Checklist
          </span>
          <ul className="space-y-1.5 text-[11px] text-emerald-200/80">
            {plan.requiredTests.map((t, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-400 select-none">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
