import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { reviewAgents } from '../../config/agents';
import { AgentId } from '../../types/agents';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileCode,
  ShieldAlert,
  Network,
  GitMerge,
  Users2,
  Bot,
  Sliders,
  ChevronRight,
  Code2,
} from 'lucide-react';

export const RepoCopilotView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    handleJumpAction,
    selectFileByPath,
    isRecordingVoice,
    startVoiceInput,
    stopVoiceInput,
    voicePlayback,
    speakAgentBriefing,
    stopAudioPlayback,
    setIsLLMSettingsModalOpen,
    setIsVoiceSettingsModalOpen,
    repo,
  } = useRepoStore();

  const [inputQuery, setInputQuery] = useState('');
  const [selectedAgentTarget, setSelectedAgentTarget] = useState<AgentId | 'all'>('all');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    sendChatMessage(inputQuery, selectedAgentTarget === 'all' ? undefined : selectedAgentTarget);
    setInputQuery('');
  };

  const dynamicQuickPrompts = [
    { prompt: `Explain the architecture of ${repo.name}`, agent: 'code_quality_arch' as AgentId },
    { prompt: 'Where is the main entry point and routing?', agent: 'code_quality_arch' as AgentId },
    { prompt: 'Audit potential security risks and secrets', agent: 'security' as AgentId },
    { prompt: 'Analyze performance and query efficiency', agent: 'performance_db' as AgentId },
    { prompt: 'Check test coverage and reliability gaps', agent: 'testing_reliability' as AgentId },
    { prompt: 'What breaks if I modify core dependencies?', agent: 'git_merge' as AgentId },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden select-none">
      {/* Top Header: Controls & Agent Selector */}
      <div className="h-14 bg-[#161b22] border-b border-[#30363d] px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white text-xs truncate">
              AI Copilot • {repo.name}
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              Branch: <span className="text-slate-200">{repo.currentBranch}</span>
            </div>
          </div>

          {/* Target Agent Selector */}
          <div className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-[#30363d]">
            <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Agent:</span>
            <button
              onClick={() => setSelectedAgentTarget('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                selectedAgentTarget === 'all'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-[#0d1117] text-slate-300 hover:text-slate-100 border border-[#30363d]'
              }`}
            >
              👑 All (Orchestrator)
            </button>
            {reviewAgents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAgentTarget(a.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1 ${
                  selectedAgentTarget === a.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-[#0d1117] text-slate-300 hover:text-slate-100 border border-[#30363d]'
                }`}
              >
                <span>{a.avatar}</span>
                <span className="hidden xl:inline">{a.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: LLM & Voice Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLLMSettingsModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] text-slate-300 hover:text-white text-xs flex items-center gap-1.5 font-mono border border-[#30363d] hover:border-indigo-500/40 transition-colors"
            title="Configure Ollama / Gemini LLM Provider"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">LLM Settings</span>
          </button>

          <button
            onClick={() => setIsVoiceSettingsModalOpen(true)}
            className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] text-slate-300 hover:text-white text-xs flex items-center gap-1 font-mono border border-[#30363d] hover:border-indigo-500/40 transition-colors"
            title="Voice Speech Settings"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-5xl mx-auto w-full text-xs">
        {chatMessages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          const agentProfile = msg.respondingAgentId
            ? reviewAgents.find((a) => a.id === msg.respondingAgentId)
            : null;
          const isSpeaking = voicePlayback.isPlaying && voicePlayback.speakingAgentId === msg.respondingAgentId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${
                isAssistant ? 'items-start' : 'items-end'
              }`}
            >
              <div
                className={`p-4 rounded-2xl max-w-3xl leading-relaxed ${
                  isAssistant
                    ? 'bg-[#161b22] border border-[#30363d] text-slate-200 shadow-sm rounded-bl-none'
                    : 'bg-indigo-600 text-white shadow-md rounded-br-none'
                }`}
              >
                {/* Agent Header if Assistant */}
                {isAssistant && agentProfile && (
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#30363d]">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{agentProfile.avatar}</span>
                      <div>
                        <div className="font-bold text-slate-100 text-xs">{agentProfile.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {agentProfile.role}
                        </div>
                      </div>
                    </div>

                    {/* Speak Button */}
                    <button
                      onClick={() => {
                        if (isSpeaking) {
                          stopAudioPlayback();
                        } else {
                          speakAgentBriefing(msg.content, agentProfile.id);
                        }
                      }}
                      className="px-2.5 py-1 rounded-md hover:bg-[#21262d] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono text-[10px] border border-[#30363d] transition-all"
                      title="Speak response aloud"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Voice</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Code Reference Citations */}
                {msg.codeReferences && msg.codeReferences.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#30363d] space-y-1.5 font-mono">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-indigo-400" /> Code References:
                    </div>
                    {msg.codeReferences.map((ref, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectFileByPath(ref.file, ref.lineStart)}
                        className="w-full text-left p-2 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-indigo-500/40 text-slate-300 text-[11px] flex items-center justify-between group transition-all"
                      >
                        <span className="text-indigo-300 font-medium truncate">
                          {ref.file}:{ref.lineStart}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Direct Action Jump Buttons */}
                {msg.jumpActions && msg.jumpActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#30363d] flex flex-wrap gap-1.5">
                    {msg.jumpActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleJumpAction(act)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 text-[11px] font-mono flex items-center gap-1.5 transition-all"
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
          );
        })}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-6 py-2.5 border-t border-[#30363d] bg-[#161b22]/60 flex gap-2 overflow-x-auto no-scrollbar max-w-5xl mx-auto w-full flex-shrink-0">
        {dynamicQuickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendChatMessage(qp.prompt, qp.agent)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 text-[11px] transition-all"
          >
            {qp.prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22] max-w-5xl mx-auto w-full flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2.5">
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={() => {
              if (isRecordingVoice) {
                stopVoiceInput();
              } else {
                startVoiceInput(selectedAgentTarget === 'all' ? undefined : selectedAgentTarget);
              }
            }}
            className={`p-3 rounded-xl border transition-all ${
              isRecordingVoice
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-[#0d1117] border-[#30363d] text-slate-300 hover:text-white hover:border-indigo-500'
            }`}
            title={isRecordingVoice ? 'Stop recording' : 'Voice Input (Speech-to-Text)'}
          >
            {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
          </button>

          <input
            type="text"
            placeholder={
              isRecordingVoice
                ? 'Listening to your voice...'
                : selectedAgentTarget === 'all'
                ? `Ask RepoLens AI anything about ${repo.name}...`
                : `Ask ${reviewAgents.find((a) => a.id === selectedAgentTarget)?.name}...`
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 font-medium text-xs font-mono"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
