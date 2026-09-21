import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { ExploreView } from '../explore/ExploreView';
import {
  Activity,
  Layers,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  ShieldCheck,
  FileCode,
  Flame,
  Trash2,
  Copy,
  TrendingUp,
  ArrowRight,
  Bot,
  Play,
  Volume2,
  FolderTree,
} from 'lucide-react';
import { SeverityBadge } from '../common/Badge';

export const RepoOverview: React.FC = () => {
  const {
    repo,
    setActiveView,
    selectFileByPath,
    reviewFindings,
    branchComparison,
    runReview,
    speakAgentBriefing,
  } = useRepoStore();

  const [activeTab, setActiveTab] = useState<'metrics' | 'explorer'>('metrics');

  const openIssues = reviewFindings.filter((f) => f.status === 'open');
  const criticalCount = openIssues.filter((f) => f.severity === 'critical').length;
  const unresolvedConflicts = branchComparison.conflicts.filter(
    (c) => c.resolutionStatus === 'unresolved'
  ).length;

  if (activeTab === 'explorer') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden">
        {/* Top Feature 1 Switcher Bar */}
        <div className="h-10 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between font-mono text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase text-[10px]">Feature 1:</span>
            <span className="text-white font-semibold">Repository Intelligence & Code Explorer</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('metrics')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-slate-300 text-[11px] transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Health & Architecture Metrics</span>
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600 text-white font-semibold text-[11px] shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Monaco Code Explorer</span>
            </button>
          </div>
        </div>

        <ExploreView />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 max-w-7xl mx-auto text-xs">
      {/* Top Banner: Repo Intelligence Header */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Repository Intelligence Active
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              Branch: <span className="text-slate-200">{repo.currentBranch}</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            {repo.name}
            <span className="text-xs font-mono font-normal text-slate-400">
              ({repo.fullName})
            </span>
          </h1>
          <p className="text-slate-300 text-xs leading-relaxed">{repo.description}</p>
        </div>

        {/* Action Buttons & Sub-View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('explorer')}
            className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-all flex items-center gap-1.5 font-mono"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Open Monaco Code Studio</span>
          </button>

          <button
            onClick={() => setActiveView('review')}
            className="px-3 py-2 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-slate-200 font-medium transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Review Findings ({openIssues.length})</span>
          </button>
        </div>
      </div>

      {/* Codebase Health & Quality Metrics Table */}
      <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
          <span className="font-semibold text-white flex items-center gap-1.5 font-mono text-xs">
            <Activity className="w-4 h-4 text-indigo-400" /> Codebase-Level Metrics & Health Index
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            {repo.stats.filesCount} files • {repo.metrics.totalLOC.toLocaleString()} LOC
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono">
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-slate-500 block uppercase">Health Score</span>
            <span className="text-base font-bold text-emerald-400">{repo.stats.healthScore}/100</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-slate-500 block uppercase">Security Index</span>
            <span className="text-base font-bold text-indigo-400">{repo.stats.securityScore}/100</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-slate-500 block uppercase">Complexity Avg</span>
            <span className="text-base font-bold text-amber-400">{repo.metrics.cyclomaticComplexityAvg}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-slate-500 block uppercase">Maintainability</span>
            <span className="text-base font-bold text-cyan-400">{repo.metrics.maintainabilityIndex}/100</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-slate-500 block uppercase">Test Coverage</span>
            <span className="text-base font-bold text-emerald-400">{repo.metrics.testCoveragePercent}%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-slate-500 block uppercase">Tech Debt Ratio</span>
            <span className="text-base font-bold text-slate-200">{repo.metrics.technicalDebtRatioPercent}%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-slate-500 block uppercase">Duplication</span>
            <span className="text-base font-bold text-slate-200">{repo.metrics.duplicatedCodePercent}%</span>
          </div>
        </div>
      </div>

      {/* Code Hotspots, Dead Code & Duplication Detection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hotspots */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5 font-mono text-xs">
              <Flame className="w-4 h-4 text-orange-400" /> Maintenance Hotspots ({repo.hotspots.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">High Risk & Churn</span>
          </div>

          <div className="space-y-2">
            {repo.hotspots.map((h) => (
              <div
                key={h.id}
                onClick={() => selectFileByPath(h.file)}
                className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-orange-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-indigo-300 text-xs">{h.functionName}()</span>
                  <span className="text-orange-400 text-[10px] font-bold">Risk: {h.riskScore}%</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">{h.file}</div>
                <p className="text-[11px] text-slate-400 leading-snug">{h.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dead Code Detection */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5 font-mono text-xs">
              <Trash2 className="w-4 h-4 text-rose-400" /> Dead Code Candidates ({repo.deadCodeItems.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">Unused AST Symbols</span>
          </div>

          <div className="space-y-2">
            {repo.deadCodeItems.map((d) => (
              <div
                key={d.id}
                onClick={() => selectFileByPath(d.file, d.line)}
                className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-rose-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-rose-300 text-xs">{d.symbolName}</span>
                  <span className="text-slate-400 text-[10px]">~{d.estimatedSavingLines} LOC</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">{d.file}:{d.line}</div>
                <p className="text-[11px] text-slate-400 leading-snug">{d.suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Code Duplication */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5 font-mono text-xs">
              <Copy className="w-4 h-4 text-cyan-400" /> Duplicate Code Blocks ({repo.duplicateCodeItems.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">DRY Violations</span>
          </div>

          <div className="space-y-2">
            {repo.duplicateCodeItems.map((dup) => (
              <div
                key={dup.id}
                className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-slate-200 text-xs">{dup.title}</span>
                  <span className="text-cyan-400 text-[10px] font-bold">{dup.similarityPercentage}% Match</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {dup.instances.map(i => i.file).join(' ↔ ')}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{dup.refactoringSuggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Architecture & Discovered APIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Architecture & Data Flow */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
              <span className="font-semibold text-white flex items-center gap-1.5 font-mono text-xs">
                <Layers className="w-4 h-4 text-indigo-400" /> System Architecture & Component Roles
              </span>
              <span className="text-[11px] font-mono text-indigo-300">
                {repo.architecture.pattern}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              {repo.architecture.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {repo.architecture.components.map((comp, idx) => (
                <div
                  key={idx}
                  onClick={() => selectFileByPath(comp.path)}
                  className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-indigo-500/40 cursor-pointer transition-all group"
                >
                  <div className="font-semibold text-slate-200 text-xs group-hover:text-indigo-300">
                    {comp.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mb-1">{comp.path}</div>
                  <p className="text-[11px] text-slate-400">{comp.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Discovered API Endpoints Table */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5 font-mono text-xs">
                <Server className="w-4 h-4 text-cyan-400" /> Discovered REST API Route Registry
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {repo.apiRoutes.length} endpoints
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#30363d] text-slate-400 text-[10px]">
                    <th className="pb-1.5">Route</th>
                    <th className="pb-1.5">Handler</th>
                    <th className="pb-1.5">Auth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]/60">
                  {repo.apiRoutes.map((r, idx) => (
                    <tr
                      key={idx}
                      onClick={() => selectFileByPath(r.handlerFile)}
                      className="hover:bg-[#21262d] cursor-pointer transition-colors"
                    >
                      <td className="py-2 flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            r.method === 'POST' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {r.method}
                        </span>
                        <span className="text-slate-200 font-medium">{r.path}</span>
                      </td>
                      <td className="py-2 text-slate-400 text-[11px]">{r.handlerFile}</td>
                      <td className="py-2">
                        {r.authRequired ? (
                          <span className="text-rose-400 text-[10px]">JWT Guard</span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Public</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Database Models & Tech Stack */}
        <div className="lg:col-span-5 space-y-4">
          {/* Database Models */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5 font-mono text-xs">
                <Database className="w-4 h-4 text-emerald-400" /> PostgreSQL / Prisma Schema Models
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {repo.databaseModels.length} models
              </span>
            </div>

            <div className="space-y-2">
              {repo.databaseModels.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => selectFileByPath(m.file)}
                  className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between font-mono"
                >
                  <span className="text-indigo-300 font-semibold text-xs">model {m.name}</span>
                  <span className="text-[10px] text-slate-500">{m.fieldsCount} columns</span>
                </div>
              ))}
            </div>
          </div>

          {/* Languages Breakdown */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-white">Language Inventory</span>
              <span className="text-slate-400">{repo.stats.linesOfCode.toLocaleString()} LOC</span>
            </div>

            <div className="w-full h-2 rounded flex overflow-hidden bg-[#0d1117]">
              {repo.languages.map((l, idx) => (
                <div
                  key={idx}
                  className="h-full"
                  style={{ width: `${l.percentage}%`, backgroundColor: l.color }}
                  title={`${l.name}: ${l.percentage}%`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              {repo.languages.map((l, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-slate-300">{l.name}</span>
                  <span className="ml-auto text-slate-500 text-[10px]">{l.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
