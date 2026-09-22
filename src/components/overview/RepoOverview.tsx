import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { ExploreView } from '../explore/ExploreView';
import {
  Activity,
  Layers,
  Server,
  Database,
  CheckCircle2,
  FileCode,
  Flame,
  Trash2,
  Copy,
  ArrowRight,
  FolderTree,
  Package,
  Network,
  GitBranch,
} from 'lucide-react';

export const RepoOverview: React.FC = () => {
  const {
    repo,
    setActiveView,
    selectFileByPath,
  } = useRepoStore();

  const [activeTab, setActiveTab] = useState<'metrics' | 'explorer' | 'apis_db' | 'dependencies' | 'hotspots'>('metrics');

  if (activeTab === 'explorer') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden">
        {/* Sub-View Switcher Bar */}
        <div className="h-10 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between font-mono text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase text-[10px]">Repository Intelligence:</span>
            <span className="text-white font-semibold">Monaco Code Explorer & Symbol Tree</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('metrics')}
              className="px-2.5 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-slate-300 text-[11px] transition-all"
            >
              ← Back to Metrics & Architecture
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className="px-2.5 py-1 rounded bg-indigo-600 text-white font-semibold text-[11px] shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5 inline mr-1" />
              <span>Monaco Editor</span>
            </button>
          </div>
        </div>

        <ExploreView />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 w-full text-xs select-none">
      {/* Top Banner: Repo Intelligence Header */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('explorer')}
            className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-all flex items-center gap-1.5 font-mono"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Open Monaco Code Studio</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Switcher for Repository Intelligence */}
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 font-mono text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'metrics'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-[#161b22] text-slate-400 hover:text-slate-200 border border-[#30363d]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Architecture & Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('apis_db')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'apis_db'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-[#161b22] text-slate-400 hover:text-slate-200 border border-[#30363d]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>APIs, Routes & Database Schema</span>
        </button>

        <button
          onClick={() => setActiveTab('dependencies')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'dependencies'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-[#161b22] text-slate-400 hover:text-slate-200 border border-[#30363d]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Dependencies & Relations</span>
        </button>

        <button
          onClick={() => setActiveTab('hotspots')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'hotspots'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-[#161b22] text-slate-400 hover:text-slate-200 border border-[#30363d]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Hotspots, Dead Code & Duplication</span>
        </button>
      </div>

      {/* TAB 1: ARCHITECTURE & CODEBASE METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Codebase Health & Quality Metrics Table */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
              <span className="font-semibold text-white flex items-center gap-1.5 font-mono text-xs">
                <Activity className="w-4 h-4 text-indigo-400" /> Codebase-Level Metrics & Architecture Health
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
                <span className="text-base font-bold text-emerald-400">{Number(repo.metrics.testCoveragePercent || 0).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <span className="text-[10px] text-slate-500 block uppercase">Tech Debt Ratio</span>
                <span className="text-base font-bold text-slate-200">{Number(repo.metrics.technicalDebtRatioPercent || 0).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <span className="text-[10px] text-slate-500 block uppercase">Duplication</span>
                <span className="text-base font-bold text-slate-200">{Number(repo.metrics.duplicatedCodePercent || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Architecture & Component Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
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
            </div>

            {/* Language Breakdown */}
            <div className="lg:col-span-4 space-y-4">
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

                <div className="space-y-1.5 text-xs font-mono pt-1">
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
      )}

      {/* TAB 2: APIS & DATABASE MODELS */}
      {activeTab === 'apis_db' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left: Discovered API Routes */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <Server className="w-4 h-4 text-cyan-400" /> Discovered REST API Route Registry
                </span>
                <span className="text-[10px] text-slate-500">{repo.apiRoutes.length} endpoints</span>
              </div>

              <div className="overflow-x-auto">
                {repo.apiRoutes.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Server className="w-16 h-16 text-slate-600/50 mx-auto" />
                    <div className="space-y-1.5">
                      <p className="text-slate-400 font-medium">No API routes detected in this repository</p>
                      <p className="text-slate-500 text-[11px] max-w-md mx-auto">
                        API route discovery analyzes Express.js, FastAPI, Flask, or similar backend frameworks.
                        This repository may not contain REST API endpoints or they require manual analysis.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('explorer')}
                      className="px-4 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all inline-flex items-center gap-2 font-medium"
                    >
                      <FolderTree className="w-4 h-4" />
                      Browse Code Files
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#30363d] text-slate-400 text-[10px]">
                        <th className="pb-1.5">Route</th>
                        <th className="pb-1.5">Handler Call-site</th>
                        <th className="pb-1.5">Security Auth</th>
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
                                r.method === 'POST'
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
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
                )}
              </div>
            </div>
          </div>

          {/* Right: Database Schema Models */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <Database className="w-4 h-4 text-emerald-400" /> PostgreSQL / Prisma Schema Models
                </span>
                <span className="text-[10px] text-slate-500">{repo.databaseModels.length} models</span>
              </div>

              <div className="space-y-2">
                {repo.databaseModels.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Database className="w-16 h-16 text-slate-600/50 mx-auto" />
                    <div className="space-y-1.5">
                      <p className="text-slate-400 font-medium">No database models detected</p>
                      <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                        Schema discovery looks for Prisma schemas, SQL migrations, Sequelize, or TypeORM models.
                      </p>
                    </div>
                  </div>
                ) : (
                  repo.databaseModels.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectFileByPath(m.file)}
                      className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-indigo-500/40 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-300 font-bold text-xs">model {m.name}</span>
                        <span className="text-[10px] text-slate-500">{m.fieldsCount} columns</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{m.file}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPENDENCIES & RELATIONSHIPS */}
      {activeTab === 'dependencies' && (
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Package className="w-4 h-4 text-purple-400" /> Direct Dependencies & Ecosystem Packages
            </span>
            <span className="text-[10px] text-slate-500">{repo.dependencies.length} packages</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {repo.dependencies.length === 0 ? (
              <div className="col-span-full py-12 text-center space-y-3">
                <Package className="w-16 h-16 text-slate-600/50 mx-auto" />
                <div className="space-y-1.5">
                  <p className="text-slate-400 font-medium">No dependencies detected</p>
                  <p className="text-slate-500 text-[11px] max-w-md mx-auto">
                    Dependencies are parsed from package.json, requirements.txt, Cargo.toml, or go.mod files.
                    This repository may not have a dependency manifest file.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('explorer')}
                  className="px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all inline-flex items-center gap-2 font-medium"
                >
                  <FolderTree className="w-4 h-4" />
                  Browse Files
                </button>
              </div>
            ) : (
              repo.dependencies.map((dep, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-200 text-xs">{dep.name}</div>
                  <div className="text-[10px] text-indigo-400">{dep.version}</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161b22] text-slate-400 uppercase">
                  {dep.type}
                </span>
              </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: HOTSPOTS, DEAD CODE & CODE DUPLICATION */}
      {activeTab === 'hotspots' && (
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
              {repo.hotspots.length === 0 ? (
                <div className="p-6 text-center">
                  <Flame className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-mono">No maintenance hotspots detected</p>
                  <p className="text-slate-600 text-[10px] mt-1">Run Multi-Agent Review to identify risk areas</p>
                </div>
              ) : (
                repo.hotspots.map((h) => (
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
                ))
              )}
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
              {repo.deadCodeItems.length === 0 ? (
                <div className="p-6 text-center">
                  <Trash2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-mono">No dead code candidates found</p>
                  <p className="text-slate-600 text-[10px] mt-1">Clean codebase or run analysis first</p>
                </div>
              ) : (
                repo.deadCodeItems.map((d) => (
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
                ))
              )}
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
              {repo.duplicateCodeItems.length === 0 ? (
                <div className="p-6 text-center">
                  <Copy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-mono">No duplicate code blocks found</p>
                  <p className="text-slate-600 text-[10px] mt-1">Good adherence to DRY principles</p>
                </div>
              ) : (
                repo.duplicateCodeItems.map((dup) => (
                  <div
                    key={dup.id}
                    className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-slate-200 text-xs">{dup.title}</span>
                      <span className="text-cyan-400 text-[10px] font-bold">{dup.similarityPercentage}% Match</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {dup.instances.map((i) => i.file).join(' ↔ ')}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{dup.refactoringSuggestion}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
