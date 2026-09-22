import React from 'react';
import { useRepoStore, AppView } from '../../store/useRepoStore';
import {
  LayoutDashboard,
  ShieldAlert,
  GitMerge,
  Network,
  Bot,
  Sparkles,
} from 'lucide-react';

interface SidebarItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    reviewState,
    reviewFindings,
    comparisonState,
    branchComparison,
    repo,
  } = useRepoStore();

  const openIssuesCount = reviewFindings.filter((f) => f.status === 'open').length;
  const criticalCount = reviewFindings.filter((f) => f.status === 'open' && f.severity === 'critical').length;
  const conflictsCount = comparisonState === 'conflicts_found'
    ? branchComparison.conflicts.filter((c) => c.resolutionStatus === 'unresolved').length
    : 0;

  const navItems: SidebarItem[] = [
    {
      id: 'overview',
      label: 'Repository Intelligence',
      icon: LayoutDashboard,
      badge: `${repo.stats.filesCount} files`,
      badgeColor: 'bg-[#21262d] text-slate-400',
    },
    {
      id: 'copilot',
      label: 'AI Copilot',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 font-mono text-[9px]',
    },
    {
      id: 'review',
      label: 'Multi-Agent Review',
      icon: ShieldAlert,
      badge: reviewState === 'completed' && openIssuesCount > 0 ? `${openIssuesCount} issues` : undefined,
      badgeColor: criticalCount > 0 ? 'bg-rose-500/20 text-rose-400 font-bold' : 'bg-amber-500/20 text-amber-400',
    },
    {
      id: 'merge',
      label: 'Merge Intelligence',
      icon: GitMerge,
      badge: conflictsCount > 0 ? `${conflictsCount} conflicts` : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold',
    },
    {
      id: 'impact',
      label: 'Impact Analysis',
      icon: Network,
      badge: '6 layers',
      badgeColor: 'bg-[#21262d] text-cyan-300 font-mono text-[9px]',
    },
  ];

  return (
    <aside className="w-56 bg-[#0d1117] border-r border-[#30363d] flex flex-col justify-between select-none flex-shrink-0 text-xs">
      {/* Navigation Links */}
      <div className="p-2 space-y-0.5">
        <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all group relative ${
                isActive
                  ? 'bg-[#21262d] text-white font-semibold border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161b22]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono flex-shrink-0 ${
                    item.badgeColor || 'bg-[#21262d] text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 5-Agent Status Footprint */}
      <div className="p-3 border-t border-[#30363d] bg-[#161b22]/50 m-2 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Bot className="w-3 h-3 text-indigo-400" /> 5-Agent Ensemble
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${reviewState === 'completed' ? 'bg-emerald-500' : reviewState === 'running' || reviewState === 'debating' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
        </div>

        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="1. Code Quality & Architecture Agent">
            🏛️
          </div>
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="2. Security Guardian Agent">
            🛡️
          </div>
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="3. Performance & Database Agent">
            ⚡
          </div>
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="4. Testing & Reliability Agent">
            🧪
          </div>
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="5. Git & Merge Intelligence Agent">
            🌿
          </div>
        </div>
      </div>
    </aside>
  );
};
