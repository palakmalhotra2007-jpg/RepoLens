import React, { useState, useEffect, useRef } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { searchRepositoryCode } from '../../services/searchEngine';
import {
  Search,
  FileCode,
  Sparkles,
  ShieldAlert,
  GitMerge,
  Network,
  Bot,
  ArrowRight,
  Code2,
  Layers,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    repo,
    selectFileByPath,
    setActiveView,
    sendChatMessage,
    runReview,
  } = useRepoStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const codeSearchResults = searchRepositoryCode(repo.rootFiles, query);

  const quickActions = [
    {
      id: 'act_review',
      label: 'Run 5-Agent Review Orchestrator',
      category: 'Agent Action',
      icon: ShieldAlert,
      action: () => {
        setActiveView('review');
        runReview();
      },
    },
    {
      id: 'act_merge',
      label: 'Inspect 3-Way Merge Conflicts & Semantic Hazards',
      category: 'Git Intelligence',
      icon: GitMerge,
      action: () => setActiveView('merge'),
    },
    {
      id: 'act_impact',
      label: 'Open Interactive Dependency Graph (React Flow)',
      category: 'Impact Analysis',
      icon: Network,
      action: () => setActiveView('impact'),
    },
    {
      id: 'act_auth',
      label: 'Ask AI: "Where is authentication handled?"',
      category: 'AI Copilot',
      icon: Sparkles,
      action: () => {
        sendChatMessage('Where is authentication handled?');
      },
    },
    {
      id: 'act_checkout',
      label: 'Ask AI: "How does the Stripe checkout flow work?"',
      category: 'AI Copilot',
      icon: Sparkles,
      action: () => {
        sendChatMessage('How does the Stripe checkout flow work?');
      },
    },
  ];

  const filteredActions = query.trim()
    ? quickActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : quickActions;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a file path, symbol, agent command, or prompt..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsCommandPaletteOpen(false);
            }}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-4 max-h-96 text-xs">
          {/* Code Search Results */}
          {codeSearchResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase font-mono">
                Matching Files & Symbols ({codeSearchResults.length})
              </div>
              <div className="space-y-1">
                {codeSearchResults.slice(0, 8).map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      selectFileByPath(res.file, res.line);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-200 font-mono font-medium">
                          {res.file}
                        </span>
                        <span className="text-slate-500 font-mono ml-2">:{res.line}</span>
                        <p className="text-slate-400 text-[11px] truncate mt-0.5 font-mono">
                          {res.content}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions & AI Prompts */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase font-mono">
              Quick Actions & Copilot Queries
            </div>
            <div className="space-y-1">
              {filteredActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      act.action();
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-slate-200 font-medium text-xs">
                          {act.label}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {act.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>Tip: Use ↑ ↓ to navigate and Enter to execute</span>
          <span>RepoLens Engine v2.4</span>
        </div>
      </div>
    </div>
  );
};
