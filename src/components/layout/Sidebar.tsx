import React from 'react';
import { useRepoStore, AppView } from '../../store/useRepoStore';
import {
  LayoutDashboard,
  FolderTree,
  ShieldAlert,
  Users2,
  GitMerge,
  Network,
  History,
  MessageSquare,
  Volume2,
  Bot,
} from 'lucide-react';

interface SidebarItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  featureIndex?: number;
}

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    reviewFindings,
    branchComparison,
    repo,
  } = useRepoStore();

  const openIssuesCount = reviewFindings.filter((f) => f.status === 'open').length;
  const criticalCount = reviewFindings.filter((f) => f.status === 'open' && f.severity === 'critical').length;
  const conflictsCount = branchComparison.conflicts.filter((c) => c.resolutionStatus === 'unresolved').length;

  const navItems: SidebarItem[] = [
    {
      id: 'overview',
      label: '1. Repository Intelligence',
      icon: LayoutDashboard,
      badge: `${repo.stats.filesCount} files`,
      badgeColor: 'bg-[#21262d] text-slate-400',
      featureIndex: 1,
    },
    {
      id: 'review',
      label: '2. Multi-Agent Review & Debate',
      icon: ShieldAlert,
      badge: openIssuesCount > 0 ? `${openIssuesCount} issues` : undefined,
      badgeColor: criticalCount > 0 ? 'bg-rose-500/20 text-rose-400 font-bold' : 'bg-amber-500/20 text-amber-400',
      featureIndex: 2,
    },
    {
      id: 'merge',
      label: '3. Merge Intelligence',
      icon: GitMerge,
      badge: conflictsCount > 0 ? `${conflictsCount} conflicts` : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold',
      featureIndex: 3,
    },
    {
      id: 'impact',
      label: '4. Impact & Blast Radius',
      icon: Network,
      badge: '6 layers',
      badgeColor: 'bg-[#21262d] text-cyan-300 font-mono text-[9px]',
      featureIndex: 4,
    },
    {
      id: 'chat',
      label: '5. Repo Chat & Voice',
      icon: MessageSquare,
      badge: 'Voice',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 font-mono text-[9px]',
      featureIndex: 5,
    },
  ];

  return (
    <aside className="w-56 bg-[#0d1117] border-r border-[#30363d] flex flex-col justify-between select-none flex-shrink-0 text-xs">
      {/* Navigation Links */}
      <div className="p-2 space-y-0.5">
        <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Workspace Views
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
              <div className="flex items-center gap-2">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
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
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="Code Quality & Architecture Agent">
            🏛️
          </div>
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="Security Guardian Agent">
            🛡️
          </div>
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="Performance & Database Agent">
            ⚡
          </div>
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="Testing & Reliability Agent">
            🧪
          </div>
          <div className="p-1 rounded bg-[#0d1117] border border-[#30363d]" title="Git & Merge Intelligence Agent">
            🌿
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono text-center flex items-center justify-center gap-1">
          <Volume2 className="w-2.5 h-2.5 text-indigo-400" /> Voice Personas Active
        </div>
      </div>
    </aside>
  );
};
