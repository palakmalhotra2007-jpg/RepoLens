import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import {
  Send,
  Sparkles,
  ChevronRight,
  FileCode,
  ShieldAlert,
  Network,
  GitMerge,
  Users2,
  Code2,
  Bot,
} from 'lucide-react';

export const RepoCopilotView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    selectFileByPath,
    handleJumpAction,
    setIsLLMSettingsModalOpen,
  } = useRepoStore();

  const [inputQuery, setInputQuery] = useState('');

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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 bg-[#0c101c]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">AI Repository Copilot</h1>
              <p className="text-sm text-slate-300 mt-0.5">
                RepoLens Engineering Intelligence ready for ShopFlow
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLLMSettingsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-white text-sm flex items-center gap-2 transition-colors"
            title="Configure LLM Provider (Ollama/Gemini)"
          >
            <Bot className="w-4 h-4" />
            <span>LLM Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-center max-w-3xl mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/20">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white">Welcome to RepoLens AI Copilot</h2>
                <p className="text-slate-300 leading-relaxed text-base">
                  I understand the full codebase architecture across React, Node.js/Express, PostgreSQL/Prisma, and Stripe.
                </p>
                <p className="text-slate-300 leading-relaxed text-base">
                  Ask any technical question or query one of the 5 specialized review agents:
                </p>
              </div>

              {/* Quick Start Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendChatMessage(prompt)}
                    className="p-5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-indigo-500/40 text-left transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                        <Code2 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <span className="text-slate-200 leading-relaxed">{prompt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-2 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-4 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-[#161b22] border border-[#30363d] text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Code Citations / References */}
                  {msg.codeReferences && msg.codeReferences.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-2">
                      <div className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Code References:
                      </div>
                      {msg.codeReferences.map((ref, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectFileByPath(ref.file, ref.lineStart)}
                          className="w-full text-left p-3 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-indigo-500/40 text-slate-300 font-mono text-xs flex items-center justify-between group transition-all"
                        >
                          <span className="truncate text-indigo-300 font-medium">
                            {ref.file}:{ref.lineStart}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Direct Action Jump Buttons */}
                  {msg.jumpActions && msg.jumpActions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap gap-2">
                      {msg.jumpActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleJumpAction(act)}
                          className="px-3 py-2 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-indigo-500/30 hover:border-indigo-400 text-indigo-200 text-xs font-mono flex items-center gap-2 transition-all shadow-sm"
                        >
                          {act.type === 'code' && <FileCode className="w-3.5 h-3.5 text-cyan-400" />}
                          {act.type === 'finding' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
                          {act.type === 'impact_node' && <Network className="w-3.5 h-3.5 text-emerald-400" />}
                          {act.type === 'merge_conflict' && <GitMerge className="w-3.5 h-3.5 text-amber-400" />}
                          {act.type === 'debate' && <Users2 className="w-3.5 h-3.5 text-purple-400" />}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))
          )}
        </div>

        {/* Quick Prompts Carousel - Only show when there are messages */}
        {chatMessages.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800/60 bg-[#0c101c] overflow-x-auto flex gap-2 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendChatMessage(prompt)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-[#161b22] hover:bg-indigo-950/50 border border-[#30363d] hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 text-xs transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-5 border-t border-slate-800 bg-[#0c101c] flex gap-3">
          <input
            type="text"
            placeholder="Ask anything about this repo..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl px-5 py-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 font-medium"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
