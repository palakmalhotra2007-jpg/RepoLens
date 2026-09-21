import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import {
  MessageSquareCode,
  Users2,
  Zap,
  Code2,
  Send,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Shield,
  ShieldAlert,
  Bot,
  Layers,
  ArrowRight,
  FileCode,
  GitMerge,
  Network,
} from 'lucide-react';
import { reviewAgents } from '../../data/mockReviewAgents';

export const RightPanel: React.FC = () => {
  const {
    isRightPanelOpen,
    setIsRightPanelOpen,
    rightPanelTab,
    setRightPanelTab,
    chatMessages,
    sendChatMessage,
    selectFileByPath,
    handleJumpAction,
    selectedFinding,
    activeFile,
    selectedImpactNodeId,
  } = useRepoStore();

  const [inputQuery, setInputQuery] = useState('');

  if (!isRightPanelOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    sendChatMessage(inputQuery);
    setInputQuery('');
  };

  const quickPrompts = [
    'Where is authentication handled?',
    'How does checkout work?',
    'Audit Stripe webhook signature risks',
    'What breaks if I change Prisma schema?',
  ];

  return (
    <aside className="w-84 lg:w-96 bg-[#0c101c] border-l border-slate-800/80 flex flex-col justify-between flex-shrink-0 z-20 h-full">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 bg-slate-950/40">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRightPanelTab('chat')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              rightPanelTab === 'chat'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={() => setRightPanelTab('debate')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              rightPanelTab === 'debate'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Agent Debate</span>
          </button>

          <button
            onClick={() => setRightPanelTab('symbols')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              rightPanelTab === 'symbols'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Symbols</span>
          </button>
        </div>
      </div>

      {/* Tab 1: AI Repository Copilot & Chat */}
      {rightPanelTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1.5 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-inner'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Code Citations / References */}
                  {msg.codeReferences && msg.codeReferences.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                        <Code2 className="w-3 h-3 text-indigo-400" /> Code References:
                      </div>
                      {msg.codeReferences.map((ref, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectFileByPath(ref.file, ref.lineStart)}
                          className="w-full text-left p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300 font-mono text-[11px] flex items-center justify-between group transition-all"
                        >
                          <span className="truncate text-indigo-300 font-medium">
                            {ref.file}:{ref.lineStart}
                          </span>
                          <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Direct Action Jump Buttons */}
                  {msg.jumpActions && msg.jumpActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                      {msg.jumpActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleJumpAction(act)}
                          className="px-2.5 py-1 rounded bg-[#161b22] hover:bg-[#21262d] border border-indigo-500/30 hover:border-indigo-400 text-indigo-200 text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          {act.type === 'code' && <FileCode className="w-3 h-3 text-cyan-400" />}
                          {act.type === 'finding' && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                          {act.type === 'impact_node' && <Network className="w-3 h-3 text-emerald-400" />}
                          {act.type === 'merge_conflict' && <GitMerge className="w-3 h-3 text-amber-400" />}
                          {act.type === 'debate' && <Users2 className="w-3 h-3 text-purple-400" />}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-1.5 border-t border-slate-800/60 bg-slate-950/30 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendChatMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-300 text-[10px] transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/60 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about this repo..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Agent Debate & Consensus Arena */}
      {rightPanelTab === 'debate' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-200">Active Debate Thread</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedFinding
                ? selectedFinding.title
                : 'Select an issue in the Review Panel to inspect the inter-agent cross-verification debate.'}
            </p>
          </div>

          {selectedFinding?.debateStages && selectedFinding.debateStages.length > 0 ? (
            <div className="space-y-3">
              {selectedFinding.debateStages.map((stage, idx) => {
                const agent = reviewAgents.find((a) => a.id === stage.agentId) || {
                  name: stage.agentName,
                  avatar: '🤖',
                  color: '#6366f1',
                };
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 transition-all hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{agent.avatar}</span>
                        <span className="font-semibold text-slate-200 text-xs">
                          {agent.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {stage.timestamp}
                      </span>
                    </div>

                    <div className="text-slate-300 leading-relaxed pl-6 text-xs">
                      {stage.argumentText}
                    </div>

                    {stage.evidenceCode && (
                      <div className="ml-6 p-2 rounded bg-slate-950 font-mono text-[10px] text-rose-300 border border-slate-800">
                        <code>{stage.evidenceCode}</code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No active debate selected.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Symbols in Active File */}
      {rightPanelTab === 'symbols' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
            <div className="text-[11px] font-medium text-slate-400 uppercase font-mono">
              Active File
            </div>
            <div className="font-semibold text-slate-100 font-mono truncate">
              {activeFile?.path || 'None selected'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono mb-2">
              Extracted AST Symbols ({activeFile?.symbols?.length || 0})
            </div>

            {activeFile?.symbols && activeFile.symbols.length > 0 ? (
              activeFile.symbols.map((sym, idx) => (
                <button
                  key={idx}
                  onClick={() => selectFileByPath(activeFile.path, sym.line)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/40 hover:bg-slate-800 border border-slate-800/60 hover:border-indigo-500/40 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {sym.kind}
                    </span>
                    <span className="font-mono text-slate-200 text-xs truncate group-hover:text-indigo-300">
                      {sym.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">L{sym.line}</span>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Code2 className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p>No symbols parsed in this file.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
