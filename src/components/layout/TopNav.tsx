import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import {
  Search,
  GitBranch,
  FolderGit2,
  Play,
  Settings,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  Zap,
  Volume2,
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const {
    repo,
    switchBranch,
    setIsCommandPaletteOpen,
    setIsConnectModalOpen,
    setIsSettingsModalOpen,
    setIsVoiceSettingsModalOpen,
    isRightPanelOpen,
    setIsRightPanelOpen,
    runReview,
    isReviewRunning,
    reviewState,
    reviewProgress,
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
    <header className="h-10 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center gap-3 z-30 select-none text-xs">
      {/* Left: Brand + Repo Switcher + Branch Switcher */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            RL
          </div>
          <span className="font-bold text-xs tracking-tight text-white flex items-center gap-1.5">
            RepoLens
            <span className="text-[10px] px-1 py-0.2 rounded bg-[#21262d] text-slate-300 font-mono border border-[#30363d]">
              v2.4
            </span>
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#30363d]" />

        {/* Current Active Repo Selector */}
        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-slate-200 transition-all font-mono text-[11px]"
          title="Switch repository or upload ZIP/connect GitHub"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-100 max-w-[130px] truncate">
            {repo.name}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-slate-300 font-mono text-[11px] transition-all"
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[120px] truncate">{repo.currentBranch}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isBranchDropdownOpen && (
            <div className="absolute left-0 mt-1 w-56 rounded-lg bg-[#161b22] border border-[#30363d] shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 font-mono text-xs">
              <div className="px-2 py-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider border-b border-[#30363d] mb-1">
                Switch Branch
              </div>
              {repo.branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    switchBranch(b);
                    setIsBranchDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-all ${
                    repo.currentBranch === b
                      ? 'bg-indigo-600/20 text-indigo-300 font-bold'
                      : 'text-slate-300 hover:bg-[#21262d]'
                  }`}
                >
                  <span className="truncate">{b}</span>
                  {repo.currentBranch === b && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Speaking State in Top Bar */}
        {voicePlayback.isPlaying && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-mono text-[11px] animate-pulse">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agent Speaking ({voicePlayback.speakingAgentId})</span>
            <button
              onClick={stopAudioPlayback}
              className="ml-1 text-slate-400 hover:text-white"
              title="Stop audio"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Middle: Universal Search / Cmd+K Launcher - Full Width */}
      <div className="flex-1 min-w-0 hidden md:block">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-slate-400 text-xs transition-all group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 flex-shrink-0" />
            <span className="text-slate-400 group-hover:text-slate-200 truncate">
              Search files, symbols, routes, or ask AI...
            </span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-[10px] font-mono text-slate-400 flex-shrink-0 ml-2">
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
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-[11px] transition-all"
            title={`${conflictsCount} merge conflicts requiring resolution`}
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>{conflictsCount} conflicts</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-[#30363d]" />

        {/* General Settings */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-1.5 rounded hover:bg-[#21262d] text-slate-400 hover:text-slate-200"
          title="Repository Settings"
        >
          <Settings className="w-4 h-4" />
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
