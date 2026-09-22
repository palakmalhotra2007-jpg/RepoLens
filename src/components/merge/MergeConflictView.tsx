import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  FolderGit2,
  FilePlus,
  FileMinus,
  FileEdit,
  Package,
  Database,
  Server,
  Zap,
} from 'lucide-react';

export const MergeConflictView: React.FC = () => {
  const {
    comparisonState,
    branchComparison,
    selectedConflict,
    setSelectedConflict,
    compareBranches,
    resetComparison,
    resolveConflictBlock,
    selectFileByPath,
    repo,
  } = useRepoStore();

  const [activeTab, setActiveTab] = useState<'3way' | 'changes' | 'semantic' | 'history'>('3way');
  const [selectedBaseBranch, setSelectedBaseBranch] = useState(repo.defaultBranch);
  const [selectedTargetBranch, setSelectedTargetBranch] = useState(
    repo.branches.length > 1 ? repo.branches[1] : repo.defaultBranch
  );

  // Get available branches from repository
  const availableBranches = repo.branches || [repo.defaultBranch];
  const hasMultipleBranches = availableBranches.length > 1;

  // Update selected branches when repository changes
  useEffect(() => {
    setSelectedBaseBranch(repo.defaultBranch);
    setSelectedTargetBranch(
      repo.branches.length > 1 ? repo.branches[1] : repo.defaultBranch
    );
  }, [repo.id, repo.defaultBranch, repo.branches]);

  // 1. NO COMPARISON AVAILABLE STATE
  if (comparisonState === 'no_comparison') {
    return (
      <div className="flex-1 overflow-y-auto p-6 text-slate-100 max-w-4xl mx-auto text-xs space-y-6 select-none">
        <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] space-y-5 text-center shadow-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px]">
            <GitMerge className="w-3.5 h-3.5" />
            <span>3-Way Version & Branch Comparison</span>
          </div>

          <div className="space-y-1.5 max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-white tracking-tight">
              No comparison available.
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Select two branches or provide an updated version to compare `BASE vs OURS vs THEIRS`, analyze added/deleted/modified files, detect AST collisions, and resolve semantic conflicts.
            </p>
          </div>

          {/* Branch Comparator Selector Form */}
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] max-w-lg mx-auto text-left space-y-3 font-mono">
            {!hasMultipleBranches && (
              <div className="mb-3 p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
                This repository only has one branch ({repo.defaultBranch}). Branch comparison requires at least 2 branches.
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                  Base Branch (Ancestor)
                </label>
                <select
                  value={selectedBaseBranch}
                  onChange={(e) => setSelectedBaseBranch(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  disabled={!hasMultipleBranches}
                >
                  {availableBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                  Compare With (Target / Ours)
                </label>
                <select
                  value={selectedTargetBranch}
                  onChange={(e) => setSelectedTargetBranch(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  disabled={!hasMultipleBranches}
                >
                  {availableBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => compareBranches(selectedBaseBranch, selectedTargetBranch)}
              disabled={!hasMultipleBranches || selectedBaseBranch === selectedTargetBranch}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>
                {!hasMultipleBranches 
                  ? 'Multiple Branches Required'
                  : selectedBaseBranch === selectedTargetBranch
                  ? 'Select Different Branches'
                  : 'Run Branch Comparison Analysis'
                }
              </span>
            </button>
          </div>

          {/* Quick Comparison Presets - Only show if demo repo with preset branches */}
          {repo.isDemo && hasMultipleBranches && availableBranches.length > 2 && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
              <span className="text-slate-500">Quick Test Scenarios:</span>
              {availableBranches.slice(1, 3).map((branch, idx) => (
                <button
                  key={branch}
                  onClick={() => compareBranches(repo.defaultBranch, branch)}
                  className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-[#30363d] transition-all"
                >
                  {idx === 0 ? '⚡' : '✓'} {branch} vs {repo.defaultBranch}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. COMPARING STATE (Loading)
  if (comparisonState === 'comparing') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-100 text-xs space-y-4 select-none">
        <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] text-center space-y-3 max-w-md w-full shadow-xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <h3 className="font-bold text-sm text-white">Comparing 3-Way AST & Lineage...</h3>
          <p className="text-slate-400 text-xs font-mono">
            Analyzing added/deleted files, route parameter drift, Prisma schema models, and semantic collisions.
          </p>
        </div>
      </div>
    );
  }

  // 3. NO CONFLICTS STATE
  if (comparisonState === 'no_conflicts') {
    return (
      <div className="flex-1 overflow-y-auto p-6 text-slate-100 max-w-5xl mx-auto text-xs space-y-6 select-none">
        <div className="p-6 rounded-xl bg-[#161b22] border border-emerald-500/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">No merge conflicts detected.</h2>
            </div>
            <button
              onClick={resetComparison}
              className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-mono transition-all"
            >
              Compare Another Branch
            </button>
          </div>

          <p className="text-slate-300 leading-relaxed text-xs">
            Branch <span className="text-emerald-300 font-mono font-semibold">{branchComparison.currentBranch}</span> merges cleanly into <span className="text-indigo-300 font-mono font-semibold">{branchComparison.targetBranch}</span>. All files, routes, database models, and functions have 0 textual conflicts and 0 semantic drift.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono pt-2">
            <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-slate-500 uppercase block">Added Files</span>
              <span className="text-sm font-bold text-emerald-400">{branchComparison.addedFiles.length} files</span>
            </div>
            <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-slate-500 uppercase block">Modified Files</span>
              <span className="text-sm font-bold text-cyan-400">{branchComparison.modifiedFiles.length} files</span>
            </div>
            <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-slate-500 uppercase block">Changed Functions</span>
              <span className="text-sm font-bold text-indigo-400">{branchComparison.changedFunctions.length}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-slate-500 uppercase block">Conflicts</span>
              <span className="text-sm font-bold text-emerald-400">0</span>
            </div>
          </div>
        </div>

        {/* Change Breakdown for clean merge */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 font-mono">
          <span className="font-semibold text-white text-xs block">
            Clean Changes Summary:
          </span>
          <div className="space-y-1.5">
            {branchComparison.addedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-emerald-400 text-[11px]">
                <FilePlus className="w-3.5 h-3.5" />
                <span>+ {f} (Added)</span>
              </div>
            ))}
            {branchComparison.modifiedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-cyan-300 text-[11px]">
                <FileEdit className="w-3.5 h-3.5" />
                <span>~ {f} (Modified)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. CONFLICTS FOUND STATE (3-Way Split, Structured Q&A, and Change Breakdown)
  const unresolvedCount = branchComparison.conflicts.filter(
    (c) => c.resolutionStatus === 'unresolved'
  ).length;

  const currentConflict = selectedConflict || branchComparison.conflicts[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 max-w-7xl mx-auto text-xs select-none">
      {/* Top Banner: Branch Comparison Info */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-mono font-medium flex items-center gap-1.5">
                <GitMerge className="w-3.5 h-3.5" /> 3-Way Merge Intelligence (BASE vs OURS vs THEIRS)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {branchComparison.currentBranch} ➔ {branchComparison.targetBranch}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Merge Conflict Resolution & Semantic Drift Analysis
            </h2>
            <p className="text-xs text-slate-300">
              Comparing branches with 3-way ancestor alignment, automated AST semantic safety checks, and structured explanations.
            </p>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-2 font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-center">
              <div className="text-[10px] uppercase text-slate-400">Textual Conflicts</div>
              <div className="text-sm font-bold text-rose-400">{unresolvedCount}</div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-center">
              <div className="text-[10px] uppercase text-slate-400">Semantic Breaks</div>
              <div className="text-sm font-bold text-amber-400">{branchComparison.semanticAlerts.length}</div>
            </div>
            <button
              onClick={resetComparison}
              className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-mono transition-all ml-2"
            >
              Reset
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-4 pt-3 border-t border-[#30363d] flex flex-wrap gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('3way')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === '3way'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border border-[#30363d]'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>3-Way Conflict Resolver ({branchComparison.conflicts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('changes')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'changes'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border border-[#30363d]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Version Change Breakdown (Files, APIs, DB)</span>
          </button>

          <button
            onClick={() => setActiveTab('semantic')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'semantic'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border border-[#30363d]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Semantic Drift Hazards ({branchComparison.semanticAlerts.length})</span>
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

      {/* TAB 1: 3-WAY SPLIT CONFLICT RESOLVER WITH STRUCTURED Q&A */}
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
                  <span className="text-[10px] text-slate-500">L{conf.lineStart}-{conf.lineEnd}</span>
                  {isResolved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ml-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* STRUCTURED CONFLICT EXPLANATION (Answers all 6 required questions) */}
          <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <HelpCircle className="w-4 h-4 text-indigo-400" /> Structured Conflict Explanation & Impact
              </h3>
              <span className="text-xs font-mono text-slate-400">
                File: <span className="text-indigo-300 font-semibold">{currentConflict.file}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Question 1: What Conflicted? */}
              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
                <div className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                  1. What Conflicted?
                </div>
                <p className="text-slate-300 text-xs leading-relaxed font-sans">
                  {currentConflict.whatConflicted || currentConflict.title}
                </p>
              </div>

              {/* Question 2: Why Did It Conflict? */}
              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  2. Why Did It Conflict?
                </div>
                <p className="text-slate-300 text-xs leading-relaxed font-sans">
                  {currentConflict.whyItConflicted || currentConflict.reason}
                </p>
              </div>
            </div>

            {/* Question 3: What Did Each Branch Change? (BASE vs OURS vs THEIRS) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                3. What Did Each Branch Change?
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0d1117] border border-slate-700">
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                    BASE (Ancestor v2.3)
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {currentConflict.whatEachBranchChanged?.base || currentConflict.whyItHappened.baseContext}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40">
                  <div className="text-[10px] font-mono uppercase text-indigo-400 font-bold mb-1">
                    OURS ({branchComparison.currentBranch})
                  </div>
                  <p className="text-indigo-200 text-[11px] leading-relaxed">
                    {currentConflict.whatEachBranchChanged?.ours || currentConflict.whyItHappened.oursIntent}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40">
                  <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1">
                    THEIRS ({branchComparison.targetBranch})
                  </div>
                  <p className="text-cyan-200 text-[11px] leading-relaxed">
                    {currentConflict.whatEachBranchChanged?.theirs || currentConflict.whyItHappened.theirsIntent}
                  </p>
                </div>
              </div>
            </div>

            {/* Question 4: Affected Components & Question 5: Semantic Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                  4. Affected Files / Functions / Routes / DB Components:
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentConflict.affectedComponents.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#161b22] text-slate-300 text-[10px] font-mono border border-[#30363d]"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
                <div className="text-[10px] font-mono uppercase text-rose-400 font-bold">
                  5. Semantic Impact:
                </div>
                <p className="text-slate-300 text-xs leading-relaxed font-sans">
                  {currentConflict.semanticImpact || 'High risk of runtime type errors if callers do not pass updated parameters.'}
                </p>
              </div>
            </div>

            {/* Question 6: Resolution Suggestion */}
            <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/30 space-y-1 font-sans">
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 6. Resolution Suggestion:
              </div>
              <p className="text-emerald-200 text-xs leading-relaxed">
                {currentConflict.resolutionSuggestion || 'Synthesize both changes by preserving metadata while adopting idempotency key headers.'}
              </p>
            </div>
          </div>

          {/* 3-Way Split Code Viewer Grid (BASE vs OURS vs THEIRS) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
            {/* Column 1: Base (Ancestor) */}
            <div className="rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden flex flex-col">
              <div className="px-3.5 py-2 bg-[#161b22] border-b border-[#30363d] text-slate-400 font-semibold flex items-center justify-between font-sans">
                <span>BASE (Common Ancestor)</span>
                <span className="text-[10px] font-mono text-slate-500">v2.3</span>
              </div>
              <div className="p-3.5 overflow-x-auto flex-1 text-slate-400 bg-[#090d16]">
                <pre>{currentConflict.baseCode}</pre>
              </div>
            </div>

            {/* Column 2: Ours (Current Branch) */}
            <div className="rounded-xl border border-indigo-500/40 bg-[#0d1117] overflow-hidden flex flex-col shadow-lg shadow-indigo-500/5">
              <div className="px-3.5 py-2 bg-indigo-950/40 border-b border-indigo-900/40 text-indigo-300 font-semibold flex items-center justify-between font-sans">
                <span>OURS ({branchComparison.currentBranch})</span>
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
            <div className="rounded-xl border border-cyan-500/40 bg-[#0d1117] overflow-hidden flex flex-col shadow-lg shadow-cyan-500/5">
              <div className="px-3.5 py-2 bg-cyan-950/40 border-b border-cyan-900/40 text-cyan-300 font-semibold flex items-center justify-between font-sans">
                <span>THEIRS ({branchComparison.targetBranch})</span>
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
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/30 via-[#161b22] to-[#161b22] border border-indigo-500/40 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">✨ Synthesized Resolution Suggestion</h3>
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
                    ? '✓ Solution Applied'
                    : 'Apply Suggested Resolution'}
                </span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-[#30363d] font-mono text-xs text-emerald-300/95 overflow-x-auto">
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

      {/* TAB 2: VERSION CHANGE BREAKDOWN */}
      {activeTab === 'changes' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
            <h3 className="font-bold text-sm text-white font-sans">
              Complete Branch Divergence & Artifact Changes
            </h3>

            {/* Added / Deleted / Modified / Renamed Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <FilePlus className="w-3 h-3" /> Added Files ({branchComparison.addedFiles.length})
                </span>
                <div className="space-y-1">
                  {branchComparison.addedFiles.map((f, i) => (
                    <div key={i} className="text-[11px] text-slate-300 truncate">{f}</div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                  <FileMinus className="w-3 h-3" /> Deleted Files ({branchComparison.deletedFiles.length})
                </span>
                <div className="space-y-1">
                  {branchComparison.deletedFiles.map((f, i) => (
                    <div key={i} className="text-[11px] text-slate-300 truncate">{f}</div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                <span className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
                  <FileEdit className="w-3 h-3" /> Modified Files ({branchComparison.modifiedFiles.length})
                </span>
                <div className="space-y-1">
                  {branchComparison.modifiedFiles.map((f, i) => (
                    <div key={i} className="text-[11px] text-slate-300 truncate">{f}</div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Renamed Files ({branchComparison.renamedFiles.length})
                </span>
                <div className="space-y-1">
                  {branchComparison.renamedFiles.map((f, i) => (
                    <div key={i} className="text-[11px] text-slate-300 truncate">{f}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Changed Functions */}
            <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
              <span className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-400" /> Changed Function AST Signatures
              </span>
              <div className="space-y-1.5">
                {branchComparison.changedFunctions.map((fn, i) => (
                  <div key={i} className="p-2 rounded bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-indigo-300 font-semibold">{fn.name}() in {fn.file}</span>
                    <span className="text-slate-400 text-[11px] font-sans">{fn.impact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Changed APIs & DB Structures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                <span className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-cyan-400" /> Changed API Endpoints
                </span>
                <div className="space-y-1.5">
                  {branchComparison.changedApis.map((api, i) => (
                    <div key={i} className="p-2 rounded bg-[#161b22] border border-[#30363d] text-[11px]">
                      <span className="text-cyan-300 font-bold mr-2">{api.route}</span>
                      <span className="text-slate-400 font-sans block mt-0.5">{api.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                <span className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" /> Changed Database Structures
                </span>
                <div className="space-y-1.5">
                  {branchComparison.changedDatabaseStructures.map((db, i) => (
                    <div key={i} className="p-2 rounded bg-[#161b22] border border-[#30363d] text-[11px]">
                      <span className="text-emerald-300 font-bold mr-2">{db.table}</span>
                      <span className="text-slate-400 font-sans block mt-0.5">{db.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Changed Dependencies */}
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
              <span className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-400" /> Changed Dependencies
              </span>
              <div className="flex flex-wrap gap-2">
                {branchComparison.changedDependencies.map((dep, i) => (
                  <div key={i} className="px-2.5 py-1 rounded bg-[#161b22] border border-[#30363d] text-[11px]">
                    <span className="text-slate-200 font-semibold">{dep.name}</span>: <span className="text-rose-400">{dep.oldVersion}</span> ➔ <span className="text-emerald-400 font-bold">{dep.newVersion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEMANTIC CONFLICTS */}
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
