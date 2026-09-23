import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { Badge } from '../../frontend';
import {
  Search,
  GitBranch,
  FolderGit2,
  Settings,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  CheckCircle2,
  Volume2,
  Zap,
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const {
    repo,
    switchBranch,
    setIsCommandPaletteOpen,
    setIsConnectModalOpen,
    setIsSettingsModalOpen,
    isRightPanelOpen,
    setIsRightPanelOpen,
    setActiveView,
    comparisonState,
    branchComparison,
    voicePlayback,
    activeView,
    stopAudioPlayback,
  } = useRepoStore();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const conflictsCount = comparisonState === 'conflicts_found'
    ? branchComparison.conflicts.filter((c) => c.resolutionStatus === 'unresolved').length
    : 0;

  return (
    <header className="h-10 bg-bg-surface border-b border-[#2d3340] px-4 flex items-center gap-3 z-30 select-none text-xs">
      {/* Left: Brand + Repo Switcher + Branch Switcher */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-[4px] bg-gradient-to-br from-accent to-accent/70 border border-accent/30 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-accent/20">
            RL
          </div>
          <span className="font-semibold text-xs tracking-tight text-text-primary flex items-center gap-1.5">
            RepoLens
            <Badge variant="neutral" className="text-[10px] lowercase py-0">v2.4</Badge>
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#2d3340]" />

        {/* Current Active Repo Selector */}
        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#1a1f26] hover:bg-[#262B31] border border-[#2d3340] text-text-primary transition-colors font-mono text-[11px]"
          title="Switch repository or upload ZIP/connect GitHub"
        >
          <FolderGit2 strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
          <span className="font-medium text-text-primary max-w-[130px] truncate">
            {repo.name}
          </span>
          <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" />
        </button>

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#1a1f26] hover:bg-[#262B31] border border-[#2d3340] text-text-secondary font-mono text-[11px] transition-colors"
          >
            <GitBranch strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
            <span className="max-w-[120px] truncate">{repo.currentBranch}</span>
            <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" />
          </button>

          {isBranchDropdownOpen && (
            <div className="absolute left-0 mt-1 w-56 rounded-[6px] bg-bg-surface border border-[#2d3340] shadow-[0_4px_12px_rgba(0,0,0,0.4)] p-1 z-50 font-mono text-xs">
              <div className="px-2 py-1 text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] border-b border-[#2d3340] mb-1">
                Switch Branch
              </div>
              {repo.branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    switchBranch(b);
                    setIsBranchDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[4px] text-left transition-colors ${
                    repo.currentBranch === b
                      ? 'bg-bg-surface-2 text-text-primary font-medium'
                      : 'text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary'
                  }`}
                >
                  <span className="truncate">{b}</span>
                  {repo.currentBranch === b && <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5 text-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Speaking State in Top Bar */}
        {voicePlayback.isPlaying && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-[11px]">
            <Volume2 strokeWidth={1.5} className="w-3.5 h-3.5 text-accent" />
            <span>Agent Speaking ({voicePlayback.speakingAgentId})</span>
            <button
              onClick={stopAudioPlayback}
              className="ml-1 text-text-secondary hover:text-text-primary"
              title="Stop audio"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Middle: Universal Search / Cmd+K Launcher - Full Width */}
      <div className="flex-1 min-w-0 hidden md:block">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-[6px] bg-bg-surface-2 hover:bg-bg-surface border border-border-default text-text-secondary text-xs transition-all group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent flex-shrink-0" />
            <span className="text-text-secondary group-hover:text-text-primary truncate">
              Search files, symbols, routes, or ask AI...
            </span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-bg-surface border border-border-default text-[10px] font-mono text-text-tertiary flex-shrink-0 ml-2">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Merge Conflict Alert Badge - ONLY when comparison has conflicts */}
        {conflictsCount > 0 && (
          <button
            onClick={() => setActiveView('merge')}
            className="flex items-center gap-1.5 transition-colors"
            title={`${conflictsCount} merge conflicts requiring resolution`}
          >
            <Badge variant="critical" className="gap-1 cursor-pointer">
              <Zap strokeWidth={1.5} className="w-3 h-3 text-status-critical" />
              <span>{conflictsCount} conflicts</span>
            </Badge>
          </button>
        )}

        <div className="h-4 w-[1px] bg-border-default" />

        {/* General Settings */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-1.5 rounded-[6px] hover:bg-bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
          title="Repository Settings"
        >
          <Settings strokeWidth={1.5} className="w-4 h-4" />
        </button>

        {/* Right Context Drawer Toggle - Only shown in Impact view */}
        {activeView === 'impact' && (
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`p-1.5 rounded transition-colors ${
              isRightPanelOpen
                ? 'bg-indigo-600/20 text-indigo-300'
                : 'hover:bg-[#21262d] text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Context Drawer"
          >
            {isRightPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
