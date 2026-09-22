import React from 'react';
import { useRepoStore, AppView } from '../../store/useRepoStore';
import { Badge } from '../../frontend';
import {
  LayoutDashboard,
  ShieldAlert,
  GitMerge,
  Network,
  Sparkles,
} from 'lucide-react';

interface SidebarItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'good' | 'warn' | 'critical' | 'accent' | 'neutral';
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
      badgeVariant: 'neutral',
    },
    {
      id: 'copilot',
      label: 'AI Copilot',
      icon: Sparkles,
      badge: 'AI',
      badgeVariant: 'accent',
    },
    {
      id: 'review',
      label: 'Multi-Agent Review',
      icon: ShieldAlert,
      badge: reviewState === 'completed' && openIssuesCount > 0 ? `${openIssuesCount} issues` : undefined,
      badgeVariant: criticalCount > 0 ? 'critical' : 'warn',
    },
    {
      id: 'merge',
      label: 'Merge Intelligence',
      icon: GitMerge,
      badge: conflictsCount > 0 ? `${conflictsCount} conflicts` : undefined,
      badgeVariant: 'critical',
    },
    {
      id: 'impact',
      label: 'Impact Analysis',
      icon: Network,
      badge: '6 layers',
      badgeVariant: 'neutral',
    },
  ];

  return (
    <aside className="w-56 bg-bg-base border-r border-border-default flex flex-col justify-between select-none flex-shrink-0 text-xs h-full">
      {/* Navigation Links */}
      <div className="p-2 space-y-1">
        <div className="px-3 py-2 text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between text-left transition-colors ${
                isActive
                  ? 'bg-bg-surface-2 border-l-2 border-accent text-text-primary pl-2.5 pr-3 py-2 rounded-r-[6px]'
                  : 'text-text-secondary bg-transparent hover:bg-bg-surface pl-3 pr-3 py-2 rounded-[6px]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon
                  strokeWidth={1.5}
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-accent' : 'text-text-secondary'
                  }`}
                />
                <span className="truncate text-xs font-normal">{item.label}</span>
              </div>

              {item.badge && (
                <Badge variant={item.badgeVariant || 'neutral'} className="ml-1 text-[10px]">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom ENSEMBLE Row */}
      <div className="border-t border-border-default pt-4 px-3 pb-3 mt-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
            Ensemble
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-[4px] ${
              reviewState === 'completed'
                ? 'bg-status-good'
                : reviewState === 'running' || reviewState === 'debating'
                ? 'bg-status-warn'
                : 'bg-border-strong'
            }`}
          />
        </div>

        <div className="grid grid-cols-5 gap-1 text-center font-mono text-[11px]">
          <div
            className="py-1 rounded-[4px] bg-bg-surface-2 border border-border-default text-text-secondary"
            title="1. Code Quality & Architecture"
          >
            AQ
          </div>
          <div
            className="py-1 rounded-[4px] bg-bg-surface-2 border border-border-default text-text-secondary"
            title="2. Security Guardian"
          >
            SG
          </div>
          <div
            className="py-1 rounded-[4px] bg-bg-surface-2 border border-border-default text-text-secondary"
            title="3. Performance & Database"
          >
            PD
          </div>
          <div
            className="py-1 rounded-[4px] bg-bg-surface-2 border border-border-default text-text-secondary"
            title="4. Testing & Reliability"
          >
            TR
          </div>
          <div
            className="py-1 rounded-[4px] bg-bg-surface-2 border border-border-default text-text-secondary"
            title="5. Multi-Agent Orchestrator"
          >
            MI
          </div>
        </div>
      </div>
    </aside>
  );
};
