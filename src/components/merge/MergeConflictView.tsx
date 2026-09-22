import React, { useState, useEffect } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { SemanticConflictAlertCard } from './SemanticConflictAlert';
import { GitHistoryView } from '../git/GitHistoryView';
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
  GitMerge,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  FilePlus,
  FileMinus,
  FileEdit,
  Package,
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
    repo,
  } = useRepoStore();

  const [activeTab, setActiveTab] = useState<'3way' | 'changes' | 'semantic' | 'history'>('3way');
  const [selectedBaseBranch, setSelectedBaseBranch] = useState(repo.defaultBranch);
  const [selectedTargetBranch, setSelectedTargetBranch] = useState(
    repo.branches.length > 1 ? repo.branches[1] : repo.defaultBranch
  );

  const availableBranches = repo.branches || [repo.defaultBranch];
  const hasMultipleBranches = availableBranches.length > 1;

  useEffect(() => {
    setSelectedBaseBranch(repo.defaultBranch);
    setSelectedTargetBranch(
      repo.branches.length > 1 ? repo.branches[1] : repo.defaultBranch
    );
  }, [repo.id, repo.defaultBranch, repo.branches]);

  // 1. NO COMPARISON AVAILABLE STATE
  if (comparisonState === 'no_comparison') {
    return (
      <div className="flex-1 overflow-y-auto p-8 text-text-primary max-w-4xl mx-auto text-xs space-y-8 select-none bg-bg-base">
        <Card className="p-8 space-y-4 text-center">
          <div className="inline-flex">
            <Badge variant="neutral">
              3-Way Version & Branch Comparison
            </Badge>
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-[20px] font-semibold text-text-primary tracking-tight">
              No comparison available.
            </h2>
            <p className="text-[13px] text-text-secondary leading-relaxed font-normal">
              Select two branches or provide an updated version to compare `BASE vs OURS vs THEIRS`, analyze added/deleted/modified files, detect AST collisions, and resolve semantic conflicts.
            </p>
          </div>

          {/* Branch Comparator Selector Form */}
          <div className="p-5 rounded-[6px] bg-bg-surface-2 border border-border-default max-w-lg mx-auto text-left space-y-4 font-mono">
            {!hasMultipleBranches && (
              <div className="p-3 rounded-[4px] bg-[#C99A3C]/12 border border-[#C99A3C]/24 text-status-warn text-xs">
                <AlertTriangle strokeWidth={1.5} className="w-4 h-4 inline mr-1.5" />
                This repository only has one branch ({repo.defaultBranch}). Branch comparison requires at least 2 branches.
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase text-text-tertiary font-medium tracking-[0.04em] block mb-1">
                  Base Branch (Ancestor)
                </label>
                <select
                  value={selectedBaseBranch}
                  onChange={(e) => setSelectedBaseBranch(e.target.value)}
                  className="w-full bg-bg-surface border border-border-default rounded-[6px] px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong font-mono"
                  disabled={!hasMultipleBranches}
                >
                  {availableBranches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase text-text-tertiary font-medium tracking-[0.04em] block mb-1">
                  Compare With (Target / Ours)
                </label>
                <select
                  value={selectedTargetBranch}
                  onChange={(e) => setSelectedTargetBranch(e.target.value)}
                  className="w-full bg-bg-surface border border-border-default rounded-[6px] px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong font-mono"
                  disabled={!hasMultipleBranches}
                >
                  {availableBranches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* The single Accent-variant button on this screen */}
            <Button
              variant="accent"
              onClick={() => compareBranches(selectedBaseBranch, selectedTargetBranch)}
              disabled={!hasMultipleBranches || selectedBaseBranch === selectedTargetBranch}
              className="w-full py-2"
            >
              <GitMerge strokeWidth={1.5} className="w-4 h-4" />
              <span>
                {!hasMultipleBranches 
                  ? 'Multiple Branches Required'
                  : selectedBaseBranch === selectedTargetBranch
                  ? 'Select Different Branches'
                  : 'Run Branch Comparison Analysis'
                }
              </span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 2. COMPARING IN PROGRESS
  if (comparisonState === 'comparing') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-xs text-text-primary space-y-4 bg-bg-base">
        <Card className="p-8 text-center space-y-4 max-w-md w-full">
          <div className="w-10 h-10 rounded-[6px] bg-bg-surface-2 border border-border-default flex items-center justify-center mx-auto text-accent">
            <GitMerge strokeWidth={1.5} className="w-5 h-5 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-text-primary">Comparing Branches</h3>
            <p className="text-[13px] text-text-secondary">
              Analyzing AST divergence, semantic collisions, and 3-way merge blocks...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 3. CLEAN MERGE (NO CONFLICTS)
  if (comparisonState === 'no_conflicts') {
    return (
      <div className="flex-1 overflow-y-auto p-8 text-text-primary max-w-4xl mx-auto text-xs space-y-6 select-none bg-bg-base">
        <Card className="p-6 space-y-4 text-center">
          <CheckCircle2 strokeWidth={1.5} className="w-10 h-10 mx-auto text-status-good" />
          <div className="space-y-1">
            <h2 className="text-[20px] font-semibold text-text-primary tracking-tight">
              Fast-Forward Clean Merge Ready
            </h2>
            <p className="text-[13px] text-text-secondary">
              Branches <span className="font-mono text-text-primary font-medium">{branchComparison.currentBranch}</span> and{' '}
              <span className="font-mono text-text-primary font-medium">{branchComparison.targetBranch}</span> can be automatically merged with zero textual or AST semantic collisions.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto pt-2 font-mono">
            <div className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default">
              <span className="text-[10px] text-text-tertiary uppercase block">Added Files</span>
              <span className="text-sm font-semibold text-text-primary">{branchComparison.addedFiles.length} files</span>
            </div>
            <div className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default">
              <span className="text-[10px] text-text-tertiary uppercase block">Modified Files</span>
              <span className="text-sm font-semibold text-text-primary">{branchComparison.modifiedFiles.length} files</span>
            </div>
            <div className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default">
              <span className="text-[10px] text-text-tertiary uppercase block">Changed Functions</span>
              <span className="text-sm font-semibold text-text-primary">{branchComparison.changedFunctions.length}</span>
            </div>
            <div className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default">
              <span className="text-[10px] text-text-tertiary uppercase block">Conflicts</span>
              <span className="text-sm font-semibold text-status-good">0</span>
            </div>
          </div>
        </Card>

        {/* Change Breakdown */}
        <Card className="p-5 space-y-3 font-mono">
          <span className="font-medium text-text-primary text-xs block">
            Clean Changes Summary:
          </span>
          <div className="space-y-2">
            {branchComparison.addedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-status-good text-[12px]">
                <FilePlus strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>+ {f} (Added)</span>
              </div>
            ))}
            {branchComparison.modifiedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-text-primary text-[12px]">
                <FileEdit strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" />
                <span>~ {f} (Modified)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // 4. CONFLICTS FOUND STATE
  const unresolvedCount = branchComparison.conflicts.filter(
    (c) => c.resolutionStatus === 'unresolved'
  ).length;

  const currentConflict = selectedConflict || branchComparison.conflicts[0];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 text-text-primary w-full text-xs select-none bg-bg-base">
      {/* Top Banner: Branch Comparison Info */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="critical">
                3-Way Merge Intelligence
              </Badge>
              <span className="text-[11px] text-text-tertiary font-mono">
                {branchComparison.currentBranch} ➔ {branchComparison.targetBranch}
              </span>
            </div>
            <h2 className="text-[20px] font-semibold text-text-primary tracking-tight">
              Merge Conflict Resolution & Semantic Drift Analysis
            </h2>
            <p className="text-[13px] text-text-secondary leading-relaxed font-normal">
              Comparing branches with 3-way ancestor alignment, automated AST semantic safety checks, and structured explanations.
            </p>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-2 font-mono">
            <div className="px-3 py-1.5 rounded-[6px] bg-bg-surface-2 border border-border-default text-center">
              <div className="text-[10px] uppercase text-text-tertiary">Textual Conflicts</div>
              <div className="text-sm font-semibold text-status-critical">{unresolvedCount}</div>
            </div>
            <div className="px-3 py-1.5 rounded-[6px] bg-bg-surface-2 border border-border-default text-center">
              <div className="text-[10px] uppercase text-text-tertiary">Semantic Breaks</div>
              <div className="text-sm font-semibold text-status-warn">{branchComparison.semanticAlerts.length}</div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={resetComparison}
              className="ml-2"
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs (Underline Active Style, No Box Background) */}
      <div>
        <TabsList>
          <TabsTrigger active={activeTab === '3way'} onClick={() => setActiveTab('3way')}>
            3-Way Conflict Resolver ({branchComparison.conflicts.length})
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'changes'} onClick={() => setActiveTab('changes')}>
            Version Change Breakdown
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'semantic'} onClick={() => setActiveTab('semantic')}>
            Semantic Drift Hazards ({branchComparison.semanticAlerts.length})
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
            Git History & PR Simulator
          </TabsTrigger>
        </TabsList>
      </div>

      {activeTab === 'history' && <GitHistoryView />}

      {/* TAB 1: 3-WAY SPLIT CONFLICT RESOLVER */}
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
                  className={`px-3 py-1.5 rounded-[4px] border font-mono text-xs transition-colors flex items-center gap-2 ${
                    isSelected
                      ? 'bg-bg-surface-2 border-accent text-text-primary font-medium'
                      : 'bg-bg-surface border-border-default text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{conf.file}:{conf.lineStart}</span>
                  <Badge variant={isResolved ? 'good' : 'critical'} className="text-[10px]">
                    {isResolved ? 'Resolved' : 'Conflict'}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* 6 Structured Questions Card */}
          <Card className="p-5 space-y-4">
            <h3 className="text-[15px] font-semibold text-text-primary">
              Structured Conflict Diagnosis ({currentConflict.file}:{currentConflict.lineStart}-{currentConflict.lineEnd})
            </h3>

            {/* Questions 1-3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-1">
                <div className="text-[11px] uppercase text-text-tertiary font-medium">1. Base Code (Ancestor):</div>
                <p className="text-text-secondary text-[12px] font-sans">{currentConflict.whyItHappened?.baseContext}</p>
              </div>

              <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-1">
                <div className="text-[11px] uppercase text-text-primary font-medium">2. Our Intent ({branchComparison.currentBranch}):</div>
                <p className="text-text-secondary text-[12px] font-sans">{currentConflict.whyItHappened?.oursIntent}</p>
              </div>

              <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-1">
                <div className="text-[11px] uppercase text-text-primary font-medium">3. Their Intent ({branchComparison.targetBranch}):</div>
                <p className="text-text-secondary text-[12px] font-sans">{currentConflict.whyItHappened?.theirsIntent}</p>
              </div>
            </div>

            {/* Question 4: Affected Components & Question 5: Semantic Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-1.5">
                <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
                  4. Affected Components:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentConflict.affectedComponents.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-[4px] bg-bg-surface text-text-secondary text-[11px] font-mono border border-border-default"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-status-critical">
                  5. Semantic Impact:
                </div>
                <p className="text-text-secondary text-[12px] leading-relaxed font-sans">
                  {currentConflict.semanticImpact || 'High risk of runtime type errors if callers do not pass updated parameters.'}
                </p>
              </div>
            </div>

            {/* Question 6: Resolution Suggestion */}
            <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-1 font-sans">
              <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-status-good flex items-center gap-1.5">
                <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" /> 6. Resolution Suggestion:
              </div>
              <p className="text-text-primary text-[12px] leading-relaxed">
                {currentConflict.resolutionSuggestion || 'Synthesize both changes by preserving metadata while adopting idempotency key headers.'}
              </p>
            </div>
          </Card>

          {/* 3-Way Split Code Viewer Grid (BASE vs OURS vs THEIRS) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
            {/* Column 1: Base */}
            <div className="rounded-[6px] border border-border-default bg-bg-surface overflow-hidden flex flex-col">
              <div className="px-3.5 py-2.5 bg-bg-surface-2 border-b border-border-default text-text-tertiary font-medium flex items-center justify-between font-sans">
                <span>BASE (Common Ancestor)</span>
                <span className="text-[11px] font-mono">v2.3</span>
              </div>
              <div className="p-4 overflow-x-auto flex-1 text-text-secondary bg-bg-surface">
                <pre>{currentConflict.baseCode}</pre>
              </div>
            </div>

            {/* Column 2: Ours */}
            <div className="rounded-[6px] border border-border-default bg-bg-surface overflow-hidden flex flex-col">
              <div className="px-3.5 py-2 bg-bg-surface-2 border-b border-border-default text-text-primary font-medium flex items-center justify-between font-sans">
                <span>OURS ({branchComparison.currentBranch})</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => resolveConflictBlock(currentConflict.id, 'ours')}
                >
                  Accept Ours
                </Button>
              </div>
              <div className="p-4 overflow-x-auto flex-1 text-text-primary bg-bg-surface">
                <pre>{currentConflict.oursCode}</pre>
              </div>
            </div>

            {/* Column 3: Theirs */}
            <div className="rounded-[6px] border border-border-default bg-bg-surface overflow-hidden flex flex-col">
              <div className="px-3.5 py-2 bg-bg-surface-2 border-b border-border-default text-text-primary font-medium flex items-center justify-between font-sans">
                <span>THEIRS ({branchComparison.targetBranch})</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => resolveConflictBlock(currentConflict.id, 'theirs')}
                >
                  Accept Theirs
                </Button>
              </div>
              <div className="p-4 overflow-x-auto flex-1 text-text-primary bg-bg-surface">
                <pre>{currentConflict.theirsCode}</pre>
              </div>
            </div>
          </div>

          {/* AI Smart Merge Suggested Resolution Box */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
                <h3 className="text-[14px] font-semibold text-text-primary">Synthesized Resolution Suggestion</h3>
                <Badge variant="good">
                  Intelligent Synthesis
                </Badge>
              </div>

              <Button
                variant="accent"
                onClick={() => resolveConflictBlock(currentConflict.id, 'ai')}
                className="gap-2"
              >
                <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>
                  {currentConflict.resolutionStatus === 'resolved_ai'
                    ? '✓ Solution Applied'
                    : 'Apply Suggested Resolution'}
                </span>
              </Button>
            </div>

            <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default font-mono text-xs text-text-primary overflow-x-auto">
              <pre>{currentConflict.aiSuggestedCode}</pre>
            </div>

            {currentConflict.resolutionStatus !== 'unresolved' && (
              <div className="flex items-center gap-2 text-xs text-status-good font-medium pt-1">
                <CheckCircle2 strokeWidth={1.5} className="w-4 h-4" />
                <span>Conflict resolved ({currentConflict.resolutionStatus})</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: VERSION CHANGE BREAKDOWN */}
      {activeTab === 'changes' && (
        <div className="space-y-4 font-mono text-xs">
          <Card className="p-5 space-y-4">
            <h3 className="text-[15px] font-semibold text-text-primary font-sans">
              Complete Branch Divergence & Artifact Changes
            </h3>

            {/* Added / Deleted / Modified Files */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-2">
                <span className="text-[11px] text-status-good font-medium uppercase flex items-center gap-1.5">
                  <FilePlus strokeWidth={1.5} className="w-3.5 h-3.5" /> Added Files ({branchComparison.addedFiles.length})
                </span>
                <div className="space-y-1">
                  {branchComparison.addedFiles.map((f, i) => (
                    <div key={i} className="text-[12px] text-text-secondary truncate">{f}</div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-2">
                <span className="text-[11px] text-status-critical font-medium uppercase flex items-center gap-1.5">
                  <FileMinus strokeWidth={1.5} className="w-3.5 h-3.5" /> Deleted Files ({branchComparison.deletedFiles.length})
                </span>
                <div className="space-y-1">
                  {branchComparison.deletedFiles.map((f, i) => (
                    <div key={i} className="text-[12px] text-text-secondary truncate">{f}</div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-2">
                <span className="text-[11px] text-text-primary font-medium uppercase flex items-center gap-1.5">
                  <FileEdit strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" /> Modified Files ({branchComparison.modifiedFiles.length})
                </span>
                <div className="space-y-1">
                  {branchComparison.modifiedFiles.map((f, i) => (
                    <div key={i} className="text-[12px] text-text-secondary truncate">{f}</div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: SEMANTIC DRIFT HAZARDS */}
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
