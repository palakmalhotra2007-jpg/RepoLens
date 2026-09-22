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
  ArrowRight,
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-24 px-4 select-none">
      <div className="w-full max-w-2xl bg-bg-surface border border-border-default rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="p-4 border-b border-border-default flex items-center gap-3 bg-bg-surface-2">
          <Search strokeWidth={1.5} className="w-4 h-4 text-text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a file path, symbol, agent command, or prompt..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsCommandPaletteOpen(false);
            }}
            className="w-full bg-transparent text-xs text-text-primary placeholder-text-tertiary focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-[4px] hover:bg-bg-surface text-text-secondary hover:text-text-primary"
            >
              <X strokeWidth={1.5} className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-1.5 py-0.2 rounded-[4px] bg-bg-surface border border-border-default text-[10px] font-mono text-text-tertiary">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-3 max-h-96 text-xs">
          {/* Code Search Results */}
          {codeSearchResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-medium text-text-tertiary uppercase font-mono tracking-[0.04em]">
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
                    className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-bg-surface-2 border border-transparent hover:border-border-default flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileCode strokeWidth={1.5} className="w-4 h-4 text-text-secondary flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-text-primary font-mono font-medium">
                          {res.file}
                        </span>
                        <span className="text-text-tertiary font-mono ml-2">:{res.line}</span>
                        <p className="text-text-secondary text-[11px] truncate mt-0.5 font-mono">
                          {res.content}
                        </p>
                      </div>
                    </div>
                    <ArrowRight strokeWidth={1.5} className="w-4 h-4 text-text-tertiary group-hover:text-text-primary transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions & AI Prompts */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-medium text-text-tertiary uppercase font-mono tracking-[0.04em]">
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
                    className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-bg-surface-2 border border-transparent hover:border-border-default flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
                      <div>
                        <div className="text-text-primary font-medium text-xs">
                          {act.label}
                        </div>
                        <div className="text-[10px] font-mono text-text-tertiary">
                          {act.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight strokeWidth={1.5} className="w-4 h-4 text-text-tertiary group-hover:text-text-primary transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-bg-surface-2 border-t border-border-default text-[11px] text-text-tertiary flex items-center justify-between font-mono">
          <span>Tip: Use ↑ ↓ to navigate and Enter to execute</span>
          <span>RepoLens Engine v2.4</span>
        </div>
      </div>
    </div>
  );
};
