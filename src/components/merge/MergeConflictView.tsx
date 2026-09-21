import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { MergeConflictBlock } from '../../types/merge';
import { SemanticConflictAlertCard } from './SemanticConflictAlert';
import { GitHistoryView } from '../git/GitHistoryView';
import {
  GitMerge,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileCode,
  Layers,
  HelpCircle,
  History,
} from 'lucide-react';

export const MergeConflictView: React.FC = () => {
  const {
    branchComparison,
    selectedConflict,
    setSelectedConflict,
    resolveConflictBlock,
    selectFileByPath,
  } = useRepoStore();

  const [activeTab, setActiveTab] = useState<'3way' | 'semantic' | 'history'>('3way');

  const unresolvedCount = branchComparison.conflicts.filter(
    (c) => c.resolutionStatus === 'unresolved'
  ).length;

  const currentConflict = selectedConflict || branchComparison.conflicts[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 max-w-7xl mx-auto text-xs">
      {/* Top Banner: Branch Comparison Info */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-mono font-medium flex items-center gap-1.5">
                <GitMerge className="w-3.5 h-3.5" /> 3-Way Merge Intelligence & Branch Drift
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {branchComparison.currentBranch} ➔ {branchComparison.targetBranch}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Merge Conflict Resolution & Semantic Drift Analysis
            </h2>
            <p className="text-xs text-slate-300">
              Comparing branches with 3-way ancestor alignment, automated AST semantic safety checks, and commit lineage.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-center">
              <div className="text-[10px] uppercase text-slate-400">Conflicts</div>
              <div className="text-sm font-bold text-rose-400">{unresolvedCount}</div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-center">
              <div className="text-[10px] uppercase text-slate-400">Semantic Breaks</div>
              <div className="text-sm font-bold text-amber-400">{branchComparison.semanticAlerts.length}</div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-4 pt-3 border-t border-[#30363d] flex gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('3way')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === '3way'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border border-[#30363d]'
            }`}
          >
            3-Way Conflict Resolver ({branchComparison.conflicts.length})
          </button>
          <button
            onClick={() => setActiveTab('semantic')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'semantic'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border border-[#30363d]'
            }`}
          >
            Semantic Drift Hazards ({branchComparison.semanticAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border border-[#30363d]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Git History & PR Simulator</span>
          </button>
        </div>
      </div>

      {activeTab === 'history' && <GitHistoryView />}

      {activeTab === '3way' && currentConflict && (
        <div className="space-y-6">
          {/* Conflict Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {branchComparison.conflicts.map((conf) => {
              const isSelected = currentConflict.id === conf.id;
              const isResolved = conf.resolutionStatus !== 'unresolved';
              return (
                <button
                  key={conf.id}
                  onClick={() => setSelectedConflict(conf)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md'
                      : isResolved
                      ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold">{conf.file}</span>
                  <span className="text-[10px] text-slate-500">L{conf.lineStart}</span>
                  {isResolved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ml-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Context: Why It Happened */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" /> Why This Conflict Happened
              </h3>
              <span className="text-xs font-mono text-slate-400">
                File: <span className="text-indigo-300 font-semibold">{currentConflict.file}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{currentConflict.reason}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-sans">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">
                  1. Common Ancestor (Base v2.3)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentConflict.whyItHappened.baseContext}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/30">
                <div className="text-[10px] font-mono uppercase text-indigo-400 mb-1">
                  2. Ours Intent (feat/stripe-elements-v3)
                </div>
                <p className="text-indigo-200 text-[11px] leading-relaxed">
                  {currentConflict.whyItHappened.oursIntent}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/30">
                <div className="text-[10px] font-mono uppercase text-cyan-400 mb-1">
                  3. Theirs Intent (main / fix/checkout-idempotency)
                </div>
                <p className="text-cyan-200 text-[11px] leading-relaxed">
                  {currentConflict.whyItHappened.theirsIntent}
                </p>
              </div>
            </div>
          </div>

          {/* 3-Way Split Code Viewer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
            {/* Column 1: Base (Ancestor) */}
            <div className="rounded-xl border border-slate-800 bg-[#090d16] overflow-hidden flex flex-col">
              <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold flex items-center justify-between font-sans">
                <span>Base (Common Ancestor)</span>
                <span className="text-[10px] font-mono text-slate-500">v2.3 commit</span>
              </div>
              <div className="p-3.5 overflow-x-auto flex-1 text-slate-400 bg-slate-950/40">
                <pre>{currentConflict.baseCode}</pre>
              </div>
            </div>

            {/* Column 2: Ours (Current Branch) */}
            <div className="rounded-xl border border-indigo-500/40 bg-[#090d16] overflow-hidden flex flex-col shadow-lg shadow-indigo-500/5">
              <div className="px-3.5 py-2 bg-indigo-950/40 border-b border-indigo-900/40 text-indigo-300 font-semibold flex items-center justify-between font-sans">
                <span>Ours (feat/stripe-elements-v3)</span>
                <button
                  onClick={() => resolveConflictBlock(currentConflict.id, 'ours')}
                  className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-sans font-medium"
                >
                  Accept Ours
                </button>
              </div>
              <div className="p-3.5 overflow-x-auto flex-1 text-indigo-200 bg-indigo-950/10">
                <pre>{currentConflict.oursCode}</pre>
              </div>
            </div>

            {/* Column 3: Theirs (Incoming Branch) */}
            <div className="rounded-xl border border-cyan-500/40 bg-[#090d16] overflow-hidden flex flex-col shadow-lg shadow-cyan-500/5">
              <div className="px-3.5 py-2 bg-cyan-950/40 border-b border-cyan-900/40 text-cyan-300 font-semibold flex items-center justify-between font-sans">
                <span>Theirs (Incoming from main)</span>
                <button
                  onClick={() => resolveConflictBlock(currentConflict.id, 'theirs')}
                  className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-sans font-medium"
                >
                  Accept Theirs
                </button>
              </div>
              <div className="p-3.5 overflow-x-auto flex-1 text-cyan-200 bg-cyan-950/10">
                <pre>{currentConflict.theirsCode}</pre>
              </div>
            </div>
          </div>

          {/* AI Smart Merge Suggested Resolution Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-900 border border-indigo-500/40 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">✨ AI Smart Merge Resolution</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  Synthesizes Both Intelligently
                </span>
              </div>

              <button
                onClick={() => resolveConflictBlock(currentConflict.id, 'ai')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all w-max"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {currentConflict.resolutionStatus === 'resolved_ai'
                    ? '✓ AI Smart Merge Applied'
                    : 'Apply AI Smart Merge Solution'}
                </span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300/95 overflow-x-auto">
              <pre>{currentConflict.aiSuggestedCode}</pre>
            </div>

            {currentConflict.resolutionStatus !== 'unresolved' && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Conflict resolved ({currentConflict.resolutionStatus})</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Semantic Conflicts */}
      {activeTab === 'semantic' && (
        <div className="space-y-4">
          {branchComparison.semanticAlerts.map((alert) => (
            <SemanticConflictAlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
};
